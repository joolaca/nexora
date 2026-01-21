$ErrorActionPreference = "SilentlyContinue"

$root = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$outFile = Join-Path $PSScriptRoot "snapshot.txt"

function Log($text = "") {
    $text | Tee-Object -FilePath $outFile -Append
}

Log "=== NEXORA FRONTEND SNAPSHOT ==="
Log "Time: $(Get-Date)"
Log "Path: $root"
Log ""

Log "--- System ---"
Log "Node: $(node -v)"
Log "NPM : $(npm -v)"
Log ""

Log "--- Vite ---"
if (Test-Path "$root\node_modules\.bin\vite.cmd") {
    Log "Vite installed"
} else {
    Log "Vite NOT found"
}
Log ""

Log "--- Running dev server ---"
netstat -ano | findstr ":5173" | ForEach-Object { Log $_ }
Log ""

Log "--- package.json scripts ---"
node -e "const p=require('./package.json'); console.log(JSON.stringify(p.scripts,null,2));" $root | ForEach-Object { Log $_ }
Log ""

Log "--- vite.config.js ---"
if (Test-Path "$root\vite.config.js") {
    Get-Content "$root\vite.config.js" | ForEach-Object { Log $_ }
}
Log ""

Log "--- Key files ---"
$files = @("src\App.jsx","index.html","vite.config.js","package.json")
foreach ($f in $files) {
    if (Test-Path "$root\$f") { Log "OK   $f" } else { Log "MISS $f" }
}
Log ""

Log "--- Project tree (limited) ---"
cmd /c "cd /d $root && tree /F /A src" | Select-Object -First 200 | ForEach-Object { Log $_ }

Log ""
Log "=== END SNAPSHOT ==="

Write-Host ""
Write-Host "Frontend snapshot created:"
Write-Host $outFile
Write-Host ""
