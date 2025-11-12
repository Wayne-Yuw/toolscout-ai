// Wenwen Responses client via Apifox-style typed content
// POST /v1/responses with headers and body: { model, input: [{ role, content: [{ type, text }] }] }

import { logRequest, logResponse } from '@/lib/logger'

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }
export type ChatCompletion = { id: string; model: string; content: string }

function env(name: string) { return process.env[name] }

const BASE = env('WENWEN_API_BASE') // use as-is; do not append
const KEY = env('WENWEN_API_KEY')
const MODEL = env('WENWEN_MODEL') || 'gpt-5'
const TIMEOUT_MS = Number(env('WENWEN_API_TIMEOUT_MS')) || 600000

function endpoint(): string {
  return BASE || 'https://breakout.wenwen-ai.com/v1/responses'
}

function redactBearer(v?: string) {
  if (!v) return v as any
  const t = v.replace(/^Bearer\s+/i, '')
  if (t.length <= 10) return 'Bearer ***'
  return 'Bearer ' + t.slice(0, 4) + '...' + t.slice(-4)
}

export async function chatComplete(messages: ChatMessage[], _opts?: { temperature?: number; maxTokens?: number }): Promise<ChatCompletion> {
  if (!KEY) throw new Error('WENWEN_API_KEY not set')
  const url = endpoint()

  // Combine messages to a single input_text
  const combined = messages.map(m => m.content).join('\n\n')
  const payload: any = {
  model: MODEL,
  messages: messages.map(m => ({ role: m.role, content: m.content })),
}

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  logRequest('wenwen.request', { path: url, method: 'POST', body: { headers: { ...headers, Authorization: redactBearer(headers.Authorization) }, payload } })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let resp: any
  try {
    resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload), signal: controller.signal })
  } finally { clearTimeout(timer) }
  const text = await resp.text()

  logResponse('wenwen.response', { path: url, status: resp.status, body: (() => { try { return JSON.parse(text) } catch { return text } })() })

  if (!resp.ok) throw new Error(`Wenwen API error ${resp.status}: ${text}`)

  let data: any
  try { data = JSON.parse(text) } catch { data = { raw: text } }

  // Extract content from output[].content[] where type === 'output_text'
  let content = ''
  if (Array.isArray(data?.output)) {
    const texts: string[] = []
    for (const o of data.output) {
      const parts = o && Array.isArray(o.content) ? o.content : []
      for (const c of parts) {
        if (c && c.type === 'output_text' && typeof c.text === 'string') texts.push(c.text)
      }
    }
    if (texts.length) content = texts.join('\n')
  }

  // Fallbacks for other possible response shapes
  if (!content && data?.choices?.[0]?.message?.content) content = data.choices[0].message.content
  else if (!content && typeof data?.output_text === 'string') content = data.output_text
  else if (!content && Array.isArray(data?.content)) {
    const part = data.content.find((p: any) => p && (p.text || p.output_text))
    content = (part && (part.text || part.output_text)) || ''
  } else if (!content && typeof data?.message === 'string') content = data.message

  // Log extracted content (source + preview)
  logRequest('wenwen.content', { path: url, method: 'PARSE', body: { from: content ? 'output.content.output_text.text' : 'fallback', preview: (content || '').slice(0, 300), length: (content || '').length } })

  return { id: data.id ?? 'unknown', model: data.model ?? MODEL, content }
}
