/**
 * EsportsHub — Backend API Server
 * Node.js + Express + JSON file storage
 *
 * Quick start:
 *   1. cd backend
 *   2. npm install
 *   3. cp .env.example .env    (then edit if needed)
 *   4. node utils/seed.js      (populate demo data)
 *   5. npm run dev             (or: npm start)
 *
 * The server runs on http://localhost:3001
 * Set VITE_API_BASE_URL=http://localhost:3001 in the frontend .env to connect.
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') })
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const express = require('express')
const cors    = require('cors')
const path    = require('path')

const authRouter          = require('./routes/auth')
const tournamentsRouter   = require('./routes/tournaments')
const teamsRouter         = require('./routes/teams')
const matchesRouter       = require('./routes/matches')
const usersRouter         = require('./routes/users')
const leaderboardRouter   = require('./routes/leaderboard')
const notificationsRouter = require('./routes/notifications')

const app  = express()
const PORT = process.env.PORT || 3001

/* ── Middleware ─────────────────────────────────────────────────────── */
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

/* ── Request logger (dev only) ──────────────────────────────────────── */
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toTimeString().slice(0,8)}] ${req.method} ${req.path}`)
    next()
  })
}

/* ── Routes ─────────────────────────────────────────────────────────── */
app.use('/auth',          authRouter)
app.use('/tournaments',   tournamentsRouter)
app.use('/teams',         teamsRouter)
app.use('/matches',       matchesRouter)
app.use('/users',         usersRouter)
app.use('/leaderboard',   leaderboardRouter)
app.use('/notifications', notificationsRouter)

/* ── Health check ───────────────────────────────────────────────────── */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    message: 'EsportsHub API is running',
  })
})

/* ── 404 handler ────────────────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' })
})

/* ── Global error handler ───────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error. Check the server logs.' })
})

/* ── Start ──────────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🚀 EsportsHub API running at http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health`)
  console.log(`   Data folder:  ${path.join(__dirname, 'data')}`)
  console.log(`   Run "node utils/seed.js" to populate demo data\n`)
})
