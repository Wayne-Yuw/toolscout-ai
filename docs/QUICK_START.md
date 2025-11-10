# Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Docker & Docker Compose** (optional, recommended for quick setup)
- **PostgreSQL** (if not using Docker)

## Option 1: Docker Quick Start (Recommended)

### 1. Clone and Navigate to Project

```bash
cd toolscout-ai
```

### 2. Set Up Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and add your API keys
```

**Frontend:**
```bash
cd ../frontend
cp .env.example .env.local
```

### 3. Start All Services

```bash
# From project root
docker-compose up -d
```

This will start:
- Frontend at http://localhost:3000
- Backend API at http://localhost:8000
- PostgreSQL at localhost:5432
- Redis at localhost:6379

### 4. View Logs

```bash
docker-compose logs -f
```

### 5. Stop Services

```bash
docker-compose down
```

---

## Option 2: Manual Setup

### 🪟 Windows 快速启动脚本（推荐）

我们为 Windows 用户提供了便捷的批处理脚本：

#### 启动所有服务
```bash
# 双击运行或在命令行执行
docs\start-all.bat
```
这会自动打开两个窗口，分别启动后端和前端服务。

#### 单独启动服务
```bash
# 只启动后端
docs\start-backend.bat

# 只启动前端
docs\start-frontend.bat
```

#### 停止所有服务
```bash
docs\stop-all.bat
```

---

### 手动启动（所有平台）

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install bcrypt pyjwt email-validator

# Set up environment variables
cp .env.example .env
# Edit .env and configure your settings

# Start development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at: http://localhost:8000

### Database Setup

If you're not using Docker, you need to set up PostgreSQL:

```bash
# Create database
createdb toolscout

# Update DATABASE_URL in backend/.env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/toolscout
```

---

## Verify Installation

### 1. Check Backend Health

Open http://localhost:8000 in your browser, you should see:

```json
{
  "message": "ToolScout AI API",
  "version": "0.1.0",
  "status": "running"
}
```

### 2. Check API Documentation

Visit http://localhost:8000/docs to see the interactive API documentation.

### 3. Check Frontend

Open http://localhost:3000 in your browser to see the homepage.

---

## Next Steps

1. **Configure API Keys** - Add your OpenAI, Anthropic, and Google CSE API keys to `backend/.env`
2. **Read Documentation** - Check out the [development guide](./docs/development.md)
3. **Start Coding** - Begin implementing features according to the roadmap

---

## Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Check what's using the port (e.g., 3000)
# On Windows:
netstat -ano | findstr :3000

# On macOS/Linux:
lsof -i :3000

# Kill the process or change the port in the respective config files
```

### Database Connection Error

Make sure PostgreSQL is running and the connection string in `.env` is correct.

```bash
# Test database connection
psql -h localhost -U postgres -d toolscout
```

### Module Not Found Errors

```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

---

## Getting Help

- Check the [full documentation](../README.md)
- Review the [product design document](./ToolScout_AI_产品设计文档.md)
- Open an issue on GitHub

---

**Happy coding! 🚀**
