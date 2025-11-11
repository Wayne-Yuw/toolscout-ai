import type { NextAuthOptions } from 'next-auth'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { findUserByIdentifier, verifyPassword, findUserByOAuth } from '@/lib/auth/db-users'
import { initGlobalProxyFromEnv } from '@/lib/net/proxy'

// ???????????????????????????????????
initGlobalProxyFromEnv()

export const authOptions: NextAuthOptions = {
  // 自定义登录页与错误页都指向 /auth/sign-in
  pages: { signIn: '/auth/sign-in', error: '/auth/sign-in' },
  // 开发环境开启调试输出
  debug: process.env.NODE_ENV !== 'production',
  // 使用默认 Cookie 策略以确保本地 http 场景能正常下发会话 Cookie
  session: { strategy: 'jwt' },
    providers: (() => {
    const list: any[] = []
    const enableGithub = String(process.env.ENABLE_OAUTH_GITHUB || process.env.NEXT_PUBLIC_ENABLE_OAUTH_GITHUB || 'true').toLowerCase() !== 'false'
    const enableGoogle = String(process.env.ENABLE_OAUTH_GOOGLE || process.env.NEXT_PUBLIC_ENABLE_OAUTH_GOOGLE || 'true').toLowerCase() !== 'false'

    if (enableGithub) {
      list.push(
        Github({
          clientId: process.env.GITHUB_CLIENT_ID || '',
          clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
          allowDangerousEmailAccountLinking: true,
          httpOptions: { timeout: Number(process.env.NEXTAUTH_PROVIDER_TIMEOUT_MS || 15000) },
        })
      )
    }

    if (enableGoogle) {
      list.push(
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          allowDangerousEmailAccountLinking: true,
          authorization: {
            url: 'https://accounts.google.com/o/oauth2/v2/auth',
            params: { scope: 'openid email profile', prompt: 'consent', access_type: 'offline', include_granted_scopes: 'true' },
          },
          token: 'https://www.googleapis.com/oauth2/v4/token',
          userinfo: 'https://www.googleapis.com/oauth2/v3/userinfo',
          wellKnown: undefined as any,
          httpOptions: { timeout: Number(process.env.NEXTAUTH_PROVIDER_TIMEOUT_MS || 30000) },
        })
      )
    }

    list.push(
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
      })
    )

    return list
  })(),
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
          // 记录第三方头像以便完善资料页默认显示
          const avatar = (profile as any)?.picture || (profile as any)?.avatar_url || (profile as any)?.image || null
          if (avatar) (token as any).oauthAvatar = avatar
        }
      }
      return token
    },
    async session({ session, token }) {
      ;(session as any).appUserId = (token as any).appUserId || null
      ;(session as any).isAdmin = (token as any).isAdmin || false
      ;(session as any).needsBinding = (token as any).needsBinding || false
      ;(session as any).oauth = (token as any).oauth || null
      ;(session as any).oauthAvatar = (token as any).oauthAvatar || null
      return session
    },
        async signIn({ account }) {
      if (account && account.type === 'oauth') {
        const provider = account.provider
        const providerAccountId = account.providerAccountId as string
        const found = await findUserByOAuth(provider, providerAccountId)
        if (!found) {
          // 首次授权：跳转到完善资料
          return '/auth/complete'
        }
      }
      return true
    },
  },
}









