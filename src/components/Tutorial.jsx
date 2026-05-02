import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/* ── Step definitions per role ──────────────────────────────────────── */
const STEPS = {
  player: [
    {
      icon: '👋',
      title: 'Welcome to EsportsHub!',
      body: "You're registered as a Player. You can compete in tournaments, track your stats, confirm match attendance, and climb the leaderboard. Let's take a quick tour.",
      cta: null,
    },
    {
      icon: '📅',
      title: 'Your Dashboard',
      body: 'Your dashboard shows upcoming matches with live countdowns, your personal stats (wins, K/D, win rate), and recent match history. Check it every day before a match.',
      cta: null,
    },
    {
      icon: '✅',
      title: 'Confirm Attendance',
      body: "Before every match, you must confirm your attendance at least 30 minutes before start time. You'll see a yellow alert on your dashboard and match page. One click — don't miss it!",
      cta: null,
    },
    {
      icon: '🏆',
      title: 'Tournaments & Bracket',
      body: `Browse all active tournaments under "Tournaments". Use the Bracket page to see your team's path to the championship. Results update live as matches complete.`,
      cta: { label: 'Browse Tournaments', path: '/tournaments' },
    },
    {
      icon: '📊',
      title: 'Stats & Leaderboard',
      body: 'Every win, K/D, and tournament placement is tracked on the Leaderboard. Your stats start at 0 and grow with every match. Compete to reach #1!',
      cta: { label: 'View Leaderboard', path: '/leaderboard' },
    },
    {
      icon: '🎮',
      title: "You're ready to compete!",
      body: 'Head to your dashboard to see your first match, or browse tournaments to find events to join. Good luck, and may your aim be true!',
      cta: { label: 'Go to Dashboard', path: '/dashboard/player' },
    },
  ],
  manager: [
    {
      icon: '👋',
      title: 'Welcome, Team Manager!',
      body: "You're the backbone of your team. As a manager, you register teams, manage rosters, and track your team's progress through tournaments. Let's get you set up.",
      cta: null,
    },
    {
      icon: '📋',
      title: 'Register Your Team',
      body: 'Start by registering your team for a tournament. Click "Register Team" and follow the 5-step wizard: choose a tournament, name your team, add 5 players, accept the rules, and confirm.',
      cta: { label: 'Register a Team', path: '/register-team' },
    },
    {
      icon: '👥',
      title: 'Manage Your Roster',
      body: 'Go to the Roster page to add, edit, or remove players. You need 5 core players before your team can compete. You can also add 1 optional substitute.',
      cta: { label: 'Manage Roster', path: '/roster' },
    },
    {
      icon: '⏰',
      title: 'Match Day',
      body: "On match day, make sure all 5 players have confirmed their attendance. Your dashboard shows each player's readiness status. Missing check-ins = forfeit.",
      cta: null,
    },
    {
      icon: '📈',
      title: 'Track Your Team',
      body: 'Your dashboard shows win rate, upcoming matches with countdowns, and recent results. Use the Bracket page to see how far your team can go.',
      cta: null,
    },
    {
      icon: '🏆',
      title: "Let's win some tournaments!",
      body: 'Register your team now and start competing. Your stats begin at 0 — every match is a chance to build your legacy.',
      cta: { label: 'Register Team Now', path: '/register-team' },
    },
  ],
  organizer: [
    {
      icon: '👋',
      title: 'Welcome, Tournament Organizer!',
      body: "You run the show. As an organizer, you manage tournaments, approve teams, verify match results, and advance brackets. Let's walk through your tools.",
      cta: null,
    },
    {
      icon: '🏆',
      title: 'Manage Tournaments',
      body: 'Go to the Tournaments page to view all active events. You can see registration progress, manage team approvals, and control tournament settings.',
      cta: { label: 'View Tournaments', path: '/tournaments' },
    },
    {
      icon: '👥',
      title: 'Approve Teams',
      body: 'When teams register, they appear in your Pending Approvals queue on the dashboard. Review their rosters and approve or reject with a single click.',
      cta: null,
    },
    {
      icon: '✅',
      title: 'Verify Results',
      body: "After each match, the winning team submits a result with screenshot evidence. You verify it from your dashboard. There's a 10-minute undo window in case of mistakes.",
      cta: null,
    },
    {
      icon: '🔗',
      title: 'Bracket Management',
      body: 'The bracket advances automatically once results are verified. Use the Bracket page to monitor the tournament structure and identify any pending matches.',
      cta: { label: 'View Bracket', path: '/bracket' },
    },
    {
      icon: '🛡️',
      title: "Ready to run the event!",
      body: 'Your organizer dashboard is the control center. Check pending actions daily — teams are counting on you to keep the tournament running smoothly.',
      cta: { label: 'Go to Dashboard', path: '/dashboard/organizer' },
    },
  ],
}

