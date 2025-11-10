import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type AnalyzeAudienceItem = {
  label: string
  emoji?: string
  pain_points: string[]
  solutions: string[]
  match_score?: number
}

type AnalyzeResult = {
  url: string
  name?: string
  overview?: string
  core_pain_point?: string
  audiences: AnalyzeAudienceItem[]
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'

async function fetchPage(url: string): Promise<{ contentType: string; html: string }> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
    redirect: 'follow',
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status}`)
  }
  const contentType = res.headers.get('content-type') || ''
  const html = await res.text()
  return { contentType, html }
}

function extractParts(contentType: string, html: string) {
  if (!contentType.toLowerCase().includes('html')) {
    return { title: null as string | null, description: null as string | null, h1: null as string | null, text: null as string | null }
  }
  const $ = cheerio.load(html)
  const title = $('title').first().text() || null
  const desc = $('meta[name="description"]').attr('content') || null
  const h1 = $('h1').first().text()?.trim() || null
  $('script, style, noscript').remove()
  const raw = $('body').text().replace(/\s+/g, ' ').trim()
  const text = raw ? raw.slice(0, 6000) : null
  return { title, description: desc, h1, text }
}

function guessNameFromTitle(title?: string | null) {
  if (!title) return null
  const parts = title.split(/\s*[\-|–|—|\|]\s*/)
  const cand = parts[0]?.trim()
  if (cand && cand.length <= 40) return cand
  return null
}

function buildPrompt(url: string, parts: ReturnType<typeof extractParts>) {
  const ctx: string[] = []
  if (parts.title) ctx.push(`Title: ${parts.title}`)
  if (parts.description) ctx.push(`MetaDescription: ${parts.description}`)
  if (parts.h1) ctx.push(`H1: ${parts.h1}`)
  if (parts.text) ctx.push(`PageText: ${parts.text}`)
  const contextBlock = ctx.join('\n')
  return (
    'You are an assistant that analyzes a product/tool website and produces a concise overview and multi-audience breakdown in Chinese per the schema.\n' +
    'Focus on factual details from the provided page context.\n\n' +
    `URL: ${url}\n\n` +
    `Context:\n${contextBlock}\n\n` +
    'Return a JSON object with keys: name, overview, core_pain_point, audiences.\n' +
    'audiences is an array of 5-8 items, each with: label, emoji, pain_points (3 items), solutions (3 items), match_score (0-100). Keep responses concise.'
  )
}

async function analyzeWithLLM(url: string, parts: ReturnType<typeof extractParts>): Promise<Partial<AnalyzeResult> | null> {
  const prompt = buildPrompt(url, parts)

  // Anthropic preferred
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1200,
        temperature: 0.5,
        messages: [{ role: 'user', content: prompt }],
      })
      const text = msg.content
        .map((b) => (b.type === 'text' ? b.text : ''))
        .join('')
      const data = JSON.parse(text)
      return data
    } catch (_) {
      // continue
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = (await import('openai')).default
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const chat = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.5,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1200,
      })
      const text = chat.choices?.[0]?.message?.content || '{}'
      const data = JSON.parse(text)
      return data
    } catch (_) {
      // continue
    }
  }

  return null
}

function heuristicFallback(url: string, parts: ReturnType<typeof extractParts>): AnalyzeResult {
  const name = guessNameFromTitle(parts.title) || '该工具'
  const overview = parts.description || parts.h1 || (parts.text ? `${parts.text.slice(0, 160)}...` : undefined)
  const core = '帮助用户更高效地完成任务，提高生产力。'
  const audiences: AnalyzeAudienceItem[] = [
    { label: '学生党', emoji: '👨‍🎓', pain_points: ['信息分散', '难以系统化', '复习低效'], solutions: ['集中管理', '结构化整理', '快速检索'], match_score: 85 },
    { label: '职场人士', emoji: '💼', pain_points: ['多任务切换', '协作困难', '流程混乱'], solutions: ['一处协作', '可视化流程', '模板化管理'], match_score: 88 },
    { label: '自媒体创作', emoji: '📝', pain_points: ['选题零散', '素材管理难', '产出不稳定'], solutions: ['灵感库', '素材库', '流程看板'], match_score: 82 },
  ]
  return { url, name, overview, core_pain_point: core, audiences }
}

export async function POST(req: Request) {
  try {
    const { url } = (await req.json()) as { url?: string }
    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ detail: 'Invalid url' }, { status: 400 })
    }
    const { contentType, html } = await fetchPage(url)
    const parts = extractParts(contentType, html)
    const llm = await analyzeWithLLM(url, parts)
    if (llm) {
      const res: AnalyzeResult = {
        url,
        name: (llm as any).name ?? guessNameFromTitle(parts.title) ?? undefined,
        overview: (llm as any).overview,
        core_pain_point: (llm as any).core_pain_point,
        audiences: Array.isArray((llm as any).audiences) ? (llm as any).audiences : [],
      }
      return NextResponse.json(res)
    }
    const res = heuristicFallback(url, parts)
    return NextResponse.json(res)
  } catch (e: any) {
    return NextResponse.json({ detail: e?.message || 'Analyze failed' }, { status: 400 })
  }
}

