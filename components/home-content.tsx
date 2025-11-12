'use client'

import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Collapsible from '@/components/collapsible'
import { useTranslations } from '@/lib/i18n'

export default function HomeContent() {
  const t = useTranslations()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [pageTitle, setPageTitle] = useState<string | null>(null)
  const [snippet, setSnippet] = useState<string | null>(null)
  const [respUrl, setRespUrl] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const pollRef = useRef<number | null>(null)

  async function onAnalyze() {
    setError(null)
    setResult(null)
    setPageTitle(null)
    setSnippet(null)
    setRespUrl(null)

    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }

    const u = url.trim()
    if (!/^https?:\/\//i.test(u)) {
      setError('请输入有效的网址（以 http:// 或 https:// 开头）')
      return
    }

    setLoading(true)
    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: u }),
      })
      const data = await resp.json()
      if (!resp.ok || !data?.ok) throw new Error(data?.error || `HTTP ${resp.status}`)

      // show snippet immediately
      setPageTitle((data.title ?? null) as any)
      setSnippet((data.snippet ?? null) as any)
      setRespUrl((data.url ?? null) as any)

      const id = (data.jobId || data.id) as (string | null)
      if (id) {
        setJobId(id)
        const poll = async () => {
          try {
            const r = await fetch('/api/analyze?id=' + encodeURIComponent(id))
            const j = await r.json()
            if (r.ok && j?.ok) {
              if (j.status === 'completed') {
                setResult((j.analysis || '') as string)
                setLoading(false)
                if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
              } else if (j.status === 'failed') {
                setError(j.error || '分析失败')
                setLoading(false)
                if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
              }
            }
          } catch {}
        }
        poll()
        pollRef.current = window.setInterval(poll, 2000) as any
      } else if (typeof data.analysis === 'string') {
        setResult(data.analysis as string)
        setLoading(false)
      } else {
        setLoading(false)
      }
    } catch (e: any) {
                setError(e?.message || '分析失败')
      setLoading(false)
    }
  }

  return (
    <main className="py-14">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t('home.title')}
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{t('home.subtitle')}</p>
      </section>

      <section className="mx-auto mt-10 max-w-3xl">
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('home.searchTitle')}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t('home.searchDesc')}</p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder={t('home.placeholder')}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 shadow-sm outline-none focus:border-zinc-300 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-700 dark:focus:ring-zinc-800"
                onChange={(e) => setUrl(e.target.value)}
                value={url}
              />
              <button
                className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white shadow-sm disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                onClick={onAnalyze}
                disabled={loading}
              >
                {loading ? '分析中…' : t('home.analyze')}
              </button>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300">
              {t('home.tip')}
            </div>
          </div>
        </div>
      </section>

      {(pageTitle || snippet) && (
        <section className="mx-auto mt-8 max-w-3xl">
          <Collapsible title="网页内容片段" defaultOpen={true} heightClass="h-96" actionsRight={respUrl ? (<a className="text-sm text-blue-600 hover:underline" href={respUrl} target="_blank" rel="noreferrer">在新窗口打开原网页</a>) : null}>
            {pageTitle && (
              <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">标题：{pageTitle}</div>
            )}
            <div className="prose prose-zinc max-w-none dark:prose-invert whitespace-pre-wrap break-words">
              {snippet || '未抓取到文本内容或页面内容为空'}
            </div>
            {respUrl && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-zinc-700 dark:text-zinc-300">内嵌网页预览（若站点允许）</summary>
                <div className="mt-2 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <iframe src={respUrl} referrerPolicy="no-referrer" loading="lazy" className="w-full h-96 bg-white dark:bg-zinc-900"></iframe>
                </div>
              </details>
            )}
          </Collapsible>
        </section>
      )}

      {result && (
        <section className="mx-auto mt-8 max-w-3xl">
          <Collapsible title="分析结果" defaultOpen={true} heightClass="h-96">
            <div className="prose prose-zinc max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          </Collapsible>
        </section>
      )}

      <section className="mx-auto mt-16 max-w-5xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-4xl">🙂</div>
            <h4 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('home.features.audience.title')}</h4>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t('home.features.audience.desc')}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl">🧩</div>
            <h4 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('home.features.script.title')}</h4>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t('home.features.script.desc')}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl">🔎</div>
            <h4 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('home.features.discover.title')}</h4>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t('home.features.discover.desc')}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
