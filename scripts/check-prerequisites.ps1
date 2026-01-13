# Check Prerequisites for Uyirgene Application
# This script checks if all required tools are installed

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Uyirgene - Prerequisites Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Java
Write-Host "Checking Java..." -NoNewline
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    if ($javaVersion -match "17|18|19|20|21") {
        Write-Host " ✓ Found: $javaVersion" -ForegroundColor Green
    } else {
        Write-Host " ✗ Java 17+ required, found: $javaVersion" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    Write-Host "   Download from: https://adoptium.net/" -ForegroundColor Yellow
    $allGood = $false
}

# Check Maven
Write-Host "Checking Maven..." -NoNewline
try {
    $mavenVersion = mvn -version 2>&1 | Select-String "Apache Maven" | Select-Object -First 1
    Write-Host " ✓ Found: $mavenVersion" -ForegroundColor Green
} catch {
    Write-Host " ⚠ Maven wrapper will be used" -ForegroundColor Yellow
}

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    if ([version]$nodeVersion.TrimStart('v') -ge [version]"16.0.0") {
        Write-Host " ✓ Found: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host " ✗ Node.js 16+ required, found: $nodeVersion" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -NoNewline
try {
    $npmVersion = npm --version
    Write-Host " ✓ Found: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host " ✗ Not found (should come with Node.js)" -ForegroundColor Red
    $allGood = $false
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL..." -NoNewline
try {
    $pgVersion = psql --version 2>&1
    if ($pgVersion -match "psql") {
        Write-Host " ✓ Found: $pgVersion" -ForegroundColor Green
    } else {
        throw "PostgreSQL not found"
    }
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    Write-Host "   Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    $allGood = $false
}

# Check if PostgreSQL service is running
Write-Host "Checking PostgreSQL service..." -NoNewline
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Where-Object {$_.Status -eq "Running"} | Select-Object -First 1
if ($pgService) {
    Write-Host " ✓ Running: $($pgService.Name)" -ForegroundColor Green
} else {
    Write-Host " ✗ Not running" -ForegroundColor Red
    Write-Host "   Start PostgreSQL from Services or pgAdmin" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✓ All prerequisites met!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: .\scripts\setup-database.ps1" -ForegroundColor White
    Write-Host "2. Run: .\scripts\start-backend.ps1" -ForegroundColor White
    Write-Host "3. Run: .\scripts\start-frontend.ps1" -ForegroundColor White
} else {
    Write-Host "✗ Some prerequisites are missing" -ForegroundColor Red
    Write-Host "Please install the missing tools and try again" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
