$nodeDir = Join-Path $env:TEMP 'nodejs'
$subdir = Get-ChildItem $nodeDir -Directory | Where-Object { $_.Name -like 'node-*' } | Select-Object -First 1
$nodePath = $subdir.FullName
$npmCmd = Join-Path $nodePath 'npm.cmd'
$logDir = 'C:\Users\Del\Desktop\.freebuff\.freebuff'

# Write a batch wrapper that sets PATH and runs npm
$batchFile = Join-Path $logDir 'start-frontend.cmd'
@"
@echo off
set PATH=$nodePath;%PATH%
cd /d C:\Users\Del\Desktop\.freebuff\frontend
"$npmCmd" run dev
"@ | Out-File -FilePath $batchFile -Encoding ASCII

Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', "`"$batchFile`"" -WindowStyle Hidden -RedirectStandardOutput "$logDir\frontend.log" -RedirectStandardError "$logDir\frontend.err"
Write-Host "Frontend start command dispatched"
