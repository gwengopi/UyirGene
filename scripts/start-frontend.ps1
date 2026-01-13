# Start Uyirgene Frontend Application
# Runs React dev server with Vite

param(
    [switch]$Install = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Uyirgene - Starting Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Push-Location frontend

# Check if node_modules exists
if (-not (Test-Path "node_modules") -or $Install) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes on first run..." -ForegroundColor Gray
    npm install

    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Installation failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Starting frontend dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "The application will open in your browser at:" -ForegroundColor Cyan
Write-Host "  http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Features to test:" -ForegroundColor Cyan
Write-Host "  ✓ Dark theme (black/gray background)" -ForegroundColor Gray
Write-Host "  ✓ User registration and login" -ForegroundColor Gray
Write-Host "  ✓ Course enrollment with mock payment" -ForegroundColor Gray
Write-Host "  ✓ Toast notifications (no browser alerts)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start dev server
npm run dev

Pop-Location
