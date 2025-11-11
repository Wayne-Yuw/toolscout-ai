'use client'

import Link from 'next/link'
import LanguageSwitcher from '@/components/language-switcher'
import { useTranslations } from '@/lib/i18n'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useMemo, useRef, useState } from 'react'

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 20 20' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true' {...props}>
      <path d='M6 8l4 4 4-4' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

function ProfileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true' {...props}>
      <path d='M12 12a5 5 0 100-10 5 5 0 000 10z' />
      <path d='M4 22a8 8 0 0116 0' />
    </svg>
  )
}

function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true' {...props}>
      <path d='M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4' />
      <path d='M16 17l5-5-5-5' />
      <path d='M21 12H9' />
    </svg>
  )
}

function UserMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const initial = useMemo(() => (name?.trim() ? name.trim().slice(0, 1) : '?'), [name])

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen((v) => !v)}
        className='flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1 text-sm hover:bg-zinc-50'
      >
        <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-white'>{initial}</span>
        <span className='max-w-[10rem] truncate text-zinc-800'>{name}</span>
        <ChevronDownIcon className='h-4 w-4 text-zinc-500' />
      </button>
      {open && (
        <div className='absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 text-sm shadow-lg'>
          <Link
            href='/profile'
            className='flex items-center gap-2 rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-50'
            onClick={() => setOpen(false)}
          >
            <ProfileIcon className='h-4 w-4' /> 个人中心
          </Link>
          <button
            className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-zinc-700 hover:bg-zinc-50'
            onClick={() => {
              setOpen(false)
              signOut()
            }}
          >
            <LogoutIcon className='h-4 w-4' /> 退出登录
          </button>
        </div>
      )}
    </div>
  )
}

export default function SiteHeader() {
  const t = useTranslations()
  const { data: session } = useSession()
  const signedIn = !!session
  const isAdmin = Boolean((session as any)?.isAdmin)
  const displayName = (session?.user?.name as string) || ''

  return (
    <header className='border-b border-zinc-200 dark:border-zinc-800'>
      <nav className='mx-auto flex max-w-5xl items-center justify-between px-6 py-4'>
        <Link href='/' className='font-semibold'>{t('nav.brand')}</Link>
        <div className='flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300'>
          <LanguageSwitcher />
          {isAdmin && <Link href='/admin'>{t('nav.admin')}</Link>}
          {!signedIn ? (
            <Link href='/auth/sign-in'>{t('nav.login')}</Link>
          ) : (
            <UserMenu name={displayName} />
          )}
        </div>
      </nav>
    </header>
  )
}
