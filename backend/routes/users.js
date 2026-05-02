const express = require('express')
const bcrypt  = require('bcryptjs')
const db      = require('../utils/db')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

/* GET /users/profile — current user's full profile */
router.get('/profile', requireAuth, (req, res) => {
  const user = db.findById('users', req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  const { password: _, ...safe } = user
  res.json({ data: safe })
})

/* PUT /users/profile — update profile */
router.put('/profile', requireAuth, (req, res) => {
  const allowed = ['name', 'username', 'email', 'ign', 'game', 'bio', 'avatar']
  const updates = {}
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })

  const updated = db.update('users', req.user.id, updates)
  if (!updated) return res.status(404).json({ error: 'User not found.' })
  const { password: _, ...safe } = updated
  res.json({ data: safe })
})

/* PUT /users/password — change password */
router.put('/password', requireAuth, async (req, res) => {
  const { current, next } = req.body
  if (!current || !next) return res.status(400).json({ error: 'Current and new password required.' })
  if (next.length < 6)    return res.status(400).json({ error: 'Password must be at least 6 characters.' })

  const user = db.findById('users', req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })

  const valid = await bcrypt.compare(current, user.password)
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' })

  const hash = await bcrypt.hash(next, 10)
  db.update('users', req.user.id, { password: hash })
  res.json({ data: { ok: true } })
})

/* GET /users/stats — current user's stats */
router.get('/stats', requireAuth, (req, res) => {
  const user = db.findById('users', req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  res.json({ data: user.stats || {} })
})

/* PUT /users/stats — update stats (internal use / organizer verified) */
router.put('/stats', requireAuth, (req, res) => {
  const user = db.findById('users', req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  const updated = db.update('users', req.user.id, {
    stats: { ...user.stats, ...req.body }
  })
  res.json({ data: updated.stats })
})

module.exports = router
