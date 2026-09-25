$tempDir = Join-Path $env:TEMP 'nodejs'
if (!(Test-Path $tempDir)) { New-Item -ItemType Directory -Path $tempDir -Force | Out-Null }
$zipFile = Join-Path $tempDir 'node.zip'
$url = 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip'
Write-Host "Downloading Node.js..."
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
$wc = New-Object System.Net.WebClient
$wc.DownloadFile($url, $zipFile)
Write-Host "Downloaded. Extracting..."
Expand-Archive -Path $zipFile -DestinationPath $tempDir -Force
$nodeDir = Get-ChildItem $tempDir -Directory | Where-Object { $_.Name -like 'node-*' } | Select-Object -First 1
$nodeExe = Join-Path $nodeDir.FullName 'node.exe'
Write-Host "Testing: $nodeExe"
& $nodeExe --version
