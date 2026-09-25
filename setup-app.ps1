$nodeDir = Join-Path $env:TEMP 'nodejs'
$subdir = Get-ChildItem $nodeDir -Directory | Where-Object { $_.Name -like 'node-*' } | Select-Object -First 1
$env:PATH = "$($subdir.FullName);$env:PATH"

Write-Host "Node: $(node --version)"
Write-Host "NPM: $(npm --version)"

Write-Host "`n=== Installing backend dependencies ==="
Set-Location 'C:\Users\Del\Desktop\.freebuff\backend'
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED backend install"; exit 1 }

Write-Host "`n=== Seeding database ==="
node database/seed.js

Write-Host "`n=== Installing frontend dependencies ==="
Set-Location 'C:\Users\Del\Desktop\.freebuff\frontend'
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED frontend install"; exit 1 }

Write-Host "`n=== Setup complete ==="
