import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Countdown from '../components/Countdown'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { API } from '../api/index'

const NEXT_MATCH = new Date(Date.now() + 1 * 3600000 + 45 * 60000).toISOString()

const RECENT_MATCHES = [
  { opp:'Storm Riders',  result:'Win',  score:'2–0', map:'Haven',   kda:'18/7/5',  date:'Apr 30', cls:'accent' },
  { opp:'Lunar Force',   result:'Win',  score:'2–1', map:'Bind',    kda:'22/11/8', date:'Apr 28', cls:'accent' },
  { opp:'BlazeCore',     result:'Loss', score:'0–2', map:'Ascent',  kda:'9/14/3',  date:'Dec 12', cls:'danger' },
  { opp:'Cyber Wolves',  result:'Win',  score:'2–0', map:'Split',   kda:'15/6/10', date:'Dec 5',  cls:'accent' },
]

export default function DashboardPlayer() {
  const { user } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()

  const [confirmed,     setConfirmed]     = useState(false)
  const [confirmLoading,setConfirmLoading]= useState(false)
  const [subModal,      setSubModal]      = useState(false)
  const firstName = user?.name?.split(' ')[0] || 'Player'

  useEffect(() => {
    API.matches.get('m1').then(res => {
      const m = res.data
      if (m && (m.attendance?.team1 === true || m.attendance?.confirmed === true || m.attendanceA === true)) {
        setConfirmed(true)
      }
    }).catch(() => {})
  }, [])

  const handleConfirm = async () => {
    setConfirmLoading(true)
    await API.matches.confirmAttendance('m1', user?.id)
    setConfirmed(true)
    setConfirmLoading(false)
    toast.success('Attendance confirmed!', 'Your team manager has been notified.')
  }

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container">

          {/* Header */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:32}}>
            <div>
              <div className="label-sm" style={{color:'var(--blue)',marginBottom:6}}>PLAYER</div>
              <h1 style={{fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',fontSize:'clamp(1.5rem,4vw,2.25rem)'}}>Welcome back, {firstName}</h1>
              <p className="text-secondary" style={{marginTop:4}}>Spring University Cup 2025 · Quarterfinals</p>
            </div>
            <div className="page-header-btns" style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <Link to="/schedule"    className="btn btn--secondary btn--lg">My Schedule</Link>
              <Link to="/leaderboard" className="btn btn--ghost btn--lg">Leaderboard</Link>
            </div>
          </div>

          {/* Attendance alert */}
          {!confirmed && (
            <Alert type="warn" style={{marginBottom:24}}
              title="Action required: Confirm attendance"
              action={
                <button className="btn btn--warn btn--sm" onClick={handleConfirm} disabled={confirmLoading}>
                  {confirmLoading ? 'Confirming…' : 'Confirm Now'}
                </button>
              }
            >
              Your next match is in under 2 hours. Confirm your attendance or your manager will be notified of your absence.
            </Alert>
          )}
          {confirmed && (
            <Alert type="success" style={{marginBottom:24}} title="Attendance confirmed">
              You're all set for the Quarterfinal match. Get ready!
            </Alert>
          )}

          {/* Stats */}
          <div className="grid-4" style={{marginBottom:32}}>
            {[
              { icon:'🎮', color:'blue',   value: user?.stats?.matchesPlayed || 0, label:'Matches Played',  note:'This semester' },
              { icon:'🏆', color:'accent', value: `${user?.stats?.winRate || 0}%`, label:'Win Rate',        note:`${user?.stats?.wins || 0}W · ${user?.stats?.losses || 0}L` },
              { icon:'⚡', color:'warn',   value: user?.stats?.kd || 0,            label:'K/D Ratio',       note:'Avg per match'  },
              { icon:'🥇', color:'purple', value: `#${user?.stats?.rank || 0}`,    label:'Leaderboard Rank',note:'Top 5% overall' },
            ].map(s => (
              <div key={s.label} className="card card__body stat-card">
                <div className={`stat-card__icon stat-card__icon--${s.color}`} style={{fontSize:18}}>{s.icon}</div>
                <div className="stat-card__value">{s.value}</div>
                <div className="stat-card__label">{s.label}</div>
                <div className="stat-card__note">{s.note}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{marginBottom:32}}>
            {/* Next Match */}
            <div>
              <div className="section-header">
                <div className="section-title">⏰ Next Match</div>
                <Link to="/schedule" className="btn btn--ghost btn--sm">Full Schedule</Link>
              </div>
              <div className="card card--warn card--clickable" onClick={() => navigate('/match/m1')} role="button" tabIndex={0} onKeyDown={e => e.key==='Enter' && navigate('/match/m1')}>
                <div className="card__body">
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                    <span className="badge badge--warn">Quarterfinal</span>
                    <span className={`badge badge--${confirmed ? 'accent' : 'blue'}`}>{confirmed ? '✓ Confirmed' : 'Upcoming'}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:20}}>
                    <div style={{flex:1,textAlign:'center'}}>
                      <div style={{width:56,height:56,borderRadius:'var(--radius)',background:'var(--accent-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'1.1rem',fontWeight:700,color:'var(--accent)',margin:'0 auto 8px'}}>NE</div>
                      <div style={{fontWeight:700,fontSize:'.875rem'}}>Nova Esports</div>
                      <div style={{fontSize:'.75rem',color:'var(--accent)'}}>YOUR TEAM</div>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'1.5rem',fontWeight:700,color:'var(--text-muted)'}}>VS</div>
                    </div>
                    <div style={{flex:1,textAlign:'center'}}>
                      <div style={{width:56,height:56,borderRadius:'var(--radius)',background:'var(--blue-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'1.1rem',fontWeight:700,color:'var(--blue)',margin:'0 auto 8px'}}>PS</div>
                      <div style={{fontWeight:700,fontSize:'.875rem'}}>Phoenix Squad</div>
                      <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>Seed #8</div>
                    </div>
                  </div>
                  <div style={{textAlign:'center',marginBottom:16}}>
                    <div style={{fontSize:'.75rem',color:'var(--text-muted)',marginBottom:8}}>MATCH STARTS IN</div>
                    <Countdown target={NEXT_MATCH} />
                  </div>
                  <div style={{background:'var(--bg-3)',borderRadius:'var(--radius)',padding:'10px 14px',marginBottom:16,fontSize:'.8rem',display:'flex',gap:24,justifyContent:'center'}}>
                    <span><span style={{color:'var(--text-muted)'}}>Game: </span><strong>Valorant</strong></span>
                    <span><span style={{color:'var(--text-muted)'}}>Format: </span><strong>Bo3</strong></span>
                    <span><span style={{color:'var(--text-muted)'}}>Platform: </span><strong>PC</strong></span>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    {!confirmed
                      ? <button className="btn btn--warn btn--sm btn--full" style={{justifyContent:'center'}} onClick={e => { e.stopPropagation(); handleConfirm() }} disabled={confirmLoading}>
                          {confirmLoading ? 'Confirming…' : '✓ Confirm Attendance'}
                        </button>
                      : <Link to="/match/m1" className="btn btn--outline btn--sm btn--full" style={{justifyContent:'center'}} onClick={e => e.stopPropagation()}>
                          View Match Details
                        </Link>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Stats */}
            <div>
              <div className="section-header">
                <div className="section-title">📊 My Performance</div>
                <Link to="/profile" className="btn btn--ghost btn--sm">Full Stats</Link>
              </div>
              <div className="card card__body" style={{display:'flex',flexDirection:'column',gap:16}}>
                {/* IGN info */}
                <div style={{display:'flex',alignItems:'center',gap:14,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
                  <div style={{width:52,height:52,borderRadius:'50%',background:'var(--blue-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'1.1rem',fontWeight:700,color:'var(--blue)',flexShrink:0}}>
                    {user?.avatar || 'PL'}
                  </div>
                  <div>
                    <div style={{fontWeight:700}}>{user?.name || 'Player'}</div>
                    <div style={{fontSize:'.8rem',color:'var(--blue)'}}>IGN: {user?.ign || 'PhoenixAR#001'}</div>
                    <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{user?.game || 'Valorant'} · Duelist</div>
                  </div>
                  <span className="badge badge--accent" style={{marginLeft:'auto'}}>Online</span>
                </div>
                {/* Stat bars */}
                {[
                  { label:'Wins this season', val: user?.stats?.wins || 0, max: Math.max(22, (user?.stats?.wins || 0) + 5), pct: Math.round(((user?.stats?.wins || 0) / Math.max(1, (user?.stats?.matchesPlayed || 1))) * 100), color:'accent' },
                  { label:'Avg K/D ratio',    val: user?.stats?.kd || 0,   max: 3,  pct: Math.min(100, ((user?.stats?.kd || 0) / 3) * 100), color:'blue'   },
                  { label:'Headshot %',       val: user?.stats?.headshot || 0, max: 100,pct: user?.stats?.headshot || 0, color:'warn'   },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'.8rem',marginBottom:6}}>
                      <span style={{color:'var(--text-muted)'}}>{s.label}</span>
                      <span style={{fontWeight:700,color:`var(--${s.color})`}}>{s.val}</span>
                    </div>
                    <div style={{height:6,background:'var(--bg-4)',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${s.pct}%`,background:`var(--${s.color})`,borderRadius:3,transition:'width .4s ease'}} />
                    </div>
                  </div>
                ))}
                <div style={{marginTop:4}}>
                  <button className="btn btn--outline btn--sm btn--full" onClick={() => setSubModal(true)}>
                    Request Sub Cover
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Matches */}
          <div>
            <div className="section-header">
              <div className="section-title">Recent Matches</div>
              <Link to="/schedule" className="btn btn--ghost btn--sm">All Matches</Link>
            </div>
            <div className="card">
              <div className="table-wrap" style={{border:'none',borderRadius:0}}>
                <table>
                  <thead><tr><th>Match</th><th>Result</th><th>Score</th><th>Map</th><th>K/D/A</th><th>Date</th></tr></thead>
                  <tbody>
                    {RECENT_MATCHES.map(m => (
                      <tr key={m.opp} style={{cursor:'pointer'}} onClick={() => navigate('/schedule')}>
                        <td><strong>vs {m.opp}</strong></td>
                        <td><span className={`badge badge--${m.cls}`}>{m.result}</span></td>
                        <td style={{fontFamily:'JetBrains Mono,monospace',fontWeight:600}}>{m.score}</td>
                        <td>{m.map}</td>
                        <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:'.8rem',color:'var(--text-muted)'}}>{m.kda}</td>
                        <td style={{color:'var(--text-muted)'}}>{m.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sub cover modal */}
      <Modal
        open={subModal}
        onClose={() => setSubModal(false)}
        title="Request Substitute Cover"
        size="sm"
        footer={
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn btn--ghost btn--sm" onClick={() => setSubModal(false)}>Cancel</button>
            <button className="btn btn--warn btn--sm" onClick={() => { setSubModal(false); toast.info('Request sent','Your manager has been notified.') }}>Send Request</button>
          </div>
        }
      >
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Alert type="warn" title="Are you sure?">
            Requesting sub cover will notify your team manager. Only use this if you genuinely cannot attend.
          </Alert>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <select className="form-select">
              <option>Schedule conflict</option>
              <option>Technical issue</option>
              <option>Medical / personal emergency</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Note to manager (optional)</label>
            <textarea className="form-input" rows={3} placeholder="Add any details…" style={{resize:'vertical'}} />
          </div>
        </div>
      </Modal>

    </>
  )
}
