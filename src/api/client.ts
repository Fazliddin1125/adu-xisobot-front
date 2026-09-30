const TOKEN_KEY = 'atm_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

let onUnauthorized: () => void = () => {}
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const token = tokenStore.get()
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    if (res.status === 401 && token) onUnauthorized()
    throw new ApiError(res.status, data.message ?? 'Xatolik yuz berdi')
  }
  return res
}

export const api = {
  async get<T>(path: string): Promise<T> {
    return (await request(path)).json()
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    return (await request(path, { method: 'POST', body: JSON.stringify(body) })).json()
  },
  async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await request(path, { method: 'PATCH', body: JSON.stringify(body) })
    return res.status === 204 ? (undefined as T) : res.json()
  },
  async delete(path: string): Promise<void> {
    await request(path, { method: 'DELETE' })
  },
  async download(path: string): Promise<void> {
    const res = await request(path)
    const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? 'hisobot.xlsx'
    const url = URL.createObjectURL(await res.blob())
    const a = Object.assign(document.createElement('a'), { href: url, download: name })
    a.click()
    URL.revokeObjectURL(url)
  },
}
