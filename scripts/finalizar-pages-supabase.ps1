param(
  [string]$Bucket = "ceal-evidence",
  [int]$MaxChecks = 18,
  [int]$SleepSeconds = 20
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$configureScript = Join-Path $PSScriptRoot "configure-supabase-pages.ps1"
$smokeScript = Join-Path $PSScriptRoot "smoke-test-ceal.ps1"
$publicUrl = "https://ic-ucn.github.io/ceal-contingencia/"

$supabaseUrl = Read-Host "Pega el Project URL de Supabase"
if (-not $supabaseUrl) {
  throw "Falta SupabaseUrl."
}

$supabaseAnonKey = Read-Host "Pega la anon key de Supabase"
if (-not $supabaseAnonKey) {
  throw "Falta SupabaseAnonKey."
}

& $configureScript `
  -SupabaseUrl $supabaseUrl `
  -SupabaseAnonKey $supabaseAnonKey `
  -Bucket $Bucket `
  -CommitAndPush

& $smokeScript

Write-Host ""
Write-Host "Esperando despliegue de GitHub Pages..." -ForegroundColor Cyan

for ($attempt = 1; $attempt -le $MaxChecks; $attempt += 1) {
  try {
    $status = curl.exe -s -o NUL -w "%{http_code}" $publicUrl
    if ($LASTEXITCODE -eq 0 -and $status -eq "200") {
      Write-Host "Pages responde 200 en $publicUrl" -ForegroundColor Green
      exit 0
    }
    Write-Host "Intento $attempt/$MaxChecks: Pages aún no responde 200 (estado: $status)." -ForegroundColor Yellow
  } catch {
    Write-Host "Intento $attempt/$MaxChecks: Pages aún no responde." -ForegroundColor Yellow
  }
  Start-Sleep -Seconds $SleepSeconds
}

Write-Host "Pages todavía no confirma 200. Revisa el workflow de GitHub Actions." -ForegroundColor Yellow
exit 1
