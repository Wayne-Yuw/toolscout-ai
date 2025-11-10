'use client'

import { useTranslations } from '@/lib/i18n'

export default function HomeContent() {
  const t = useTranslations()
  const popular = ['Notion', 'ChatGPT', 'Figma', 'Canva', 'Obsidian', 'Trello', 'Airtable', 'Miro']

  return (
    <main className="py-14">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t('home.title')}
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          {t('home.subtitle')}
        </p>
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
                disabled
              />
              <button
                className="w-full rounded-xl bg-zinc-200 py-3 text-sm font-medium text-zinc-600 shadow-sm dark:bg-zinc-800 dark:text-zinc-400"
                disabled
              >
                {t('home.analyze')}
              </button>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300">
              {t('home.tip')}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-3xl">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t('home.popular')}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {popular.map((name) => (
            <button
              key={name}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              disabled
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-4xl">🎯</div>
            <h4 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('home.features.audience.title')}</h4>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t('home.features.audience.desc')}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl">📝</div>
            <h4 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('home.features.script.title')}</h4>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t('home.features.script.desc')}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl">🔗</div>
            <h4 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('home.features.discover.title')}</h4>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t('home.features.discover.desc')}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
