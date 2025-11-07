@echo off
chcp 65001 >nul
echo ========================================
echo   ToolScout AI - 停止所有服务
echo ========================================
echo.

echo 🛑 正在停止后端服务 (端口 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo    终止进程 PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo 🛑 正在停止前端服务 (端口 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo    终止进程 PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ✅ 所有服务已停止
echo.

pause
