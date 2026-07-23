@echo off
REM Use this if PowerShell blocks npm. Runs npm via Command Prompt.
cd /d "C:\DASHBOARD\CSAT-Analysis-Dashboard"
call npm install
echo.
echo Done. Run "npm start" from the same folder when needed.
pause
