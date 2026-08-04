const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../db')
const { signToken, requireAuth } = require('../auth')

const router = express.Router()

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' })

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase())
  if (!user) return res.status(401).json({ error: 'Email atau password salah' })

  const valid = bcrypt.compareSync(password.trim(), user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Email atau password salah' })

  const token = signToken(user)
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

// PUT /api/auth/change-password
router.put('/change-password', requireAuth, (req, res) => {
  const { old_password, new_password } = req.body
  if (!old_password || !new_password) return res.status(400).json({ error: 'Password lama dan baru wajib diisi' })
  if (new_password.trim().length < 6) return res.status(400).json({ error: 'Password baru minimal 6 karakter' })

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' })

  const valid = bcrypt.compareSync(old_password.trim(), user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Password lama tidak sesuai' })

  const hash = bcrypt.hashSync(new_password.trim(), 10)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id)
  res.json({ ok: true })
})

module.exports = router
