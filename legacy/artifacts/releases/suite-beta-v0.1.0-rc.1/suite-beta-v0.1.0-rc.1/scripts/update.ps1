$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
    git submodule sync --recursive
    if ($LASTEXITCODE -ne 0) { throw "Falha ao sincronizar os URLs dos submodules." }

    git submodule update --init --recursive --remote
    if ($LASTEXITCODE -ne 0) { throw "Falha ao atualizar os submodules." }

    Write-Host "Submodules atualizados. Revise 'git status' e faça commit dos novos ponteiros no repositório pai."
} finally {
    Pop-Location
}
