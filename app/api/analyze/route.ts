import { NextRequest } from 'next/server'
import { initGlobalProxyFromEnv } from '@/lib/net/proxy'
import { chatComplete, type ChatMessage } from '@/lib/ai/wenwen'
import { createJob, setCompleted, setFailed, getJob } from '@/lib/jobs/analyze-store'
import { logRequest, logResponse, logError } from '@/lib/logger'

// Enable outbound proxy if configured
initGlobalProxyFromEnv()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function fetchPageText(url: string): Promise<{ title?: string; text: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': 'ToolScoutAI/0.1 (+https://example.com; bot) Mozilla/5.0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    })
    const html = await res.text()
    const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '').trim()
    const raw = html
      .replace(/\n+/g, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
    const text = raw.replace(/\s+/g, ' ').trim()
    return { title, text }
  } finally {
    clearTimeout(timer)
  }
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') || searchParams.get('jobId')
  if (!id) return new Response(JSON.stringify({ ok: false, error: 'missing_job_id' }), { status: 400 })
  const job = getJob(id)
  if (!job) return new Response(JSON.stringify({ ok: false, error: 'job_not_found' }), { status: 404 })
  return new Response(JSON.stringify({ ok: true, id: job.id, status: job.status, model: job.model, analysis: job.analysis, error: job.error }), { status: 200, headers: { 'content-type': 'application/json' } })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any))
  logRequest('api.analyze.in', { path: '/api/analyze', method: 'POST', body })
  try {
    const { url } = body as { url?: string }
    if (!url || !/^https?:\/\//i.test(url)) {
      return new Response(JSON.stringify({ error: 'invalid_url' }), { status: 400 })
    }

    const { title, text } = await fetchPageText(url)
    const snippet = text.slice(0, 20000)

    const sys: ChatMessage = {
      role: 'system',
      content:
        'You are an expert product analyst for SaaS/tools. Follow the product design spec of ToolScout AI. Output structured Markdown sections with clear headings in Chinese.',
    }
    const user: ChatMessage = {
      role: 'user',
      content: [
  `URL: ${url}`,
  title ? `Title: ${title}` : '',
  'Website content snippet (partial and may be noisy):',
  '---',
  snippet,
  '---',
        'Task: 依据以上网页内容，生成“工具深度拆解”报告，遵循以下结构：',
        '1) 产品概览（定位/价值主张/关键信息）',
        '2) 受众画像（标签+痛点+使用场景）',
        '3) 核心功能与JTBD（功能—收益/限制/典型流程）',
        '4) 定价与变现（若无则标注假设）',
        '5) Onboarding与激活路径（首次体验/关键触点/阻塞点）',
        '6) 竞品与差异化（列3-5个常见竞品对比要点）',
        '7) 潜在用户异议与风险（技术、合规、依赖、性能等）',
        '8) 增长渠道与GTM线索（SEO/社区/联盟/内容/渠道合作等）',
        '9) 评估检查清单（可执行的打分项）',
        '说明：如信息缺失，请谨慎推断并明确标注“假设”。',
].filter(Boolean).join('\n'),
    }

    const job = createJob()
    ;(async () => {
      try {
        const completion = await chatComplete([sys, user], { temperature: 0.2, maxTokens: 1200 })
        setCompleted(job.id, completion.model, completion.content)
      } catch (e) {
        setFailed(job.id, e)
      }
    })()

    const out = { ok: true, jobId: job.id, url, title, snippet }
    logResponse('api.analyze.out', { path: '/api/analyze', status: 200, body: out })
    return new Response(JSON.stringify(out), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (e: any) {
    logError('api.analyze.err', { path: '/api/analyze', error: e })
    const msg = e?.message || 'internal_error'
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
}
