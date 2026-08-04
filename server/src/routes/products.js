const express = require('express')
const db = require('../db')
const { requireAuth, requireRole } = require('../auth')

const router = express.Router()

// GET /api/products
router.get('/', requireAuth, (req, res) => {
  const activeOnly = req.query.active !== 'false'
  const products = activeOnly
    ? db.prepare('SELECT * FROM products WHERE active=1 ORDER BY name ASC').all()
    : db.prepare('SELECT * FROM products ORDER BY name ASC').all()
  res.json(products)
})

// POST /api/products
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Nama produk wajib diisi' })
  try {
    const result = db.prepare('INSERT INTO products (name) VALUES (?)').run(name.trim())
    res.json({ id: result.lastInsertRowid })
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Produk sudah ada' })
    throw e
  }
})

// PUT /api/products/:id
router.put('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const { name, active } = req.body
  db.prepare('UPDATE products SET name=?, active=? WHERE id=?').run(name.trim(), active, Number(req.params.id))
  res.json({ ok: true })
})

// DELETE /api/products/:id
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  db.prepare('DELETE FROM products WHERE id=?').run(Number(req.params.id))
  res.json({ ok: true })
})

module.exports = router
