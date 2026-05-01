import { useNavigate } from 'react-router-dom'

const gameColors = {
  'Valorant':          { bg: 'linear-gradient(135deg,#0a1f18,#1a3d2e)', text: '#00e5a0', abbr: 'VALO' },
  'CS2':               { bg: 'linear-gradient(135deg,#0a1525,#1a2f4e)', text: '#4fa8ff', abbr: 'CS2'  },
  'League of Legends': { bg: 'linear-gradient(135deg,#1a0a2e,#2e1a4e)', text: '#b476ff', abbr: 'LOL'  },
  'PUBG Mobile':       { bg: 'linear-gradient(135deg,#1f0a0a,#3d1a1a)', text: '#ff5c6c', abbr: 'PUBG' },
  'Fortnite':          { bg: 'linear-gradient(135deg,#0a1a2e,#1a3058)', text: '#ffb547', abbr: 'FN'   },
}

const statusBadge = (status) => {
  if (status === 'active')    return <span className="badge badge--live">LIVE</span>
  if (status === 'upcoming')  return <span className="badge badge--blue">Upcoming</span>
  if (status === 'completed') return <span className="badge badge--muted">Completed</span>
  return null
}

export default function TournamentCard({ tournament, actionLabel, onAction }) {
  const navigate = useNavigate()
  const t = tournament
  const style = gameColors[t.game] || { bg: 'var(--bg-4)', text: 'var(--accent)', abbr: t.game?.slice(0,4).toUpperCase() }
  const pct = Math.round(((t.registeredTeams || 0) / t.maxTeams) * 100)

  return (
    <div
      className="card tournament-card card--clickable"
      onClick={() => navigate(`/tournaments/${t.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/tournaments/${t.id}`)}
    >
      <div className="tournament-card__banner" style={{ background: style.bg }}>
        <div className="tournament-card__banner-game" style={{ color: style.text }}>{style.abbr}</div>
        <div className="tournament-card__banner-badge">{statusBadge(t.status)}</div>
      </div>
      <div className="tournament-card__body">
        <div className="tournament-card__title">{t.title}</div>
        <div className="tournament-card__meta">
          <span className="tournament-card__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
            {t.startDate}
          </span>
          <span className="tournament-card__meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            {t.registeredTeams}/{t.maxTeams} teams
          </span>
          {t.prizePool && (
            <span className="tournament-card__meta-item" style={{ color: 'var(--warn)' }}>{t.prizePool}</span>
          )}
          {t.format && <span className="tournament-card__meta-item">{t.format}</span>}
        </div>
        {t.status !== 'completed' && (
          <div className="tournament-card__progress">
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.75rem', color:'var(--text-muted)' }}>
              <span>Registration</span><span>{t.registeredTeams}/{t.maxTeams}</span>
            </div>
            <div className="tournament-card__progress-bar">
              <div className="tournament-card__progress-fill" style={{ width: pct + '%' }} />
            </div>
          </div>
        )}
        {t.status === 'completed' && t.winner && (
          <div style={{ marginTop:'12px', padding:'10px 12px', background:'var(--warn-bg)', borderRadius:'var(--radius)', fontSize:'.8rem', color:'var(--warn)' }}>
            🏆 Champion: <strong>{t.winner}</strong>
          </div>
        )}
      </div>
      <div className="tournament-card__footer">
        <span style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{t.organizer}</span>
        <button
          className="btn btn--primary btn--sm"
          onClick={(e) => { e.stopPropagation(); onAction ? onAction(t) : navigate(`/tournaments/${t.id}`) }}
        >
          {actionLabel || 'View →'}
        </button>
      </div>
    </div>
  )
}
