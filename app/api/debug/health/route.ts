import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const env = process.env
  const result: any = {
    ok: false,
    env: {
      hasDatabaseUrl: Boolean(env.DATABASE_URL),
      databaseSsl: env.DATABASE_SSL || null,
      nodeTlsRejectUnauthorized: env.NODE_TLS_REJECT_UNAUTHORIZED || null,
    },
    db: null,
  }
  try {
    const { rows } = await query<{ now: string }>('select now() as now')
    result.ok = true
    result.db = { now: rows[0]?.now }
    return NextResponse.json(result)
  } catch (e: any) {
    result.ok = false
    result.db = { error: e?.message || String(e) }
    return NextResponse.json(result, { status: 500 })
  }
}

