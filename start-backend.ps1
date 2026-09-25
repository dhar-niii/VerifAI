$nodeDir = Join-Path $env:TEMP 'nodejs'
$subdir = Get-ChildItem $nodeDir -Directory | Where-Object { $_.Name -like 'node-*' } | Select-Object -First 1
$nodeExe = Join-Path $subdir.FullName 'node.exe'
$npmCmd = Join-Path $subdir.FullName 'npm.cmd'

$env:PATH = "$($subdir.FullName);$env:PATH"
Set-Location 'C:\Users\Del\Desktop\.freebuff\backend'
& $nodeExe server.js
