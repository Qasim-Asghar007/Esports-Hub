const express = require('express')
const bcrypt  = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const db      = require('../utils/db')
const { signToken, requireAuth } = require('../middleware/auth')

const router = express.Router()

/* ── POST /auth/login ──────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' })

  const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return res.status(401).json({ error: 'No account found with that email.' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Incorrect password.' })

  const { password: _, ...safeUser } = user
  return res.json({ data: { user: safeUser, token: signToken(safeUser) } })
})

/* ── POST /auth/signup ─────────────────────────────────────────────── */
router.post('/signup', async (req, res) => {
  const { name, username, email, password, role, ign, game, avatar } = req.body
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' })
  }

  // Check duplicate email
  if (db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists.' })
  }

  // Check duplicate username
  if (username && db.findOne('users', u => u.username?.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'Username is already taken.' })
  }

  const hash = await bcrypt.hash(password, 10)
  const newUser = {
    id:        uuidv4(),
    name:      name.trim(),
    username:  username?.trim() || name.replace(/\s+/g,'').toLowerCase(),
    email:     email.trim().toLowerCase(),
    password:  hash,
    role,
    avatar:    avatar || name.slice(0,2).toUpperCase(),
    ign:       ign?.trim() || null,
    game:      game || null,
    team:      null,
    bio:       '',
    isDemo:    false,
    // New users start with all stats at 0
    stats: {
      matchesPlayed: 0, wins: 0, losses: 0, winRate: 0,
      kd: 0, hsPercent: 0, fbPercent: 0, points: 0, rank: null,
    },
    createdAt: new Date().toISOString(),
  }

  db.insert('users', newUser)

  const { password: _, ...safeUser } = newUser
  return res.status(201).json({ data: { user: safeUser, token: signToken(safeUser) } })
})

/* ── GET /auth/me ──────────────────────────────────────────────────── */
router.get('/me', requireAuth, (req, res) => {
  const user = db.findById('users', req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  const { password: _, ...safeUser } = user
  res.json({ data: safeUser })
})

/* ── POST /auth/logout ─────────────────────────────────────────────── */
// JWT is stateless; logout is handled client-side by discarding the token.
// In production, add a token blacklist / short-lived refresh tokens.
router.post('/logout', (req, res) => {
  res.json({ data: { ok: true } })
})

module.exports = router
