'use client'

import Link from 'next/link'
import { useTranslations } from '@/lib/i18n'

export default function SignInPage() {
  const t = useTranslations()
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">{t('auth.signInTitle')}</h1>
      <p className="text-zinc-600 mt-2">{t('auth.signInDesc')}</p>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        {t('auth.noAccount')}
        <Link href="/auth/sign-up" className="text-blue-600 hover:underline dark:text-blue-400 ml-1">
          {t('auth.goSignUp')}
        </Link>
      </p>
    </main>
  )
}
