param(
  [switch]$RunOnce
)

$ErrorActionPreference = "Stop"

Add-Type -Namespace Ceal -Name Power -MemberDefinition @"
[DllImport("kernel32.dll")]
public static extern uint SetThreadExecutionState(uint esFlags);
"@

$ES_CONTINUOUS = [uint32]2147483648
$ES_SYSTEM_REQUIRED = [uint32]1
$ES_DISPLAY_REQUIRED = [uint32]2

$AppDir = Split-Path -Parent $PSScriptRoot
$ConfigPath = Join-Path $AppDir "public\config.js"
$TunnelStdout = Join-Path $AppDir "tunnel.stdout.log"
$TunnelStderr = Join-Path $AppDir "tunnel.stderr.log"
$ServerStdout = Join-Path $AppDir "server.stdout.log"
$ServerStderr = Join-Path $AppDir "server.stderr.log"
$OpsDir = $PSScriptRoot
$LoopLog = Join-Path $OpsDir "keep-ceal-live.log"
$StatePath = Join-Path $OpsDir "keep-ceal-live.state.json"
$RepoDir = $AppDir
$PublicSiteUrl = "https://ic-ucn.github.io/ceal-contingencia/"

function Write-LoopLog([string]$Message) {
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
  Add-Content -Path $LoopLog -Value $line
}

function Keep-Awake {
  [Ceal.Power]::SetThreadExecutionState($ES_CONTINUOUS -bor $ES_SYSTEM_REQUIRED -bor $ES_DISPLAY_REQUIRED) | Out-Null
}

function Test-JsonEndpoint([string]$Url, [int]$TimeoutSeconds = 20) {
  try {
    Invoke-RestMethod -Uri $Url -TimeoutSec $TimeoutSeconds | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Get-LocalHealthUrl {
  return "http://localhost:3000/api/health"
}

function Ensure-AppServer {
  if (Test-JsonEndpoint (Get-LocalHealthUrl)) {
    return
  }

  Write-LoopLog "Backend local caido. Reiniciando npm start."
  Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "npm start" `
    -WorkingDirectory $AppDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput $ServerStdout `
    -RedirectStandardError $ServerStderr | Out-Null

  $deadline = (Get-Date).AddSeconds(75)
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2
    if (Test-JsonEndpoint (Get-LocalHealthUrl)) {
      Write-LoopLog "Backend local recuperado."
      return
    }
  }

  throw "No fue posible levantar el backend local en localhost:3000."
}

function Get-TunnelProcessIds {
  Get-CimInstance Win32_Process |
    Where-Object {
      $_.Name -eq "ssh.exe" -and
      $_.CommandLine -match "localhost\.run" -and
      $_.CommandLine -match "localhost:3000"
    } |
    Select-Object -ExpandProperty ProcessId
}

function Get-TunnelUrlFromLog {
  if (-not (Test-Path $TunnelStdout)) {
    return $null
  }

  $content = Get-Content $TunnelStdout -Raw
  if ([string]::IsNullOrWhiteSpace($content)) {
    return $null
  }
  $tunnelMatch = [regex]::Match($content, "https://[a-z0-9.-]+(?=\s+tunneled with tls termination)")
  if ($tunnelMatch.Success) {
    return $tunnelMatch.Value
  }

  return $null
}

function Get-ConfiguredPublicUrl {
  if (-not (Test-Path $ConfigPath)) {
    return $null
  }

  $config = Get-Content $ConfigPath -Raw
  if ([string]::IsNullOrWhiteSpace($config)) {
    return $null
  }

  $match = [regex]::Match($config, 'const PUBLIC_API_BASE = "(https://[^"]+)"')
  if ($match.Success) {
    return $match.Groups[1].Value
  }

  return $null
}

function Start-Tunnel {
  Write-LoopLog "Reiniciando tunel publico localhost.run."
  foreach ($tunnelPid in Get-TunnelProcessIds) {
    try { Stop-Process -Id $tunnelPid -Force -ErrorAction Stop } catch {}
  }

  $stopDeadline = (Get-Date).AddSeconds(10)
  while ((Get-Date) -lt $stopDeadline) {
    if (-not (Get-TunnelProcessIds)) {
      break
    }
    Start-Sleep -Milliseconds 500
  }

  if (Test-Path $TunnelStdout) {
    Remove-Item $TunnelStdout -Force -ErrorAction SilentlyContinue
  }
  if (Test-Path $TunnelStderr) {
    Remove-Item $TunnelStderr -Force -ErrorAction SilentlyContinue
  }

  Start-Process -FilePath "$env:SystemRoot\System32\OpenSSH\ssh.exe" `
    -ArgumentList @(
      "-o", "StrictHostKeyChecking=no",
      "-o", "ServerAliveInterval=30",
      "-o", "ExitOnForwardFailure=yes",
      "-R", "80:localhost:3000",
      "nokey@localhost.run"
    ) `
    -WindowStyle Hidden `
    -RedirectStandardOutput $TunnelStdout `
    -RedirectStandardError $TunnelStderr | Out-Null

  $deadline = (Get-Date).AddSeconds(45)
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2
    $url = Get-TunnelUrlFromLog
    if ($url) {
      Write-LoopLog "Tunel activo: $url"
      return $url
    }
  }

  throw "No fue posible obtener la URL publica del tunel."
}

