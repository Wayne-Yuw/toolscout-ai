import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '@/lib/auth/options'
import { createUser, findUserByPhone, findUserByUsername, linkOAuthToUser } from '@/lib/auth/db-users'
import { logRequest, logResponse, logError, nowISO } from '@/lib/logger'

export const runtime = 'nodejs'

const BodySchema = z.object({
  username: z.string().trim().min(3).max(32).regex(/^[A-Za-z0-9_]+$/, '用户名仅支持字母、数字、下划线'),
  phone: z.string().trim().regex(/^1[3-9]\d{9}$/u, '手机号格式不正确'),
  nickname: z.union([z.string().trim().max(32), z.literal('')]).optional().transform((v) => (v ? v : undefined)),
  avatar_url: z.union([z.string().trim().url(), z.string().trim().regex(/^data:/)]).optional(),
  merge: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  let session = await getServerSession(authOptions)
  try {
    const names = req.cookies.getAll().map((c) => c.name)
    console.log(`[${nowISO()}] bind-phone:cookies`, names)
  } catch {}
  let needs = (session as any)?.needsBinding as boolean | undefined
  let oauth = (session as any)?.oauth as { provider: string; providerAccountId: string; email?: string | null } | null

  // Fallback: read JWT directly if session missing
  if (!session || !oauth) {
    const token =
      (await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName: '__Secure-next-auth.session-token' })) ||
      (await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName: 'next-auth.session-token' }))
    if (token) {
      needs = (token as any).needsBinding as boolean
      oauth = ((token as any).oauth || null) as any
      try { console.log(`[${nowISO()}] bind-phone:fallback-token`, { hasToken: true, hasOAuth: !!oauth, needs }) } catch {}
    } else {
      try { console.log(`[${nowISO()}] bind-phone:fallback-token`, { hasToken: false }) } catch {}
    }
  }

  if (!oauth) return NextResponse.json({ error: '未登录' }, { status: 401 })
  if (!needs) return NextResponse.json({ error: '无需绑定' }, { status: 400 })

  try {
    const json = await req.json()
    logRequest('api/app/bind-phone', { path: req.nextUrl.pathname, method: req.method, body: json })
    const body = BodySchema.parse(json)

    const existsPhone = await findUserByPhone(body.phone)
    if (existsPhone) {
      if (existsPhone.provider) {
        return NextResponse.json({ error: 'PHONE_TAKEN_OAUTH_BOUND', message: '该手机号已被绑定到授权账号' }, { status: 409 })
      }
      if (!body.merge) {
        return NextResponse.json({ error: 'PHONE_TAKEN_CAN_MERGE', message: '手机号已存在，是否合并到该账号', canMerge: true }, { status: 409 })
      }
      await linkOAuthToUser(existsPhone.id, oauth!.provider, oauth!.providerAccountId)
      const resBody = { ok: true, userId: existsPhone.id, merged: true }
      logResponse('api/app/bind-phone', { path: req.nextUrl.pathname, status: 200, body: resBody })
      return NextResponse.json(resBody)
    }

    const created = await createUser({
      username: body.username,
      phone: body.phone,
      password: undefined,
      nickname: body.nickname,
      email: oauth?.email || undefined,
      avatar_url: body.avatar_url || ((session as any)?.oauthAvatar as string | null) || undefined,
      provider: oauth!.provider,
      provider_account_id: oauth!.providerAccountId,
    })
    const resBody = { ok: true, userId: created.id }
    logResponse('api/app/bind-phone', { path: req.nextUrl.pathname, status: 200, body: resBody })
    return NextResponse.json(resBody)
  } catch (e: any) {
    logError('api/app/bind-phone', { path: req.nextUrl.pathname, error: e })
    return NextResponse.json({ error: e?.message || '绑定失败' }, { status: 400 })
  }
}
