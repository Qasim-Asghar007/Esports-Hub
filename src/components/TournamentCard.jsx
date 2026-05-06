import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const GAME_META = {
  'Valorant': {
    img: 'https://media.rawg.io/media/games/3ea/3ea3c9bbd940b6cb7f2139e42d3d443f.jpg',
    fallbackImg: 'https://upload.wikimedia.org/wikipedia/en/5/54/Valorant_first_promotional_image.jpg',
    bg: 'linear-gradient(135deg,#1a0005,#3d0011)',
    text: '#FF4655',
    abbr: 'VALO',
  },
  'CS2': {
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
    bg: 'linear-gradient(135deg,#0a100f,#112a1a)',
    text: '#F0A020',
    abbr: 'CS2',
  },
  'League of Legends': {
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/2703540/header.jpg',
    fallbackImg: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg',
    bg: 'linear-gradient(135deg,#0d0a00,#1c1400)',
    text: '#C89B3C',
    abbr: 'LOL',
  },
  'PUBG Mobile': {
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/578080/header.jpg',
    bg: 'linear-gradient(135deg,#0d0a05,#1a1508)',
    text: '#F5A623',
    abbr: 'PUBG',
  },
  'Fortnite': {
    img: 'https://cdn.akamai.steamstatic.com/steam/apps/1677740/header.jpg',
    bg: 'linear-gradient(135deg,#0a1020,#1a2845)',
    text: '#60A0FF',
    abbr: 'FN',
  },
}

const gameColors = Object.fromEntries(
  Object.entries(GAME_META).map(([k, v]) => [k, { bg: v.bg, text: v.text, abbr: v.abbr }])
)

const statusBadge = (status) => {
  if (status === 'active')    return <span className="badge badge--live">LIVE</span>
  if (status === 'upcoming')  return <span className="badge badge--blue">Upcoming</span>
  if (status === 'completed') return <span className="badge badge--muted">Completed</span>
  return null
}

export default function TournamentCard({ tournament, actionLabel, onAction }) {
  const navigate = useNavigate()
  const [imgFailed, setImgFailed] = useState(false)
  const [fallbackFailed, setFallbackFailed] = useState(false)
  const t = tournament
  const meta = GAME_META[t.game]
  const style = gameColors[t.game] || { bg: 'var(--bg-4)', text: 'var(--accent)', abbr: t.game?.slice(0,4).toUpperCase() }
  const pct = Math.round(((t.registeredTeams || 0) / t.maxTeams) * 100)

  const imgSrc = !imgFailed ? meta?.img : (!fallbackFailed ? meta?.fallbackImg : null)

  return (
    <div
      className="card tournament-card card--clickable"
      onClick={() => navigate(`/tournaments/${t.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/tournaments/${t.id}`)}
    >
      <div className="tournament-card__banner" style={{ background: style.bg, position: 'relative', overflow: 'hidden' }}>
        {imgSrc && (
          <img
            src={imgSrc}
            alt={t.game}
            onError={() => { if (!imgFailed) setImgFailed(true); else setFallbackFailed(true) }}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: 0.35,
              filter: 'saturate(1.2)',
            }}
          />
        )}
        <div className="tournament-card__banner-game" style={{ color: style.text }}>{t.game}</div>
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
