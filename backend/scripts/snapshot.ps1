$ErrorActionPreference = "SilentlyContinue"

function Resolve-ProjectRoot {
    $scriptPath = $MyInvocation.MyCommand.Path
    if (-not $scriptPath) { return (Get-Location).Path }
    $scriptDir = Split-Path -Parent $scriptPath
    $rootGuess = Join-Path $scriptDir "..\.."
    return [System.IO.Path]::GetFullPath($rootGuess)
}

$root = Resolve-ProjectRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$dockerDir = Join-Path $root "docker"

$outFile = Join-Path $PSScriptRoot "snapshot.txt"

function Write-Log($text = "") {
    $text | Tee-Object -FilePath $outFile -Append
}

Write-Log "=== NEXORA SNAPSHOT REPORT ==="
Write-Log "Time: $(Get-Date)"
Write-Log "Root: $root"
Write-Log ""

Write-Log "--- System ---"
Write-Log "Node: $(node -v)"
Write-Log "NPM : $(npm -v)"
Write-Log "PWD : $(Get-Location)"
Write-Log ""

Write-Log "--- Git ---"
if (Test-Path (Join-Path $root ".git")) {
    Write-Log (git -C $root rev-parse --abbrev-ref HEAD)
    Write-Log (git -C $root --no-pager log -1 --oneline)
} else {
    Write-Log "No git repository"
}
Write-Log ""

Write-Log "--- Docker ---"
Write-Log (docker version --format '{{.Server.Version}}')
Write-Log (docker compose version)
Write-Log ""

Write-Log "--- Containers ---"
Write-Log (docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
Write-Log ""

Write-Log "--- Ports ---"
Write-Log (netstat -ano | findstr ":5000")
Write-Log (netstat -ano | findstr ":5173")
Write-Log (netstat -ano | findstr ":27017")
Write-Log ""

Write-Log "--- Project structure ---"
if (Test-Path (Join-Path $backend "src")) {
    Write-Log "backend/src:"
    cmd /c "cd /d $backend && tree /F /A src" | Select-Object -First 200 | ForEach-Object { Write-Log $_ }
}
Write-Log ""

if (Test-Path $frontend) {
    Write-Log "frontend:"
    cmd /c "cd /d $root && tree /F /A frontend" | Select-Object -First 150 | ForEach-Object { Write-Log $_ }
}
Write-Log ""

Write-Log "--- Backend key files ---"
$paths = @("src\app.js","src\server.js","src\db\seed\index.js",".env","package.json")
foreach ($rel in $paths) {
    $p = Join-Path $backend $rel
    if (Test-Path $p) { Write-Log "OK   backend\$rel" } else { Write-Log "MISS backend\$rel" }
}
Write-Log ""

Write-Log "--- Backend scripts ---"
$backendPkg = Join-Path $backend "package.json"
if (Test-Path $backendPkg) {
    node -e "const p=require(process.argv[1]); console.log(JSON.stringify(p.scripts,null,2));" $backendPkg | ForEach-Object { Write-Log $_ }
}
Write-Log ""

Write-Log "--- Backend .env keys ---"
$backendEnv = Join-Path $backend ".env"
if (Test-Path $backendEnv) {
    Get-Content $backendEnv | Where-Object { $_ -and $_ -notmatch '^\s*#' } | ForEach-Object {
        $k = ($_ -split '=',2)[0].Trim()
        Write-Log "$k=***"
    }
}
Write-Log ""

Write-Log "=== END REPORT ==="

Write-Host ""
Write-Host "Snapshot created:"
Write-Host $outFile
Write-Host ""
