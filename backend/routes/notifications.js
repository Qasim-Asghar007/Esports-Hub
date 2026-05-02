const express = require('express')
const db      = require('../utils/db')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

/* GET /notifications — current user's notifications */
router.get('/', requireAuth, (req, res) => {
  const notifs = db.findMany('notifications', n => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 50)
  res.json({ data: notifs })
})

/* POST /notifications/mark-all */
router.post('/mark-all', requireAuth, (req, res) => {
  const all = db.findAll('notifications')
  all.forEach(n => {
    if (n.userId === req.user.id && !n.read) {
      db.update('notifications', n.id, { read: true })
    }
  })
  res.json({ data: { ok: true } })
})

/* POST /notifications/:id/read */
router.post('/:id/read', requireAuth, (req, res) => {
  const n = db.findById('notifications', req.params.id)
  if (!n || n.userId !== req.user.id) return res.status(404).json({ error: 'Not found.' })
  db.update('notifications', req.params.id, { read: true })
  res.json({ data: { ok: true } })
})

module.exports = router
