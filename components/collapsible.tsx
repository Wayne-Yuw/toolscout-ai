'use client'

import { useState, ReactNode } from 'react'

type Props = {
  title: ReactNode
  defaultOpen?: boolean
  heightClass?: string // e.g., 'h-96'
  children: ReactNode
  actionsRight?: ReactNode
}

export default function Collapsible({ title, defaultOpen = true, heightClass = 'h-96', children, actionsRight }: Props) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
        <div className="flex items-center gap-3">
          {actionsRight}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg border px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {open ? '收起' : '展开'}
          </button>
        </div>
      </div>
      {open && (
        <div className={`mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/30 overflow-auto ${heightClass}`}>
          <div className="p-4">{children}</div>
        </div>
      )}
    </div>
  )
}
