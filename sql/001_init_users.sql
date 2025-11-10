-- Users table for ToolScout AI auth
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  username text not null unique,
  password_hash text,
  nickname text,
  email text,
  avatar_url text,
  is_admin boolean not null default false,
  supabase_user_id uuid,
  provider text,
  provider_account_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_app_users_created_at on app_users(created_at desc);

