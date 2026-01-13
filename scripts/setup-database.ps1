# Setup Database for Uyirgene Application
# Creates the database and applies migrations

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Uyirgene - Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for PostgreSQL credentials
$dbUser = Read-Host "Enter PostgreSQL username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) {
    $dbUser = "postgres"
}

$dbPassword = Read-Host "Enter PostgreSQL password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
$dbPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Creating database 'UyirGene'..." -ForegroundColor Yellow

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPasswordPlain

# Check if database exists
$checkDb = "SELECT 1 FROM pg_database WHERE datname='UyirGene';"
$dbExists = psql -U $dbUser -h localhost -p 5432 -d postgres -t -c $checkDb 2>&1

if ($dbExists -match "1") {
    Write-Host "Database 'UyirGene' already exists" -ForegroundColor Yellow
    $recreate = Read-Host "Do you want to recreate it? (y/N)"

    if ($recreate -eq "y" -or $recreate -eq "Y") {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        psql -U $dbUser -h localhost -p 5432 -d postgres -c "DROP DATABASE IF EXISTS `"UyirGene`";" 2>&1 | Out-Null

        Write-Host "Creating fresh database..." -ForegroundColor Yellow
        psql -U $dbUser -h localhost -p 5432 -d postgres -c "CREATE DATABASE `"UyirGene`";" 2>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Database recreated successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to recreate database" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "Creating database..." -ForegroundColor Yellow
    psql -U $dbUser -h localhost -p 5432 -d postgres -c "CREATE DATABASE `"UyirGene`";" 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database created successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database" -ForegroundColor Red
        Write-Host "Error details:" -ForegroundColor Red
        psql -U $dbUser -h localhost -p 5432 -d postgres -c "CREATE DATABASE `"UyirGene`";"
        exit 1
    }
}

# Clear PGPASSWORD
$env:PGPASSWORD = $null

# Save credentials to .env file for later use
Write-Host ""
Write-Host "Saving database configuration..." -ForegroundColor Yellow

$envContent = @"
# Database Configuration
DB_USERNAME=$dbUser
DB_PASSWORD=$dbPasswordPlain
DATABASE_URL=jdbc:postgresql://localhost:5432/UyirGene

# Spring Profile
SPRING_PROFILES_ACTIVE=dev

# Mail Configuration (optional - for testing use Mailtrap)
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
"@

Set-Content -Path ".env" -Value $envContent -Force
Write-Host "✓ Configuration saved to .env" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Run .\scripts\start-backend.ps1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
