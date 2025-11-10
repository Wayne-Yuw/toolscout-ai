Auth 功能说明与配置

- 新增用户表（手机号唯一）：请在 Supabase SQL 编辑器执行 `sql/001_init_users.sql`。
- 登录：支持“用户名/手机号 + 密码”（Credentials）。
- 第三方授权：GitHub、Google。首次授权后跳转“完善资料”绑定手机号并生成一条用户记录。
- 管理员登录：在“管理员登录”Tab 下不显示第三方登录与注册链接，后端校验 `is_admin`。

环境变量（复制 .env.example 到 .env.local 并填写）：
- `DATABASE_URL`：Supabase 连接串。若密码含 `#`，请写成 `Yuwei%23EDC5rdx`。
- `NEXTAUTH_SECRET`：随机字符串。
- `GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET`、`GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET`：从各平台获取。

主要文件：
- UI：`app/auth/sign-in/page.tsx`、`app/auth/sign-up/page.tsx`、`app/auth/complete/page.tsx`
- API：`app/api/auth/register/route.ts`、`app/api/app/bind-phone/route.ts`
- NextAuth：`app/api/auth/[...nextauth]/route.ts`、`lib/auth/options.ts`
- 数据库：`lib/db.ts`、`lib/auth/db-users.ts`、`sql/001_init_users.sql`

本地启动：
1. `cp .env.example .env.local` 并填充环境变量
2. 执行 `sql/001_init_users.sql`
3. `npm i && npm run dev`

