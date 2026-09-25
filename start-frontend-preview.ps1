$nodeDir = Join-Path $env:TEMP 'nodejs'
$subdir = Get-ChildItem $nodeDir -Directory | Where-Object { $_.Name -like 'node-*' } | Select-Object -First 1
$env:PATH = "$($subdir.FullName);$env:PATH"
Set-Location 'C:\Users\Del\Desktop\.freebuff\frontend'
& npx.cmd vite --port 3000 --host
