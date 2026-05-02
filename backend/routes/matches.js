const express = require('express')
const prisma = require('../utils/prisma')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

/* GET /matches */
router.get('/', requireAuth, async (req, res) => {
  const { tournament, status, team } = req.query
  const where = {}
  if (tournament) where.tournamentId = tournament
  if (status)     where.status = status
  if (team) {
    // If the client passed a team name, we might need to find its ID first, 
    // or if it's an ID, just use it.
    // Assuming 'team' might be a name or ID based on legacy behaviour,
    // let's do a loose OR check.
    where.OR = [
      { teamAId: team },
      { teamBId: team },
      { teamA: { name: team } },
      { teamB: { name: team } }
    ]
  }

  const list = await prisma.match.findMany({ 
    where,
    include: { teamARel: true, teamBRel: true }
  })
  
  // Format for frontend
  const formatted = list.map(m => ({
    ...m,
    tournament: m.tournamentId,
    teamA: m.teamARel?.name || null,
    teamB: m.teamBRel?.name || null,
    resultSubmitted: typeof m.resultSubmitted === 'string' ? JSON.parse(m.resultSubmitted) : m.resultSubmitted,
    dispute: typeof m.dispute === 'string' ? JSON.parse(m.dispute) : m.dispute
  }))
  
  res.json({ data: formatted })
})

/* GET /matches/:id */
router.get('/:id', requireAuth, async (req, res) => {
  const m = await prisma.match.findUnique({ 
    where: { id: req.params.id },
    include: { teamARel: true, teamBRel: true }
  })
  if (!m) return res.status(404).json({ error: 'Match not found.' })
  
  const formatted = {
    ...m,
    tournament: m.tournamentId,
    teamA: m.teamARel?.name || null,
    teamB: m.teamBRel?.name || null,
    resultSubmitted: typeof m.resultSubmitted === 'string' ? JSON.parse(m.resultSubmitted) : m.resultSubmitted,
    dispute: typeof m.dispute === 'string' ? JSON.parse(m.dispute) : m.dispute
  }
  
  res.json({ data: formatted })
})

/* POST /matches — organizer creates a match */
router.post('/', requireAuth, requireRole('organizer'), async (req, res) => {
  const { tournament, stage, teamAId, teamBId, scheduledAt, game, format, server } = req.body
  
  const match = await prisma.match.create({
    data: {
      tournamentId: tournament, 
      stage: stage || 'Group Stage',
      teamAId: teamAId || null, 
      teamBId: teamBId || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: 'upcoming', 
      score: null, 
      winner: null,
      game: game || 'Valorant', 
      format: format || 'Best of 3',
      lobbyCode: null, 
      server: server || 'Middle East',
      attendanceA: false, 
      attendanceB: false,
      resultVerified: false
    },
    include: { teamARel: true, teamBRel: true }
  })
  
  const formatted = {
    ...match,
    tournament: match.tournamentId,
    teamA: match.teamARel?.name || null,
    teamB: match.teamBRel?.name || null,
  }
  
  res.status(201).json({ data: formatted })
})

/* POST /matches/:id/attendance — player/manager confirms attendance */
router.post('/:id/attendance', requireAuth, async (req, res) => {
  const match = await prisma.match.findUnique({ where: { id: req.params.id } })
  if (!match) return res.status(404).json({ error: 'Match not found.' })
  
  const { side } = req.body  // 'A' or 'B'
  const data = side === 'B' ? { attendanceB: true } : { attendanceA: true }
  
  const updated = await prisma.match.update({
    where: { id: req.params.id },
    data
  })
  res.json({ data: updated })
})

/* POST /matches/:id/result — team submits result */
router.post('/:id/result', requireAuth, async (req, res) => {
  const match = await prisma.match.findUnique({ 
    where: { id: req.params.id },
    include: { teamARel: true, teamBRel: true }
  })
  if (!match) return res.status(404).json({ error: 'Match not found.' })
  
  const { winner, scoreA, scoreB, notes } = req.body
  if (!winner) return res.status(400).json({ error: 'Winner is required.' })

  // winner usually comes as teamName. Let's find out which ID it is.
  let winnerId = null
  if (winner === match.teamARel?.name) winnerId = match.teamAId
  else if (winner === match.teamBRel?.name) winnerId = match.teamBId

  const resultData = {
    by: req.user.id,
    at: new Date().toISOString(),
    winner, scoreA, scoreB, notes: notes || ''
  }

  const updated = await prisma.match.update({
    where: { id: req.params.id },
    data: {
      status: 'pending_verification',
      score: `${scoreA}-${scoreB}`,
      winner: winnerId,
      resultSubmitted: resultData // Will be stored as JSON
    }
  })

  // Notify organizer
  const organizers = await prisma.user.findMany({ where: { role: 'organizer' } })
  if (organizers.length > 0) {
    const notifs = organizers.map(org => ({
      userId: org.id,
      message: `Result submitted for <strong>${match.teamARel?.name || 'TBD'} vs ${match.teamBRel?.name || 'TBD'}</strong>. Please verify.`,
      time: 'just now', read: false
    }))
    await prisma.notification.createMany({ data: notifs })
  }

  res.json({ data: updated })
})

/* POST /matches/:id/verify — organizer verifies result */
router.post('/:id/verify', requireAuth, requireRole('organizer'), async (req, res) => {
  const match = await prisma.match.findUnique({ where: { id: req.params.id } })
  if (!match) return res.status(404).json({ error: 'Match not found.' })

  const updated = await prisma.match.update({
    where: { id: req.params.id },
    data: {
      status: 'completed',
      resultVerified: true,
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    }
  })

  // Update team win/loss records
  const winnerTeamId = match.winner
  const loserTeamId  = winnerTeamId === match.teamAId ? match.teamBId : match.teamAId

  if (winnerTeamId) {
    const winnerTeam = await prisma.team.findUnique({ where: { id: winnerTeamId } })
    if (winnerTeam) {
      const wins = winnerTeam.wins + 1
      const losses = winnerTeam.losses
      await prisma.team.update({
        where: { id: winnerTeamId },
        data: { wins, winRate: Math.round((wins/(wins+losses))*100) }
      })
    }
  }
  
  if (loserTeamId) {
    const loserTeam = await prisma.team.findUnique({ where: { id: loserTeamId } })
    if (loserTeam) {
      const wins = loserTeam.wins
      const losses = loserTeam.losses + 1
      await prisma.team.update({
        where: { id: loserTeamId },
        data: { losses, winRate: Math.round((wins/(wins+losses))*100) }
      })
    }
  }

  res.json({ data: updated })
})

/* POST /matches/:id/dispute */
router.post('/:id/dispute', requireAuth, async (req, res) => {
  const match = await prisma.match.findUnique({ 
    where: { id: req.params.id },
    include: { teamARel: true, teamBRel: true }
  })
  if (!match) return res.status(404).json({ error: 'Match not found.' })
  const { reason, description } = req.body

  await prisma.match.update({
    where: { id: req.params.id },
    data: {
      dispute: { by: req.user.id, reason, description, at: new Date().toISOString(), status: 'open' }
    }
  })

  // Notify organizers
  const organizers = await prisma.user.findMany({ where: { role: 'organizer' } })
  if (organizers.length > 0) {
    const notifs = organizers.map(org => ({
      userId: org.id,
      message: `Dispute filed for <strong>${match.teamARel?.name || 'TBD'} vs ${match.teamBRel?.name || 'TBD'}</strong>.`,
      time: 'just now', read: false
    }))
    await prisma.notification.createMany({ data: notifs })
  }

  res.json({ data: { ok: true } })
})

module.exports = router
