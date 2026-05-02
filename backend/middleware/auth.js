const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'esportshub_dev_secret_change_in_production'

/**
 * Verify JWT from Authorization: Bearer <token> header.
 * Attaches decoded payload to req.user.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — no token provided' })
  }
  const token = header.slice(7)
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized — invalid or expired token' })
  }
}

/**
 * Require a specific role.
 * Usage: requireRole('organizer')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden — requires role: ${roles.join(' or ')}` })
    }
    next()
  }
}

/**
 * Create a signed JWT for a user object.
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

module.exports = { requireAuth, requireRole, signToken }
