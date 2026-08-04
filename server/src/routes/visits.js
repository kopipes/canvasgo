const express = require('express')
const db = require('../db')
const { requireAuth } = require('../auth')

const router = express.Router()

// GET /api/visits
router.get('/', requireAuth, (req, res) => {
  const { userId, status, dateFrom, dateTo, search } = req.query

  const conditions = []
  const params = []

  // Reps can only see their own visits
  const effectiveUserId = req.user.role === 'rep' ? req.user.id : (userId ? Number(userId) : null)
  if (effectiveUserId) {
    conditions.push('v.user_id = ?')
    params.push(effectiveUserId)
  }
  if (status) { conditions.push('v.status = ?'); params.push(status) }
  if (dateFrom) { conditions.push("date(v.created_at) >= ?"); params.push(dateFrom) }
  if (dateTo) { conditions.push("date(v.created_at) <= ?"); params.push(dateTo) }
  if (search) {
    conditions.push('(v.location_name LIKE ? OR v.pic_name LIKE ? OR v.notes LIKE ?)')
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const visits = db.prepare(`
    SELECT v.*, u.name as user_name
    FROM visits v
    LEFT JOIN users u ON v.user_id = u.id
    ${where}
    ORDER BY v.created_at DESC
  `).all(...params)

  res.json(visits)
})

// GET /api/visits/:id
router.get('/:id', requireAuth, (req, res) => {
  const visit = db.prepare(`
    SELECT v.*, u.name as user_name
    FROM visits v LEFT JOIN users u ON v.user_id = u.id
    WHERE v.id = ?
  `).get(Number(req.params.id))
  if (!visit) return res.status(404).json({ error: 'Visit tidak ditemukan' })
  // Rep can only see own visits
  if (req.user.role === 'rep' && visit.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
  res.json(visit)
})

// POST /api/visits
router.post('/', requireAuth, (req, res) => {
  const { location_name, pic_name, pic_phone, pic_email, products, existing_system, website, status, next_follow_up, notes, photo, lat, lng } = req.body
  if (!location_name || !pic_name) return res.status(400).json({ error: 'Nama lokasi dan PIC wajib diisi' })

  const result = db.prepare(`
    INSERT INTO visits (user_id, location_name, pic_name, pic_phone, pic_email, products, existing_system, website, status, next_follow_up, notes, photo, lat, lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, location_name, pic_name, pic_phone||'', pic_email||'', products||'[]', existing_system||'', website||'', status||'follow_up', next_follow_up||'', notes||'', photo||'', lat||null, lng||null)

  res.json({ id: result.lastInsertRowid })
})

// PUT /api/visits/:id
router.put('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const visit = db.prepare('SELECT * FROM visits WHERE id=?').get(id)
  if (!visit) return res.status(404).json({ error: 'Visit tidak ditemukan' })
  if (req.user.role === 'rep' && visit.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  const { location_name, pic_name, pic_phone, pic_email, products, existing_system, website, status, next_follow_up, notes, photo } = req.body
  db.prepare(`
    UPDATE visits SET location_name=?, pic_name=?, pic_phone=?, pic_email=?, products=?, existing_system=?, website=?, status=?, next_follow_up=?, notes=?, photo=?
    WHERE id=?
  `).run(location_name, pic_name, pic_phone||'', pic_email||'', products||'[]', existing_system||'', website||'', status, next_follow_up||'', notes||'', photo||'', id)

  res.json({ ok: true })
})

// DELETE /api/visits/:id
router.delete('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const visit = db.prepare('SELECT * FROM visits WHERE id=?').get(id)
  if (!visit) return res.status(404).json({ error: 'Visit tidak ditemukan' })
  if (req.user.role === 'rep' && visit.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
  if (req.user.role === 'manager') return res.status(403).json({ error: 'Forbidden' })
  db.prepare('DELETE FROM visits WHERE id=?').run(id)
  res.json({ ok: true })
})

// GET /api/visits/stats/summary
router.get('/stats/summary', requireAuth, (req, res) => {
  const { userId } = req.query
  const effectiveUserId = req.user.role === 'rep' ? req.user.id : (userId ? Number(userId) : null)
  const where = effectiveUserId ? 'WHERE user_id = ?' : ''
  const params = effectiveUserId ? [effectiveUserId] : []

  const row = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status='interested' THEN 1 ELSE 0 END) as interested,
      SUM(CASE WHEN status='follow_up' THEN 1 ELSE 0 END) as follow_up,
      SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END) as closed,
      SUM(CASE WHEN date(created_at) >= date('now','-7 days') THEN 1 ELSE 0 END) as this_week
    FROM visits ${where}
  `).get(...params)

  res.json({
    total: row.total || 0,
    interested: row.interested || 0,
    follow_up: row.follow_up || 0,
    closed: row.closed || 0,
    this_week: row.this_week || 0,
  })
})

module.exports = router
