'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import LanguageSwitcher from '@/components/language-switcher'
import { useTranslations } from '@/lib/i18n'
import { getSupabase } from '@/lib/supabase/client'

function isAdminUser(user: any): boolean {
  if (!user) return false
  const appMeta = user.app_metadata || {}
  const userMeta = user.user_metadata || {}

  const roles = [
    ...(Array.isArray(appMeta.roles) ? appMeta.roles : []),
    ...(Array.isArray(userMeta.roles) ? userMeta.roles : []),
  ]
    .filter(Boolean)
    .map((r: any) => String(r).toLowerCase())

  const role = String(userMeta.role || appMeta.role || '').toLowerCase()
  const flags = [userMeta.is_admin, appMeta.is_admin, userMeta.admin, appMeta.admin]

  if (roles.includes('admin')) return true
  if (role === 'admin') return true
  if (flags.some(Boolean)) return true
  return false
}

export default function SiteHeader() {
  const t = useTranslations()
  const [signedIn, setSignedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = getSupabase()
    let mounted = true

    const sync = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!mounted) return
      setSignedIn(!!user)
      setIsAdmin(isAdminUser(user))
    }

    sync()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setSignedIn(!!user)
      setIsAdmin(isAdminUser(user))
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return (
    <header className='border-b border-zinc-200 dark:border-zinc-800'>
      <nav className='mx-auto flex max-w-5xl items-center justify-between px-6 py-4'>
        <Link href='/' className='font-semibold'>{t('nav.brand')}</Link>
        <div className='flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300'>
          <LanguageSwitcher />
          {isAdmin && <Link href='/admin'>{t('nav.admin')}</Link>}
          {!signedIn && <Link href='/auth/sign-in'>{t('nav.login')}</Link>}
        </div>
      </nav>
    </header>
  )
}
