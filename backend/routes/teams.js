const express = require('express')
const prisma = require('../utils/prisma')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

/* GET /teams */
router.get('/', requireAuth, async (req, res) => {
  const { tournament, manager } = req.query
  const where = {}
  if (tournament) where.tournamentId = tournament
  if (manager)    where.managerId = manager

  const list = await prisma.team.findMany({ 
    where,
    include: { players: true } 
  })
  
  // Transform format to match frontend expectation (players array with userId)
  const formatted = list.map(t => ({
    ...t,
    tournament: t.tournamentId,
    manager: t.managerId,
    players: t.players.filter(p => p.role !== 'Substitute'),
    sub: t.players.find(p => p.role === 'Substitute') || null
  }))
  
  res.json({ data: formatted })
})

/* GET /teams/:id */
router.get('/:id', requireAuth, async (req, res) => {
  const team = await prisma.team.findUnique({ 
    where: { id: req.params.id },
    include: { players: true }
  })
  if (!team) return res.status(404).json({ error: 'Team not found.' })
  
  const formatted = {
    ...team,
    tournament: team.tournamentId,
    manager: team.managerId,
    players: team.players.filter(p => p.role !== 'Substitute'),
    sub: team.players.find(p => p.role === 'Substitute') || null
  }
  
  res.json({ data: formatted })
})

/* POST /teams — manager registers a team */
router.post('/', requireAuth, requireRole('manager'), async (req, res) => {
  const { name, tag, game, tournament, players, sub, contactEmail } = req.body
  if (!name || !game || !tournament) {
    return res.status(400).json({ error: 'Name, game, and tournament are required.' })
  }
  
  // Ensure tournament exists
  const t = await prisma.tournament.findUnique({ where: { id: tournament } })
  if (!t) return res.status(404).json({ error: 'Tournament not found.' })
  if (t.registered >= t.maxTeams) return res.status(409).json({ error: 'Tournament is full.' })

  // Validate players exist
  let validPlayers = []
  if (players && Array.isArray(players)) {
    for (const p of players) {
      if (p.name || p.ign) {
        const exists = await prisma.user.findFirst({
          where: { OR: [ { ign: p.ign }, { email: p.email } ] }
        })
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
    const exists = await prisma.user.findFirst({
      where: { OR: [ { ign: sub.ign }, { email: sub.email } ] }
    })
    if (!exists) {
      return res.status(400).json({ error: `Substitute player ${sub.ign || sub.name} does not exist in the database.` })
    }
    validSub = { ...sub, userId: exists.id }
  }

  const team = await prisma.team.create({
    data: {
      name: name.trim(), 
      tag: tag?.trim() || name.slice(0,2).toUpperCase(),
      game, 
      tournamentId: tournament, 
      managerId: req.user.id, 
      status: 'pending',
      wins: 0, losses: 0, winRate: 0,
      
      players: {
        create: [
          ...validPlayers.map(p => ({
            name: p.name || p.ign,
            ign: p.ign || p.name,
            role: p.role || 'Player',
            userId: p.userId,
            confirmed: false
          })),
          ...(validSub && validSub.userId ? [{
            name: validSub.name || validSub.ign,
            ign: validSub.ign || validSub.name,
            role: 'Substitute',
            userId: validSub.userId,
            confirmed: false
          }] : [])
        ]
      }
    },
    include: { players: true }
  })

  // Increment registration count
  await prisma.tournament.update({
    where: { id: tournament },
    data: { registered: t.registered + 1 }
  })

  // Notify players to confirm registration
  const notifs = []
  validPlayers.forEach(p => {
    notifs.push({
      userId: p.userId,
      message: `You have been invited to join team <strong>${team.name}</strong>.`,
      time: 'just now', read: false,
      type: 'team_invite', teamId: team.id
    })
  })
  if (validSub && validSub.userId) {
    notifs.push({
      userId: validSub.userId,
      message: `You have been invited as a substitute for team <strong>${team.name}</strong>.`,
      time: 'just now', read: false,
      type: 'team_invite', teamId: team.id
    })
  }
  
  if (notifs.length > 0) {
    await prisma.notification.createMany({ data: notifs })
  }

  res.status(201).json({ data: team })
})

/* PUT /teams/:id — manager updates roster / team info */
router.put('/:id', requireAuth, async (req, res) => {
  const team = await prisma.team.findUnique({ where: { id: req.params.id } })
  if (!team) return res.status(404).json({ error: 'Team not found.' })
  
  if (team.managerId !== req.user.id && req.user.role !== 'organizer') {
    return res.status(403).json({ error: 'Only the team manager can edit this team.' })
  }
  
  const updated = await prisma.team.update({
    where: { id: req.params.id },
    data: req.body
  })
  res.json({ data: updated })
})

/* POST /teams/:id/approve — organizer approves team */
router.post('/:id/approve', requireAuth, requireRole('organizer'), async (req, res) => {
  const team = await prisma.team.findUnique({ where: { id: req.params.id } })
  if (!team) return res.status(404).json({ error: 'Team not found.' })
  
  const updated = await prisma.team.update({
    where: { id: req.params.id },
    data: { status: 'approved' }
  })
  
  if (team.managerId) {
    await prisma.notification.create({
      data: {
        userId: team.managerId,
        message: `Your team <strong>${team.name}</strong> has been approved!`,
        time: 'just now', read: false
      }
    })
  }
  res.json({ data: updated })
})

/* POST /teams/:id/reject — organizer rejects team */
router.post('/:id/reject', requireAuth, requireRole('organizer'), async (req, res) => {
  try {
    const updated = await prisma.team.update({
      where: { id: req.params.id },
      data: { status: 'rejected' }
    })
    res.json({ data: updated })
  } catch (err) {
    res.status(404).json({ error: 'Team not found.' })
  }
})

module.exports = router
