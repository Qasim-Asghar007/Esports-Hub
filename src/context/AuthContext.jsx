import { createContext, useState, useEffect, useCallback } from 'react'
import { API, setTokenGetter, MockDB } from '../api/index'

export const AuthContext = createContext(null)

const STORAGE_USER  = 'esportshub_user'
const STORAGE_TOKEN = 'esportshub_token'
const TUTORIAL_KEY  = 'esportshub_tutorial_done'

/* ── Demo users (pre-seeded, full stats) ─────────────────────────────── */
const DEMO_USERS = {
  player: {
    id: 'u2', username: 'AhmedRaza', name: 'Ahmed Raza', role: 'player',
    avatar: 'AR', email: 'ahmed@giki.edu.pk', game: 'Valorant',
    team: 'Nova Esports', ign: 'PhoenixAR#001',
    isDemo: true,
    stats: {
      matchesPlayed: 22, wins: 17, losses: 5, winRate: 77,
      kd: 1.8, hsPercent: 42, fbPercent: 31, points: 1150, rank: 4,
    },
  },
  manager: {
    id: 'u1', username: 'AliKhan', name: 'Ali Khan', role: 'manager',
    avatar: 'AK', email: 'ali@giki.edu.pk', game: 'Valorant',
    team: 'Nova Esports', ign: null,
    isDemo: true,
    stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, kd: 0, hsPercent: 0, fbPercent: 0, points: 0, rank: null },
  },
  organizer: {
    id: 'u3', username: 'UsmanJaved', name: 'Usman Javed', role: 'organizer',
    avatar: 'UJ', email: 'usman@giki.edu.pk', game: null, team: null, ign: null,
    isDemo: true,
    stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0, kd: 0, hsPercent: 0, fbPercent: 0, points: 0, rank: null },
  },
}

/* ── Zero stats for brand-new real users ────────────────────────────── */
const ZERO_STATS = {
  matchesPlayed: 0, wins: 0, losses: 0, winRate: 0,
  kd: 0, hsPercent: 0, fbPercent: 0, points: 0, rank: null,
}

export function AuthProvider({ children }) {
  const [user,  setUserState]  = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_USER)) } catch { return null }
  })
  const [token, setTokenState] = useState(() => localStorage.getItem(STORAGE_TOKEN))
  const [loading, setLoading]  = useState(false)
  /* showTutorial: true when a brand-new user just signed up */
  const [showTutorial, setShowTutorial] = useState(false)

  // Keep token getter in sync so API layer can attach it to requests
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

  /* ── Login ──────────────────────────────────────────────────────── */
  const login = useCallback(async (email, password) => {
    setLoading(true)
    const { data, error } = await API.auth.login(email, password)
    setLoading(false)
    if (error || !data) return { error: error || 'Login failed' }
    _persist(data.user, data.token)
    return { data: data.user }
  }, [_persist])

  /* ── Signup ─────────────────────────────────────────────────────── */
  const signup = useCallback(async (payload) => {
    setLoading(true)
    const { data, error } = await API.auth.signup(payload)
    setLoading(false)
    if (error || !data) return { error: error || 'Signup failed' }

    // New user — attach zero stats and mark tutorial as needed
    const newUser = { ...data.user, stats: ZERO_STATS, isNew: true }
    _persist(newUser, data.token)

    // Show tutorial for brand-new users (unless they've seen it before)
    if (!localStorage.getItem(TUTORIAL_KEY)) {
      setShowTutorial(true)
    }

    return { data: newUser }
  }, [_persist])

  /* ── Demo login (no API call, instant) ─────────────────────────── */
  const demoLogin = useCallback((role) => {
    const u = DEMO_USERS[role]
    if (!u) return null
    _persist(u, 'demo-token-' + u.id)
    // Demo users skip tutorial (they already have data to show)
    localStorage.setItem(TUTORIAL_KEY, 'done')
    return u
  }, [_persist])

  /* ── Logout ─────────────────────────────────────────────────────── */
  const logout = useCallback(async () => {
    await API.auth.logout().catch(() => {})
    _persist(null, null)
  }, [_persist])

  /* ── Update user profile locally (after PUT /users/:id) ─────────── */
  const updateUser = useCallback((updates) => {
    setUserState(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem(STORAGE_USER, JSON.stringify(next))
      return next
    })
  }, [])

  /* ── Update a specific stat (called when match result is recorded) ── */
  const updateStats = useCallback((statUpdates) => {
    setUserState(prev => {
      const newStats = { ...prev?.stats, ...statUpdates }
      const next = { ...prev, stats: newStats }
      localStorage.setItem(STORAGE_USER, JSON.stringify(next))
      return next
    })
  }, [])

  /* ── Role switcher (demo utility) ───────────────────────────────── */
  const switchRole = useCallback((role) => {
    return demoLogin(role)
  }, [demoLogin])

  /* ── Dismiss tutorial ───────────────────────────────────────────── */
  const dismissTutorial = useCallback(() => {
    localStorage.setItem(TUTORIAL_KEY, 'done')
    setShowTutorial(false)
  }, [])

  /* ── Re-trigger tutorial (from Help menu) ───────────────────────── */
  const triggerTutorial = useCallback(() => {
    setShowTutorial(true)
  }, [])

  const isLoggedIn = !!token && !!user

  return (
    <AuthContext.Provider value={{
      user, token, loading, isLoggedIn,
      showTutorial, dismissTutorial, triggerTutorial,
      login, signup, logout, demoLogin, updateUser, updateStats, switchRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
