@echo off
REM Launches the Office Attendance Compliance app under waitress.
REM Used by the Windows Service (NSSM) / Scheduled Task so it survives reboots.
cd /d "%~dp0"
"C:\Users\azureuser\AppData\Local\Programs\Python\Python314\python.exe" -m waitress --port=5000 app:app