'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import zh from './locales/zh-CN'
import en from './locales/en'

export type Locale = 'zh-CN' | 'en'

const DICTS: Record<Locale, any> = { 'zh-CN': zh, en }

function getFromPath(obj: any, path: string) {
  return path.split('.').reduce((acc: any, key: string) => (acc ? acc[key] : undefined), obj)
}

const I18nContext = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}>({
  locale: 'en',
  setLocale: () => {},
  t: (k: string) => k,
})

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  const lang = (navigator.language || 'en').toLowerCase()
  if (lang.startsWith('zh')) return 'zh-CN'
  return 'en'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  // First mount: load from localStorage or detect from browser
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('locale') as Locale | null) : null
    const initial = stored || detectBrowserLocale()
    setLocaleState(initial)
  }, [])

  // Reflect locale to <html lang>
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const setLocale = (l: Locale) => {
    setLocaleState((curr) => {
      if (curr === l) return curr // 防呆：相同语言不处理
      if (typeof window !== 'undefined') localStorage.setItem('locale', l)
      return l
    })
  }

  const dict = useMemo(() => DICTS[locale] ?? DICTS['en'], [locale])
  const t = (key: string) => getFromPath(dict, key) ?? key

  const value = useMemo(() => ({ locale, setLocale, t }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

export function useTranslations() {
  const { t } = useI18n()
  return t
}
