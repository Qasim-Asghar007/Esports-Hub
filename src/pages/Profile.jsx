import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Alert from '../components/Alert'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const GAMES = ['Valorant','CS2','League of Legends','PUBG Mobile','Fortnite']

const MATCH_HISTORY = [
  { opp:'Storm Riders',  result:'Win',  score:'2–0', date:'Apr 30', kda:'18/7/5'  },
  { opp:'Lunar Force',   result:'Win',  score:'2–1', date:'Apr 28', kda:'22/11/8' },
  { opp:'BlazeCore',     result:'Loss', score:'0–2', date:'Dec 12', kda:'9/14/3'  },
  { opp:'Cyber Wolves',  result:'Win',  score:'2–0', date:'Dec 5',  kda:'15/6/10' },
  { opp:'Iron Wolves',   result:'Win',  score:'2–1', date:'Nov 20', kda:'20/9/6'  },
]

const ACHIEVEMENTS = [
  { icon:'🏆', label:'Spring Cup 2024 — 2nd Place',     date:'Dec 2024' },
  { icon:'⚡', label:'Top Fragger — Winter Clash 2024', date:'Dec 2024' },
  { icon:'🎯', label:'20+ Match Wins',                  date:'All time' },
  { icon:'🔥', label:'5-game Win Streak',               date:'Apr 2025' },
]

