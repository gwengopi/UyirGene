# Start Uyirgene Backend Application
# Runs Spring Boot with dev profile and mock payment

param(
    [switch]$Build = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Uyirgene - Starting Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env
if (Test-Path ".env") {
    Write-Host "Loading configuration from .env..." -ForegroundColor Yellow
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  Set $key" -ForegroundColor Gray
        }
    }
    Write-Host "✓ Configuration loaded" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    Write-Host "Please run .\scripts\setup-database.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Check if we need to build
if ($Build) {
    Write-Host ""
    Write-Host "Building application..." -ForegroundColor Yellow
    if (Test-Path "mvnw.cmd") {
        .\mvnw.cmd clean package -DskipTests
    } else {
        mvn clean package -DskipTests
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Build successful" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "This may take 30-60 seconds on first run..." -ForegroundColor Gray
Write-Host ""
Write-Host "Watch for these messages:" -ForegroundColor Cyan
Write-Host "  - Flyway migration successful" -ForegroundColor Gray
Write-Host "  - Started UyirgeneApplication" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the application
if (Test-Path "mvnw.cmd") {
    .\mvnw.cmd spring-boot:run
} else {
    mvn spring-boot:run
}
