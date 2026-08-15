# Start both dev servers (client:5173 + admin:5174), each in its own window.
# Usage:  .\dev-all.ps1   (run from repo root)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "Starting admin dev server (5174) ..."
Start-Process powershell `
  -WorkingDirectory (Join-Path $root "admin") `
  -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "Starting client dev server (5173) ..."
Start-Process powershell `
  -WorkingDirectory (Join-Path $root "client") `
  -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "Two windows opened:"
Write-Host "  admin   -> http://127.0.0.1:5174/admin"
Write-Host "  client  -> http://127.0.0.1:5173  (enter page -> click Admin button -> /admin)"
