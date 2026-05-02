import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { useAuth } from '../hooks/useAuth'

export default function NotFound() {
  const navigate   = useNavigate()
  const { isLoggedIn, user } = useAuth()
  const [count,    setCount] = useState(8)

  // Auto-redirect countdown
  useEffect(() => {
    if (count === 0) {
      const dest = isLoggedIn && user
        ? { player:'/dashboard/player', manager:'/dashboard/manager', organizer:'/dashboard/organizer' }[user.role] || '/'
        : '/'
      navigate(dest, { replace: true })
      return
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, navigate, isLoggedIn, user])

  const dest = isLoggedIn && user
    ? { player:'/dashboard/player', manager:'/dashboard/manager', organizer:'/dashboard/organizer' }[user.role] || '/'
    : '/'

  return (
    <>
      <Header />
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 520 }}>
          {/* 404 glitch number */}
          <div style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: 'clamp(5rem, 20vw, 9rem)',
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, var(--accent), var(--blue))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 16,
            letterSpacing: '-0.04em',
          }}>
            404
          </div>

          <h2 style={{
            fontFamily: 'Rajdhani, sans-serif',
            textTransform: 'uppercase',
            fontSize: 'clamp(1.2rem, 3vw, 1.75rem)',
            marginBottom: 12,
          }}>
            Page Not Found
          </h2>

          <p style={{
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: 32,
            maxWidth: 380,
            margin: '0 auto 32px',
          }}>
            This page doesn't exist or may have been moved.
            You'll be redirected in <strong style={{ color: 'var(--accent)' }}>{count}s</strong>.
          </p>

          {/* Progress bar */}
          <div style={{
            height: 3,
            background: 'var(--bg-3)',
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: 32,
            maxWidth: 320,
            margin: '0 auto 32px',
          }}>
            <div style={{
              height: '100%',
              background: 'var(--accent)',
              borderRadius: 2,
              width: `${(count / 8) * 100}%`,
              transition: 'width 1s linear',
            }} />
          </div>

          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to={dest} className="btn btn--primary btn--lg">
              {isLoggedIn ? 'Go to Dashboard' : 'Go Home'}
            </Link>
            <button className="btn btn--ghost btn--lg" onClick={() => navigate(-1)}>
              ← Go Back
            </button>
          </div>

          {/* Quick links */}
          <div style={{ marginTop: 40, display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap', fontSize:'.875rem' }}>
            {[
              { label:'Tournaments', to:'/tournaments' },
              { label:'Leaderboard', to:'/leaderboard' },
              { label:'Schedule',    to:'/schedule'    },
              { label:'Bracket',     to:'/bracket'     },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{ color:'var(--text-muted)', textDecoration:'none' }}
                onMouseEnter={e => e.target.style.color='var(--accent)'}
                onMouseLeave={e => e.target.style.color='var(--text-muted)'}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
