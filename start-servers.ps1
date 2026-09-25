$nodeDir = Join-Path $env:TEMP 'nodejs'
$subdir = Get-ChildItem $nodeDir -Directory | Where-Object { $_.Name -like 'node-*' } | Select-Object -First 1
$nodeExe = Join-Path $subdir.FullName 'node.exe'
$npmCmd = Join-Path $subdir.FullName 'npm.cmd'
$logDir = 'C:\Users\Del\Desktop\.freebuff\.freebuff'

# Start backend
Write-Host "Starting backend server..."
$backendProc = Start-Process -FilePath $nodeExe -ArgumentList 'server.js' -WorkingDirectory 'C:\Users\Del\Desktop\.freebuff\backend' -RedirectStandardOutput "$logDir\backend.log" -RedirectStandardError "$logDir\backend.err" -WindowStyle Hidden -PassThru
Write-Host "Backend PID: $($backendProc.Id)"

# Wait for backend to be ready
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend dev server..."
$frontendProc = Start-Process -FilePath $npmCmd -ArgumentList 'run','dev' -WorkingDirectory 'C:\Users\Del\Desktop\.freebuff\frontend' -RedirectStandardOutput "$logDir\frontend.log" -RedirectStandardError "$logDir\frontend.err" -WindowStyle Hidden -PassThru
Write-Host "Frontend PID: $($frontendProc.Id)"

# Wait for frontend to be ready
Start-Sleep -Seconds 5

# Verify both are running
$backendAlive = Get-Process -Id $backendProc.Id -ErrorAction SilentlyContinue
$frontendAlive = Get-Process -Id $frontendProc.Id -ErrorAction SilentlyContinue

if ($backendAlive) { Write-Host "Backend is running (PID $($backendProc.Id))" } else { Write-Host "WARNING: Backend stopped!" }
if ($frontendAlive) { Write-Host "Frontend is running (PID $($frontendProc.Id))" } else { Write-Host "WARNING: Frontend stopped!" }

Write-Host "`nBackend PID: $($backendProc.Id)"
Write-Host "Frontend PID: $($frontendProc.Id)"