export default function Tutorial() {
  const { user, showTutorial, dismissTutorial } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]   = useState(0)
  const [exiting, setExiting] = useState(false)
  const overlayRef = useRef(null)

  const role   = user?.role || 'player'
  const steps  = STEPS[role] || STEPS.player
  const current = steps[step]
  const isLast  = step === steps.length - 1

  // Reset step when tutorial opens
  useEffect(() => { if (showTutorial) setStep(0) }, [showTutorial])

  // Keyboard nav
  useEffect(() => {
    if (!showTutorial) return
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext()
      if (e.key === 'ArrowLeft')  handlePrev()
      if (e.key === 'Escape')     handleSkip()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutorial, step])

  if (!showTutorial) return null

  const handleNext = () => {
    if (isLast) { handleSkip(); return }
    setStep(s => s + 1)
  }
  const handlePrev = () => setStep(s => Math.max(0, s - 1))

  const handleSkip = () => {
    setExiting(true)
    setTimeout(() => { setExiting(false); dismissTutorial() }, 300)
  }

  const handleCta = (path) => {
    dismissTutorial()
    navigate(path)
  }

  const roleColor = { player:'var(--blue)', manager:'var(--warn)', organizer:'var(--purple)' }[role]

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        opacity: exiting ? 0 : 1,
        transition: 'opacity .3s ease',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding tutorial"
    >
      <div style={{
        width: '100%',
        maxWidth: 520,
        background: 'var(--bg-2)',
        border: `1px solid ${roleColor}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: `0 0 60px ${roleColor}33`,
      }}>
        {/* Accent top bar */}
        <div style={{ height: 4, background: roleColor }} />

        {/* Progress dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'20px 24px 0' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: i === step ? 24 : 8, height: 8,
                borderRadius: 4,
                background: i <= step ? roleColor : 'var(--bg-4)',
                cursor: 'pointer',
                transition: 'all .25s ease',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '24px 32px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16, lineHeight: 1 }}>
            {current.icon}
          </div>
          <div style={{
            fontSize: '.75rem', fontWeight: 700, letterSpacing: '.1em',
            textTransform: 'uppercase', color: roleColor, marginBottom: 10,
          }}>
            Step {step + 1} of {steps.length}
          </div>
          <h2 style={{
            fontFamily: 'Rajdhani, sans-serif',
            textTransform: 'uppercase',
            fontSize: 'clamp(1.2rem,3vw,1.6rem)',
            marginBottom: 12,
          }}>
            {current.title}
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            fontSize: '.9rem',
            marginBottom: current.cta ? 24 : 0,
          }}>
            {current.body}
          </p>
          {current.cta && (
            <button
              className="btn btn--sm"
              style={{ background: roleColor, color: '#000', border: 'none', marginBottom: 0 }}
              onClick={() => handleCta(current.cta.path)}
            >
              {current.cta.label} →
            </button>
          )}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-3)',
          gap: 12,
        }}>
          <button
            className="btn btn--ghost btn--sm"
            onClick={handleSkip}
            style={{ color: 'var(--text-faint)' }}
          >
            {isLast ? '✕ Close' : 'Skip tour'}
          </button>

          <div style={{ display:'flex', gap:8 }}>
            {step > 0 && (
              <button className="btn btn--ghost btn--sm" onClick={handlePrev}>← Back</button>
            )}
            <button
              className="btn btn--sm"
              style={{ background: roleColor, color: '#000', border: 'none' }}
              onClick={handleNext}
            >
              {isLast ? '🎉 Let\'s go!' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}