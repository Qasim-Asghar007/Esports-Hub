import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Landing() {
  const { demoLogin, isLoggedIn, user } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()

  const handleDemo = (role) => {
    const u = demoLogin(role)
    toast.success(`Welcome, ${u.name}!`, `Signed in as ${role}`)
    const dest = { player:'/dashboard/player', manager:'/dashboard/manager', organizer:'/dashboard/organizer' }
    setTimeout(() => navigate(dest[role]), 600)
  }

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="hero">
        <div className="hero__grid-bg" />
        <div className="container">
          <div className="hero__content animate-slide-up">
            <div className="hero__eyebrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
              GIKI University Esports Platform
            </div>
            <h1 className="hero__title">
              Compete.<br /><span>Organize.</span><br />Dominate.
            </h1>
            <p className="hero__sub">
              EsportsHub brings your university tournaments to one place — register teams, track brackets, confirm matches, and verify results. No more Discord spreadsheets.
            </p>
            <div className="hero__actions">
              {isLoggedIn
                ? <Link to={`/dashboard/${user.role}`} className="btn btn--primary btn--xl">Go to Dashboard</Link>
                : <Link to="/signup" className="btn btn--primary btn--xl">Get Started Free</Link>
              }
              <Link to="/tournaments" className="btn btn--outline-white btn--xl">Browse Tournaments</Link>
            </div>
            <div className="hero__stats">
              {[['16+','Active Teams'],['5','Tournaments'],['PKR 50k','Prize Pool'],['200+','Players']].map(([n,l]) => (
                <div key={l}>
                  <div className="hero__stat-num">{n}</div>
                  <div className="hero__stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="container">
          <div className="text-center">
            <div className="label-sm" style={{color:'var(--accent)',marginBottom:12}}>EVERYTHING YOU NEED</div>
            <h2>Built for competitive university gaming</h2>
            <p className="text-secondary" style={{marginTop:12,maxWidth:500,margin:'12px auto 0'}}>From team registration to bracket advancement — EsportsHub covers the full tournament lifecycle.</p>
          </div>
          <div className="features__grid" style={{marginTop:40}}>
            {[
              { icon: '👥', color: 'accent', title: 'Team Registration',   desc: '5-step guided wizard. Set your roster, accept rules, confirm team info — done in under 3 minutes.' },
              { icon: '🏆', color: 'blue',   title: 'Live Brackets',        desc: 'Real-time bracket visualization. See your path to the championship and follow every match as it happens.' },
              { icon: '📅', color: 'warn',   title: 'Match Scheduling',     desc: 'Automated scheduling with countdown timers, attendance confirmation, and lobby code distribution.' },
              { icon: '✅', color: 'purple', title: 'Result Verification',  desc: 'Organizers verify scores with screenshot evidence. 10-minute undo window prevents accidental advances.' },
              { icon: '📊', color: 'danger', title: 'Stats & Leaderboard',  desc: 'Track wins, win rate, K/D ratio and tournament placements. Rise through the university rankings.' },
              { icon: '🔔', color: 'blue',   title: 'Smart Notifications',  desc: 'Match reminders, result alerts, team approvals — all in one feed, tailored to your role.' },
            ].map(f => (
              <div className="card feature-card" key={f.title}>
                <div className={`feature-card__icon stat-card__icon--${f.color}`} style={{fontSize:24}}>{f.icon}</div>
                <div className="feature-card__title">{f.title}</div>
                <div className="feature-card__desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section style={{padding:'var(--space-16) 0',background:'var(--bg-2)',borderTop:'1px solid var(--border)'}}>
        <div className="container">
          <div className="text-center" style={{marginBottom:40}}>
            <div className="label-sm" style={{color:'var(--blue)',marginBottom:12}}>HOW IT WORKS</div>
            <h2>Three roles, one platform</h2>
          </div>
          <div className="grid-3">
            {[
              { role:'player',    color:'blue',   emoji:'🎮', label:'Player',    btnCls:'btn--blue',   tasks:['See upcoming matches with live countdowns','Confirm attendance with one tap','Track personal stats and rank'] },
              { role:'manager',   color:'warn',   emoji:'📋', label:'Manager',   btnCls:'btn--warn',   tasks:['Register your team in under 3 minutes','Manage roster, subs, and readiness','Track your team\'s tournament progress'] },
              { role:'organizer', color:'purple', emoji:'🛡️', label:'Organizer', btnCls:'btn--purple', tasks:['Manage tournament settings and teams','Verify results and advance brackets','Resolve disputes with full evidence review'] },
            ].map(({ role, color, emoji, label, btnCls, tasks }) => (
              <div key={role} className="card" style={{borderColor:`var(--${color})`,overflow:'visible'}}>
                <div style={{height:6,background:`var(--${color})`}} />
                <div className="card__body">
                  <div style={{width:52,height:52,borderRadius:'var(--radius-lg)',background:`var(--${color}-bg)`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,fontSize:24}}>{emoji}</div>
                  <div style={{color:`var(--${color})`,fontSize:'.75rem',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>{label}</div>
                  <h3 style={{marginBottom:12}}>{label === 'Player' ? 'Compete & Track' : label === 'Manager' ? 'Build & Register' : 'Run & Verify'}</h3>
                  <ul style={{display:'flex',flexDirection:'column',gap:10,listStyle:'none'}}>
                    {tasks.map(t => (
                      <li key={t} style={{display:'flex',gap:10,fontSize:'.875rem',color:'var(--text-secondary)'}}>
                        <span style={{color:`var(--${color})`,flexShrink:0,fontWeight:700}}>✓</span>{t}
                      </li>
                    ))}
                  </ul>
                  <div style={{marginTop:20}}>
                    <button className={`btn ${btnCls} btn--sm btn--full`} onClick={() => handleDemo(role)}>
                      Try as {label}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'var(--space-16) 0',background:'var(--bg-1)',borderTop:'1px solid var(--border)'}}>
        <div className="container text-center">
          <div className="label-sm" style={{color:'var(--accent)',marginBottom:12}}>READY TO PLAY?</div>
          <h2 style={{marginBottom:16}}>Join the Spring University Cup 2025</h2>
          <p className="text-secondary" style={{marginBottom:32,maxWidth:440,margin:'0 auto 32px'}}>16 slots · Valorant · PKR 15,000 prize pool · Registration closes May 8</p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <Link to="/signup" className="btn btn--primary btn--lg">Create Account</Link>
            <Link to="/login"  className="btn btn--outline-white btn--lg">Sign In</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
