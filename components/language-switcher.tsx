'use client'

import { useEffect, useRef, useState } from 'react'
import { useI18n, type Locale } from '@/lib/i18n'

const OPTIONS: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '中文' },
]

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClickOutside)
    return () => document.removeEventListener('click', onClickOutside)
  }, [])

  const current = OPTIONS.find((o) => o.code === locale) || OPTIONS[0]

  const onSelect = (code: Locale) => {
    if (code === locale) {
      setOpen(false) // 防呆：选择当前语言仅关闭
      return
    }
    setLocale(code)
    setOpen(false)
  }

  return (
    <div className='relative' ref={ref}>
      <button
        type='button'
        className='inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
        onClick={() => setOpen((v) => !v)}
        aria-haspopup='listbox'
        aria-expanded={open}
      >
        {current.label}
        <svg viewBox='0 0 20 20' fill='currentColor' className='h-4 w-4 opacity-70'>
          <path fillRule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z' clipRule='evenodd' />
        </svg>
      </button>
      {open && (
        <div className='absolute right-0 z-10 mt-2 w-32 overflow-hidden rounded-md border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900'>
          {OPTIONS.map((opt) => (
            <button
              key={opt.code}
              className={`w-full rounded px-2.5 py-1.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 ${opt.code === locale ? 'text-zinc-400 cursor-default' : ''}`}
              onClick={() => onSelect(opt.code)}
              disabled={opt.code === locale}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
