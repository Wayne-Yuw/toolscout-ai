# ToolScout 项目框架

基于 Next.js 16（App Router）与 Supabase 的项目骨架。当前仅包含目录与页面结构，功能尚未实现。

## 结构概览

- pp/
  - page.tsx：主页占位
  - dmin/：管理员后台入口页（占位）
  - uth/
    - sign-in/：登录页（占位）
    - sign-up/：注册页（占位）
- lib/supabase/client.ts：Supabase 客户端初始化（仅前端公开密钥）
- .env.local.example：环境变量示例

## 设计文档（参考）

请参考工作区根目录的三份设计文档：
- ToolScoutAI设计文档
- 管理员后台系统设计
- 用户认证和会员系统设计

后续会基于上述文档逐步实现各模块功能。

## 本地开发

1. 复制环境变量并配置 Supabase：
   `ash
   cp .env.local.example .env.local
   # 设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY
   `
2. 安装依赖并启动：
   `ash
   npm install
   npm run dev
   `
3. 打开 http://localhost:3000 访问。

## 下一步建议

- 接入 Supabase Auth（邮箱/第三方登录）。
- 定义角色与权限（管理员、会员等）。
- 按设计文档拆分模块与布局（如后台侧边栏、仪表盘等）。
- 配置数据库表结构、RLS 与 Seed 脚本。
