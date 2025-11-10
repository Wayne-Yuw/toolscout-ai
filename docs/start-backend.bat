@echo off
chcp 65001 >nul
echo ========================================
echo   ToolScout AI - Backend Start
echo ========================================
echo.

cd /d "%~dp0..\backend"

echo Current directory: %CD%
echo.

REM Activate virtualenv if exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo WARNING: No virtualenv (venv) found. Using system Python.
)

REM Check required Python deps (pydantic_settings)
echo Checking backend dependencies...
python -c "import pydantic_settings" 2>nul
if errorlevel 1 (
    echo Installing dependencies from requirements.txt (this may take a few minutes)...

    python -m pip install --upgrade pip setuptools wheel
    python -m pip install -r requirements.txt

    echo Dependencies installed.
    echo.
)

REM Check .env presence
if not exist ".env" (
    echo WARNING: .env not found. Please configure DB connection and other settings.
)

echo.
echo ========================================
echo   Starting backend (http://localhost:8000)
echo ========================================
echo.

echo Press Ctrl+C to stop the server.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
