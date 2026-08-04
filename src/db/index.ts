import { User, Visit, Product, Role, VisitStatus } from '@/types'

// ─── Storage keys ────────────────────────────────────────────────────────────
const KEYS = {
  users: 'cg_users',
  visits: 'cg_visits',
  products: 'cg_products',
  seq: 'cg_seq',
}

// ─── Generic helpers ─────────────────────────────────────────────────────────
function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function nextId(entity: string): number {
  const seqs: Record<string, number> = JSON.parse(localStorage.getItem(KEYS.seq) ?? '{}')
  seqs[entity] = (seqs[entity] ?? 0) + 1
  localStorage.setItem(KEYS.seq, JSON.stringify(seqs))
  return seqs[entity]
}

// ─── Seed on first run ───────────────────────────────────────────────────────
function seedIfEmpty() {
  const users = load<User>(KEYS.users)
  if (users.length === 0) {
    const seeded: User[] = [
      { id: 1, name: 'Admin',         email: 'admin@canvasgo.app',   password_hash: 'admin123',   role: 'admin',   created_at: new Date().toISOString() },
      { id: 2, name: 'Manager Demo',  email: 'manager@canvasgo.app', password_hash: 'manager123', role: 'manager', created_at: new Date().toISOString() },
      { id: 3, name: 'Sales Rep Demo',email: 'rep@canvasgo.app',     password_hash: 'rep123',     role: 'rep',     created_at: new Date().toISOString() },
    ]
    save(KEYS.users, seeded)
    const seqs: Record<string, number> = { users: 3 }
    localStorage.setItem(KEYS.seq, JSON.stringify(seqs))
  }

  const products = load<Product>(KEYS.products)
  if (products.length === 0) {
    const seeded: Product[] = [
      { id: 1, name: 'Kontakami',            active: 1, created_at: new Date().toISOString() },
      { id: 2, name: 'Reservation System',   active: 1, created_at: new Date().toISOString() },
      { id: 3, name: 'POS Integration',      active: 1, created_at: new Date().toISOString() },
      { id: 4, name: 'Analytics Dashboard',  active: 1, created_at: new Date().toISOString() },
      { id: 5, name: 'Customer Loyalty',     active: 1, created_at: new Date().toISOString() },
    ]
    save(KEYS.products, seeded)
    const seqs: Record<string, number> = JSON.parse(localStorage.getItem(KEYS.seq) ?? '{}')
    seqs.products = 5
    localStorage.setItem(KEYS.seq, JSON.stringify(seqs))
  }

  const visits = load<Visit>(KEYS.visits)
  if (visits.length === 0) {
    const now = new Date()
    const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()
    const seeded: Visit[] = [
      {
        id: 1, user_id: 3, location_name: 'Apollo Wu Artisan', pic_name: 'Ibu Stephany',
        pic_phone: '081355555312', pic_email: 'management@apolloartisan.com',
        products: JSON.stringify(['Kontakami', 'Reservation System']),
        existing_system: 'Chope', website: 'https://apollowuartisan.com',
        status: 'follow_up', next_follow_up: new Date(now.getTime() + 3 * 86400000).toISOString().slice(0, 10),
        notes: 'Diminta kirim Company Profile dahulu ke email.', photo: '', lat: null, lng: null,
        created_at: daysAgo(1), synced: 1,
      },
      {
        id: 2, user_id: 3, location_name: 'Sushi Tei Grand Indonesia', pic_name: 'Bapak Rudi',
        pic_phone: '08119876543', pic_email: 'rudi@sushitei.co.id',
        products: JSON.stringify(['POS Integration', 'Analytics Dashboard']),
        existing_system: 'Moka POS', website: 'https://sushitei.co.id',
        status: 'interested', next_follow_up: new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10),
        notes: 'Sangat tertarik dengan integrasi POS. Minta demo minggu depan.', photo: '', lat: null, lng: null,
        created_at: daysAgo(2), synced: 1,
      },
      {
        id: 3, user_id: 3, location_name: 'Kopi Kenangan Sudirman', pic_name: 'Ibu Dewi',
        pic_phone: '08561234567', pic_email: 'dewi@kopikenangan.com',
        products: JSON.stringify(['Customer Loyalty', 'Kontakami']),
        existing_system: '-', website: 'https://kopikenangan.com',
        status: 'not_interested', next_follow_up: '',
        notes: 'Sudah pakai sistem internal sendiri. Tidak ada budget tahun ini.', photo: '', lat: null, lng: null,
        created_at: daysAgo(3), synced: 1,
      },
      {
        id: 4, user_id: 3, location_name: 'Pizza Hut Delivery Kemang', pic_name: 'Bapak Hendra',
        pic_phone: '08121111222', pic_email: 'hendra@phd.co.id',
        products: JSON.stringify(['Reservation System']),
        existing_system: 'Manual WhatsApp', website: '',
        status: 'closed', next_follow_up: '',
        notes: 'Deal! Kontrak ditandatangani. Onboarding jadwal minggu depan.', photo: '', lat: null, lng: null,
        created_at: daysAgo(5), synced: 1,
      },
      {
        id: 5, user_id: 3, location_name: 'Warung Padang Sederhana', pic_name: 'Bapak Andi',
        pic_phone: '08523334444', pic_email: '',
        products: JSON.stringify(['Kontakami']),
        existing_system: '-', website: '',
        status: 'no_contact', next_follow_up: '',
        notes: 'Pemilik tidak ada di tempat. Coba lagi besok.', photo: '', lat: null, lng: null,
        created_at: daysAgo(6), synced: 1,
      },
    ]
    save(KEYS.visits, seeded)
    const seqs: Record<string, number> = JSON.parse(localStorage.getItem(KEYS.seq) ?? '{}')
    seqs.visits = 5
    localStorage.setItem(KEYS.seq, JSON.stringify(seqs))
  }
}

