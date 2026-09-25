$nodeDir = Join-Path $env:TEMP 'nodejs'
$subdir = Get-ChildItem $nodeDir -Directory | Where-Object { $_.Name -like 'node-*' } | Select-Object -First 1
$env:PATH = "$($subdir.FullName);$env:PATH"

$npmCmd = Join-Path $subdir.FullName 'npm.cmd'
Set-Location 'C:\Users\Del\Desktop\.freebuff\frontend'
& $npmCmd run dev 2>&1 | ForEach-Object { $_ }
