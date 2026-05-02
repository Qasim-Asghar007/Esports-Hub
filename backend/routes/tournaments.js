const express = require('express')
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

/* GET /tournaments */
router.get('/', requireAuth, (req, res) => {
  const { game, status } = req.query
  let list = db.findAll('tournaments')
  if (game)   list = list.filter(t => t.game.toLowerCase() === game.toLowerCase())
  if (status) list = list.filter(t => t.status === status)
  res.json({ data: list })
})

/* GET /tournaments/:id */
router.get('/:id', requireAuth, (req, res) => {
  const t = db.findById('tournaments', req.params.id)
  if (!t) return res.status(404).json({ error: 'Tournament not found.' })
  res.json({ data: t })
})

/* POST /tournaments — organizer only */
router.post('/', requireAuth, requireRole('organizer'), (req, res) => {
  const { title, game, format, maxTeams, prize, date, deadline, platform, description } = req.body
  if (!title || !game) return res.status(400).json({ error: 'Title and game are required.' })
  const t = {
    id: uuidv4(), title, game,
    status: 'registration', stage: 'Registration',
    format: format || 'Single Elimination',
    maxTeams: maxTeams || 16, registered: 0,
    prize: prize || 'TBA', date: date || 'TBD', deadline: deadline || null,
    platform: platform || 'PC', description: description || '',
    organizer: req.user.id,
    createdAt: new Date().toISOString(),
  }
  db.insert('tournaments', t)
  res.status(201).json({ data: t })
})

/* PUT /tournaments/:id — organizer only */
router.put('/:id', requireAuth, requireRole('organizer'), (req, res) => {
  const t = db.findById('tournaments', req.params.id)
  if (!t) return res.status(404).json({ error: 'Tournament not found.' })
  const updated = db.update('tournaments', req.params.id, req.body)
  res.json({ data: updated })
})

/* DELETE /tournaments/:id — organizer only */
router.delete('/:id', requireAuth, requireRole('organizer'), (req, res) => {
  const ok = db.remove('tournaments', req.params.id)
  if (!ok) return res.status(404).json({ error: 'Tournament not found.' })
  res.json({ data: { ok: true } })
})

module.exports = router
