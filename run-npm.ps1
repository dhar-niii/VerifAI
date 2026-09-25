param(
    [string]$Command,
    [string]$WorkingDir
)
$nodeDir = Join-Path $env:TEMP 'nodejs'
$subdir = Get-ChildItem $nodeDir -Directory | Where-Object { $_.Name -like 'node-*' } | Select-Object -First 1
$env:PATH = "$($subdir.FullName);$env:PATH"
Set-Location $WorkingDir
Write-Host "Running: $Command in $WorkingDir"
Invoke-Expression $Command
