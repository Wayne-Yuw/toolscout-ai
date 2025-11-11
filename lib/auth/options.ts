import type { NextAuthOptions } from 'next-auth'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { findUserByIdentifier, verifyPassword, findUserByOAuth } from '@/lib/auth/db-users'
import { initGlobalProxyFromEnv } from '@/lib/net/proxy'

// 初始化全局代理（可选，取决于环境变量是否存在）
initGlobalProxyFromEnv()

export const authOptions: NextAuthOptions = {
  // 自定义登录页与错误页都指向 /auth/sign-in
  pages: { signIn: '/auth/sign-in', error: '/auth/sign-in' },
  // 开发环境开启调试输出
  debug: process.env.NODE_ENV !== 'production',
  // 确保会话 Cookie 在整个站点路径可用（不仅是 /api/auth）
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  session: { strategy: 'jwt' },
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      httpOptions: { timeout: Number(process.env.NEXTAUTH_PROVIDER_TIMEOUT_MS || 15000) },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      httpOptions: { timeout: Number(process.env.NEXTAUTH_PROVIDER_TIMEOUT_MS || 15000) },
    }),
    Credentials({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        idOrPhone: { label: '用户名或手机号', type: 'text' },
        password: { label: '密码', type: 'password' },
        loginType: { label: 'loginType', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null
        const { idOrPhone, password, loginType } = credentials as any
        const user = await findUserByIdentifier(idOrPhone)
        if (!user) return null
        const ok = await verifyPassword(user, password)
        if (!ok) return null
        if (loginType === 'admin' && !user.is_admin) return null
        return { id: user.id, name: user.nickname || user.username, email: user.email || undefined, appUserId: user.id, isAdmin: user.is_admin } as any
      },
    }),
  ],
  logger: {
    error(code, metadata) {
      console.error('[next-auth:error]', code, metadata)
    },
    warn(code) {
      console.warn('[next-auth:warn]', code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV !== 'production') console.log('[next-auth:debug]', code, metadata)
    },
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user && (user as any).appUserId) {
        ;(token as any).appUserId = (user as any).appUserId
        ;(token as any).isAdmin = (user as any).isAdmin
      }
      if (account && account.type === 'oauth') {
        const provider = account.provider
        const providerAccountId = account.providerAccountId as string
        const found = await findUserByOAuth(provider, providerAccountId)
        if (found) {
          ;(token as any).appUserId = found.id
          ;(token as any).isAdmin = found.is_admin
          ;(token as any).needsBinding = false
        } else {
          ;(token as any).needsBinding = true
          ;(token as any).oauth = { provider, providerAccountId, email: (profile as any)?.email ?? null }
        }
      }
      return token
    },
    async session({ session, token }) {
      ;(session as any).appUserId = (token as any).appUserId || null
      ;(session as any).isAdmin = (token as any).isAdmin || false
      ;(session as any).needsBinding = (token as any).needsBinding || false
      ;(session as any).oauth = (token as any).oauth || null
      return session
    },
    async signIn({ account }) {
      if (account && account.type === 'oauth') {
        const provider = account.provider
        const providerAccountId = account.providerAccountId as string
        const found = await findUserByOAuth(provider, providerAccountId)
        if (!found) {
          return '/auth/complete'
        }
      }
      return true
    },
  },
}
