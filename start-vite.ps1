$nodeDir = Join-Path $env:TEMP 'nodejs'
$subdir = Get-ChildItem $nodeDir -Directory | Where-Object { $_.Name -like 'node-*' } | Select-Object -First 1
$env:PATH = "$($subdir.FullName);$env:PATH"

$viteBin = 'C:\Users\Del\Desktop\.freebuff\frontend\node_modules\.bin\vite.cmd'

Set-Location 'C:\Users\Del\Desktop\.freebuff\frontend'
& $viteBin --port 3000 --host
