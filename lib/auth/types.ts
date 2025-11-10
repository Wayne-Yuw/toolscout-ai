export type AppUser = {
  id: string
  phone: string
  username: string
  password_hash: string | null
  nickname: string | null
  email: string | null
  avatar_url: string | null
  is_admin: boolean
  supabase_user_id: string | null
  provider: string | null
  provider_account_id: string | null
  created_at: string
}

