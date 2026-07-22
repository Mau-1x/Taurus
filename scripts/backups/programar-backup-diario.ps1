param(
  [string]$Hora = "21:30",
  [string]$BackupRoot = "",
  [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"

if ($Hora -notmatch "^([01]\d|2[0-3]):[0-5]\d$") {
  throw "La hora debe tener formato HH:mm. Ejemplo: 21:30"
}

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$backupScript = Join-Path $scriptDirectory "backup-taurus.ps1"

if (-not (Test-Path -LiteralPath $backupScript)) {
  throw "No se encontró: $backupScript"
}

if ([string]::IsNullOrWhiteSpace($BackupRoot)) {
  $documents = [Environment]::GetFolderPath("MyDocuments")
  $BackupRoot = Join-Path $documents "TaurusBackups"
}

$taskName = "Taurus - Copia diaria"
$powerShell = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"

$arguments = @(
  "-NoProfile",
  "-ExecutionPolicy Bypass",
  "-File `"$backupScript`"",
  "-BackupRoot `"$BackupRoot`"",
  "-RetentionDays $RetentionDays"
) -join " "

$action = New-ScheduledTaskAction `
  -Execute $powerShell `
  -Argument $arguments

$trigger = New-ScheduledTaskTrigger `
  -Daily `
  -At $Hora

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Hours 4)

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Copia diaria local de Azure SQL y Cloudinary para Taurus." `
  -Force | Out-Null

Write-Host ""
Write-Host "Tarea programada correctamente." -ForegroundColor Green
Write-Host "Nombre: $taskName"
Write-Host "Hora: $Hora"
Write-Host "Destino: $BackupRoot"
Write-Host ""
Write-Host "La PC debe estar encendida o encenderse después; la tarea está configurada para ejecutarse cuando vuelva a estar disponible."
