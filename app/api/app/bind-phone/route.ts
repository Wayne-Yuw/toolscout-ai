import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { createUser, findUserByPhone, findUserByUsername, linkOAuthToUser } from '@/lib/auth/db-users'

const BodySchema = z.object({
  username: z.string().trim().min(3).max(32),
  phone: z.string().trim().min(6).max(20),
  nickname: z.union([z.string().trim().max(32), z.literal('')]).optional().transform((v) => (v ? v : undefined)),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })
  const needs = (session as any).needsBinding
  const oauth = (session as any).oauth as { provider: string; providerAccountId: string; email?: string | null } | null
  if (!needs || !oauth) return NextResponse.json({ error: '无需绑定' }, { status: 400 })

  try {
    const json = await req.json()
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
    return NextResponse.json({ ok: true, userId: created.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || '绑定失败' }, { status: 400 })
  }
}
