@echo off
chcp 65001 >nul
echo ========================================
echo   ToolScout AI - Restart All Services
echo ========================================
echo.

REM Switch to the directory of this script
cd /d "%~dp0"

echo Stopping backend (port 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo   Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Stopping frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo   Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Waiting for ports to be released...
timeout /t 2 /nobreak >nul

echo.
echo Starting all services...
call "%~dp0start-all.bat"

REM Remove pause below if you don't want the window to stay open
pause
