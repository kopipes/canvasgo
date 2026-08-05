const express = require('express')
const db = require('../db')
const { requireAuth } = require('../auth')

const router = express.Router()

// GET /api/activities?visitId=
router.get('/', requireAuth, (req, res) => {
  const { visitId } = req.query
  if (!visitId) return res.status(400).json({ error: 'visitId wajib diisi' })

  const activities = db.prepare(`
    SELECT a.*, u.name as user_name
    FROM canvassing_activities a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.visit_id = ?
    ORDER BY a.created_at DESC
  `).all(Number(visitId))

  res.json(activities)
})

// POST /api/activities
router.post('/', requireAuth, (req, res) => {
  const { visit_id, tanggal, catatan, status, photo } = req.body
  if (!visit_id || !tanggal || !catatan) return res.status(400).json({ error: 'visit_id, tanggal, dan catatan wajib diisi' })

  const result = db.prepare(`
    INSERT INTO canvassing_activities (visit_id, user_id, tanggal, catatan, status, photo)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(Number(visit_id), req.user.id, tanggal, catatan.trim(), status||'', photo||'')

  // Sync visit status if activity has a status set
  if (status) {
    db.prepare('UPDATE visits SET status=? WHERE id=?').run(status, Number(visit_id))
  }

  res.json({ id: result.lastInsertRowid })
})

// PUT /api/activities/:id
router.put('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const activity = db.prepare('SELECT * FROM canvassing_activities WHERE id=?').get(id)
  if (!activity) return res.status(404).json({ error: 'Aktivitas tidak ditemukan' })
  if (req.user.role !== 'admin' && activity.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  const { tanggal, catatan, status, photo } = req.body
  db.prepare('UPDATE canvassing_activities SET tanggal=?, catatan=?, status=?, photo=? WHERE id=?')
    .run(tanggal, catatan.trim(), status||'', photo||'', id)

  // Sync visit status if activity has a status set
  if (status) {
    db.prepare('UPDATE visits SET status=? WHERE id=?').run(status, activity.visit_id)
  }

  res.json({ ok: true })
})

// DELETE /api/activities/:id
router.delete('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const activity = db.prepare('SELECT * FROM canvassing_activities WHERE id=?').get(id)
  if (!activity) return res.status(404).json({ error: 'Aktivitas tidak ditemukan' })
  if (req.user.role !== 'admin' && activity.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  db.prepare('DELETE FROM canvassing_activities WHERE id=?').run(id)
  res.json({ ok: true })
})

module.exports = router
