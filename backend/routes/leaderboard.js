const express = require('express')
const db      = require('../utils/db')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

/* GET /leaderboard */
router.get('/', requireAuth, (req, res) => {
  const { game } = req.query
  let list = db.findAll('leaderboard')
  if (game && game !== 'All Games') {
    list = list.filter(e => e.game === game)
  }
  // Re-rank after filter
  list = list.map((e, i) => ({ ...e, rank: i + 1 }))
  res.json({ data: list })
})

/* GET /leaderboard/me — current user's rank */
router.get('/me', requireAuth, (req, res) => {
  const entry = db.findOne('leaderboard', e => e.userId === req.user.id)
  res.json({ data: entry || null })
})

module.exports = router
