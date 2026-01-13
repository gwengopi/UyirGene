# Run All Services for Uyirgene Application
# Starts backend and frontend in separate windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Uyirgene - Start All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Database not configured yet" -ForegroundColor Yellow
    Write-Host "Running database setup..." -ForegroundColor Cyan
    Write-Host ""
    .\scripts\setup-database.ps1
    Write-Host ""
}

Write-Host "Starting backend in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", ".\scripts\start-backend.ps1"

Write-Host "Waiting for backend to start (30 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

Write-Host "Starting frontend in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", ".\scripts\start-frontend.ps1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Services starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Two PowerShell windows should have opened:" -ForegroundColor Cyan
Write-Host "  1. Backend  (http://localhost:8080)" -ForegroundColor White
Write-Host "  2. Frontend (http://localhost:5173)" -ForegroundColor White
Write-Host ""
Write-Host "Wait 1-2 minutes for services to fully start" -ForegroundColor Yellow
Write-Host "Then run: .\scripts\test-application.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or open browser to: http://localhost:5173" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
