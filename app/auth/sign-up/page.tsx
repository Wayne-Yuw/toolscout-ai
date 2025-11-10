"use client"

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { signIn } from 'next-auth/react'
import AvatarUpload from '@/components/ui/avatar-upload'
import AlertModal from '@/components/ui/alert-modal'
import { useTranslations } from '@/lib/i18n'

function useErrorMessage() {
  const t = useTranslations()
  return (code: string) => {
    const map: Record<string, string> = {
      USERNAME_TAKEN: t('auth.errors.usernameTaken'),
      PHONE_TAKEN: t('auth.errors.phoneTaken'),
      INVALID_PHONE: t('auth.validation.invalidPhone'),
      INVALID_PASSWORD: t('auth.validation.invalidPassword'),
      REQUIRED_FIELD: t('auth.validation.required'),
      NETWORK_ERROR: t('auth.errors.network'),
      UNKNOWN: t('auth.errors.unknown'),
    }
    return map[code] || map.UNKNOWN
  }
}

export default function SignUpPage() {
  const t = useTranslations()
  const errMsg = useErrorMessage()
  const [form, setForm] = useState({ username: '', phone: '', password: '', nickname: '', email: '', avatar_url: '' })
  const [pwdTouched, setPwdTouched] = useState(false)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMsg, setModalMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const passwordInvalid = useMemo(() => {
    if (!pwdTouched) return false
    return !/^.{6,}$/.test(form.password)
  }, [pwdTouched, form.password])

  const openModal = (msg: string) => {
    setModalMsg(msg)
    setModalOpen(true)
  }

  function validateAll(): string | null {
    if (!form.username || !form.phone || !form.password) return errMsg('REQUIRED_FIELD')
    if (!/^.{6,}$/.test(form.password)) return errMsg('INVALID_PASSWORD')
    if (!/^\+?\d[\d\-\s]{5,}$/.test(form.phone)) return errMsg('INVALID_PHONE')
    return null
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateAll()
    if (err) return openModal(err)

    setLoading(true)
    try {
      const payload = {
        username: form.username.trim(),
        phone: form.phone.trim(),
        password: form.password,
        nickname: form.nickname.trim() || undefined,
        email: form.email.trim() || undefined,
        avatar_url: form.avatar_url.trim() || undefined,
      }
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) {
        let apiMsg: string | null = null
        if (typeof data?.message === 'string') apiMsg = data.message
        else if (Array.isArray(data)) {
          const first = data[0]
          if (first?.format === 'email') apiMsg = errMsg('INVALID_EMAIL')
          else if (first?.format === 'url') apiMsg = errMsg('INVALID_URL')
        } else if (data?.error === 'INPUT_INVALID' && Array.isArray(data?.issues)) {
          const first = data.issues[0]
          if (first?.message) apiMsg = first.message
        } else if (typeof data?.error === 'string') apiMsg = data.error
        if (!apiMsg) apiMsg = errMsg('UNKNOWN')
        throw new Error(apiMsg)
      }
      await signIn('credentials', { idOrPhone: form.username, password: form.password, loginType: 'user', redirect: true, callbackUrl: '/' })
    } catch (e: any) {
      openModal(e?.message || errMsg('NETWORK_ERROR'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='py-10'>
      <div className='mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100'>
        <h1 className='text-2xl font-bold text-zinc-900'>{t('auth.signUp.heading')}</h1>
        <p className='mt-1 text-sm text-zinc-500'>{t('auth.signUp.phoneUniqueHint')}</p>
        <form onSubmit={submit} className='mt-4 space-y-3'>
          <div>
            <label className='mb-1 block text-sm'>{t('auth.form.username')}</label>
            <input className='w-full rounded-lg border border-zinc-200 px-3 py-2' value={form.username} onChange={(e) => update('username', e.target.value)} required />
          </div>
          <div>
            <label className='mb-1 block text-sm'>{t('auth.form.phone')}</label>
            <input className='w-full rounded-lg border border-zinc-200 px-3 py-2' value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
          </div>
          <div>
            <label className='mb-1 block text-sm'>{t('auth.form.password')}</label>
            <input
              type='password'
              className='w-full rounded-lg border border-zinc-200 px-3 py-2'
              value={form.password}
              onChange={(e) => {
                if (!pwdTouched) setPwdTouched(true)
                update('password', e.target.value)
              }}
              onBlur={() => {
                setPwdTouched(true)
                const invalid = !/^.{6,}$/.test(form.password)
                setPwdError(invalid ? errMsg('INVALID_PASSWORD') : null)
              }}
              required
            />
            {pwdError && <p className='mt-1 text-xs text-red-600'>{pwdError}</p>}
          </div>
          <div>
            <label className='mb-1 block text-sm'>{t('auth.form.nicknameOptional')}</label>
            <input className='w-full rounded-lg border border-zinc-200 px-3 py-2' value={form.nickname} onChange={(e) => update('nickname', e.target.value)} />
          </div>
          <div>
            <label className='mb-1 block text-sm'>{t('auth.form.emailOptional')}</label>
            <input type='email' className='w-full rounded-lg border border-zinc-200 px-3 py-2' value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div>
            <label className='mb-1 block text-sm'>{t('auth.form.avatarOptional')}</label>
            <AvatarUpload value={form.avatar_url || null} onChange={(v) => update('avatar_url', v || '')} />
          </div>
          <button type='submit' disabled={loading || passwordInvalid} className='mt-2 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60'>
            {loading ? t('auth.actions.submitting') : t('auth.signUp.submit')}
          </button>
          <p className='text-center text-sm text-zinc-600'>{t('auth.signUp.haveAccount')}<Link href='/auth/sign-in' className='text-blue-600'>{t('auth.signUp.goLogin')}</Link></p>
        </form>
      </div>

      <AlertModal open={modalOpen} title={t('auth.modal.registerFailed')} okText={t('auth.actions.ok')} message={modalMsg} onClose={() => setModalOpen(false)} />
    </main>
  )
}
