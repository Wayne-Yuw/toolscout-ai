# ToolScout AI - Project Skeleton Summary

## ✅ 项目初始化完成!

项目骨架已经创建完成,包含前端、后端、数据库配置和开发文档。

---

## 📂 项目结构

```
toolscout-ai/
├── README.md                      # 项目主文档
├── .gitignore                     # Git 忽略规则
├── docker-compose.yml             # Docker 编排配置
│
├── frontend/                      # Next.js 前端应用
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # 全局布局
│   │   │   ├── page.tsx           # 首页(带占位UI)
│   │   │   └── globals.css        # 全局样式
│   │   ├── components/            # 组件目录(占位)
│   │   ├── lib/
│   │   │   ├── api-client.ts      # API 客户端配置
│   │   │   └── utils.ts           # 工具函数
│   │   └── types/
│   │       └── index.ts           # TypeScript 类型定义
│   ├── public/                    # 静态资源
│   ├── package.json               # NPM 依赖
│   ├── tsconfig.json              # TypeScript 配置
│   ├── next.config.js             # Next.js 配置
│   ├── tailwind.config.js         # Tailwind CSS 配置
│   ├── postcss.config.js          # PostCSS 配置
│   ├── .env.example               # 环境变量模板
│   └── Dockerfile                 # Docker 镜像配置
│
├── backend/                       # FastAPI 后端应用
│   ├── app/
│   │   ├── main.py                # FastAPI 入口
│   │   ├── core/
│   │   │   ├── config.py          # 应用配置
│   │   │   └── database.py        # 数据库连接
│   │   ├── models/
│   │   │   └── __init__.py        # SQLAlchemy 模型
│   │   ├── schemas/
│   │   │   └── __init__.py        # Pydantic schemas
│   │   ├── services/              # 业务逻辑层(占位)
│   │   └── api/                   # API 路由(占位)
│   ├── tests/                     # 测试目录
│   ├── requirements.txt           # Python 依赖
│   ├── .env.example               # 环境变量模板
│   └── Dockerfile                 # Docker 镜像配置
│
└── docs/                          # 文档
    ├── QUICK_START.md             # 快速启动指南
    ├── DEVELOPMENT.md             # 开发指南
    └── (产品设计文档在上级目录)
```

---

## 🎯 已完成的工作

### ✅ 前端 (Frontend)
- [x] Next.js 15 + TypeScript 项目配置
- [x] Tailwind CSS + shadcn/ui 样式配置
- [x] 基础页面布局和占位 UI
- [x] TypeScript 类型定义
- [x] API 客户端配置
- [x] 工具函数库

### ✅ 后端 (Backend)
- [x] FastAPI 项目结构
- [x] 数据库模型定义(Tool, Audience, Script, SearchResult)
- [x] Pydantic schemas 定义
- [x] 应用配置和环境变量
- [x] 健康检查端点
- [x] CORS 配置

### ✅ 数据库 (Database)
- [x] PostgreSQL 表结构设计
- [x] SQLAlchemy ORM 配置
- [x] 数据模型关系定义

### ✅ DevOps
- [x] Docker Compose 配置(前端 + 后端 + PostgreSQL + Redis)
- [x] Dockerfile 配置
- [x] .gitignore 配置

### ✅ 文档 (Documentation)
- [x] 项目 README
- [x] 快速启动指南
- [x] 开发指南
- [x] 产品设计文档(独立文件)

---

## 🚀 下一步操作

### 1. 安装依赖

**使用 Docker (推荐):**
```bash
cd toolscout-ai
docker-compose up -d
```

**手动安装:**

前端:
```bash
cd frontend
npm install
npm run dev
```

后端:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. 配置环境变量

```bash
# 后端
cd backend
cp .env.example .env
# 编辑 .env,添加 API keys

# 前端
cd frontend
cp .env.example .env.local
```

### 3. 验证安装

- 前端: http://localhost:3000
- 后端: http://localhost:8000
- API 文档: http://localhost:8000/docs

---

## 📋 功能开发路线图

### Phase 1: MVP (2-3 周)
- [ ] URL 输入和验证
- [ ] 网页抓取服务
- [ ] 工具分析(AI 驱动的人群拆解)
- [ ] 基础文案生成(干货型)
- [ ] 分析历史记录

### Phase 2: 增强体验 (2-4 周)
- [ ] 智能搜索功能
- [ ] 多种文案风格(剧情型、对比型等)
- [ ] 多平台适配(抖音、小红书、B站等)
- [ ] 导出功能(Markdown, JSON)

### Phase 3: 高级功能 (4+ 周)
- [ ] 页面预览(截图 + AI 评估)
- [ ] 自定义风格(用户上传示例)
- [ ] 同类工具推荐
- [ ] 完整导出(Word, PDF)
- [ ] 批量分析

---

## 🔑 需要的 API Keys

开发前请准备以下 API 密钥:

1. **OpenAI API Key** - 用于 GPT-4o 文案生成
   - 获取地址: https://platform.openai.com/api-keys

2. **Anthropic API Key** - 用于 Claude 3.5 Sonnet 深度分析
   - 获取地址: https://console.anthropic.com/

3. **Google Custom Search API Key** - 用于工具搜索
   - 获取地址: https://developers.google.com/custom-search

4. **Jina AI Reader API Key** (可选) - 用于网页抓取
   - 获取地址: https://jina.ai/

---

## 📖 重要文档

1. **[README.md](../README.md)** - 项目总览
2. **[QUICK_START.md](./QUICK_START.md)** - 快速启动指南
3. **[DEVELOPMENT.md](./DEVELOPMENT.md)** - 开发指南
4. **[产品设计文档](../ToolScout_AI_产品设计文档.md)** - 完整的产品设计

---

## 💡 开发建议

1. **先跑通流程** - 从最简单的 URL 输入 → 分析开始
2. **逐步迭代** - 不要一次实现所有功能
3. **Prompt 是关键** - 花时间优化 AI 提示词
4. **测试驱动** - 每个功能都要测试
5. **成本控制** - 使用缓存减少 API 调用

---

## 🛠️ 技术栈

### 前端
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand (状态管理)
- Axios (HTTP 客户端)

### 后端
- FastAPI
- Python 3.10+
- SQLAlchemy (ORM)
- PostgreSQL
- Redis
- Alembic (数据库迁移)

### 外部服务
- OpenAI GPT-4o
- Anthropic Claude 3.5 Sonnet
- Google Custom Search API
- Jina AI Reader

---

## ❓ 常见问题

### Q: 端口被占用怎么办?
A: 在 docker-compose.yml 中修改端口映射,或关闭占用端口的进程。

### Q: 如何添加新的 API 端点?
A: 参考 [DEVELOPMENT.md](./DEVELOPMENT.md) 中的"添加新的 API 端点"章节。

### Q: 数据库迁移怎么做?
A: 使用 Alembic:
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Q: 如何调试前端/后端?
A:
- 前端: 使用浏览器 DevTools
- 后端: 查看终端日志,或使用 FastAPI 自带的 `/docs` 调试

---

## 📧 联系方式

如有问题,请查阅文档或提交 Issue。

---

**🎉 项目骨架已就绪,可以开始开发了!**

**建议下一步:**
1. 安装依赖并启动项目
2. 验证前后端能正常运行
3. 配置 API keys
4. 开始实现第一个功能(URL 输入 + 基础分析)

Good luck! 🚀
