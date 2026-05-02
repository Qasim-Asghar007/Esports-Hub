const express = require('express')
const prisma  = require('../utils/prisma')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

/* GET /leaderboard */
router.get('/', requireAuth, async (req, res) => {
  const { game } = req.query
  
  // Fetch all players to sort them by stats
  let users = await prisma.user.findMany({
    where: { role: 'player' }
  })
  
  if (game && game !== 'All Games') {
    users = users.filter(u => u.game === game)
  }
  
  // Map and parse stats
  let list = users.map(u => {
    const stats = typeof u.stats === 'string' ? JSON.parse(u.stats) : u.stats || {}
    return {
      id: u.id,
      userId: u.id,
      name: u.name,
      ign: u.ign,
      game: u.game,
      avatar: u.avatar,
      wins: stats.wins || 0,
      losses: stats.losses || 0,
      winRate: stats.winRate || 0,
      kd: stats.kd || 0,
      points: stats.points || 0
    }
  })
  
  // Sort by points descending
  list.sort((a, b) => b.points - a.points)
  
  // Assign rank
  list = list.map((e, i) => ({ ...e, rank: i + 1 }))
  
  res.json({ data: list })
})

/* GET /leaderboard/me — current user's rank */
router.get('/me', requireAuth, async (req, res) => {
  // To get the rank, we just do the same sorting
  const users = await prisma.user.findMany({ where: { role: 'player' } })
  
  let list = users.map(u => {
    const stats = typeof u.stats === 'string' ? JSON.parse(u.stats) : u.stats || {}
    return {
      userId: u.id,
      points: stats.points || 0
    }
  })
  
  list.sort((a, b) => b.points - a.points)
  
  const myIndex = list.findIndex(e => e.userId === req.user.id)
  
  if (myIndex === -1) {
    return res.json({ data: null })
  }
  
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  const stats = typeof user.stats === 'string' ? JSON.parse(user.stats) : user.stats || {}
  
  const entry = {
    id: user.id,
    userId: user.id,
    name: user.name,
    ign: user.ign,
    game: user.game,
    avatar: user.avatar,
    wins: stats.wins || 0,
    losses: stats.losses || 0,
    winRate: stats.winRate || 0,
    kd: stats.kd || 0,
    points: stats.points || 0,
    rank: myIndex + 1
  }
  
  res.json({ data: entry })
})

module.exports = router
