import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** Redirect to /login if not authenticated. Call at top of protected pages. */
export function useRequireAuth() {
  const { isLoggedIn } = useAuth()
  // Note: actual redirect handled by <ProtectedRoute> in App.jsx
  return isLoggedIn
}

/** Redirect to dashboard if already logged in. Call on Login/Signup pages. */
export function useRedirectIfAuthed() {
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  if (isLoggedIn && user) {
    const dest = {
      player:    '/dashboard/player',
      manager:   '/dashboard/manager',
      organizer: '/dashboard/organizer',
    }
    navigate(dest[user.role] || '/', { replace: true })
  }
}
