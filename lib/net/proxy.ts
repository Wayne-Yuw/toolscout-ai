// Server-side helper to enable global HTTP(S) proxy for undici fetch
export function initGlobalProxyFromEnv() {
  const proxy = process.env.OUTBOUND_HTTP_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  if (!proxy) return
  try {
    // undici is the HTTP client behind global fetch in Node 18+
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const undici = require('undici')
    if (undici?.ProxyAgent && undici?.setGlobalDispatcher) {
      const agent = new undici.ProxyAgent(proxy)
      undici.setGlobalDispatcher(agent)
      console.log('[net] Global proxy enabled:', proxy)
    }
  } catch (e) {
    console.warn('[net] Enable proxy failed:', e)
  }
}

