$ErrorActionPreference = "Stop"

Write-Host "Comprobando .NET..." -ForegroundColor Cyan

$dotnet = Get-Command "dotnet" -ErrorAction SilentlyContinue

if (-not $dotnet) {
  throw @"
No se encontró el SDK de .NET.

Instala .NET SDK 8 o una versión posterior y vuelve a ejecutar este archivo.
"@
}

$versionText = (& dotnet --version).Trim()
$majorVersion = [int]($versionText.Split(".")[0])

if ($majorVersion -lt 8) {
  throw "SqlPackage requiere .NET SDK 8 o posterior. Versión detectada: $versionText"
}

Write-Host "Versión de .NET: $versionText" -ForegroundColor Green

$installed = & dotnet tool list --global |
  Select-String -Pattern "microsoft\.sqlpackage" -Quiet

if ($installed) {
  Write-Host "Actualizando SqlPackage..." -ForegroundColor Cyan
  & dotnet tool update --global Microsoft.SqlPackage
}
else {
  Write-Host "Instalando SqlPackage..." -ForegroundColor Cyan
  & dotnet tool install --global Microsoft.SqlPackage
}

if ($LASTEXITCODE -ne 0) {
  throw "No se pudo instalar o actualizar SqlPackage."
}

Write-Host ""
Write-Host "SqlPackage quedó instalado correctamente." -ForegroundColor Green
Write-Host "Cierra y vuelve a abrir PowerShell si el comando todavía no aparece en PATH."