function Read-State {
  if (Test-Path $StatePath) {
    try {
      return Get-Content $StatePath -Raw | ConvertFrom-Json
    } catch {}
  }

  return [pscustomobject]@{
    tunnelUrl = ""
    lastSmokeAt = ""
  }
}

function Save-State($State) {
  $State | ConvertTo-Json | Set-Content -Path $StatePath
}

function Update-PublicConfig([string]$BaseUrl) {
  $content = Get-Content $ConfigPath -Raw
  $updated = [regex]::Replace($content, 'const PUBLIC_API_BASE = "https://[^"]+";', "const PUBLIC_API_BASE = `"$BaseUrl`";")
  if ($updated -ne $content) {
    Set-Content -Path $ConfigPath -Value $updated -NoNewline
    Write-LoopLog "config.js actualizado con backend publico $BaseUrl"
    return $true
  }

  return $false
}

function Push-ConfigUpdate {
  $status = git -C $RepoDir status --porcelain -- public/config.js
  if (-not $status) {
    return
  }

  Write-LoopLog "Publicando cambio de config.js en GitHub Pages."
  git -C $RepoDir add public/config.js | Out-Null
  git -C $RepoDir commit -m "Actualiza backend publico CEAL" | Out-Null
  git -C $RepoDir push origin main | Out-Null
}

function Invoke-SmokeTests([string]$BaseUrl) {
  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $questionPayload = @{
    category = "otro"
    question = "WATCHDOG-QA-$timestamp"
    submitter = "watchdog"
    source = "watchdog"
  } | ConvertTo-Json

  $reportPayload = @{
    problemType = "otro"
    problemTypeLabel = "Otro"
    curriculum = "general"
    curriculumLabel = "General / unidad"
    subject = "General"
    subjectKey = "General"
    subjectOther = ""
    date = (Get-Date -Format "yyyy-MM-dd")
    description = "WATCHDOG-REPORT-$timestamp"
    followUp = ""
    source = "watchdog"
    evidence = @()
  } | ConvertTo-Json -Depth 6

  Invoke-RestMethod -Uri "$BaseUrl/api/questions" -Method Post -ContentType "application/json" -Body $questionPayload -TimeoutSec 30 | Out-Null
  Invoke-RestMethod -Uri "$BaseUrl/api/reports" -Method Post -ContentType "application/json" -Body $reportPayload -TimeoutSec 30 | Out-Null
  Write-LoopLog "Smoke tests OK para $BaseUrl"
}

function Ensure-PublicBackend([string]$CurrentUrl, $State) {
  $url = $CurrentUrl
  if (-not $url) {
    $url = Get-ConfiguredPublicUrl
  }

  if ($url -and -not (Test-JsonEndpoint "$url/api/health")) {
    $url = $null
  }

  if (-not $url) {
    $url = Start-Tunnel
  }

  if (-not (Test-JsonEndpoint "$url/api/health")) {
    $url = Start-Tunnel
  }

  $needsSmoke = $false
  if ($url -ne $State.tunnelUrl) {
    $State.tunnelUrl = $url
    $needsSmoke = $true
  } elseif (-not $State.lastSmokeAt) {
    $needsSmoke = $true
  }

  if ($needsSmoke) {
    Invoke-SmokeTests $url
    $State.lastSmokeAt = (Get-Date).ToString("o")
  }

  return $url
}

Write-LoopLog "Monitor CEAL iniciado."
$state = Read-State

while ($true) {
  try {
    Keep-Awake
    Ensure-AppServer
    $candidateUrl = if ($state.tunnelUrl) { $state.tunnelUrl } else { Get-ConfiguredPublicUrl }
    $publicUrl = Ensure-PublicBackend $candidateUrl $state
    if (Update-PublicConfig $publicUrl) {
      Push-ConfigUpdate
    }
    if (-not (Test-JsonEndpoint $PublicSiteUrl 30)) {
      Write-LoopLog "Advertencia: GitHub Pages aun no responde 200."
    }
    Save-State $state
  } catch {
    Write-LoopLog "Error de monitor: $($_.Exception.Message)"
  }

  if ($RunOnce) {
    break
  }

  Start-Sleep -Seconds 60
}
