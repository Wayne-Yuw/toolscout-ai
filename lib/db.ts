import { Pool, type PoolConfig } from 'pg'
import { nowISO } from '@/lib/logger'

let pool: Pool | null = null

function resolveSSL(connectionString: string): PoolConfig['ssl'] | undefined {
  const sslEnv = String(process.env.DATABASE_SSL || process.env.PGSSLMODE || '')
    .trim()
    .toLowerCase()
  if (['disable', 'off', 'false', '0', ''].includes(sslEnv)) return undefined
  if (['no-verify', 'allow', 'prefer', 'require', 'on', 'true', '1'].includes(sslEnv)) {
    return { rejectUnauthorized: false }
  }
  if (/\.supabase\.co(?::\d+)?\/?/i.test(connectionString)) return { rejectUnauthorized: false }
  return undefined
}

export function getPool() {
  if (pool) return pool
  const connStr = process.env.DATABASE_URL
  if (!connStr) {
    // Lazy pool that throws on use if not configured
    throw new Error('Missing DATABASE_URL env for Postgres connection')
  }
  const ssl = resolveSSL(connStr)
  try {
    const u = new URL(connStr)
    const masked = `${u.protocol}//${u.username || 'user'}:***@${u.hostname}:${u.port || '5432'}${u.pathname}`
    console.log(`[${nowISO()}] db:init`, { connectionString: masked, ssl: ssl ? { rejectUnauthorized: (ssl as any).rejectUnauthorized === false ? false : true } : null })
  } catch {}
  pool = new Pool({ connectionString: connStr, ssl })
  return pool
}

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const p = getPool()
  const res = await p.query(text, params)
  return { rows: res.rows as T[] }
}

export async function withTransaction<T>(fn: (client: any) => Promise<T>): Promise<T> {
  const p = getPool()
  const client = await p.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
