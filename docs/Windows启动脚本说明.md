# Windows 启动脚本说明

## 📁 脚本列表

| 脚本名称 | 功能说明 | 使用场景 |
|---------|---------|---------|
| `start-all.bat` | 启动所有服务（前端+后端） | 开发时一键启动整个项目 |
| `start-backend.bat` | 只启动后端服务 | 只需要后端 API 时使用 |
| `start-frontend.bat` | 只启动前端服务 | 只需要前端界面时使用 |
| `stop-all.bat` | 停止所有服务 | 清理所有运行的服务进程 |

---

## 🚀 使用方法

### 方法 1：双击运行（推荐）

1. 在文件资源管理器中找到 `docs` 目录
2. 双击要运行的 `.bat` 文件
3. 等待服务启动完成

### 方法 2：命令行运行

```cmd
# 从项目根目录执行
cd toolscout-ai

# 启动所有服务
docs\start-all.bat

# 或单独启动
docs\start-backend.bat
docs\start-frontend.bat
```

---

## 📋 详细说明

### 1️⃣ start-all.bat - 启动所有服务

**功能：**
- 自动打开两个命令行窗口
- 窗口 1：后端服务 (端口 8000)
- 窗口 2：前端服务 (端口 3000)

**执行流程：**
1. 检查环境
2. 启动后端服务
3. 等待 2 秒
4. 启动前端服务
5. 显示服务地址

**服务地址：**
- 后端 API: http://localhost:8000
- 前端界面: http://localhost:3000
- API 文档: http://localhost:8000/docs

---

### 2️⃣ start-backend.bat - 启动后端服务

**功能：**
- 启动 FastAPI 后端服务
- 自动检查并激活 Python 虚拟环境
- 自动安装缺失的依赖
- 开启热重载模式

**执行流程：**
1. 切换到 `backend` 目录
2. 检查并激活虚拟环境 (venv)
3. 检查 FastAPI 是否已安装
4. 如果缺失，自动运行 `pip install`
5. 检查 `.env` 配置文件
6. 启动 Uvicorn 服务器

**检查项：**
- ✅ 虚拟环境 (`venv/Scripts/activate.bat`)
- ✅ Python 依赖 (`requirements.txt`)
- ✅ 环境配置 (`.env` 文件)

**启动命令：**
```cmd
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**端口：** 8000

---

### 3️⃣ start-frontend.bat - 启动前端服务

**功能：**
- 启动 Next.js 前端服务
- 自动检查 Node.js 环境
- 自动安装 npm 依赖
- 自动创建 `.env.local` 配置

**执行流程：**
1. 切换到 `frontend` 目录
2. 检查 Node.js 是否安装
3. 显示 Node.js 版本
4. 检查 `node_modules` 目录
5. 如果缺失，自动运行 `npm install`
6. 检查 `.env.local` 配置文件
7. 如果缺失，自动创建默认配置
8. 启动 Next.js 开发服务器

**检查项：**
- ✅ Node.js 安装状态
- ✅ npm 依赖 (`node_modules`)
- ✅ 环境配置 (`.env.local` 文件)

**启动命令：**
```cmd
npm run dev
```

**端口：** 3000

---

### 4️⃣ stop-all.bat - 停止所有服务

**功能：**
- 查找并终止占用 8000 端口的进程（后端）
- 查找并终止占用 3000 端口的进程（前端）
- 清理所有相关的服务进程

**执行流程：**
1. 查找占用端口 8000 的进程
2. 强制终止该进程 (`taskkill /F`)
3. 查找占用端口 3000 的进程
4. 强制终止该进程 (`taskkill /F`)
5. 显示停止结果

**使用场景：**
- 服务无响应时强制停止
- 切换项目前清理进程
- 端口被占用时释放端口

---

## ⚙️ 环境要求

### 后端环境
- ✅ Python 3.11+
- ✅ pip（Python 包管理器）
- ✅ Supabase 数据库（已配置）

### 前端环境
- ✅ Node.js 18+
- ✅ npm 或 pnpm

---

## 🔧 配置说明

### 后端配置文件：`backend/.env`

```env
# 数据库连接（Supabase）
DATABASE_URL=postgresql://postgres:密码@db.项目ID.supabase.co:5432/postgres

# JWT 配置
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS 配置
CORS_ORIGINS=["http://localhost:3000"]

# 调试模式
DEBUG=True
DATABASE_ECHO=False
```

### 前端配置文件：`frontend/.env.local`

```env
# API 服务器地址
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**注意：** 脚本会自动创建默认的 `.env.local` 文件，但后端的 `.env` 需要手动配置数据库连接。

---

## 🐛 常见问题

### Q1: 双击脚本后窗口闪退

**原因：** 路径问题或环境未安装

**解决方案：**
1. 右键点击脚本 → "以管理员身份运行"
2. 在命令行中运行，查看错误信息
3. 检查 Python/Node.js 是否正确安装

### Q2: 提示 "uvicorn 不是内部或外部命令"

**原因：** Python 依赖未安装或虚拟环境未激活

**解决方案：**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Q3: 提示 "npm 不是内部或外部命令"

**原因：** Node.js 未安装或未添加到 PATH

**解决方案：**
1. 下载安装 Node.js: https://nodejs.org/
2. 重启命令行窗口
3. 验证安装：`node -v`

### Q4: 端口被占用

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案：**
```cmd
# 方法 1: 使用停止脚本
docs\stop-all.bat

# 方法 2: 手动查找并终止进程
netstat -ano | findstr :3000
taskkill /F /PID <进程ID>
```

### Q5: 数据库连接失败

**错误信息：**
```
sqlalchemy.exc.OperationalError: connection to server failed
```

**解决方案：**
1. 检查 `backend/.env` 中的 `DATABASE_URL` 是否正确
2. 确认 Supabase 项目是否正常运行
3. 检查网络连接

### Q6: 虚拟环境未创建

**解决方案：**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install bcrypt pyjwt email-validator
```

---

## 💡 开发建议

### 推荐工作流

1. **开发阶段**
   ```cmd
   # 一键启动所有服务
   docs\start-all.bat
   ```

2. **只修改前端**
   ```cmd
   # 只启动前端，节省资源
   docs\start-frontend.bat
   ```

3. **只修改后端**
   ```cmd
   # 只启动后端 API
   docs\start-backend.bat
   ```

4. **结束工作**
   ```cmd
   # 停止所有服务
   docs\stop-all.bat
   ```

### 热重载说明

- **后端**: 修改 Python 代码后自动重载（`--reload` 参数）
- **前端**: 修改 React/TypeScript 代码后自动刷新（Next.js 热更新）

**注意：** 修改配置文件 (`.env`, `.env.local`) 需要手动重启服务。

---

## 📚 相关文档

- [快速开始指南](./QUICK_START.md)
- [Docker 问题修复](./Docker问题修复.md)
- [数据库迁移文档](./数据库迁移.md)
- [API 测试脚本](../test-api.sh)

---

## 🎯 下一步

启动服务后，访问以下地址：

- **前端首页**: http://localhost:3000
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

开始愉快的开发吧! 🚀
