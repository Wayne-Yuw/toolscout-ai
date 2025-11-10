"use client"

import { useState } from 'react'
import { useTranslations } from '@/lib/i18n'

export default function CompleteProfilePage() {
  const t = useTranslations()
  const [form, setForm] = useState({ username: '', phone: '', nickname: '' })
  const [message, setMessage] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const update = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const res = await fetch('/api/app/bind-phone', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (!res.ok) setMessage(data.error || t('auth.modal.registerFailed'))
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
            <input className='w-full rounded-lg border border-zinc-200 px-3 py-2' value={form.username} onChange={(e) => update('username', e.target.value)} required />
          </div>
          <div>
            <label className='mb-1 block text-sm'>{t('auth.form.phone')}</label>
            <input className='w-full rounded-lg border border-zinc-200 px-3 py-2' value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
          </div>
          <div>
            <label className='mb-1 block text-sm'>{t('auth.form.nicknameOptional')}</label>
            <input className='w-full rounded-lg border border-zinc-200 px-3 py-2' value={form.nickname} onChange={(e) => update('nickname', e.target.value)} />
          </div>
          {message && <p className='text-sm text-red-600'>{message}</p>}
          <button type='submit' className='mt-2 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 py-2 text-white'>
            {t('auth.complete.bindAndEnter')}
          </button>
          {ok && <p className='pt-2 text-center text-sm text-green-600'>{t('auth.complete.success')}</p>}
        </form>
      </div>
    </main>
  )
}
