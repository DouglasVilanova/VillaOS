# Instala as skills e agentes do VillaOS no Claude Code (padrão: global, ~/.claude).
# Uso: powershell -ExecutionPolicy Bypass -File scripts\instalar.ps1 [-Destino <pasta .claude>]
param([string]$Destino = (Join-Path $HOME ".claude"))
$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot

$skillsDest = Join-Path $Destino "skills"
$agentsDest = Join-Path $Destino "agents"
New-Item -ItemType Directory -Force $skillsDest, $agentsDest | Out-Null

Get-ChildItem (Join-Path $raiz "skills") -Directory | ForEach-Object {
  $alvo = Join-Path $skillsDest $_.Name
  robocopy $_.FullName $alvo /E /PURGE /XD node_modules .next .auditoria /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "robocopy falhou em $($_.Name) (código $LASTEXITCODE)" }
  Write-Host "skill  $($_.Name)"
}

Get-ChildItem (Join-Path $raiz "agents") -Filter *.md | Where-Object Name -ne "README.md" | ForEach-Object {
  Copy-Item $_.FullName -Destination $agentsDest -Force
  Write-Host "agente $($_.BaseName)"
}

$global:LASTEXITCODE = 0
Write-Host "VillaOS instalado em $Destino"
