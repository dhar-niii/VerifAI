$nodeDir = Join-Path $env:TEMP 'nodejs'
$subdir = Get-ChildItem $nodeDir -Directory | Where-Object { $_.Name -like 'node-*' } | Select-Object -First 1
$npmCmd = Join-Path $subdir.FullName 'npm.cmd'
$logDir = 'C:\Users\Del\Desktop\.freebuff\.freebuff'

Start-Process -FilePath $npmCmd -ArgumentList 'run','dev' -WorkingDirectory 'C:\Users\Del\Desktop\.freebuff\frontend' -RedirectStandardOutput "$logDir\frontend.log" -RedirectStandardError "$logDir\frontend.err" -WindowStyle Hidden -PassThru | Select-Object -ExpandProperty Id
