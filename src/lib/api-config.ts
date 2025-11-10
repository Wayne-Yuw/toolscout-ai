/**
 * API 配置和工具函数
 */

// API 基础 URL（Vercel 部署：使用 Next.js 内置 API 路由）
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Token 存储 key
export const TOKEN_KEY = 'toolscout_token';

/**
 * 获取存储的 Token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 保存 Token
 */
export function saveToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 删除 Token
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 创建 Authorization header
 */
export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
