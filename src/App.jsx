import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ErrorBoundary from './components/ErrorBoundary'

import Landing          from './pages/Landing'
import Login            from './pages/Login'
import Signup           from './pages/Signup'
import DashboardManager   from './pages/DashboardManager'
import DashboardPlayer    from './pages/DashboardPlayer'
import DashboardOrganizer from './pages/DashboardOrganizer'
import Tournaments      from './pages/Tournaments'
import TournamentDetail from './pages/TournamentDetail'
import RegisterTeam     from './pages/RegisterTeam'
import Bracket          from './pages/Bracket'
import MatchDetail      from './pages/MatchDetail'
import ResultEntry      from './pages/ResultEntry'
import Roster           from './pages/Roster'
import Profile          from './pages/Profile'
import Leaderboard      from './pages/Leaderboard'
import Schedule         from './pages/Schedule'
import NotFound         from './pages/NotFound'
import Toast            from './components/Toast'

/* ── Protected route wrapper ─────────────────────────────────────────── */
function ProtectedRoute({ children, role }) {
  const { user, isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (role && user?.role !== role) {
    // redirect to their own dashboard instead of '/'
    const dest = { player:'/dashboard/player', manager:'/dashboard/manager', organizer:'/dashboard/organizer' }
    return <Navigate to={dest[user.role] || '/'} replace />
  }
  return <ErrorBoundary>{children}</ErrorBoundary>
}

/* ── Guest-only route (redirect logged-in users away) ────────────────── */
function GuestRoute({ children }) {
  const { isLoggedIn, user } = useAuth()
  if (isLoggedIn && user) {
    const dest = { player:'/dashboard/player', manager:'/dashboard/manager', organizer:'/dashboard/organizer' }
    return <Navigate to={dest[user.role] || '/'} replace />
  }
  return children
}

/* ── Dashboard auto-redirect ─────────────────────────────────────────── */
function DashboardRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const dest = {
    player:    '/dashboard/player',
    manager:   '/dashboard/manager',
    organizer: '/dashboard/organizer',
  }
  return <Navigate to={dest[user.role] || '/'} replace />
}

export default function App() {
  return (
    <>
      <Toast />
      <Routes>
        {/* ── Fully public (no auth needed) ── */}
        <Route path="/" element={<ErrorBoundary><Landing /></ErrorBoundary>} />

        {/* ── Guest-only (redirect if already logged in) ── */}
        <Route path="/login"  element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

        {/* ── Dashboard redirect ── */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

        {/* ── Protected — Player ── */}
        <Route path="/dashboard/player" element={
          <ProtectedRoute><DashboardPlayer /></ProtectedRoute>
        }/>

        {/* ── Protected — Manager ── */}
        <Route path="/dashboard/manager" element={
          <ProtectedRoute><DashboardManager /></ProtectedRoute>
        }/>
        <Route path="/register-team" element={
          <ProtectedRoute><RegisterTeam /></ProtectedRoute>
        }/>
        <Route path="/roster" element={
          <ProtectedRoute><Roster /></ProtectedRoute>
        }/>

        {/* ── Protected — Organizer ── */}
        <Route path="/dashboard/organizer" element={
          <ProtectedRoute><DashboardOrganizer /></ProtectedRoute>
        }/>
        <Route path="/result-entry" element={
          <ProtectedRoute><ResultEntry /></ProtectedRoute>
        }/>

        {/* ── Protected — Any logged-in user ── */}
        <Route path="/tournaments"     element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
        <Route path="/tournaments/:id" element={<ProtectedRoute><TournamentDetail /></ProtectedRoute>} />
        <Route path="/bracket"         element={<ProtectedRoute><Bracket /></ProtectedRoute>} />
        <Route path="/leaderboard"     element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/schedule"        element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/match/:id"       element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
        <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
