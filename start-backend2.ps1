$nodeDir = Join-Path $env:TEMP 'nodejs'
$subdir = Get-ChildItem $nodeDir -Directory | Where-Object { $_.Name -like 'node-*' } | Select-Object -First 1
$nodeExe = Join-Path $subdir.FullName 'node.exe'
$logDir = 'C:\Users\Del\Desktop\.freebuff\.freebuff'

$proc = Start-Process -FilePath $nodeExe -ArgumentList 'server.js' -WorkingDirectory 'C:\Users\Del\Desktop\.freebuff\backend' -RedirectStandardOutput "$logDir\backend.log" -RedirectStandardError "$logDir\backend.err" -WindowStyle Hidden -PassThru
$proc.Id | Out-File "$logDir\backend.pid"
Write-Host "Backend PID: $($proc.Id)"
