const express = require('express')
const prisma  = require('../utils/prisma')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

/* GET /notifications — current user's notifications */
router.get('/', requireAuth, async (req, res) => {
  const notifs = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
  res.json({ data: notifs })
})

/* PATCH /notifications/read-all */
router.patch('/read-all', requireAuth, async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true }
  })
  res.json({ data: { ok: true } })
})

/* PATCH /notifications/read */
router.patch('/read', requireAuth, async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
  await prisma.notification.updateMany({
    where: { userId: req.user.id, id: { in: ids } },
    data: { read: true }
  })
  res.json({ data: { ok: true } })
})

/* Backward-compatible aliases */
router.post('/mark-all', requireAuth, async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true }
  })
  res.json({ data: { ok: true } })
})

router.post('/:id/read', requireAuth, async (req, res) => {
  const n = await prisma.notification.findUnique({ where: { id: req.params.id } })
  if (!n || n.userId !== req.user.id) return res.status(404).json({ error: 'Not found.' })
  
  await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true }
  })
  res.json({ data: { ok: true } })
})

module.exports = router
