param(
  [Parameter(Mandatory = $true)]
  [string]$BacpacPath,

  [string]$TargetDatabase = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

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

  throw "No se encontró SqlPackage. Ejecuta instalar-sqlpackage.ps1."
}

$BacpacPath = (Resolve-Path -LiteralPath $BacpacPath).Path

if ([System.IO.Path]::GetExtension($BacpacPath) -ne ".bacpac") {
  throw "El archivo seleccionado no tiene extensión .bacpac"
}

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = (Resolve-Path (Join-Path $scriptDirectory "..\..")).Path
$envPath = Join-Path $projectRoot "backend\.env"
$values = Read-DotEnv -Path $envPath

$dbServer = Require-Value -Values $values -Name "DB_SERVER"
$dbProduction = Require-Value -Values $values -Name "DB_DATABASE"
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

if ([string]::IsNullOrWhiteSpace($TargetDatabase)) {
  $TargetDatabase = "Taurus_Restore_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
}

if ($TargetDatabase -eq $dbProduction) {
  throw "Por seguridad no se permite importar directamente sobre la base de producción."
}

if ($TargetDatabase -notmatch "^[A-Za-z0-9_\-]{3,128}$") {
  throw "El nombre de la base de destino contiene caracteres no permitidos."
}

Write-Host ""
Write-Host "IMPORTACIÓN DE PRUEBA" -ForegroundColor Yellow
Write-Host "Archivo: $BacpacPath"
Write-Host "Servidor: $dbServer"
Write-Host "Nueva base: $TargetDatabase"
Write-Host ""
Write-Host "La importación debe realizarse en una base nueva o vacía." -ForegroundColor Yellow

$confirmation = Read-Host "Escribe RESTAURAR para continuar"

if ($confirmation -ne "RESTAURAR") {
  Write-Host "Operación cancelada."
  exit 0
}

$sqlPackage = Get-SqlPackageCommand
$logPath = Join-Path (Split-Path -Parent $BacpacPath) "sqlpackage-import.log"

$arguments = @(
  "/Action:Import",
  "/SourceFile:$BacpacPath",
  "/TargetServerName:tcp:$dbServer",
  "/TargetDatabaseName:$TargetDatabase",
  "/TargetUser:$dbUser",
  "/TargetPassword:$dbPassword",
  "/TargetEncryptConnection:True",
  "/TargetTrustServerCertificate:False",
  "/TargetTimeout:60",
  "/p:CommandTimeout=120",
  "/p:LongRunningCommandTimeout=0",
  "/DiagnosticsFile:$logPath"
)

& $sqlPackage @arguments

if ($LASTEXITCODE -ne 0) {
  throw "La importación falló. Revisa: $logPath"
}

Write-Host ""
Write-Host "Base importada correctamente: $TargetDatabase" -ForegroundColor Green
Write-Host "Prueba los datos antes de realizar cualquier cambio en producción."
