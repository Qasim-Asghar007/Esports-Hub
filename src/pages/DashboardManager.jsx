import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Countdown from '../components/Countdown'
import Alert from '../components/Alert'
import Skeleton from '../components/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { API } from '../api/index'

const NEXT_MATCH = new Date(Date.now() + 2 * 3600000 + 14 * 60000).toISOString()

const ROSTER = [
  { avatar:'AR', name:'Ahmed Raza',  role:'Duelist',    ign:'PhoenixAR', online:true  },
  { avatar:'SM', name:'Sara Malik',  role:'Controller', ign:'SaraM',     online:true  },
  { avatar:'HA', name:'Hamza Ali',   role:'Initiator',  ign:'HamzaGG',   online:true  },
  { avatar:'OB', name:'Omar Baig',   role:'Sentinel',   ign:'OmarB',     online:false },
  { avatar:'ZK', name:'Zain Khan',   role:'Flex',       ign:'ZainK99',   online:false },
]

export default function DashboardManager() {
  const { user } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()

  const [checklistDismissed, setChecklistDismissed] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const firstName = user?.name?.split(' ')[0] || 'Manager'

  const [myTeams, setMyTeams] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.teams.list()
        if (res.data) {
          const managed = res.data.filter(t => t.manager === user?.id)
          setMyTeams(managed)
        }
      } catch (e) {}
      setPageLoading(false)
    }
    fetchData()
  }, [user])

  if (pageLoading) return <><Header /><Skeleton.Dashboard /></>

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container">

          {/* Header */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:32}}>
            <div>
              <div className="label-sm" style={{color:'var(--warn)',marginBottom:6}}>TEAM MANAGER</div>
              <h1 style={{fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',fontSize:'clamp(1.5rem,4vw,2.25rem)'}}>Welcome back, {firstName}</h1>
              <p className="text-secondary" style={{marginTop:4}}>Spring University Cup 2025 · Registration closes May 8</p>
            </div>
            <div className="page-header-btns" style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <Link to="/register-team" className="btn btn--primary btn--lg">Register Team</Link>
              <Link to="/tournaments"   className="btn btn--secondary btn--lg">Browse Tournaments</Link>
            </div>
          </div>

          {/* Onboarding checklist */}
          {!checklistDismissed && (
            <div className="onboarding-checklist">
              <div className="onboarding-checklist__header">
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
                  <strong style={{fontSize:'.9rem'}}>Get started</strong>
                  <span className="badge badge--accent">1/3 done</span>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={() => setChecklistDismissed(true)}>Dismiss</button>
              </div>
              {[
                { label:'Create your account', done:true },
                { label:'Register your team for a tournament', done: myTeams.length > 0, href:'/register-team', btnLabel:'Register →' },
                { label:'Fill your roster (5 core + 1 sub)', done: myTeams.some(t => t.players?.length >= 5), href:'/roster', btnLabel:'Manage Roster →' },
              ].map((item, i) => (
                <div key={i} className={`onboarding-checklist__item ${item.done ? 'done' : ''}`}>
                  <div className="onboarding-checklist__check">{item.done ? '✓' : ''}</div>
                  {item.label}
                  {!item.done && <Link to={item.href} className="btn btn--outline btn--sm onboarding-checklist__link">{item.btnLabel}</Link>}
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid-4" style={{marginBottom:32}}>
            {[
              { icon:'🏆', color:'warn',   value: myTeams.length, label:'Active Teams', note: myTeams.some(t => t.status === 'pending') ? '1 pending approval' : 'All approved' },
              { icon:'👥', color:'accent', value: myTeams.reduce((acc, t) => acc + (t.players?.length || 0), 0), label:'Total Roster Players', note:'Across all teams' },
              { icon:'📅', color:'blue',   value: user?.stats?.matchesPlayed || 0, label:'Upcoming Matches', note:'Default demo' },
              { icon:'📈', color:'purple', value: `${myTeams.reduce((acc, t) => acc + (t.winRate || 0), 0) / (myTeams.length || 1)}%`, label:'Avg Team Win Rate', note:'Across all teams' },
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
                    <span className="badge badge--blue">Upcoming</span>
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
                  <Link to="/match/m1" className="btn btn--warn btn--sm btn--full" style={{justifyContent:'center'}} onClick={e => e.stopPropagation()}>
                    View Match Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Roster */}
            <div>
              <div className="section-header">
                <div className="section-title">👥 Nova Esports Roster</div>
                <Link to="/roster" className="btn btn--ghost btn--sm">Manage →</Link>
              </div>
              <div className="card">
                <div className="card__body" style={{display:'flex',flexDirection:'column',gap:12}}>
                  <Alert type="success" style={{padding:'10px 14px'}}>5/5 core players ready · 1 sub slot open</Alert>
                  {ROSTER.map(p => (
                    <div key={p.name} className={`player-card ${p.online ? 'player-card__avatar--online' : ''}`}>
                      <div className={`player-card__avatar ${p.online ? 'player-card__avatar--online' : ''}`}>{p.avatar}</div>
                      <div><div className="player-card__name">{p.name}</div><div className="player-card__role">{p.role} · {p.ign}</div></div>
                      <span className="badge badge--accent" style={{marginLeft:'auto'}}>Ready</span>
                    </div>
                  ))}
                  <div className="player-card" style={{borderStyle:'dashed',borderColor:'var(--text-faint)'}}>
                    <div className="player-card__avatar" style={{border:'2px dashed var(--text-faint)',color:'var(--text-faint)'}}>+</div>
                    <div><div className="player-card__name" style={{color:'var(--text-muted)'}}>Add Substitute</div><div className="player-card__role">Optional slot</div></div>
                    <Link to="/roster" className="btn btn--outline btn--sm" style={{marginLeft:'auto'}}>Add</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Results */}
          <div>
            <div className="section-header">
              <div className="section-title">Recent Results</div>
              <Link to="/schedule" className="btn btn--ghost btn--sm">All Matches</Link>
            </div>
            <div className="card">
              <div className="table-wrap" style={{border:'none',borderRadius:0}}>
                <table>
                  <thead><tr><th>Match</th><th>Tournament</th><th>Result</th><th>Date</th></tr></thead>
                  <tbody>
                    {[
                      { opp:'Storm Riders',  t:'Spring Cup 2025', res:'Win 2–0',  cls:'accent', date:'Apr 30' },
                      { opp:'Lunar Force',   t:'Spring Cup 2025', res:'Win 2–1',  cls:'accent', date:'Apr 28' },
                      { opp:'BlazeCore',     t:'Winter Clash 2024',res:'Loss 0–2',cls:'danger', date:'Dec 12' },
                    ].map(r => (
                      <tr key={r.opp}>
                        <td><strong>Nova Esports</strong> vs {r.opp}</td>
                        <td>{r.t}</td>
                        <td><span className={`badge badge--${r.cls}`}>{r.res}</span></td>
                        <td style={{color:'var(--text-muted)'}}>{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
