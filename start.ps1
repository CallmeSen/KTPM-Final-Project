Write-Host "=== Starting Online Bookstore Application ===" -ForegroundColor Green
Write-Host ""

Write-Host "1. Checking Docker..." -ForegroundColor Cyan
$dockerVersion = docker --version 2>$null
if ($dockerVersion) {
    Write-Host "   Docker OK" -ForegroundColor Green
} else {
    Write-Host "   Docker not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Starting MySQL Database..." -ForegroundColor Cyan
Set-Location "d:\kiemthu\KTPM-Final-Project"
docker-compose up -d db
Write-Host "   Waiting 10 seconds for database..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "   Database started" -ForegroundColor Green

Write-Host ""
Write-Host "3. Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\kiemthu\KTPM-Final-Project\Backend'; npm run start:dev"
Write-Host "   Backend terminal opened" -ForegroundColor Green
Write-Host "   Waiting 15 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "4. Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\kiemthu\KTPM-Final-Project\Frontend'; npm run dev"
Write-Host "   Frontend terminal opened" -ForegroundColor Green
Write-Host "   Waiting 10 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "=== Application Ready ===" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "GraphQL:  http://localhost:8000/graphql" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to close this window..." -ForegroundColor Yellow
Read-Host
