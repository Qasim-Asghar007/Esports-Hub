import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

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
import Toast            from './components/Toast'

/* ── Protected route wrapper ─────────────────────────────────── */
function ProtectedRoute({ children, role }) {
  const { user, isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/" replace />
  return children
}

/* ── Dashboard auto-redirect ─────────────────────────────────── */
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
        {/* Public */}
        <Route path="/"           element={<Landing />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/signup"     element={<Signup />} />
        <Route path="/tournaments"        element={<Tournaments />} />
        <Route path="/tournaments/:id"    element={<TournamentDetail />} />
        <Route path="/bracket"            element={<Bracket />} />
        <Route path="/leaderboard"        element={<Leaderboard />} />
        <Route path="/schedule"           element={<Schedule />} />

        {/* Dashboard redirect */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Protected — Player */}
        <Route path="/dashboard/player" element={
          <ProtectedRoute><DashboardPlayer /></ProtectedRoute>
        }/>

        {/* Protected — Manager */}
        <Route path="/dashboard/manager" element={
          <ProtectedRoute><DashboardManager /></ProtectedRoute>
        }/>
        <Route path="/register-team" element={
          <ProtectedRoute><RegisterTeam /></ProtectedRoute>
        }/>
        <Route path="/roster" element={
          <ProtectedRoute><Roster /></ProtectedRoute>
        }/>

        {/* Protected — Organizer */}
        <Route path="/dashboard/organizer" element={
          <ProtectedRoute><DashboardOrganizer /></ProtectedRoute>
        }/>
        <Route path="/result-entry" element={
          <ProtectedRoute><ResultEntry /></ProtectedRoute>
        }/>

        {/* Protected — Any logged-in user */}
        <Route path="/match/:id"  element={
          <ProtectedRoute><MatchDetail /></ProtectedRoute>
        }/>
        <Route path="/profile"    element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        }/>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
