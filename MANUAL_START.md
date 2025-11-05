# 🚀 ToolScout AI - 快速启动指南 (无 Docker 版本)

由于 Docker 网络连接问题,这里提供**手动启动项目的完整步骤**。

---

## ✅ 前置条件

确认已安装:
- ✅ Node.js (v18+) - 已安装 v22.20.0
- ✅ Python (v3.10+) - 已安装 v3.13.5
- ✅ NPM - 已安装 v11.6.2

---

## 📝 启动步骤

### **第 1 步:启动前端**

```bash
# 1. 进入前端目录
cd d:\ai_coding_workspace\toolscout-ai\frontend

# 2. 安装依赖(已完成)
npm install

# 3. 创建环境变量文件
copy .env.example .env.local

# 4. 启动开发服务器
npm run dev
```

**前端地址:** http://localhost:3000

---

### **第 2 步:启动后端**

打开**新的终端窗口**:

```bash
# 1. 进入后端目录
cd d:\ai_coding_workspace\toolscout-ai\backend

# 2. 安装简化版依赖(无数据库)
python -m pip install fastapi uvicorn python-dotenv pydantic pydantic-settings

# 3. 创建环境变量文件
copy .env.example .env

# 4. 启动开发服务器
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**后端地址:**
- API: http://localhost:8000
- 文档: http://localhost:8000/docs

---

## 🎯 验证安装

### 1. 检查后端

打开浏览器访问: http://localhost:8000

应该看到:
```json
{
  "message": "ToolScout AI API",
  "version": "0.1.0",
  "status": "running"
}
```

### 2. 检查前端

访问: http://localhost:3000

应该看到一个漂亮的首页,有搜索框和功能介绍。

### 3. 查看 API 文档

访问: http://localhost:8000/docs

可以看到交互式 API 文档(Swagger UI)。

---

## 📦 如果安装依赖时遇到问题

### 前端依赖安装失败

```bash
#  清除缓存重新安装
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 后端依赖安装失败

**方案 1: 使用国内镜像**
```bash
pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/
pip install fastapi uvicorn python-dotenv pydantic pydantic-settings
```

**方案 2: 逐个安装**
```bash
pip install fastapi
pip install uvicorn[standard]
pip install python-dotenv
pip install pydantic
pip install pydantic-settings
```

---

## ⚠️ 重要说明

### 当前版本的限制

由于我们跳过了数据库安装,**当前版本只能展示 UI,无法使用完整功能**:

- ✅ **可以使用:**
  - 查看前端页面
  - 查看 API 文档
  - 测试健康检查端点

- ❌ **暂不可用:**
  - 工具分析功能(需要数据库)
  - 历史记录(需要数据库)
  - 文案生成(需要 API keys)

### 下一步开发建议

1. **先熟悉项目结构**
   - 查看前端代码:`frontend/src/app/page.tsx`
   - 查看后端代码:`backend/app/main.py`

2. **添加第一个功能**
   - 从简单的API端点开始
   - 参考 `docs/DEVELOPMENT.md`

3. **后续安装数据库**
   - 安装 PostgreSQL Desktop
   - 或使用 Docker 只启动数据库:`docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine`

---

## 🛠️ 常见问题

### Q: 端口被占用怎么办?

**前端端口 3000 被占用:**
```bash
# 修改端口,在 package.json 的 dev 脚本中添加:
"dev": "next dev -p 3001"
```

**后端端口 8000 被占用:**
```bash
# 启动时指定其他端口
python -m uvicorn app.main:app --reload --port 8001
```

### Q: 如何停止服务?

在运行服务的终端中按 `Ctrl + C`

### Q: 如何查看日志?

服务运行时,终端会实时显示日志。

---

## 🎉 成功启动后

你会看到:
1. ✅ **前端 http://localhost:3000** - 漂亮的 UI 页面
2. ✅ **后端 http://localhost:8000** - API 服务运行
3. ✅ **API 文档 http://localhost:8000/docs** - 交互式文档

**恭喜!项目骨架已经运行起来了!**

---

##  📞 需要帮助?

- 查看完整文档: `docs/DEVELOPMENT.md`
- 查看产品设计: `ToolScout_AI_产品设计文档.md`
- 如果有问题,告诉我具体的错误信息!

---

**下一步:** 开始实现第一个功能 - URL 输入和基础分析!
