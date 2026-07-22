param(
  [string]$BackupRoot = "",
  [int]$RetentionDays = 30,
  [switch]$SinCloudinary
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-Step {
  param([string]$Message)

  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Read-DotEnv {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "No se encontró el archivo .env en: $Path"
  }

  $values = @{}

  foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
    $trimmed = $line.Trim()

    if (
      [string]::IsNullOrWhiteSpace($trimmed) -or
      $trimmed.StartsWith("#")
    ) {
      continue
    }

    $separator = $trimmed.IndexOf("=")

    if ($separator -lt 1) {
      continue
    }

    $name = $trimmed.Substring(0, $separator).Trim()
    $value = $trimmed.Substring($separator + 1).Trim()

    if (
      ($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'"))
    ) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    $values[$name] = $value
  }

  return $values
}

function Require-Value {
  param(
    [hashtable]$Values,
    [string]$Name
  )

  if (
    -not $Values.ContainsKey($Name) -or
    [string]::IsNullOrWhiteSpace([string]$Values[$Name])
  ) {
    throw "Falta la variable $Name en backend\.env"
  }

  return [string]$Values[$Name]
}

function Get-SqlPackageCommand {
  $command = Get-Command "sqlpackage" -ErrorAction SilentlyContinue

  if ($command) {
    return $command.Source
  }

  $globalTool = Join-Path $HOME ".dotnet\tools\sqlpackage.exe"

  if (Test-Path -LiteralPath $globalTool) {
    return $globalTool
  }

  throw @"
No se encontró SqlPackage.

Ejecuta primero:
scripts\backups\instalar-sqlpackage.ps1
"@
}

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = (Resolve-Path (Join-Path $scriptDirectory "..\..")).Path
$backendRoot = Join-Path $projectRoot "backend"
$envPath = Join-Path $backendRoot ".env"

if ([string]::IsNullOrWhiteSpace($BackupRoot)) {
  $documents = [Environment]::GetFolderPath("MyDocuments")
  $BackupRoot = Join-Path $documents "TaurusBackups"
}

$BackupRoot = [Environment]::ExpandEnvironmentVariables($BackupRoot)
New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$tempDirectory = Join-Path $BackupRoot ".temporal_$timestamp"
$finalDirectory = Join-Path $BackupRoot "Taurus_$timestamp"
$databaseDirectory = Join-Path $tempDirectory "database"
$cloudinaryDirectory = Join-Path $tempDirectory "cloudinary"
$logsDirectory = Join-Path $tempDirectory "logs"

New-Item -ItemType Directory -Force -Path $databaseDirectory | Out-Null
New-Item -ItemType Directory -Force -Path $logsDirectory | Out-Null

$values = Read-DotEnv -Path $envPath

$dbServer = Require-Value -Values $values -Name "DB_SERVER"
$dbDatabase = Require-Value -Values $values -Name "DB_DATABASE"
$dbUser = Require-Value -Values $values -Name "DB_USER"
$dbPassword = Require-Value -Values $values -Name "DB_PASSWORD"

$dbPort = "1433"

if (
  $values.ContainsKey("DB_PORT") -and
  -not [string]::IsNullOrWhiteSpace([string]$values["DB_PORT"])
) {
  $dbPort = [string]$values["DB_PORT"]
}

$dbServer = $dbServer -replace "^tcp:", ""

if ($dbServer -notmatch ",\d+$") {
  $dbServer = "$dbServer,$dbPort"
}

$sqlPackage = Get-SqlPackageCommand
$bacpacPath = Join-Path $databaseDirectory "$dbDatabase.bacpac"
$sqlLogPath = Join-Path $logsDirectory "sqlpackage-export.log"

Write-Step "Exportando Azure SQL a BACPAC"
Write-Host "Destino: $bacpacPath"

$sqlArguments = @(
  "/Action:Export",
  "/SourceServerName:tcp:$dbServer",
  "/SourceDatabaseName:$dbDatabase",
  "/SourceUser:$dbUser",
  "/SourcePassword:$dbPassword",
  "/TargetFile:$bacpacPath",
  "/SourceEncryptConnection:True",
  "/SourceTrustServerCertificate:False",
  "/SourceTimeout:60",
  "/p:CommandTimeout=120",
  "/p:LongRunningCommandTimeout=0",
  "/DiagnosticsFile:$sqlLogPath"
)

& $sqlPackage @sqlArguments

if ($LASTEXITCODE -ne 0) {
  $failedDirectory = Join-Path $BackupRoot "FALLIDO_$timestamp"

  if (Test-Path -LiteralPath $failedDirectory) {
    Remove-Item -LiteralPath $failedDirectory -Recurse -Force
  }

  Move-Item -LiteralPath $tempDirectory -Destination $failedDirectory

  throw "La exportación de Azure SQL falló. Revisa: $failedDirectory\logs\sqlpackage-export.log"
}

if (
  -not (Test-Path -LiteralPath $bacpacPath) -or
  (Get-Item -LiteralPath $bacpacPath).Length -le 0
) {
  throw "SqlPackage terminó sin crear un BACPAC válido."
}

$dbHash = (Get-FileHash -LiteralPath $bacpacPath -Algorithm SHA256).Hash
$cloudinaryStatus = "omitido"
$cloudinaryError = $null

if (-not $SinCloudinary) {
  $requiredCloudinary = @(
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
  )

  $hasCloudinary = $true

  foreach ($name in $requiredCloudinary) {
    if (
      -not $values.ContainsKey($name) -or
      [string]::IsNullOrWhiteSpace([string]$values[$name])
    ) {
      $hasCloudinary = $false
    }
  }

  if ($hasCloudinary) {
    Write-Step "Descargando imágenes originales de Cloudinary"

    $cloudScript = Join-Path $backendRoot "scripts\backup-cloudinary.js"

    if (-not (Test-Path -LiteralPath $cloudScript)) {
      throw "No se encontró: $cloudScript"
    }

    New-Item -ItemType Directory -Force -Path $cloudinaryDirectory | Out-Null

    & node $cloudScript `
      --output $cloudinaryDirectory `
      --env $envPath

    if ($LASTEXITCODE -eq 0) {
      $cloudinaryStatus = "completado"
    }
    else {
      $cloudinaryStatus = "fallido"
      $cloudinaryError = "El script de Cloudinary devolvió el código $LASTEXITCODE."
      Write-Warning $cloudinaryError
    }
  }
  else {
    Write-Warning "No se encontraron todas las variables de Cloudinary. Se guardará solo la base de datos."
  }
}

$gitCommit = $null

try {
  $gitCommit = (
    git -C $projectRoot rev-parse HEAD 2>$null
  ).Trim()
}
catch {
  $gitCommit = $null
}

$manifest = [ordered]@{
  createdAt = (Get-Date).ToString("o")
  project = "Taurus"
  computer = $env:COMPUTERNAME
  database = [ordered]@{
    name = $dbDatabase
    file = "database\$dbDatabase.bacpac"
    bytes = (Get-Item -LiteralPath $bacpacPath).Length
    sha256 = $dbHash
  }
  cloudinary = [ordered]@{
    status = $cloudinaryStatus
    error = $cloudinaryError
  }
  gitCommit = $gitCommit
  retentionDays = $RetentionDays
}

$manifestPath = Join-Path $tempDirectory "manifest.json"

$manifest |
  ConvertTo-Json -Depth 8 |
  Set-Content -LiteralPath $manifestPath -Encoding UTF8

if (Test-Path -LiteralPath $finalDirectory) {
  Remove-Item -LiteralPath $finalDirectory -Recurse -Force
}

Move-Item -LiteralPath $tempDirectory -Destination $finalDirectory

Write-Step "Aplicando retención de copias"

$limitDate = (Get-Date).AddDays(-[Math]::Abs($RetentionDays))

Get-ChildItem -LiteralPath $BackupRoot -Directory |
  Where-Object {
    $_.Name -match "^Taurus_\d{8}_\d{6}$" -and
    $_.LastWriteTime -lt $limitDate -and
    $_.FullName -ne $finalDirectory
  } |
  ForEach-Object {
    Write-Host "Eliminando copia antigua: $($_.FullName)"
    Remove-Item -LiteralPath $_.FullName -Recurse -Force
  }

Write-Host ""
Write-Host "COPIA COMPLETADA" -ForegroundColor Green
Write-Host "Carpeta: $finalDirectory"
Write-Host "BACPAC SHA-256: $dbHash"
Write-Host "Cloudinary: $cloudinaryStatus"

if ($cloudinaryStatus -eq "fallido") {
  exit 2
}

exit 0
