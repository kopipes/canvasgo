import initSqlJs, { Database } from 'sql.js'
import { User, Visit, Product, Role, VisitStatus } from '@/types'

const DB_KEY = 'canvasgo_db'

let db: Database | null = null

async function getDB(): Promise<Database> {
  if (db) return db

  const SQL = await initSqlJs({
    locateFile: (file: string) => `/${file}`,
  })

  const saved = localStorage.getItem(DB_KEY)
  if (saved) {
    const buf = Uint8Array.from(atob(saved), (c) => c.charCodeAt(0))
    db = new SQL.Database(buf)
  } else {
    db = new SQL.Database()
    migrate(db)
    persist(db)
  }

  return db
}

function persist(database: Database) {
  const data = database.export()
  const b64 = btoa(String.fromCharCode(...Array.from(data)))
  localStorage.setItem(DB_KEY, b64)
}

function migrate(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'rep',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT UNIQUE NOT NULL,
      active     INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS visits (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id         INTEGER NOT NULL,
      location_name   TEXT NOT NULL,
      pic_name        TEXT NOT NULL,
      pic_phone       TEXT NOT NULL DEFAULT '',
      pic_email       TEXT NOT NULL DEFAULT '',
      products        TEXT NOT NULL DEFAULT '[]',
      existing_system TEXT NOT NULL DEFAULT '',
      website         TEXT NOT NULL DEFAULT '',
      status          TEXT NOT NULL DEFAULT 'follow_up',
      next_follow_up  TEXT NOT NULL DEFAULT '',
      notes           TEXT NOT NULL DEFAULT '',
      photo           TEXT NOT NULL DEFAULT '',
      lat             REAL,
      lng             REAL,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      synced          INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)

  // Seed default admin user (password: admin123)
  database.run(`
    INSERT OR IGNORE INTO users (name, email, password_hash, role)
    VALUES
      ('Admin', 'admin@canvasgo.app', 'admin123', 'admin'),
      ('Manager Demo', 'manager@canvasgo.app', 'manager123', 'manager'),
      ('Sales Rep Demo', 'rep@canvasgo.app', 'rep123', 'rep');
  `)

  // Seed default products
  database.run(`
    INSERT OR IGNORE INTO products (name) VALUES
      ('Kontakami'),
      ('Reservation System'),
      ('POS Integration'),
      ('Analytics Dashboard'),
      ('Customer Loyalty');
  `)
}

// --- AUTH ---

export async function loginUser(email: string, password: string): Promise<User | null> {
  const database = await getDB()
  const result = database.exec(
    `SELECT * FROM users WHERE email = '${email.replace(/'/g, "''")}' AND password_hash = '${password.replace(/'/g, "''")}' LIMIT 1`
  )
  if (!result.length || !result[0].values.length) return null
  const [row] = result[0].values
  const cols = result[0].columns
  return rowToUser(cols, row as (string | number)[])
}

function rowToUser(cols: string[], row: (string | number)[]): User {
  const obj: Record<string, string | number> = {}
  cols.forEach((c, i) => (obj[c] = row[i]))
  return obj as unknown as User
}

// --- VISITS ---

