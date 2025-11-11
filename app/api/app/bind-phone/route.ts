import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { createUser, findUserByPhone, findUserByUsername, linkOAuthToUser } from '@/lib/auth/db-users'
import { logRequest, logResponse, logError } from '@/lib/logger'

const BodySchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[A-Za-z0-9_]+$/, '用户名仅支持字母、数字、下划线'),
  phone: z
    .string()
    .trim()
    .regex(/^1[3-9]\d{9}$/u, '手机号格式不正确'),
  nickname: z
    .union([z.string().trim().max(32), z.literal('')])
    .optional()
    .transform((v) => (v ? v : undefined)),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })
  const needs = (session as any).needsBinding
  const oauth = (session as any).oauth as { provider: string; providerAccountId: string; email?: string | null } | null
  if (!needs || !oauth) return NextResponse.json({ error: '无需绑定' }, { status: 400 })

  try {
    const json = await req.json()
    logRequest('api/app/bind-phone', { path: req.nextUrl.pathname, method: req.method, body: json })
    const body = BodySchema.parse(json)

    const existsPhone = await findUserByPhone(body.phone)
    if (existsPhone) return NextResponse.json({ error: '手机号已存在' }, { status: 409 })
    const existsName = await findUserByUsername(body.username)
    if (existsName) return NextResponse.json({ error: '用户名已存在' }, { status: 409 })

    const created = await createUser({
      username: body.username,
      phone: body.phone,
      password: undefined,
      nickname: body.nickname,
      email: oauth.email || undefined,
      provider: oauth.provider,
      provider_account_id: oauth.providerAccountId,
    })
    // next-auth jwt will update on next reload; client can refetch session
    const resBody = { ok: true, userId: created.id }
    logResponse('api/app/bind-phone', { path: req.nextUrl.pathname, status: 200, body: resBody })
    return NextResponse.json(resBody)
  } catch (e: any) {
    logError('api/app/bind-phone', { path: req.nextUrl.pathname, error: e })
    return NextResponse.json({ error: e?.message || '绑定失败' }, { status: 400 })
  }
}
