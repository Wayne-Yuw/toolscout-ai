"use client";

import { useTranslations } from 'next-intl';
import HeaderBar from '@/components/HeaderBar';
import { useState } from 'react';
import type { AnalyzeResponse } from '@/types';

// In Vercel deployment, we use Next.js API route directly
const API_BASE_URL = '/api';

export default function HomePage() {
  const t = useTranslations('home');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const popularTools = ['https://www.notion.so', 'https://www.figma.com', 'https://www.canva.com', 'https://obsidian.md'];

  async function handleAnalyze(url: string) {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Request failed');
      }
      const data = (await res.json()) as AnalyzeResponse;
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Failed to analyze');
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    void handleAnalyze(input.trim());
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
      <div className="container mx-auto px-4 py-16">
        <HeaderBar />

        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('subtitle')}</p>
        </header>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">🔍 {t('searchTitle')}</h2>
              <p className="text-gray-600">{t('searchDescription')}</p>
            </div>

            <form onSubmit={onSubmit} className="mb-6">
              <input
                type="url"
                inputMode="url"
                placeholder={t('searchPlaceholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              />
              <button
                type="submit"
                className="w-full mt-4 bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={loading || !input.trim()}
              >
                {loading ? 'Analyzing...' : t('analyzeButton')}
              </button>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">💡 <strong>{t('tip')}:</strong> {t('tipContent')}</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">🔥 {t('popularTools')}</h3>
            <div className="flex flex-wrap gap-2">
              {popularTools.map((tool) => (
                <button
                  key={tool}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                  onClick={() => {
                    setInput(tool);
                    void handleAnalyze(tool);
                  }}
                  disabled={loading}
                >
                  {new URL(tool).hostname}
                </button>
              ))}
            </div>
          </div>

          {result && (
            <div className="mt-10 bg-white rounded-2xl shadow p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-semibold">{result.name || new URL(result.url).hostname}</h3>
                  <p className="text-sm text-gray-500">{result.url}</p>
                </div>
              </div>

              {result.overview && (
                <section className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">📌 概览</h4>
                  <p className="text-gray-800 leading-relaxed">{result.overview}</p>
                </section>
              )}

              {result.core_pain_point && (
                <section className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">💡 核心痛点</h4>
                  <p className="text-gray-800 leading-relaxed">{result.core_pain_point}</p>
                </section>
              )}

              {!!result.audiences?.length && (
                <section>
                  <h4 className="text-lg font-semibold mb-3">🎯 适合人群</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.audiences.map((a, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-lg font-medium">{a.emoji ? `${a.emoji} ` : ''}{a.label}</div>
                          {typeof a.match_score === 'number' && (
                            <span className="text-sm text-gray-500">{Math.round(a.match_score)}%</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-700">
                          <div className="mb-1"><span className="font-semibold">痛点:</span> {a.pain_points?.join('、')}</div>
                          <div><span className="font-semibold">解决:</span> {a.solutions?.join('、')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">{t('features.audienceAnalysis.title')}</h3>
            <p className="text-gray-600">{t('features.audienceAnalysis.description')}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">{t('features.scriptGeneration.title')}</h3>
            <p className="text-gray-600">{t('features.scriptGeneration.description')}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">{t('features.toolDiscovery.title')}</h3>
            <p className="text-gray-600">{t('features.toolDiscovery.description')}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-16 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-center text-yellow-800">⚠️ <strong>{t('devMode.title')}:</strong> {t('devMode.message')}</p>
        </div>
      </div>
    </main>
  )
}