export default function Profile() {
  const { user, updateUser } = useAuth()
  const toast = useToast()

  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState({
    name:     user?.name     || '',
    username: user?.username || '',
    email:    user?.email    || '',
    ign:      user?.ign      || '',
    game:     user?.game     || '',
    bio:      user?.bio      || '',
  })
  const [pwForm,    setPwForm]    = useState({ current:'', next:'', confirm:'' })
  const [pwErrors,  setPwErrors]  = useState({})
  const [activeTab, setActiveTab] = useState('stats')

  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}))

  const saveProfile = () => {
    if (!form.name.trim()) { toast.error('Error','Name is required.'); return }
    updateUser(form)
    setEditing(false)
    toast.success('Profile updated!', 'Your changes have been saved.')
  }

  const changePassword = () => {
    const e = {}
    if (!pwForm.current)             e.current = 'Enter current password.'
    if (pwForm.next.length < 6)      e.next    = 'Min 6 characters.'
    if (pwForm.next !== pwForm.confirm) e.confirm = 'Passwords do not match.'
    setPwErrors(e)
    if (Object.keys(e).length > 0) return
    setPwForm({ current:'', next:'', confirm:'' })
    toast.success('Password changed!', 'Your new password is active.')
  }

  const wins   = 17
  const losses = 5
  const total  = wins + losses
  const winRate = Math.round((wins / total) * 100)

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container" style={{maxWidth:900}}>

          {/* Profile header */}
          <div className="card card__body" style={{marginBottom:24}}>
            <div style={{display:'flex',alignItems:'center',gap:24,flexWrap:'wrap'}}>
              {/* Avatar */}
              <div style={{
                width:88,height:88,borderRadius:'50%',
                background:'var(--accent-bg)',border:'3px solid var(--accent)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontFamily:'Rajdhani,sans-serif',fontSize:'1.8rem',fontWeight:700,color:'var(--accent)',
                flexShrink:0,
              }}>
                {user?.avatar || user?.name?.slice(0,2).toUpperCase() || 'PL'}
              </div>
              {/* Info */}
              <div style={{flex:1,minWidth:180}}>
                <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:4}}>
                  <h2 style={{margin:0}}>{user?.name || 'Player'}</h2>
                  <span className={`badge badge--${user?.role === 'player' ? 'blue' : user?.role === 'manager' ? 'warn' : 'purple'}`} style={{textTransform:'capitalize'}}>
                    {user?.role || 'player'}
                  </span>
                </div>
                <div style={{fontSize:'.875rem',color:'var(--text-muted)',marginBottom:4}}>@{user?.username || 'username'} · {user?.email}</div>
                {user?.ign && <div style={{fontSize:'.8rem',color:'var(--blue)'}}>IGN: {user.ign} {user?.game && `· ${user.game}`}</div>}
                {form.bio && <div style={{fontSize:'.8rem',color:'var(--text-secondary)',marginTop:6}}>{form.bio}</div>}
              </div>
              {/* Stats quick */}
              <div style={{display:'flex',gap:24,textAlign:'center',flexWrap:'wrap'}}>
                {[{v:total,l:'Matches'},{v:`${winRate}%`,l:'Win Rate'},{v:wins,l:'Wins'},{v:'#4',l:'Rank'}].map(s=>(
                  <div key={s.l}>
                    <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'1.4rem',fontWeight:700,color:'var(--accent)'}}>{s.v}</div>
                    <div style={{fontSize:'.7rem',color:'var(--text-muted)',textTransform:'uppercase'}}>{s.l}</div>
                  </div>
                ))}
              </div>
              {/* Edit button */}
              <button className={`btn btn--sm ${editing ? 'btn--ghost' : 'btn--outline'}`} onClick={() => { setEditing(e=>!e); if(editing) setForm({name:user?.name||'',username:user?.username||'',email:user?.email||'',ign:user?.ign||'',game:user?.game||'',bio:user?.bio||''}) }}>
                {editing ? 'Cancel' : '✏️ Edit Profile'}
              </button>
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="card card__body" style={{marginBottom:24}}>
              <h3 style={{marginBottom:16}}>Edit Profile</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={set('name')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <div className="input-group">
                    <span className="input-group__icon" style={{fontSize:'.85rem',fontWeight:700}}>@</span>
                    <input className="form-input" value={form.username} onChange={set('username')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={set('email')} />
                </div>
                <div className="form-group">
                  <label className="form-label">In-Game Name</label>
                  <input className="form-input" value={form.ign} onChange={set('ign')} placeholder="YourName#001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Game</label>
                  <select className="form-select" value={form.game} onChange={set('game')}>
                    <option value="">Select…</option>
                    {GAMES.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                  <label className="form-label">Bio</label>
                  <textarea className="form-input" rows={2} value={form.bio} onChange={set('bio')} placeholder="Tell others about yourself…" style={{resize:'vertical'}} />
                </div>
              </div>
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <button className="btn btn--primary btn--sm" onClick={saveProfile}>Save Changes</button>
                <button className="btn btn--ghost btn--sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{display:'flex',gap:4,borderBottom:'1px solid var(--border)',marginBottom:24}}>
            {['stats','history','achievements','security'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{padding:'10px 20px',background:'none',border:'none',cursor:'pointer',color:activeTab===t?'var(--accent)':'var(--text-muted)',borderBottom:`2px solid ${activeTab===t?'var(--accent)':'transparent'}`,fontWeight:activeTab===t?700:400,textTransform:'capitalize',transition:'all var(--t-fast)',fontSize:'.875rem'}}>
                {t}
              </button>
            ))}
          </div>

          {/* Stats tab */}
          {activeTab === 'stats' && (
            <div>
              <div className="grid-4" style={{marginBottom:24}}>
                {[
                  {v:total,   l:'Total Matches', color:'blue'   },
                  {v:wins,    l:'Wins',           color:'accent' },
                  {v:losses,  l:'Losses',         color:'danger' },
                  {v:'1.8',   l:'Avg K/D',        color:'warn'   },
                ].map(s => (
                  <div key={s.l} className="card card__body stat-card">
                    <div className="stat-card__value" style={{color:`var(--${s.color})`}}>{s.v}</div>
                    <div className="stat-card__label">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="card card__body" style={{maxWidth:480}}>
                <div style={{fontWeight:700,marginBottom:16,fontSize:'.9rem',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-muted)'}}>Performance</div>
                {[
                  {label:'Win Rate',      val:`${winRate}%`, pct:winRate, color:'accent' },
                  {label:'Headshot %',    val:'42%',          pct:42,      color:'warn'   },
                  {label:'First Blood %', val:'31%',          pct:31,      color:'blue'   },
                ].map(s => (
                  <div key={s.label} style={{marginBottom:16}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'.875rem',marginBottom:6}}>
                      <span style={{color:'var(--text-muted)'}}>{s.label}</span>
                      <span style={{fontWeight:700,color:`var(--${s.color})`}}>{s.val}</span>
                    </div>
                    <div style={{height:6,background:'var(--bg-4)',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${s.pct}%`,background:`var(--${s.color})`,borderRadius:3}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History tab */}
          {activeTab === 'history' && (
            <div className="card">
              <div className="table-wrap" style={{border:'none',borderRadius:0}}>
                <table>
                  <thead><tr><th>Match</th><th>Result</th><th>Score</th><th>K/D/A</th><th>Date</th></tr></thead>
                  <tbody>
                    {MATCH_HISTORY.map(m => (
                      <tr key={m.opp}>
                        <td><strong>vs {m.opp}</strong></td>
                        <td><span className={`badge badge--${m.result==='Win'?'accent':'danger'}`}>{m.result}</span></td>
                        <td style={{fontFamily:'JetBrains Mono,monospace',fontWeight:600}}>{m.score}</td>
                        <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:'.8rem',color:'var(--text-muted)'}}>{m.kda}</td>
                        <td style={{color:'var(--text-muted)'}}>{m.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Achievements tab */}
          {activeTab === 'achievements' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
              {ACHIEVEMENTS.map(a => (
                <div key={a.label} className="card card__body" style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{fontSize:'2rem',flexShrink:0}}>{a.icon}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:'.875rem'}}>{a.label}</div>
                    <div style={{fontSize:'.75rem',color:'var(--text-muted)',marginTop:2}}>{a.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <div className="card card__body" style={{maxWidth:480}}>
              <h3 style={{marginBottom:16}}>Change Password</h3>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div className={`form-group ${pwErrors.current ? 'has-error' : ''}`}>
                  <label className="form-label">Current Password</label>
                  <input className="form-input" type="password" value={pwForm.current} onChange={e => setPwForm(f=>({...f,current:e.target.value}))} />
                  {pwErrors.current && <div className="form-error" style={{display:'block'}}>{pwErrors.current}</div>}
                </div>
                <div className={`form-group ${pwErrors.next ? 'has-error' : ''}`}>
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" value={pwForm.next} onChange={e => setPwForm(f=>({...f,next:e.target.value}))} placeholder="min. 6 characters" />
                  {pwErrors.next && <div className="form-error" style={{display:'block'}}>{pwErrors.next}</div>}
                </div>
                <div className={`form-group ${pwErrors.confirm ? 'has-error' : ''}`}>
                  <label className="form-label">Confirm New Password</label>
                  <input className="form-input" type="password" value={pwForm.confirm} onChange={e => setPwForm(f=>({...f,confirm:e.target.value}))} />
                  {pwErrors.confirm && <div className="form-error" style={{display:'block'}}>{pwErrors.confirm}</div>}
                </div>
                <button className="btn btn--primary btn--sm" onClick={changePassword}>Update Password</button>
              </div>
              <div style={{marginTop:24,paddingTop:24,borderTop:'1px solid var(--border)'}}>
                <div style={{fontWeight:700,marginBottom:12,color:'var(--danger)'}}>Danger Zone</div>
                <Alert type="danger" title="Delete Account">
                  This action is permanent and cannot be undone. All your data will be lost.
                </Alert>
                <button className="btn btn--ghost btn--sm" style={{color:'var(--danger)',marginTop:12}} onClick={() => toast.error('Not available','Account deletion requires admin confirmation.')}>
                  Delete My Account
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}
