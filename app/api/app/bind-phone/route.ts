import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '@/lib/auth/options'
import { createUser, findUserByPhone, findUserByUsername } from '@/lib/auth/db-users'
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
  // 需要确保用户已通过 OAuth 完成首次登录（但未绑定手机号）
  let session = await getServerSession(authOptions)
  let needs = (session as any)?.needsBinding as boolean | undefined
  let oauth = (session as any)?.oauth as { provider: string; providerAccountId: string; email?: string | null } | null

  // 某些环境下 getServerSession 读取不到 Cookie，这里降级用 JWT 直接解析
  if (!session || !oauth) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (token) {
      needs = (token as any).needsBinding as boolean
      oauth = ((token as any).oauth || null) as any
    }
  }

  if (!oauth) return NextResponse.json({ error: '未登录' }, { status: 401 })
  if (!needs) return NextResponse.json({ error: '无需绑定' }, { status: 400 })

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
      email: oauth?.email || undefined,
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
