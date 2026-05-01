import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Countdown from '../components/Countdown'
import { MockDB } from '../api/index'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const FILTERS = ['All', 'upcoming', 'live', 'completed']

// Enrich matches with more data for display
const MATCHES = [
  { id:'m1', teamA:'Nova Esports',  teamB:'Phoenix Squad',  stage:'Quarterfinal', game:'Valorant', scheduledAt: new Date(Date.now() + 1.75 * 3600000).toISOString(), status:'upcoming', score:null },
  { id:'m2', teamA:'Storm Riders',  teamB:'Cyber Wolves',   stage:'Quarterfinal', game:'Valorant', scheduledAt: new Date(Date.now() + 3 * 3600000).toISOString(),    status:'upcoming', score:null },
  { id:'m3', teamA:'BlazeCore',     teamB:'Iron Wolves',    stage:'Quarterfinal', game:'Valorant', scheduledAt: new Date(Date.now() - 2 * 3600000).toISOString(),    status:'completed',score:'2–0' },
  { id:'m4', teamA:'Nexus Gaming',  teamB:'Alpha Squad',    stage:'Quarterfinal', game:'Valorant', scheduledAt: new Date(Date.now() - 5 * 3600000).toISOString(),    status:'completed',score:'1–2' },
  { id:'m5', teamA:'Nova Esports',  teamB:'Storm Riders',   stage:'Semifinal',    game:'Valorant', scheduledAt: new Date(Date.now() + 24 * 3600000).toISOString(),   status:'upcoming', score:null },
  { id:'m6', teamA:'TBD',           teamB:'TBD',            stage:'Grand Final',  game:'Valorant', scheduledAt: new Date(Date.now() + 48 * 3600000).toISOString(),   status:'pending',  score:null },
]

export default function Schedule() {
  const navigate   = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const toast      = useToast()

  const [filter,    setFilter]    = useState('All')
  const [confirmed, setConfirmed] = useState([])

  const filtered = filter === 'All' ? MATCHES : MATCHES.filter(m => m.status === filter)

  const handleConfirm = (id) => {
    if (!isLoggedIn) { navigate('/login'); return }
    setConfirmed(c => [...c, id])
    toast.success('Attendance confirmed!', 'Your team manager has been notified.')
  }

  const statusColor = { upcoming:'blue', live:'live', completed:'accent', pending:'warn' }

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container">

          <div style={{marginBottom:32}}>
            <div className="label-sm" style={{color:'var(--blue)',marginBottom:8}}>SCHEDULE</div>
            <h1 style={{fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',fontSize:'clamp(1.5rem,4vw,2.25rem)'}}>Match Schedule</h1>
            <p className="text-secondary" style={{marginTop:4}}>Spring University Cup 2025 · All matches</p>
          </div>

          {/* Filters */}
          <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn btn--sm ${filter === f ? 'btn--primary' : 'btn--ghost'}`}
              >
                {f === 'All' ? 'All Matches' : f.charAt(0).toUpperCase()+f.slice(1)}
                <span style={{marginLeft:6,opacity:.7}}>
                  {f === 'All' ? MATCHES.length : MATCHES.filter(m=>m.status===f).length}
                </span>
              </button>
            ))}
          </div>

          {/* Match list */}
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {filtered.length === 0 && (
              <div className="empty-state" style={{padding:'48px 0'}}>
                <div className="empty-state__icon">📅</div>
                <div className="empty-state__desc">No {filter.toLowerCase()} matches</div>
              </div>
            )}
            {filtered.map(match => {
              const isUpcoming  = match.status === 'upcoming'
              const isCompleted = match.status === 'completed'
              const isConfirmed = confirmed.includes(match.id)
              const matchDate   = new Date(match.scheduledAt)
              const myTeam      = user?.role === 'player' ? 'Nova Esports' : null

              return (
                <div
                  key={match.id}
                  className={`card ${isUpcoming ? 'card--clickable' : ''}`}
                  onClick={() => isUpcoming && navigate(`/match/${match.id}`)}
                  role={isUpcoming ? 'button' : undefined}
                  tabIndex={isUpcoming ? 0 : undefined}
                  onKeyDown={e => e.key === 'Enter' && isUpcoming && navigate(`/match/${match.id}`)}
                >
                  <div className="card__body">
                    <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
                      {/* Date/time */}
                      <div style={{textAlign:'center',minWidth:60,flexShrink:0}}>
                        <div style={{fontSize:'.7rem',color:'var(--text-muted)',textTransform:'uppercase',fontWeight:700}}>
                          {matchDate.toLocaleDateString('en-US',{month:'short'})}
                        </div>
                        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'1.5rem',fontWeight:700,lineHeight:1}}>
                          {matchDate.getDate()}
                        </div>
                        <div style={{fontSize:'.7rem',color:'var(--text-muted)'}}>
                          {matchDate.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{width:1,height:48,background:'var(--border)',flexShrink:0}} />

                      {/* Teams */}
                      <div style={{flex:1,minWidth:160}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                          <span style={{fontWeight:700,fontSize:'.9rem'}}>{match.teamA}</span>
                          {match.teamA === myTeam && <span className="badge badge--accent" style={{fontSize:'.65rem'}}>YOU</span>}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:4}}>
                          {isCompleted
                            ? <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:700,color:'var(--text-muted)',fontSize:'.875rem'}}>{match.score}</span>
                            : <span style={{fontSize:'.7rem',color:'var(--text-faint)'}}>vs</span>
                          }
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontWeight:700,fontSize:'.9rem'}}>{match.teamB}</span>
                          {match.teamB === myTeam && <span className="badge badge--accent" style={{fontSize:'.65rem'}}>YOU</span>}
                        </div>
                      </div>

                      {/* Stage / Game */}
                      <div style={{textAlign:'center',flexShrink:0}}>
                        <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{match.game}</div>
                        <div style={{fontSize:'.8rem',fontWeight:600,marginTop:2}}>{match.stage}</div>
                      </div>

                      {/* Status */}
                      <div style={{textAlign:'center',flexShrink:0}}>
                        <span className={`badge badge--${statusColor[match.status]||'blue'}`}>
                          {match.status === 'live' ? '● LIVE' : match.status.charAt(0).toUpperCase()+match.status.slice(1)}
                        </span>
                      </div>

                      {/* Countdown or result */}
                      {isUpcoming && (
                        <div style={{flexShrink:0}}>
                          <Countdown target={match.scheduledAt} size="sm" />
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{display:'flex',gap:8,flexShrink:0}} onClick={e => e.stopPropagation()}>
                        {isUpcoming && user?.role === 'player' && (
                          isConfirmed
                            ? <span className="badge badge--accent">✓ Confirmed</span>
                            : <button className="btn btn--warn btn--sm" onClick={() => handleConfirm(match.id)}>Confirm</button>
                        )}
                        {isCompleted && (
                          <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/match/${match.id}`)}>Details</button>
                        )}
                        {isUpcoming && (
                          <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/match/${match.id}`)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
