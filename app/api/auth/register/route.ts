import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createUser, findUserByPhone, findUserByUsername } from '@/lib/auth/db-users'
import { logRequest, logResponse, logError } from '@/lib/logger'

const BodySchema = z.object({
  username: z.string().trim().min(3).max(32),
  phone: z.string().trim().min(6).max(20),
  password: z.string().min(6).max(128),
  nickname: z
    .union([z.string().trim().max(32), z.literal('')])
    .optional()
    .transform((v) => (v ? v : undefined)),
  email: z
    .union([z.string().trim().email(), z.literal('')])
    .optional()
    .transform((v) => (v ? v : undefined)),
  avatar_url: z
    .union([z.string().trim().url(), z.literal('')])
    .optional()
    .transform((v) => (v ? v : undefined)),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    logRequest('api/auth/register', { path: req.nextUrl.pathname, method: req.method, body: json })
    const body = BodySchema.parse(json)

    const existsPhone = await findUserByPhone(body.phone)
    if (existsPhone) return NextResponse.json({ error: '手机号已存在' }, { status: 409 })
    const existsName = await findUserByUsername(body.username)
    if (existsName) return NextResponse.json({ error: '用户名已存在' }, { status: 409 })

    const user = await createUser({
      username: body.username,
      phone: body.phone,
      password: body.password,
      nickname: body.nickname,
      email: body.email,
      avatar_url: body.avatar_url,
    })
    const resBody = { ok: true, user: { id: user.id, username: user.username, phone: user.phone } }
    logResponse('api/auth/register', { path: req.nextUrl.pathname, status: 200, body: resBody })
    return NextResponse.json(resBody)
  } catch (e: any) {
    logError('api/auth/register', { path: req.nextUrl.pathname, error: e })
    if (e instanceof z.ZodError) {
      const issues = e.issues?.map((i) => ({
        path: i.path,
        message: i.message,
        code: i.code,
        expected: (i as any).expected,
        received: (i as any).received,
      }))
      return NextResponse.json(
        { error: 'INPUT_INVALID', message: issues?.[0]?.message || 'Invalid input', issues },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'REGISTER_FAILED', message: e?.message || '注册失败' }, { status: 400 })
  }
}
