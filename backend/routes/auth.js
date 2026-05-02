const express = require('express')
const bcrypt  = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const prisma  = require('../utils/prisma')
const { signToken, requireAuth } = require('../middleware/auth')

const router = express.Router()

/* ── POST /auth/login ──────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' })

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
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
  if (await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })) {
    return res.status(409).json({ error: 'An account with this email already exists.' })
  }

  // Check duplicate username
  if (username && await prisma.user.findFirst({ where: { username: { equals: username, mode: 'insensitive' } } })) {
    return res.status(409).json({ error: 'Username is already taken.' })
  }

  const hash = await bcrypt.hash(password, 10)
  
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      username: username?.trim() || name.replace(/\s+/g,'').toLowerCase(),
      email: email.trim().toLowerCase(),
      password: hash,
      role,
      avatar: avatar || name.slice(0,2).toUpperCase(),
      ign: ign?.trim() || null,
      game: game || null,
      bio: '',
      isDemo: false,
      stats: {
        matchesPlayed: 0, wins: 0, losses: 0, winRate: 0,
        kd: 0, hsPercent: 0, fbPercent: 0, points: 0, rank: null,
      }
    }
  })

  const { password: _, ...safeUser } = newUser
  return res.status(201).json({ data: { user: safeUser, token: signToken(safeUser) } })
})

/* ── GET /auth/me ──────────────────────────────────────────────────── */
router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) return res.status(404).json({ error: 'User not found.' })
  const { password: _, ...safeUser } = user
  res.json({ data: safeUser })
})

/* ── POST /auth/logout ─────────────────────────────────────────────── */
router.post('/logout', (req, res) => {
  res.json({ data: { ok: true } })
})

module.exports = router
