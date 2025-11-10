'use client'

import Link from 'next/link'
import LanguageSwitcher from '@/components/language-switcher'
import { useTranslations } from '@/lib/i18n'
import { useSession, signOut } from 'next-auth/react'

export default function SiteHeader() {
  const t = useTranslations()
  const { data: session } = useSession()
  const signedIn = !!session
  const isAdmin = Boolean((session as any)?.isAdmin)

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
            <button onClick={() => signOut()} className='text-zinc-600 hover:underline'>退出登录</button>
          )}
        </div>
      </nav>
    </header>
  )
}

