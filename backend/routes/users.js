const express = require('express')
const bcrypt  = require('bcryptjs')
const prisma  = require('../utils/prisma')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

/* GET /users/profile — current user's full profile */
router.get('/profile', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) return res.status(404).json({ error: 'User not found.' })
  const { password: _, ...safe } = user
  res.json({ data: safe })
})

/* PUT /users/profile — update profile */
router.put('/profile', requireAuth, async (req, res) => {
  const allowed = ['name', 'username', 'email', 'ign', 'game', 'bio', 'avatar']
  const updates = {}
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })

  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updates
    })
    const { password: _, ...safe } = updated
    res.json({ data: safe })
  } catch (err) {
    res.status(404).json({ error: 'User not found.' })
  }
})

/* PUT /users/password — change password */
router.put('/password', requireAuth, async (req, res) => {
  const { current, next } = req.body
  if (!current || !next) return res.status(400).json({ error: 'Current and new password required.' })
  if (next.length < 6)    return res.status(400).json({ error: 'Password must be at least 6 characters.' })

  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) return res.status(404).json({ error: 'User not found.' })

  const valid = await bcrypt.compare(current, user.password)
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' })

  const hash = await bcrypt.hash(next, 10)
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hash }
  })
  res.json({ data: { ok: true } })
})

/* GET /users/stats — current user's stats */
router.get('/stats', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) return res.status(404).json({ error: 'User not found.' })
  
  // stats is JSON type in Prisma
  res.json({ data: typeof user.stats === 'string' ? JSON.parse(user.stats) : user.stats || {} })
})

/* PUT /users/stats — update stats (internal use / organizer verified) */
router.put('/stats', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) return res.status(404).json({ error: 'User not found.' })
  
  let currentStats = typeof user.stats === 'string' ? JSON.parse(user.stats) : user.stats || {}
  
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      stats: { ...currentStats, ...req.body }
    }
  })
  
  res.json({ data: typeof updated.stats === 'string' ? JSON.parse(updated.stats) : updated.stats })
})

module.exports = router
