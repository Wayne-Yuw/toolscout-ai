@echo off
chcp 65001 >nul
echo ========================================
echo   ToolScout AI - 启动所有服务
echo ========================================
echo.

cd /d "%~dp0"

echo 🚀 正在启动后端和前端服务...
echo.
echo ⚠️  提示: 这将打开两个新的命令行窗口
echo    - 后端服务 (端口 8000)
echo    - 前端服务 (端口 3000)
echo.

REM 启动后端服务（新窗口）
start "ToolScout AI - Backend" cmd /k "%~dp0start-backend.bat"

REM 等待 2 秒
timeout /t 2 /nobreak >nul

REM 启动前端服务（新窗口）
start "ToolScout AI - Frontend" cmd /k "%~dp0start-frontend.bat"

echo.
echo ✅ 服务启动命令已执行
echo.
echo 📌 服务地址:
echo    后端: http://localhost:8000
echo    前端: http://localhost:3000
echo    API文档: http://localhost:8000/docs
echo.
echo 💡 要停止服务，请在相应的窗口中按 Ctrl+C
echo.

pause
