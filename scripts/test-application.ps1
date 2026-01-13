# Test Uyirgene Application
# Verifies backend and frontend are running

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Uyirgene - Application Tester" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Test Backend Health
Write-Host "Testing backend health..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method Get -TimeoutSec 5
    if ($response.status -eq "UP") {
        Write-Host " ✓ Backend is healthy" -ForegroundColor Green
    } else {
        Write-Host " ✗ Backend status: $($response.status)" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host " ✗ Backend not responding" -ForegroundColor Red
    Write-Host "   Make sure backend is running: .\scripts\start-backend.ps1" -ForegroundColor Yellow
    $allGood = $false
}

# Test Frontend
Write-Host "Testing frontend..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host " ✓ Frontend is running" -ForegroundColor Green
    } else {
        Write-Host " ✗ Frontend returned: $($response.StatusCode)" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host " ✗ Frontend not responding" -ForegroundColor Red
    Write-Host "   Make sure frontend is running: .\scripts\start-frontend.ps1" -ForegroundColor Yellow
    $allGood = $false
}

# Test Database Connection
Write-Host "Testing database connection..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method Get -TimeoutSec 5
    if ($response.components.db.status -eq "UP") {
        Write-Host " ✓ Database connected" -ForegroundColor Green
    } else {
        Write-Host " ✗ Database not connected" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host " ⚠ Unable to check database" -ForegroundColor Yellow
}

# Test API Endpoints
Write-Host "Testing API endpoints..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/courses" -Method Get -TimeoutSec 5
    Write-Host " ✓ API accessible" -ForegroundColor Green
} catch {
    Write-Host " ✗ API not accessible" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✓ All systems operational!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Open your browser to:" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "  Backend:  http://localhost:8080/actuator/health" -ForegroundColor White
    Write-Host "  API Docs: http://localhost:8080/swagger-ui.html" -ForegroundColor White
    Write-Host ""
    Write-Host "Manual Testing Steps:" -ForegroundColor Cyan
    Write-Host "1. Register a new user" -ForegroundColor White
    Write-Host "2. Login with credentials" -ForegroundColor White
    Write-Host "3. Browse courses (note the dark theme)" -ForegroundColor White
    Write-Host "4. Enroll in a course (mock payment will work)" -ForegroundColor White
    Write-Host "5. Check 'My Courses' to see enrolled courses" -ForegroundColor White
} else {
    Write-Host "✗ Some components are not working" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure both backend and frontend are running:" -ForegroundColor Yellow
    Write-Host "  Terminal 1: .\scripts\start-backend.ps1" -ForegroundColor White
    Write-Host "  Terminal 2: .\scripts\start-frontend.ps1" -ForegroundColor White
}

Write-Host "========================================" -ForegroundColor Cyan
