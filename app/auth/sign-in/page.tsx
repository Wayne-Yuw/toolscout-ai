'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslations } from '@/lib/i18n'
import AlertModal from '@/components/ui/alert-modal'
import { useRouter, useSearchParams } from 'next/navigation'

type Tab = 'user' | 'admin'

function SignInPageInner() {
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<null | 'github' | 'google'>(null)
  const busy = loading || !!oauthLoading
  const enableGithub = (process.env.NEXT_PUBLIC_ENABLE_OAUTH_GITHUB || 'true') !== 'false'
  const enableGoogle = (process.env.NEXT_PUBLIC_ENABLE_OAUTH_GOOGLE || 'true') !== 'false'
  const t = useTranslations()
  const router = useRouter()
  const search = useSearchParams()
  const [tab, setTab] = useState<Tab>('user')
  const [idOrPhone, setIdOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMsg, setModalMsg] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        idOrPhone,
        password,
        loginType: tab,
        redirect: false,
      })
      if (res?.error) setMessage(res.error || '登录失败')
      else window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }

  const Icon = ({ kind }: { kind: 'github' | 'google' }) => {
    if (kind === 'github')
      return (
        <svg viewBox='0 0 24 24' className='h-4 w-4' aria-hidden>
          <path fill='currentColor' d='M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.35-1.77-1.35-1.77-1.1-.76.08-.74.08-.74 1.22.08 1.87 1.25 1.87 1.25 1.08 1.84 2.84 1.31 3.53 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.56.12-3.25 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.69.25 2.94.12 3.25.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .5Z'/>
        </svg>
      )
    return (
      <svg viewBox='0 0 24 24' className='h-4 w-4' aria-hidden>
        <path fill='#EA4335' d='M12 10.2v3.6h5.1c-.2 1.1-.8 2.1-1.7 2.8l2.7 2.1c1.6-1.5 2.6-3.7 2.6-6.4 0-.6-.1-1.2-.2-1.7H12z'/>
        <path fill='#34A853' d='M6.6 14.3l-.8.6-2.2 1.7C4.9 19.7 8.2 22 12 22c2.4 0 4.4-.8 5.9-2.3l-2.7-2.1c-.8.6-1.8 1-3.2 1-2.5 0-4.6-1.7-5.4-4.1z'/>
        <path fill='#4A90E2' d='M3.6 7.7C2.9 9.1 2.5 10.5 2.5 12s.4 2.9 1.1 4.3c0 .1 3-2.3 3-2.3-.2-.7-.4-1.4-.4-2s.1-1.4.4-2l-3-2.3z'/>
        <path fill='#FBBC05' d='M12 4.8c1.3 0 2.4.4 3.3 1.2l2.5-2.5C16.4 1.8 14.4 1 12 1 8.2 1 4.9 3.3 3.4 7.7l3 2.3C7.2 7.6 9.4 4.8 12 4.8z'/>
      </svg>
    )
  }

  const oauthBtn = (provider: 'github' | 'google', label: string) => (
    <button
      type='button'
      disabled={busy}
      onClick={() => { try { sessionStorage.setItem('oauthLastProvider', provider) } catch {} setOauthLoading(provider); signIn(provider, { callbackUrl: '/' }) }}


      className='flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60'
    >
      <Icon kind={provider} />
      <span>{oauthLoading === provider ? t('auth.actions.submitting') : label}</span>
    </button>
  )

  // 妫€娴嬫潵鑷?next-auth 鐨?OAuth 閿欒骞跺脊绐楁彁绀猴紙甯歌涓哄洖璋冮樁娈电綉缁滆秴鏃讹級
  useEffect(() => {
    const err = search?.get('error')
    if (!err) return
    if (err === 'OAuthCallback' || err === 'OAuthSignin') {
      let hint = t('auth.errors.oauthTimeout') || '第三方授权超时或网络异常，请重试'
      try {
        const p = (sessionStorage.getItem('oauthLastProvider') || '') as 'github' | 'google'
        if (p === 'github') hint = t('auth.errors.oauthTimeoutGithub') || hint
        else if (p === 'google') hint = t('auth.errors.oauthTimeoutGoogle') || hint
      } catch {}
      setModalMsg(hint)
      setModalOpen(true)
    }
  }, [search])

  const closeModal = () => {
    setModalOpen(false)
    // 娓呯悊 URL 涓婄殑 error 涓?callbackUrl锛岄伩鍏嶉噸澶嶅脊鍑?    router.replace('/auth/sign-in')
  }

  return (
    <main className='py-10'>
      <div className='mx-auto grid max-w-5xl grid-cols-1 gap-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 md:grid-cols-2'>
        <div className='relative hidden overflow-hidden rounded-xl bg-zinc-50 md:block'>
          <Image src='/login-illustration.svg' alt='' fill className='object-contain p-6' sizes='400px' />
        </div>
        <div className='p-2'>
          <h1 className='text-2xl font-bold text-zinc-900'>{t('auth.signIn.heading')}</h1>
          <p className='mt-1 text-sm text-zinc-500'>{t('auth.signIn.welcome')}</p>

          <div className='mt-4 flex rounded-lg bg-zinc-100 p-1 text-sm font-medium'>
            <button disabled={busy}
              onClick={() => setTab('user')}
              className={`flex-1 rounded-md px-3 py-2 ${tab === 'user' ? 'bg-white text-blue-600 shadow' : 'text-zinc-600'}`}
            >
              {t('auth.signIn.userTab')}
            </button>
            <button disabled={busy}
              onClick={() => setTab('admin')}
              className={`flex-1 rounded-md px-3 py-2 ${tab === 'admin' ? 'bg-white text-blue-600 shadow' : 'text-zinc-600'}`}
            >
              {t('auth.signIn.adminTab')}
            </button>
          </div>

          <form onSubmit={onSubmit} className='mt-4 space-y-3'>
            <div>
              <label className='mb-1 block text-sm text-zinc-700'>{t('auth.form.usernamePhone')}</label>
              <input disabled={busy}
                value={idOrPhone}
                onChange={(e) => setIdOrPhone(e.target.value)}
                placeholder={t('auth.form.usernamePhone')}
                className='w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            <div>
              <label className='mb-1 block text-sm text-zinc-700'>{t('auth.form.password')}</label>
              <input disabled={busy}
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.form.password')}
                className='w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            {message && <p className='text-sm text-red-600'>{message}</p>}
            <button type='submit' disabled={busy} className='mt-2 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 py-2 text-white'>
              {loading ? t('auth.actions.submitting') : t('auth.signIn.login')}
            </button>
          </form>

          {tab === 'user' && (
            <div className='mt-6 space-y-2'>
              <div className='flex items-center gap-3 text-xs text-zinc-400'>
                <div className='h-px flex-1 bg-zinc-200' /> {t('auth.signIn.otherLogins')} <div className='h-px flex-1 bg-zinc-200' />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                {enableGithub && oauthBtn('github', t('auth.signIn.github'))}
                {enableGoogle && oauthBtn('google', t('auth.signIn.google'))}
              </div>
            </div>
          )}

          <p className='mt-6 text-center text-sm text-zinc-600'>
            {t('auth.signIn.noAccount')}
            {tab === 'user' ? (
              <Link href='/auth/sign-up' className='ml-1 text-blue-600'>{t('auth.signIn.goSignUp')}</Link>
            ) : (
              <span className='ml-1 text-zinc-400'>{t('auth.signIn.adminNoRegister')}</span>
            )}
          </p>
        </div>
      </div>
      <AlertModal open={modalOpen} title={t('auth.modal.oauthError') || '鎺堟潈鐧诲綍澶辫触'} okText={t('auth.actions.ok')} message={modalMsg} onClose={closeModal} />
    </main>
  )
}



export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageInner />
    </Suspense>
  )
}
