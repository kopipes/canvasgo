const API_BASE = '/api'

let _token: string | null = localStorage.getItem('cg_token')

export function setToken(t: string | null) {
  _token = t
  if (t) localStorage.setItem('cg_token', t)
  else localStorage.removeItem('cg_token')
}

export function getToken(): string | null {
  return _token
}

async function request(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (_token) headers['Authorization'] = `Bearer ${_token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const api = {
  get:    (path: string) => request('GET', path),
  post:   (path: string, body: unknown) => request('POST', path, body),
  put:    (path: string, body: unknown) => request('PUT', path, body),
  delete: (path: string) => request('DELETE', path),
}
