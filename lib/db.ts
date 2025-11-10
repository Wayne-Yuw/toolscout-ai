import { Pool, type PoolConfig } from 'pg'

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
  pool = new Pool({ connectionString: connStr, ssl: resolveSSL(connStr) })
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
