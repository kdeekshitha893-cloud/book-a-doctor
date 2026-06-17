# MedConnect Portal Startup Runner
$nodeDir = "C:\Users\Administrator\.gemini\antigravity\scratch\node_portable\node-v20.12.2-win-x64"

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "              MedConnect Portal System Startup            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start Backend in a new window
Write-Host "[1/2] Booting Express API (Port 5000) with in-memory MongoDB..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = '$nodeDir;' + `$env:PATH; Set-Location 'C:\Users\Administrator\.gemini\antigravity\scratch\medconnect\backend'; node src/index.js"

# 2. Start Frontend in a new window
Write-Host "[2/2] Booting Vite/React Development Server (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = '$nodeDir;' + `$env:PATH; Set-Location 'C:\Users\Administrator\.gemini\antigravity\scratch\medconnect\frontend'; npm run dev"

# 3. Print access info
Write-Host ""
Write-Host "Launch initiated successfully! Verify endpoints in your web browser:" -ForegroundColor Green
Write-Host "  -> Frontend Portal:    http://localhost:5173" -ForegroundColor Green
Write-Host "  -> Backend API Health: http://localhost:5000/api/health" -ForegroundColor Green
Write-Host ""
Write-Host "Default Demo Accounts (Credentials):" -ForegroundColor Cyan
Write-Host "  * Patient Account:   patient1@medconnect.com  / patient123"
Write-Host "  * Verified Doctor:   doctor1@medconnect.com   / doctor123"
Write-Host "  * Unverified Doctor: doctor2@medconnect.com   / doctor123"
Write-Host "  * System Admin:      admin@medconnect.com     / admin123"
Write-Host "==========================================================" -ForegroundColor Cyan
