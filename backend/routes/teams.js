const express = require('express')
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

/* GET /teams */
router.get('/', requireAuth, (req, res) => {
  const { tournament, manager } = req.query
  let list = db.findAll('teams')
  if (tournament) list = list.filter(t => t.tournament === tournament)
  if (manager)    list = list.filter(t => t.manager === manager)
  res.json({ data: list })
})

/* GET /teams/:id */
router.get('/:id', requireAuth, (req, res) => {
  const team = db.findById('teams', req.params.id)
  if (!team) return res.status(404).json({ error: 'Team not found.' })
  res.json({ data: team })
})

/* POST /teams — manager registers a team */
router.post('/', requireAuth, requireRole('manager'), (req, res) => {
  const { name, tag, game, tournament, players, sub, contactEmail } = req.body
  if (!name || !game || !tournament) {
    return res.status(400).json({ error: 'Name, game, and tournament are required.' })
  }
  // Ensure tournament exists
  const t = db.findById('tournaments', tournament)
  if (!t) return res.status(404).json({ error: 'Tournament not found.' })
  if (t.registered >= t.maxTeams) return res.status(409).json({ error: 'Tournament is full.' })

  // Validate players exist and link their User IDs
  const allUsers = db.findAll('users')
  let validPlayers = []
  if (players && Array.isArray(players)) {
    for (let i = 0; i < players.length; i++) {
      const p = players[i]
      if (p.name || p.ign) {
        const exists = allUsers.find(u => u.ign === p.ign || u.email === p.email)
        if (!exists) {
          return res.status(400).json({ error: `Player ${p.ign || p.name} does not exist in the database. Please verify their IGN or Email.` })
        }
        validPlayers.push({ ...p, userId: exists.id })
      }
    }
  }

  // Same for sub
  let validSub = sub
  if (sub && (sub.name || sub.ign)) {
    const exists = allUsers.find(u => u.ign === sub.ign || u.email === sub.email)
    if (!exists) {
      return res.status(400).json({ error: `Substitute player ${sub.ign || sub.name} does not exist in the database.` })
    }
    validSub = { ...sub, userId: exists.id }
  }

  const team = {
    id: uuidv4(), name: name.trim(), tag: tag?.trim() || name.slice(0,2).toUpperCase(),
    game, tournament, manager: req.user.id, status: 'pending',
    players: validPlayers, sub: validSub,
    contactEmail: contactEmail || req.user.email,
    wins: 0, losses: 0, winRate: 0, seed: null,
    createdAt: new Date().toISOString(),
  }
  db.insert('teams', team)

  // Increment registration count
  db.update('tournaments', tournament, { registered: t.registered + 1 })

  // Notify players to confirm registration
  validPlayers.forEach(p => {
    db.insert('notifications', {
      id: uuidv4(), userId: p.userId,
      message: `You have been invited to join team <strong>${team.name}</strong>.`,
      time: 'just now', read: false,
      type: 'team_invite', teamId: team.id,
      createdAt: new Date().toISOString(),
    })
  })
  if (validSub && validSub.userId) {
    db.insert('notifications', {
      id: uuidv4(), userId: validSub.userId,
      message: `You have been invited as a substitute for team <strong>${team.name}</strong>.`,
      time: 'just now', read: false,
      type: 'team_invite', teamId: team.id,
      createdAt: new Date().toISOString(),
    })
  }

  res.status(201).json({ data: team })
})

/* PUT /teams/:id — manager updates roster / team info */
router.put('/:id', requireAuth, (req, res) => {
  const team = db.findById('teams', req.params.id)
  if (!team) return res.status(404).json({ error: 'Team not found.' })
  // Only the manager or organizer can edit
  if (team.manager !== req.user.id && req.user.role !== 'organizer') {
    return res.status(403).json({ error: 'Only the team manager can edit this team.' })
  }
  const updated = db.update('teams', req.params.id, req.body)
  res.json({ data: updated })
})

/* POST /teams/:id/approve — organizer approves team */
router.post('/:id/approve', requireAuth, requireRole('organizer'), (req, res) => {
  const team = db.findById('teams', req.params.id)
  if (!team) return res.status(404).json({ error: 'Team not found.' })
  const updated = db.update('teams', req.params.id, { status: 'approved' })
  // Add notification for manager
  if (team.manager) {
    db.insert('notifications', {
      id: uuidv4(), userId: team.manager,
      message: `Your team <strong>${team.name}</strong> has been approved!`,
      time: 'just now', read: false,
      createdAt: new Date().toISOString(),
    })
  }
  res.json({ data: updated })
})

/* POST /teams/:id/reject — organizer rejects team */
router.post('/:id/reject', requireAuth, requireRole('organizer'), (req, res) => {
  const team = db.findById('teams', req.params.id)
  if (!team) return res.status(404).json({ error: 'Team not found.' })
  const updated = db.update('teams', req.params.id, { status: 'rejected' })
  res.json({ data: updated })
})

module.exports = router
