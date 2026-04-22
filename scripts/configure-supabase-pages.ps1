param(
  [Parameter(Mandatory = $true)]
  [string]$SupabaseUrl,

  [Parameter(Mandatory = $true)]
  [string]$SupabaseAnonKey,

  [string]$Bucket = "ceal-evidence",

  [switch]$CommitAndPush,

  [string]$CommitMessage = "Activa Supabase para GitHub Pages"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $projectRoot "public\\config.js"

if (-not (Test-Path $configPath)) {
  throw "No se encontró public\\config.js"
}

$content = Get-Content -Path $configPath -Raw -Encoding UTF8

$replacements = @{
  'supabaseUrl:\s*".*?"' = ('supabaseUrl: "{0}"' -f $SupabaseUrl)
  'supabaseAnonKey:\s*".*?"' = ('supabaseAnonKey: "{0}"' -f $SupabaseAnonKey)
  'supabaseBucket:\s*".*?"' = ('supabaseBucket: "{0}"' -f $Bucket)
}

foreach ($pattern in $replacements.Keys) {
  $content = [regex]::Replace($content, $pattern, $replacements[$pattern], 1)
}

Set-Content -Path $configPath -Value $content -Encoding UTF8

Write-Host "Configuración Supabase aplicada en public/config.js" -ForegroundColor Green
Write-Host "URL: $SupabaseUrl"
Write-Host "Bucket: $Bucket"

if ($CommitAndPush) {
  Push-Location $projectRoot
  try {
    git add public/config.js
    git commit -m $CommitMessage
    git push origin main
    Write-Host "Commit y push completados." -ForegroundColor Green
  } finally {
    Pop-Location
  }
}
