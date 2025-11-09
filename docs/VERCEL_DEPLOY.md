# 在 Vercel 部署（Next.js 全栈）

本项目已改造为可直接在 Vercel 运行的 Next.js 全栈应用（Serverless API 路由内置分析能力），无需单独后端服务。

## 部署步骤

1. 创建 Vercel 项目
   - New Project → 选择该仓库
   - Project Settings 中设置 Root Directory 为 `toolscout-ai`

2. 环境变量（可选，用于启用真实 LLM 分析）
   - `OPENAI_API_KEY`（可选）
   - `ANTHROPIC_API_KEY`（可选）
   - 任意其一存在即可启用真实分析；否则使用启发式占位结果，仍可端到端联调

3. 构建设置
   - Framework Preset: Next.js（Vercel 自动识别）
   - Build Command: `next build`（默认）
   - Output Directory: `.next`（默认）
   - 不需要自定义 `vercel.json`

4. 代码说明
   - 内置 API 路由：`src/app/api/analyze/route.ts`
   - 前端页面：`src/app/[locale]/page.tsx`
   - 默认直接请求 `/api/analyze`，无需额外代理或重写

## 本地开发

```bash
cd toolscout-ai/frontend
npm i
npm run dev
```

可在本地设置 `.env.local`：

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=...
```

## 注意事项

- `next.config.js` 仅在显式设置 `NEXT_PUBLIC_API_URL` 且为 http(s) 地址时，才会将 `/api/*` 代理到外部；默认不代理，直接使用 Next.js Serverless API。
- 若未来接入更多后端能力（例如鉴权、历史记录、导出文件等），推荐继续在 `app/api/*` 下扩展 Serverless 路由，保持 Vercel 一键部署体验。
