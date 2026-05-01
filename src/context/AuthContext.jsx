import { createContext, useState, useEffect, useCallback } from 'react'
import { API, setTokenGetter, MockDB } from '../api/index'

export const AuthContext = createContext(null)

const STORAGE_USER  = 'esportshub_user'
const STORAGE_TOKEN = 'esportshub_token'

const DEMO_USERS = {
  player:    { id: 'u2', username: 'AhmedRaza',  name: 'Ahmed Raza',  role: 'player',    avatar: 'AR', email: 'ahmed@giki.edu.pk', game: 'Valorant', team: 'Nova Esports', ign: 'PhoenixAR' },
  manager:   { id: 'u1', username: 'AliKhan',    name: 'Ali Khan',    role: 'manager',   avatar: 'AK', email: 'ali@giki.edu.pk',   game: 'Valorant', team: 'Nova Esports' },
  organizer: { id: 'u3', username: 'UsmanJaved', name: 'Usman Javed', role: 'organizer', avatar: 'UJ', email: 'usman@giki.edu.pk', game: null, team: null },
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_USER)) } catch { return null }
  })
  const [token, setTokenState] = useState(() => localStorage.getItem(STORAGE_TOKEN))
  const [loading, setLoading] = useState(false)

  // Keep token getter in sync so API layer can read it
  useEffect(() => {
    setTokenGetter(() => token)
  }, [token])

  const _persist = useCallback((u, t) => {
    setUserState(u)
    setTokenState(t)
    if (u) localStorage.setItem(STORAGE_USER, JSON.stringify(u))
    else   localStorage.removeItem(STORAGE_USER)
    if (t) localStorage.setItem(STORAGE_TOKEN, t)
    else   localStorage.removeItem(STORAGE_TOKEN)
  }, [])

  /* ── Login ──────────────────────────────────────────────────── */
  const login = useCallback(async (email, password) => {
    setLoading(true)
    const { data, error } = await API.auth.login(email, password)
    setLoading(false)
    if (error || !data) return { error: error || 'Login failed' }
    _persist(data.user, data.token)
    return { data: data.user }
  }, [_persist])

  /* ── Signup ─────────────────────────────────────────────────── */
  const signup = useCallback(async (payload) => {
    setLoading(true)
    const { data, error } = await API.auth.signup(payload)
    setLoading(false)
    if (error || !data) return { error: error || 'Signup failed' }
    _persist(data.user, data.token)
    return { data: data.user }
  }, [_persist])

  /* ── Demo login (no API call) ────────────────────────────────── */
  const demoLogin = useCallback((role) => {
    const u = DEMO_USERS[role]
    if (!u) return null
    _persist(u, 'demo-token-' + u.id)
    return u
  }, [_persist])

  /* ── Logout ─────────────────────────────────────────────────── */
  const logout = useCallback(async () => {
    await API.auth.logout().catch(() => {})
    _persist(null, null)
  }, [_persist])

  /* ── Update user profile locally (after PUT /users/:id) ─────── */
  const updateUser = useCallback((updates) => {
    setUserState(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem(STORAGE_USER, JSON.stringify(next))
      return next
    })
  }, [])

  /* ── Role switcher (demo utility) ───────────────────────────── */
  const switchRole = useCallback((role) => {
    return demoLogin(role)
  }, [demoLogin])

  const isLoggedIn = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, loading, isLoggedIn, login, signup, logout, demoLogin, updateUser, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}
