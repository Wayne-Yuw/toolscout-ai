@echo off
chcp 65001 >nul
echo ========================================
echo   ToolScout AI - 依赖快速安装
echo ========================================
echo.

echo 此脚本将自动安装前后端所需的所有依赖
echo.

REM 安装后端依赖
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📦 正在安装后端依赖...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd /d "%~dp0..\backend"

REM 检查虚拟环境
if exist "venv\Scripts\activate.bat" (
    echo ✅ 使用虚拟环境
    call venv\Scripts\activate.bat
) else (
    echo ⚠️  未使用虚拟环境（建议创建: python -m venv venv）
)

echo.
echo 📥 升级 pip 和核心工具...
python -m pip install --upgrade pip setuptools wheel

echo.
echo 📥 安装 Web 框架...
pip install fastapi==0.104.1 uvicorn[standard]==0.24.0

echo.
echo 📥 安装数据库相关...
pip install sqlalchemy==2.0.25 psycopg2-binary==2.9.9 alembic==1.13.0

echo.
echo 📥 安装认证相关...
pip install pyjwt==2.8.0 bcrypt==4.1.2 email-validator==2.1.0

echo.
echo 📥 安装其他依赖...
pip install python-dotenv==1.0.0 python-multipart==0.0.6 redis==5.0.1

echo.
echo 📥 安装 Pydantic...
pip install "pydantic==2.5.0" "pydantic-settings==2.1.0"

echo.
echo ✅ 后端依赖安装完成！
echo.

REM 安装前端依赖
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📦 正在安装前端依赖...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd /d "%~dp0..\frontend"

REM 检查 Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，无法安装前端依赖
    echo 💡 请先安装 Node.js: https://nodejs.org/
    goto :frontend_skip
)

echo 📥 正在运行 npm install...
echo （这可能需要几分钟时间）
echo.

call npm install

echo.
echo ✅ 前端依赖安装完成！
:frontend_skip

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   🎉 依赖安装完成！
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 📋 后续步骤:
echo.
echo 1. 配置数据库连接（如果还没有）
echo    编辑 backend\.env 文件
echo.
echo 2. 运行环境检查
echo    docs\check-environment.bat
echo.
echo 3. 启动服务
echo    docs\start-all.bat
echo.

pause
