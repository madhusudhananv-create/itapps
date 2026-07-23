@echo off
REM Run this as Administrator if you get EPERM when deleting node_modules
REM Right-click remove-node-modules.cmd -> Run as administrator

cd /d "C:\DASHBOARD\CSAT-Analysis-Dashboard"

echo Stopping any Node processes in this project...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Removing node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    if exist node_modules (
        echo.
        echo FAILED: node_modules still exists. Something is locking it.
        echo 1. Close Cursor/VS Code completely
        echo 2. Close all terminals
        echo 3. Restart PC, then run this script again as Administrator
        pause
        exit /b 1
    )
    echo node_modules removed successfully.
) else (
    echo node_modules not found.
)

echo.
echo Now run in a normal terminal:
echo   cd C:\DASHBOARD\CSAT-Analysis-Dashboard
echo   npm install
echo   npm start
echo.
pause
