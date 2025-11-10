export function nowISO() {
  return new Date().toISOString()
}

function maskDeep(value: any): any {
  if (value == null) return value
  if (Array.isArray(value)) return value.map(maskDeep)
  if (typeof value === 'object') {
    const out: any = {}
    for (const [k, v] of Object.entries(value)) {
      if (k.toLowerCase().includes('password')) out[k] = '***'
      else if (k === 'avatar_url' && typeof v === 'string' && v.startsWith('data:')) out[k] = `data-url(${v.length} chars)`
      else out[k] = maskDeep(v)
    }
    return out
  }
  return value
}

export function logRequest(tag: string, info: { path: string; method: string; body?: any }) {
  try {
    const masked = maskDeep(info.body)
    console.log(`[${nowISO()}] ${tag} ->`, { path: info.path, method: info.method, body: masked })
  } catch (e) {
    console.log(`[${nowISO()}] ${tag} ->`, { path: info.path, method: info.method, note: 'log failed' })
  }
}

export function logResponse(tag: string, info: { path: string; status: number; body?: any }) {
  try {
    const masked = maskDeep(info.body)
    console.log(`[${nowISO()}] ${tag} <-`, { path: info.path, status: info.status, body: masked })
  } catch (e) {
    console.log(`[${nowISO()}] ${tag} <-`, { path: info.path, status: info.status, note: 'log failed' })
  }
}

export function logError(tag: string, info: { path?: string; error: any }) {
  const msg = info?.error?.message || String(info.error)
  console.error(`[${nowISO()}] ${tag} !`, { path: info.path, message: msg, error: info.error })
}

