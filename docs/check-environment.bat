@echo off
chcp 65001 >nul
echo ========================================
echo   ToolScout AI - 环境检查工具
echo ========================================
echo.

REM 检查 Python
echo 📍 检查 Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装
    echo 💡 请访问: https://www.python.org/downloads/
    set PYTHON_OK=0
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do echo ✅ Python %%i
    set PYTHON_OK=1
)
echo.

REM 检查 Node.js
echo 📍 检查 Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装
    echo 💡 请访问: https://nodejs.org/
    set NODE_OK=0
) else (
    for /f %%i in ('node -v') do echo ✅ Node.js %%i
    set NODE_OK=1
)
echo.

REM 检查 npm
echo 📍 检查 npm...
npm -v >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装
    set NPM_OK=0
) else (
    for /f %%i in ('npm -v') do echo ✅ npm %%i
    set NPM_OK=1
)
echo.

REM 检查后端依赖
echo 📍 检查后端 Python 依赖...
cd /d "%~dp0..\backend"
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo ❌ FastAPI 未安装
    echo 💡 运行: pip install fastapi
    set BACKEND_DEPS_OK=0
) else (
    echo ✅ FastAPI 已安装
    set BACKEND_DEPS_OK=1
)

python -c "import sqlalchemy" 2>nul
if errorlevel 1 (
    echo ❌ SQLAlchemy 未安装
    set BACKEND_DEPS_OK=0
) else (
    echo ✅ SQLAlchemy 已安装
)

python -c "import uvicorn" 2>nul
if errorlevel 1 (
    echo ❌ Uvicorn 未安装
    set BACKEND_DEPS_OK=0
) else (
    echo ✅ Uvicorn 已安装
)
echo.

REM 检查前端依赖
echo 📍 检查前端 Node 依赖...
cd /d "%~dp0..\frontend"
if exist "node_modules" (
    echo ✅ node_modules 存在
    set FRONTEND_DEPS_OK=1
) else (
    echo ❌ node_modules 不存在
    echo 💡 运行: npm install
    set FRONTEND_DEPS_OK=0
)
echo.

REM 检查配置文件
echo 📍 检查配置文件...
cd /d "%~dp0..\backend"
if exist ".env" (
    echo ✅ backend/.env 存在
    set BACKEND_CONFIG_OK=1
) else (
    echo ⚠️  backend/.env 不存在
    echo 💡 需要创建并配置数据库连接
    set BACKEND_CONFIG_OK=0
)

cd /d "%~dp0..\frontend"
if exist ".env.local" (
    echo ✅ frontend/.env.local 存在
    set FRONTEND_CONFIG_OK=1
) else (
    echo ⚠️  frontend/.env.local 不存在（可自动创建）
    set FRONTEND_CONFIG_OK=1
)
echo.

REM 检查端口占用
echo 📍 检查端口占用...
netstat -ano | findstr ":8000.*LISTENING" >nul 2>&1
if errorlevel 1 (
    echo ✅ 端口 8000 可用（后端）
    set PORT_8000_OK=1
) else (
    echo ⚠️  端口 8000 已被占用
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000.*LISTENING"') do (
        echo    进程 PID: %%a
    )
    set PORT_8000_OK=0
)

netstat -ano | findstr ":3000.*LISTENING" >nul 2>&1
if errorlevel 1 (
    echo ✅ 端口 3000 可用（前端）
    set PORT_3000_OK=1
) else (
    echo ⚠️  端口 3000 已被占用
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do (
        echo    进程 PID: %%a
    )
    set PORT_3000_OK=0
)
echo.

REM 总结
echo ========================================
echo   📊 检查结果总结
echo ========================================
echo.

if %PYTHON_OK%==1 if %NODE_OK%==1 if %NPM_OK%==1 (
    echo ✅ 基础环境: 完整
) else (
    echo ❌ 基础环境: 不完整，请安装缺失的软件
)

if %BACKEND_DEPS_OK%==1 (
    echo ✅ 后端依赖: 已安装
) else (
    echo ❌ 后端依赖: 缺失，运行 start-backend.bat 将自动安装
)

if %FRONTEND_DEPS_OK%==1 (
    echo ✅ 前端依赖: 已安装
) else (
    echo ❌ 前端依赖: 缺失，运行 start-frontend.bat 将自动安装
)

if %BACKEND_CONFIG_OK%==1 (
    echo ✅ 后端配置: 已配置
) else (
    echo ⚠️  后端配置: 需要手动配置 backend/.env
)

if %PORT_8000_OK%==1 if %PORT_3000_OK%==1 (
    echo ✅ 端口状态: 可用
) else (
    echo ⚠️  端口状态: 有端口被占用，可运行 stop-all.bat 释放
)

echo.
echo ========================================
echo.

if %PYTHON_OK%==1 if %NODE_OK%==1 if %BACKEND_CONFIG_OK%==1 (
    echo 🎉 环境检查通过！可以运行 start-all.bat 启动服务
) else (
    echo ⚠️  环境未完全就绪，请按照提示完成配置
)

echo.
pause
