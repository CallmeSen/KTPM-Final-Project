# Script to stop the Online Bookstore application

Write-Host "=== Stopping Online Bookstore Application ===" -ForegroundColor Red
Write-Host ""

# Stop Docker containers
Write-Host "1. Stopping Docker containers..." -ForegroundColor Cyan
Set-Location "d:\kiemthu\KTPM-Final-Project"
docker-compose down
Write-Host "   Docker containers stopped ✓" -ForegroundColor Green

# Kill Node processes on ports 3000 and 8000
Write-Host ""
Write-Host "2. Stopping Backend and Frontend servers..." -ForegroundColor Cyan

# Find and kill process on port 8000 (Backend)
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    $processId = $port8000.OwningProcess | Select-Object -First 1
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "   Backend server (port 8000) stopped ✓" -ForegroundColor Green
}

# Find and kill process on port 3000 (Frontend)
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $processId = $port3000.OwningProcess | Select-Object -First 1
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "   Frontend server (port 3000) stopped ✓" -ForegroundColor Green
}

Write-Host ""
Write-Host "All services stopped!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
