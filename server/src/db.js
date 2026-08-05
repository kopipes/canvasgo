const Database = require('better-sqlite3')
const path = require('path')
const bcrypt = require('bcryptjs')

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/canvasgo.db')

// Ensure data directory exists
const fs = require('fs')
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(DB_PATH)

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ─── Schema ───────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'rep' CHECK(role IN ('rep','manager','admin')),
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
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_name   TEXT NOT NULL,
    pic_name        TEXT NOT NULL,
    pic_phone       TEXT NOT NULL DEFAULT '',
    pic_email       TEXT NOT NULL DEFAULT '',
    products        TEXT NOT NULL DEFAULT '[]',
    existing_system TEXT NOT NULL DEFAULT '',
    website         TEXT NOT NULL DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'follow_up',
    interested      INTEGER NOT NULL DEFAULT 0,
    address         TEXT NOT NULL DEFAULT '',
    lead_source     TEXT NOT NULL DEFAULT '',
    next_follow_up  TEXT NOT NULL DEFAULT '',
    notes           TEXT NOT NULL DEFAULT '',
    photo           TEXT NOT NULL DEFAULT '',
    lat             REAL,
    lng             REAL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS canvassing_activities (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id   INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tanggal    TEXT NOT NULL,
    catatan    TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT '',
    photo      TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// ─── Migrations ───────────────────────────────────────────────────────────────
function migrate() {
  const cols = db.prepare("PRAGMA table_info(visits)").all()
  const colNames = cols.map(c => c.name)

  if (!colNames.includes('interested')) {
    db.prepare("ALTER TABLE visits ADD COLUMN interested INTEGER NOT NULL DEFAULT 0").run()
    console.log('Migration: added interested column to visits')
  }
  if (!colNames.includes('address')) {
    db.prepare("ALTER TABLE visits ADD COLUMN address TEXT NOT NULL DEFAULT ''").run()
    console.log('Migration: added address column to visits')
  }
  if (!colNames.includes('lead_source')) {
    db.prepare("ALTER TABLE visits ADD COLUMN lead_source TEXT NOT NULL DEFAULT ''").run()
    console.log('Migration: added lead_source column to visits')
  }
}
migrate()
function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get()
  if (count.c > 0) return

  const hash = (pw) => bcrypt.hashSync(pw, 10)
  const insertUser = db.prepare('INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
  insertUser.run('Admin', 'admin@canvasgo.app', hash('admin123'), 'admin')
  insertUser.run('Manager Demo', 'manager@canvasgo.app', hash('manager123'), 'manager')
  insertUser.run('Sales Rep Demo', 'rep@canvasgo.app', hash('rep123'), 'rep')

  const insertProduct = db.prepare('INSERT OR IGNORE INTO products (name) VALUES (?)')
  ;['Kontakami', 'Reservation System', 'POS Integration', 'Analytics Dashboard', 'Customer Loyalty'].forEach(n => insertProduct.run(n))

  console.log('Database seeded with demo accounts')
}

seedIfEmpty()

module.exports = db