const DB_VERSION = '3'
const VERSION_KEY = 'cg_version'

// Clear stale data from old sql.js era
if (localStorage.getItem(VERSION_KEY) !== DB_VERSION) {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k))
  localStorage.removeItem(VERSION_KEY)
  localStorage.setItem(VERSION_KEY, DB_VERSION)
}

// Run seed immediately
seedIfEmpty()


// ─── AUTH ────────────────────────────────────────────────────────────────────
export async function loginUser(email: string, password: string): Promise<User | null> {
  const users = load<User>(KEYS.users)
  return users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password_hash === password) ?? null
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export async function getUsers(): Promise<User[]> {
  return load<User>(KEYS.users).sort((a, b) => a.name.localeCompare(b.name))
}

export async function createUser(name: string, email: string, password: string, role: Role): Promise<void> {
  const users = load<User>(KEYS.users)
  users.push({ id: nextId('users'), name, email, password_hash: password, role, created_at: new Date().toISOString() })
  save(KEYS.users, users)
}

export async function updateUser(id: number, name: string, email: string, role: Role, password?: string): Promise<void> {
  const users = load<User>(KEYS.users)
  const idx = users.findIndex(u => u.id === id)
  if (idx === -1) return
  users[idx] = { ...users[idx], name, email, role, ...(password ? { password_hash: password } : {}) }
  save(KEYS.users, users)
}

export async function deleteUser(id: number): Promise<void> {
  save(KEYS.users, load<User>(KEYS.users).filter(u => u.id !== id))
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export async function getProducts(activeOnly = true): Promise<Product[]> {
  const all = load<Product>(KEYS.products)
  return (activeOnly ? all.filter(p => p.active === 1) : all).sort((a, b) => a.name.localeCompare(b.name))
}

export async function createProduct(name: string): Promise<void> {
  const products = load<Product>(KEYS.products)
  if (products.find(p => p.name.toLowerCase() === name.toLowerCase())) return
  products.push({ id: nextId('products'), name, active: 1, created_at: new Date().toISOString() })
  save(KEYS.products, products)
}

export async function updateProduct(id: number, name: string, active: number): Promise<void> {
  const products = load<Product>(KEYS.products)
  const idx = products.findIndex(p => p.id === id)
  if (idx === -1) return
  products[idx] = { ...products[idx], name, active }
  save(KEYS.products, products)
}

export async function deleteProduct(id: number): Promise<void> {
  save(KEYS.products, load<Product>(KEYS.products).filter(p => p.id !== id))
}

// ─── VISITS ──────────────────────────────────────────────────────────────────
export async function getVisits(filters?: {
  userId?: number
  status?: VisitStatus | ''
  dateFrom?: string
  dateTo?: string
  search?: string
}): Promise<Visit[]> {
  const users = load<User>(KEYS.users)
  let visits = load<Visit>(KEYS.visits).map(v => ({
    ...v,
    user_name: users.find(u => u.id === v.user_id)?.name ?? '',
  }))

  if (filters?.userId) visits = visits.filter(v => v.user_id === filters.userId)
  if (filters?.status) visits = visits.filter(v => v.status === filters.status)
  if (filters?.dateFrom) visits = visits.filter(v => v.created_at.slice(0, 10) >= filters.dateFrom!)
  if (filters?.dateTo)   visits = visits.filter(v => v.created_at.slice(0, 10) <= filters.dateTo!)
  if (filters?.search) {
    const s = filters.search.toLowerCase()
    visits = visits.filter(v =>
      v.location_name.toLowerCase().includes(s) ||
      v.pic_name.toLowerCase().includes(s) ||
      v.notes.toLowerCase().includes(s)
    )
  }

  return visits.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function getVisitById(id: number): Promise<Visit | null> {
  const users = load<User>(KEYS.users)
  const visit = load<Visit>(KEYS.visits).find(v => v.id === id)
  if (!visit) return null
  return { ...visit, user_name: users.find(u => u.id === visit.user_id)?.name ?? '' }
}

export async function createVisit(visit: Omit<Visit, 'id' | 'created_at' | 'synced' | 'user_name'>): Promise<number> {
  const visits = load<Visit>(KEYS.visits)
  const id = nextId('visits')
  visits.push({ ...visit, id, created_at: new Date().toISOString(), synced: 1 })
  save(KEYS.visits, visits)
  return id
}

export async function updateVisit(id: number, patch: Partial<Omit<Visit, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
  const visits = load<Visit>(KEYS.visits)
  const idx = visits.findIndex(v => v.id === id)
  if (idx === -1) return
  visits[idx] = { ...visits[idx], ...patch }
  save(KEYS.visits, visits)
}

export async function deleteVisit(id: number): Promise<void> {
  save(KEYS.visits, load<Visit>(KEYS.visits).filter(v => v.id !== id))
}

// ─── STATS ───────────────────────────────────────────────────────────────────
export async function getDashboardStats(userId?: number): Promise<{
  total: number; interested: number; follow_up: number; closed: number; this_week: number
}> {
  let visits = load<Visit>(KEYS.visits)
  if (userId) visits = visits.filter(v => v.user_id === userId)

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString()

  return {
    total:       visits.length,
    interested:  visits.filter(v => v.status === 'interested').length,
    follow_up:   visits.filter(v => v.status === 'follow_up').length,
    closed:      visits.filter(v => v.status === 'closed').length,
    this_week:   visits.filter(v => v.created_at >= weekAgoStr).length,
  }
}