export async function getVisits(filters?: {
  userId?: number
  status?: VisitStatus | ''
  dateFrom?: string
  dateTo?: string
  search?: string
}): Promise<Visit[]> {
  const database = await getDB()
  const conditions: string[] = []

  if (filters?.userId) conditions.push(`v.user_id = ${filters.userId}`)
  if (filters?.status) conditions.push(`v.status = '${filters.status}'`)
  if (filters?.dateFrom) conditions.push(`date(v.created_at) >= '${filters.dateFrom}'`)
  if (filters?.dateTo) conditions.push(`date(v.created_at) <= '${filters.dateTo}'`)
  if (filters?.search) {
    const s = filters.search.replace(/'/g, "''")
    conditions.push(`(v.location_name LIKE '%${s}%' OR v.pic_name LIKE '%${s}%' OR v.notes LIKE '%${s}%')`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const result = database.exec(`
    SELECT v.*, u.name as user_name
    FROM visits v
    LEFT JOIN users u ON v.user_id = u.id
    ${where}
    ORDER BY v.created_at DESC
  `)

  if (!result.length) return []
  const { columns, values } = result[0]
  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((c, i) => (obj[c] = row[i]))
    return obj as unknown as Visit
  })
}

export async function getVisitById(id: number): Promise<Visit | null> {
  const database = await getDB()
  const result = database.exec(`
    SELECT v.*, u.name as user_name
    FROM visits v
    LEFT JOIN users u ON v.user_id = u.id
    WHERE v.id = ${id} LIMIT 1
  `)
  if (!result.length || !result[0].values.length) return null
  const { columns, values } = result[0]
  const obj: Record<string, unknown> = {}
  columns.forEach((c, i) => (obj[c] = values[0][i]))
  return obj as unknown as Visit
}

export async function createVisit(visit: Omit<Visit, 'id' | 'created_at' | 'synced' | 'user_name'>): Promise<number> {
  const database = await getDB()
  database.run(
    `INSERT INTO visits (user_id, location_name, pic_name, pic_phone, pic_email, products, existing_system, website, status, next_follow_up, notes, photo, lat, lng, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      visit.user_id,
      visit.location_name,
      visit.pic_name,
      visit.pic_phone,
      visit.pic_email,
      visit.products,
      visit.existing_system,
      visit.website,
      visit.status,
      visit.next_follow_up,
      visit.notes,
      visit.photo,
      visit.lat ?? null,
      visit.lng ?? null,
    ]
  )
  persist(database)
  const res = database.exec('SELECT last_insert_rowid() as id')
  return res[0].values[0][0] as number
}

export async function updateVisit(id: number, visit: Partial<Omit<Visit, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
  const database = await getDB()
  const fields = Object.entries(visit)
    .map(([k, v]) => `${k} = ${v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`}`)
    .join(', ')
  database.run(`UPDATE visits SET ${fields} WHERE id = ${id}`)
  persist(database)
}

export async function deleteVisit(id: number): Promise<void> {
  const database = await getDB()
  database.run(`DELETE FROM visits WHERE id = ${id}`)
  persist(database)
}

// --- PRODUCTS ---

export async function getProducts(activeOnly = true): Promise<Product[]> {
  const database = await getDB()
  const where = activeOnly ? 'WHERE active = 1' : ''
  const result = database.exec(`SELECT * FROM products ${where} ORDER BY name ASC`)
  if (!result.length) return []
  const { columns, values } = result[0]
  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((c, i) => (obj[c] = row[i]))
    return obj as unknown as Product
  })
}

export async function createProduct(name: string): Promise<void> {
  const database = await getDB()
  database.run(`INSERT OR IGNORE INTO products (name) VALUES ('${name.replace(/'/g, "''")}')`)
  persist(database)
}

export async function updateProduct(id: number, name: string, active: number): Promise<void> {
  const database = await getDB()
  database.run(`UPDATE products SET name = '${name.replace(/'/g, "''")}', active = ${active} WHERE id = ${id}`)
  persist(database)
}

export async function deleteProduct(id: number): Promise<void> {
  const database = await getDB()
  database.run(`DELETE FROM products WHERE id = ${id}`)
  persist(database)
}

// --- USERS ---

export async function getUsers(): Promise<User[]> {
  const database = await getDB()
  const result = database.exec(`SELECT id, name, email, role, created_at FROM users ORDER BY name ASC`)
  if (!result.length) return []
  const { columns, values } = result[0]
  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((c, i) => (obj[c] = row[i]))
    return obj as unknown as User
  })
}

export async function createUser(name: string, email: string, password: string, role: Role): Promise<void> {
  const database = await getDB()
  database.run(
    `INSERT INTO users (name, email, password_hash, role) VALUES ('${name.replace(/'/g, "''")}', '${email.replace(/'/g, "''")}', '${password.replace(/'/g, "''")}', '${role}')`
  )
  persist(database)
}

export async function updateUser(id: number, name: string, email: string, role: Role, password?: string): Promise<void> {
  const database = await getDB()
  const pwPart = password ? `, password_hash = '${password.replace(/'/g, "''")}'` : ''
  database.run(
    `UPDATE users SET name = '${name.replace(/'/g, "''")}', email = '${email.replace(/'/g, "''")}', role = '${role}'${pwPart} WHERE id = ${id}`
  )
  persist(database)
}

export async function deleteUser(id: number): Promise<void> {
  const database = await getDB()
  database.run(`DELETE FROM users WHERE id = ${id}`)
  persist(database)
}

// --- STATS ---

export async function getDashboardStats(userId?: number): Promise<{
  total: number
  interested: number
  follow_up: number
  closed: number
  this_week: number
}> {
  const database = await getDB()
  const userFilter = userId ? `WHERE user_id = ${userId}` : ''
  const res = database.exec(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'interested' THEN 1 ELSE 0 END) as interested,
      SUM(CASE WHEN status = 'follow_up' THEN 1 ELSE 0 END) as follow_up,
      SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
      SUM(CASE WHEN date(created_at) >= date('now', '-7 days') THEN 1 ELSE 0 END) as this_week
    FROM visits ${userFilter}
  `)
  if (!res.length || !res[0].values.length) return { total: 0, interested: 0, follow_up: 0, closed: 0, this_week: 0 }
  const [total, interested, follow_up, closed, this_week] = res[0].values[0] as number[]
  return { total: total || 0, interested: interested || 0, follow_up: follow_up || 0, closed: closed || 0, this_week: this_week || 0 }
}
