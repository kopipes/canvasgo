import { api } from '@/api/client'
import { User, Visit, Product, Role, VisitStatus, CanvassingActivity } from '@/types'

// ─── AUTH ────────────────────────────────────────────────────────────────────
export async function loginUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    return await api.post('/auth/login', { email, password })
  } catch {
    return null
  }
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await api.put('/auth/change-password', { old_password: oldPassword, new_password: newPassword })
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Gagal mengganti password' }
  }
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export async function getUsers(): Promise<User[]> {
  return api.get('/users')
}

export async function createUser(name: string, email: string, password: string, role: Role): Promise<void> {
  await api.post('/users', { name, email, password, role })
}

export async function updateUser(id: number, name: string, email: string, role: Role, password?: string): Promise<void> {
  await api.put(`/users/${id}`, { name, email, role, password })
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`)
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export async function getProducts(activeOnly = true): Promise<Product[]> {
  return api.get(`/products?active=${!activeOnly ? 'false' : 'true'}`)
}

export async function createProduct(name: string): Promise<void> {
  await api.post('/products', { name })
}

export async function updateProduct(id: number, name: string, active: number): Promise<void> {
  await api.put(`/products/${id}`, { name, active })
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`)
}

// ─── VISITS ──────────────────────────────────────────────────────────────────
export async function getVisits(filters?: {
  userId?: number
  status?: VisitStatus | ''
  dateFrom?: string
  dateTo?: string
  search?: string
}): Promise<Visit[]> {
  const params = new URLSearchParams()
  if (filters?.userId) params.set('userId', String(filters.userId))
  if (filters?.status) params.set('status', filters.status)
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  if (filters?.search) params.set('search', filters.search)
  const qs = params.toString()
  return api.get(`/visits${qs ? '?' + qs : ''}`)
}

export async function getVisitById(id: number): Promise<Visit | null> {
  try {
    return await api.get(`/visits/${id}`)
  } catch {
    return null
  }
}

export async function createVisit(visit: Omit<Visit, 'id' | 'created_at' | 'synced' | 'user_name' | 'user_id'>): Promise<number> {
  const res = await api.post('/visits', visit)
  return res.id
}

export async function updateVisit(id: number, patch: Partial<Omit<Visit, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
  await api.put(`/visits/${id}`, patch)
}

export async function deleteVisit(id: number): Promise<void> {
  await api.delete(`/visits/${id}`)
}

// ─── STATS ───────────────────────────────────────────────────────────────────
export async function getDashboardStats(userId?: number, dateFrom?: string, dateTo?: string): Promise<{
  total: number; total_leads: number; total_visited: number; interested: number; follow_up: number; closed: number; lost: number; this_week: number
}> {
  const params = new URLSearchParams()
  if (userId) params.set('userId', String(userId))
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)
  const qs = params.toString()
  return api.get(`/visits/stats/summary${qs ? '?' + qs : ''}`)
}

export interface FollowUpSummaryItem {
  id: number
  location_name: string
  pic_name: string
  status: string
  interested: number
  user_id: number
  user_name: string
  activity_count: number
  last_activity_date: string
}

export async function getFollowUpSummary(userId?: number, dateFrom?: string, dateTo?: string): Promise<FollowUpSummaryItem[]> {
  const params = new URLSearchParams()
  if (userId) params.set('userId', String(userId))
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)
  const qs = params.toString()
  return api.get(`/visits/followup-summary${qs ? '?' + qs : ''}`)
}

// ─── CANVASSING ACTIVITIES ───────────────────────────────────────────────────
export async function getActivities(visitId: number): Promise<CanvassingActivity[]> {
  return api.get(`/activities?visitId=${visitId}`)
}

export async function createActivity(activity: Omit<CanvassingActivity, 'id' | 'created_at' | 'user_name'>): Promise<void> {
  await api.post('/activities', activity)
}

export async function updateActivity(id: number, catatan: string, tanggal: string, status: CanvassingActivity['status'], photo: string): Promise<void> {
  await api.put(`/activities/${id}`, { catatan, tanggal, status, photo })
}

export async function deleteActivity(id: number): Promise<void> {
  await api.delete(`/activities/${id}`)
}
