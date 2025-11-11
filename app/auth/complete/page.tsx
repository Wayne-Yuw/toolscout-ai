"use client"

import { useMemo, useState } from 'react'
import { useTranslations } from '@/lib/i18n'
import AlertModal from '@/components/ui/alert-modal'

export default function CompleteProfilePage() {
  const t = useTranslations()
  const [form, setForm] = useState({ username: '', phone: '', nickname: '' })
  const [message, setMessage] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [ok, setOk] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [nameTouched, setNameTouched] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

  const update = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const phoneInvalid = useMemo(() => {
    if (!phoneTouched) return false
    return !/^1[3-9]\d{9}$/.test(form.phone.trim())
  }, [phoneTouched, form.phone])

  const nameInvalid = useMemo(() => {
    if (!nameTouched) return false
    return !/^[A-Za-z0-9_]{3,32}$/.test(form.username.trim())
  }, [nameTouched, form.username])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const res = await fetch('/api/app/bind-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      const msg = data.error || t('auth.modal.registerFailed')
      setMessage(msg)
      setModalOpen(true)
    }
    else {
      setOk(true)
      setTimeout(() => (window.location.href = '/'), 800)
    }
  }

  return (
    <main className='py-10'>
      <div className='mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100'>
        <h1 className='text-2xl font-bold'>{t('auth.complete.heading')}</h1>
        <p className='mt-1 text-sm text-zinc-500'>{t('auth.complete.tip')}</p>
        <form onSubmit={submit} className='mt-4 space-y-3'>
          <div>
            <label className='mb-1 block text-sm'>{t('auth.form.username')}</label>
            <input
              className='w-full rounded-lg border border-zinc-200 px-3 py-2'
              value={form.username}
              onChange={(e) => update('username', e.target.value)}
              onBlur={() => {
                setNameTouched(true)
                const invalid = !/^[A-Za-z0-9_]{3,32}$/.test(form.username.trim())
                setNameError(invalid ? t('auth.validation.invalidUsername') : null)
              }}
              required
            />
            {nameError && <p className='mt-1 text-xs text-red-600'>{nameError}</p>}
          </div>
          <div>
            <label className='mb-1 block text-sm'>{t('auth.form.phone')}</label>
            <input
              className='w-full rounded-lg border border-zinc-200 px-3 py-2'
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              onBlur={() => {
                setPhoneTouched(true)
                const invalid = !/^1[3-9]\d{9}$/.test(form.phone.trim())
                setPhoneError(invalid ? t('auth.validation.invalidPhone') : null)
              }}
              required
            />
            {phoneError && <p className='mt-1 text-xs text-red-600'>{phoneError}</p>}
          </div>
          <div>
            <label className='mb-1 block text-sm'>{t('auth.form.nicknameOptional')}</label>
            <input className='w-full rounded-lg border border-zinc-200 px-3 py-2' value={form.nickname} onChange={(e) => update('nickname', e.target.value)} />
          </div>
          {message && <p className='text-sm text-red-600'>{message}</p>}
          <button type='submit' disabled={phoneInvalid || nameInvalid} className='mt-2 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60'>
            {t('auth.complete.bindAndEnter')}
          </button>
          {ok && <p className='pt-2 text-center text-sm text-green-600'>{t('auth.complete.success')}</p>}
        </form>
      </div>
      <AlertModal open={modalOpen} title={t('auth.modal.registerFailed')} okText={t('auth.actions.ok')} message={message || ''} onClose={() => setModalOpen(false)} />
    </main>
  )
}
