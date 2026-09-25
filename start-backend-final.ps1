$nodeDir = Join-Path $env:TEMP 'nodejs'
$subdir = Get-ChildItem $nodeDir -Directory | Where-Object { $_.Name -like 'node-*' } | Select-Object -First 1
$nodeExe = Join-Path $subdir.FullName 'node.exe'
$logDir = 'C:\Users\Del\Desktop\.freebuff\.freebuff'
$env:PORT = '5000'
$env:DB_PATH = 'C:\Users\Del\Desktop\.freebuff\backend\database\globetrotter.db'
$env:JWT_SECRET = 'globetrotter-hackathon-secret-key-2024'

Start-Process -FilePath $nodeExe -ArgumentList 'server.js' -WorkingDirectory 'C:\Users\Del\Desktop\.freebuff\backend' -RedirectStandardOutput "$logDir\backend.log" -RedirectStandardError "$logDir\backend.err" -WindowStyle Hidden
Write-Host "Backend start command dispatched"
