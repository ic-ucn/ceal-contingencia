param(
[string]$LocalUrl = "http://localhost:3000/?v=37#inicio",
  [string]$PublicUrl = "https://ic-ucn.github.io/ceal-contingencia/",
  [switch]$CheckPublic
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Test-Url {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url
  )

  $response = curl.exe -s -o NUL -w "%{http_code}" $Url
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo consultar $Url"
  }
  return [int]$response
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $projectRoot "public\\config.js"
$configText = Get-Content -Path $configPath -Raw -Encoding UTF8

$supabaseUrl = if ($configText -match 'supabaseUrl:\s*"([^"]*)"') { $matches[1] } else { "" }
$apiBase = if ($configText -match 'const PUBLIC_API_BASE = "([^"]*)"') { $matches[1] } else { "" }

Write-Host "Smoke test CEAL" -ForegroundColor Cyan
Write-Host "Local URL: $LocalUrl"
Write-Host "Modo configurado:"
if ($supabaseUrl) {
  Write-Host "  - Supabase: $supabaseUrl" -ForegroundColor Green
} else {
  Write-Host "  - Supabase: no configurado" -ForegroundColor Yellow
}
if ($apiBase) {
  Write-Host "  - Backend HTTP: $apiBase" -ForegroundColor Green
} else {
  Write-Host "  - Backend HTTP: vacio" -ForegroundColor Yellow
}

$localStatus = Test-Url -Url $LocalUrl
Write-Host "Local homepage: HTTP $localStatus" -ForegroundColor Green

$healthStatus = Test-Url -Url "http://localhost:3000/api/health"
Write-Host "Local health: HTTP $healthStatus" -ForegroundColor Green

if ($CheckPublic) {
  $publicStatus = Test-Url -Url $PublicUrl
  Write-Host "Public homepage: HTTP $publicStatus" -ForegroundColor Green
}
