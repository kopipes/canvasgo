const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3060

app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '10mb' })) // large limit for base64 photos

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/products', require('./routes/products'))
app.use('/api/visits', require('./routes/visits'))
app.use('/api/activities', require('./routes/activities'))

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

// Error handler
app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`CanvasGo API running on http://127.0.0.1:${PORT}`)
})
