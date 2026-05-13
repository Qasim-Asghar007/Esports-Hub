const express = require('express')
const prisma = require('../utils/prisma')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

function isBeforeToday(value) {
  if (!value) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date < today
}

/* GET /tournaments */
router.get('/', requireAuth, async (req, res) => {
  const { game, status } = req.query
  const where = {}
  if (game) where.game = { equals: game, mode: 'insensitive' }
  if (status) where.status = status

  const list = await prisma.tournament.findMany({ where })
  res.json({ data: list })
})

/* GET /tournaments/:id */
router.get('/:id', requireAuth, async (req, res) => {
  const t = await prisma.tournament.findUnique({ where: { id: req.params.id } })
  if (!t) return res.status(404).json({ error: 'Tournament not found.' })
  res.json({ data: t })
})

/* POST /tournaments — organizer only */
router.post('/', requireAuth, requireRole('organizer'), async (req, res) => {
  const { title, game, format, maxTeams, prize, date, deadline, startDate, registrationDeadline, platform, description } = req.body
  if (!title || !game) return res.status(400).json({ error: 'Title and game are required.' })

  const start = startDate || date
  const regDeadline = registrationDeadline || deadline
  if (isBeforeToday(start)) {
    return res.status(400).json({ error: 'Start date must be today or later.' })
  }
  if (isBeforeToday(regDeadline)) {
    return res.status(400).json({ error: 'Registration deadline must be today or later.' })
  }
  if (start && regDeadline && new Date(regDeadline) >= new Date(start)) {
    return res.status(400).json({ error: 'Registration deadline must be before the tournament start date.' })
  }
  
  const t = await prisma.tournament.create({
    data: {
      title, game,
      status: 'registration', stage: 'Registration',
      format: format || 'Single Elimination',
      maxTeams: maxTeams || 16, registered: 0,
      prize: prize || 'TBA', date: start || null, deadline: regDeadline || null,
      platform: platform || 'PC', description: description || '',
      organizer: req.user.id
    }
  })
  
  res.status(201).json({ data: t })
})

/* PUT /tournaments/:id — organizer only */
router.put('/:id', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const updated = await prisma.tournament.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json({ data: updated })
  } catch (err) {
    res.status(404).json({ error: 'Tournament not found.' })
  }
})

/* DELETE /tournaments/:id — organizer only */
router.delete('/:id', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    await prisma.tournament.delete({ where: { id: req.params.id } })
    res.json({ data: { ok: true } })
  } catch (err) {
    res.status(404).json({ error: 'Tournament not found.' })
  }
})

module.exports = router
