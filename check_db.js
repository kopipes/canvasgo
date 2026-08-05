const D = require('./node_modules/better-sqlite3')
const db = new D('./data/canvasgo.db')
try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
  console.log('Tables:', JSON.stringify(tables))
  const cols = db.prepare("PRAGMA table_info(visits)").all()
  console.log('Visit cols:', JSON.stringify(cols.map(c => c.name)))
} catch(e) {
  console.error('Error:', e.message)
}
