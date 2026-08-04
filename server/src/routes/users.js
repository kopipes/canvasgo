const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../db')
const { requireAuth, requireRole } = require('../auth')

const router = express.Router()

// GET /api/users
router.get('/', requireAuth, requireRole('admin', 'manager'), (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY name ASC').all()
  res.json(users)
})

// POST /api/users
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'Semua field wajib diisi' })
  try {
    const hash = bcrypt.hashSync(password.trim(), 10)
    const result = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(name.trim(), email.trim().toLowerCase(), hash, role)
    res.json({ id: result.lastInsertRowid })
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email sudah digunakan' })
    throw e
  }
})

// PUT /api/users/:id
router.put('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const { name, email, role, password } = req.body
  const id = Number(req.params.id)
  if (password) {
    const hash = bcrypt.hashSync(password.trim(), 10)
    db.prepare('UPDATE users SET name=?, email=?, role=?, password_hash=? WHERE id=?').run(name.trim(), email.trim().toLowerCase(), role, hash, id)
  } else {
    db.prepare('UPDATE users SET name=?, email=?, role=? WHERE id=?').run(name.trim(), email.trim().toLowerCase(), role, id)
  }
  res.json({ ok: true })
})

// DELETE /api/users/:id
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const id = Number(req.params.id)
  if (id === req.user.id) return res.status(400).json({ error: 'Tidak bisa hapus akun sendiri' })
  db.prepare('DELETE FROM users WHERE id=?').run(id)
  res.json({ ok: true })
})

module.exports = router
