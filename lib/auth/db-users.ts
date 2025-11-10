import { query } from '@/lib/db'
import type { AppUser } from './types'
import bcrypt from 'bcryptjs'

export async function findUserByIdentifier(identifier: string): Promise<AppUser | null> {
  const { rows } = await query<AppUser>(
    `select * from app_users where phone = $1 or username = $1 limit 1`,
    [identifier]
  )
  return rows[0] ?? null
}

export async function findUserById(id: string): Promise<AppUser | null> {
  const { rows } = await query<AppUser>(`select * from app_users where id = $1`, [id])
  return rows[0] ?? null
}

export async function findUserByOAuth(provider: string, providerAccountId: string): Promise<AppUser | null> {
  const { rows } = await query<AppUser>(
    `select * from app_users where provider = $1 and provider_account_id = $2 limit 1`,
    [provider, providerAccountId]
  )
  return rows[0] ?? null
}

export async function findUserByPhone(phone: string): Promise<AppUser | null> {
  const { rows } = await query<AppUser>(`select * from app_users where phone = $1`, [phone])
  return rows[0] ?? null
}

export async function findUserByUsername(username: string): Promise<AppUser | null> {
  const { rows } = await query<AppUser>(`select * from app_users where username = $1`, [username])
  return rows[0] ?? null
}

export async function createUser(input: {
  username: string
  phone: string
  password?: string
  nickname?: string | null
  email?: string | null
  avatar_url?: string | null
  is_admin?: boolean
  provider?: string | null
  provider_account_id?: string | null
}): Promise<AppUser> {
  const password_hash = input.password ? await bcrypt.hash(input.password, 10) : null
  const nickname = input.nickname || `用户${maskPhone(input.phone)}`
  const avatar_url = input.avatar_url || defaultAvatarUrl(input.username)
  const is_admin = !!input.is_admin

  const { rows } = await query<AppUser>(
    `insert into app_users (username, phone, password_hash, nickname, email, avatar_url, is_admin, provider, provider_account_id)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     returning *`,
    [
      input.username,
      input.phone,
      password_hash,
      nickname,
      input.email || null,
      avatar_url,
      is_admin,
      input.provider || null,
      input.provider_account_id || null,
    ]
  )
  return rows[0]
}

export async function linkOAuthToUser(userId: string, provider: string, providerAccountId: string) {
  const { rows } = await query<AppUser>(
    `update app_users set provider = $2, provider_account_id = $3 where id = $1 returning *`,
    [userId, provider, providerAccountId]
  )
  return rows[0]
}

export async function verifyPassword(user: AppUser, password: string): Promise<boolean> {
  if (!user.password_hash) return false
  return bcrypt.compare(password, user.password_hash)
}

function maskPhone(phone: string) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

function defaultAvatarUrl(seed: string) {
  const safe = encodeURIComponent(seed)
  return `https://api.dicebear.com/9.x/identicon/svg?seed=${safe}`
}

