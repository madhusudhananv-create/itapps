# Fix npm install when node_modules is locked (unlink error)
# Run this from project folder. Close "npm start" and Cursor/IDE if possible first.

$projectRoot = "c:\DASHBOARD\CSAT-Analysis-Dashboard"
Set-Location $projectRoot

Write-Host "Removing node_modules (this may take a moment)..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    # If Remove-Item fails due to long paths, try robocopy trick
    if (Test-Path "node_modules") {
        Write-Host "Trying alternate removal with cmd /c rmdir..." -ForegroundColor Yellow
        cmd /c "rmdir /s /q node_modules"
    }
}
if (Test-Path "node_modules") {
    Write-Host "ERROR: Could not remove node_modules. Please close all programs (npm start, Cursor, terminals) and run: Remove-Item -Recurse -Force node_modules" -ForegroundColor Red
    exit 1
}
Write-Host "node_modules removed." -ForegroundColor Green

Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null

Write-Host "Running npm install..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Done. You can run: npm start" -ForegroundColor Green
