const express = require('express')
const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

/* GET /matches */
router.get('/', requireAuth, (req, res) => {
  const { tournament, status, team } = req.query
  let list = db.findAll('matches')
  if (tournament) list = list.filter(m => m.tournament === tournament)
  if (status)     list = list.filter(m => m.status === status)
  if (team)       list = list.filter(m => m.teamA === team || m.teamB === team)
  res.json({ data: list })
})

/* GET /matches/:id */
router.get('/:id', requireAuth, (req, res) => {
  const match = db.findById('matches', req.params.id)
  if (!match) return res.status(404).json({ error: 'Match not found.' })
  res.json({ data: match })
})

/* POST /matches — organizer creates a match */
router.post('/', requireAuth, requireRole('organizer'), (req, res) => {
  const { tournament, stage, teamA, teamB, teamAId, teamBId, scheduledAt, game, format, server } = req.body
  const match = {
    id: uuidv4(), tournament, stage,
    teamA, teamB, teamAId, teamBId,
    scheduledAt: scheduledAt || null,
    status: 'upcoming', score: null, winner: null,
    game: game || 'Valorant', format: format || 'Best of 3',
    lobbyCode: null, server: server || 'Middle East',
    attendanceA: false, attendanceB: false,
    resultSubmitted: null, resultVerified: false,
    createdAt: new Date().toISOString(),
  }
  db.insert('matches', match)
  res.status(201).json({ data: match })
})

/* POST /matches/:id/attendance — player/manager confirms attendance */
router.post('/:id/attendance', requireAuth, (req, res) => {
  const match = db.findById('matches', req.params.id)
  if (!match) return res.status(404).json({ error: 'Match not found.' })
  // Determine which side the user's team is on
  const { side } = req.body  // 'A' or 'B'
  const field = side === 'B' ? 'attendanceB' : 'attendanceA'
  const updated = db.update('matches', req.params.id, { [field]: true })
  res.json({ data: updated })
})

/* POST /matches/:id/result — team submits result */
router.post('/:id/result', requireAuth, (req, res) => {
  const match = db.findById('matches', req.params.id)
  if (!match) return res.status(404).json({ error: 'Match not found.' })
  const { winner, scoreA, scoreB, notes } = req.body
  if (!winner) return res.status(400).json({ error: 'Winner is required.' })

  const updated = db.update('matches', req.params.id, {
    status: 'pending_verification',
    score: `${scoreA}-${scoreB}`,
    winner,
    resultSubmitted: {
      by: req.user.id,
      at: new Date().toISOString(),
      winner, scoreA, scoreB, notes: notes || '',
    },
  })

  // Notify organizer
  const organizers = db.findMany('users', u => u.role === 'organizer')
  organizers.forEach(org => {
    db.insert('notifications', {
      id: uuidv4(), userId: org.id,
      message: `Result submitted for <strong>${match.teamA} vs ${match.teamB}</strong>. Please verify.`,
      time: 'just now', read: false,
      createdAt: new Date().toISOString(),
    })
  })

  res.json({ data: updated })
})

/* POST /matches/:id/verify — organizer verifies result */
router.post('/:id/verify', requireAuth, requireRole('organizer'), (req, res) => {
  const match = db.findById('matches', req.params.id)
  if (!match) return res.status(404).json({ error: 'Match not found.' })

  const updated = db.update('matches', req.params.id, {
    status: 'completed',
    resultVerified: true,
    verifiedBy: req.user.id,
    verifiedAt: new Date().toISOString(),
  })

  // Update team win/loss records
  const winnerTeamId = match.winner === match.teamA ? match.teamAId : match.teamBId
  const loserTeamId  = match.winner === match.teamA ? match.teamBId : match.teamAId

  const winnerTeam = db.findById('teams', winnerTeamId)
  const loserTeam  = db.findById('teams', loserTeamId)

  if (winnerTeam) {
    const wins   = (winnerTeam.wins || 0) + 1
    const losses = winnerTeam.losses || 0
    db.update('teams', winnerTeamId, { wins, losses, winRate: Math.round((wins/(wins+losses))*100) })
  }
  if (loserTeam) {
    const wins   = loserTeam.wins || 0
    const losses = (loserTeam.losses || 0) + 1
    db.update('teams', loserTeamId, { wins, losses, winRate: Math.round((wins/(wins+losses))*100) })
  }

  res.json({ data: updated })
})

/* POST /matches/:id/dispute */
router.post('/:id/dispute', requireAuth, (req, res) => {
  const match = db.findById('matches', req.params.id)
  if (!match) return res.status(404).json({ error: 'Match not found.' })
  const { reason, description } = req.body

  db.update('matches', req.params.id, {
    dispute: { by: req.user.id, reason, description, at: new Date().toISOString(), status: 'open' },
  })

  // Notify organizers
  const organizers = db.findMany('users', u => u.role === 'organizer')
  organizers.forEach(org => {
    db.insert('notifications', {
      id: uuidv4(), userId: org.id,
      message: `Dispute filed for <strong>${match.teamA} vs ${match.teamB}</strong>.`,
      time: 'just now', read: false,
      createdAt: new Date().toISOString(),
    })
  })

  res.json({ data: { ok: true } })
})

module.exports = router
