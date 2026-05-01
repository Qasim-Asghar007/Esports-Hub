import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const GAMES = ['Valorant','CS2','League of Legends','PUBG Mobile','Fortnite']

export default function Signup() {
  const { signup, isLoggedIn, user } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({ name:'', username:'', email:'', ign:'', game:'', password:'', confirm:'' })
  const [role,    setRole]    = useState(null)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError,setApiError]= useState('')

  useEffect(() => {
    if (isLoggedIn && user) {
      const dest = { player:'/dashboard/player', manager:'/dashboard/manager', organizer:'/dashboard/organizer' }
      navigate(dest[user.role] || '/', { replace: true })
    }
  }, [isLoggedIn, user, navigate])

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name     = 'Full name is required.'
    if (!form.username.trim()) e.username = 'Username is required.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.'
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match.'
    if (!role) e.role = 'Please select a role.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setLoading(true)
    const { data, error } = await signup({ ...form, role, avatar: form.name.slice(0,2).toUpperCase() })
    setLoading(false)
    if (error) { setApiError(error); return }
    toast.success('Account created!', `Welcome to EsportsHub, ${data.name}!`)
    const dest = { player:'/dashboard/player', manager:'/dashboard/manager', organizer:'/dashboard/organizer' }
    navigate(dest[data.role] || '/', { replace: true })
  }

  const roleColors = { player:'var(--blue)', manager:'var(--warn)', organizer:'var(--purple)' }

  return (
    <div className="auth-page">
      {/* Left */}
      <div className="auth-page__left">
        <div style={{position:'relative',zIndex:1}}>
          <Link to="/" className="auth-form__logo" style={{marginBottom:48,display:'flex',textDecoration:'none'}}>
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" style={{flexShrink:0}}><rect width="32" height="32" rx="8" fill="rgba(0,229,160,0.15)"/><path d="M8 16l8-8 8 8-8 8-8-8z" fill="none" stroke="#00e5a0" strokeWidth="2.5"/><circle cx="16" cy="16" r="3" fill="#00e5a0"/></svg>
            Esports<span style={{color:'var(--accent)'}}>Hub</span>
          </Link>
          <h1 className="display-lg" style={{marginBottom:16}}>One account.<br /><span style={{color:'var(--accent)'}}>Every tournament.</span></h1>
          <p style={{color:'var(--text-secondary)',lineHeight:1.7,maxWidth:380}}>Create your free EsportsHub account and start competing.</p>
          <div style={{marginTop:40,background:'var(--bg-3)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:20}}>
            <div style={{fontSize:'.78rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:16}}>Active Tournaments</div>
            {[{status:'live',label:'Spring University Cup 2025',game:'Valorant'},{status:'upcoming',label:'CS2 Open Championship',game:'CS2'},{status:'upcoming',label:'LoL Clash',game:'League'}].map(t => (
              <div key={t.label} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <span className={`badge badge--${t.status === 'live' ? 'live' : 'blue'}`}>{t.status === 'live' ? 'LIVE' : 'Upcoming'}</span>
                <span style={{fontSize:'.875rem',fontWeight:600}}>{t.label}</span>
                <span style={{marginLeft:'auto',fontSize:'.78rem',color:'var(--text-muted)'}}>{t.game}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="auth-page__right" style={{overflowY:'auto'}}>
        <div className="auth-form" style={{padding:'16px 0'}}>
          <Link to="/" className="auth-form__logo" style={{display:'flex',textDecoration:'none',marginBottom:24}}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="rgba(0,229,160,0.15)"/><path d="M8 16l8-8 8 8-8 8-8-8z" fill="none" stroke="#00e5a0" strokeWidth="2.5"/><circle cx="16" cy="16" r="3" fill="#00e5a0"/></svg>
            EsportsHub
          </Link>
          <h2 className="auth-form__title">Create account</h2>
          <p className="auth-form__sub">Free forever for university players</p>

          {/* Role selector */}
          <div style={{marginBottom:20}}>
            <div className="form-label" style={{marginBottom:12}}>I am a… <span style={{color:'var(--danger)'}}>*</span></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {[{r:'player',emoji:'🎮'},{r:'manager',emoji:'📋'},{r:'organizer',emoji:'🛡️'}].map(({r,emoji}) => (
                <label key={r} onClick={() => setRole(r)} style={{cursor:'pointer'}}>
                  <div style={{padding:'12px 8px',background:'var(--bg-3)',border:`2px solid ${role===r ? roleColors[r] : 'var(--border)'}`,borderRadius:'var(--radius)',textAlign:'center',transition:'all var(--t-fast)'}}>
                    <div style={{fontSize:'1.25rem',marginBottom:4}}>{emoji}</div>
                    <div style={{fontSize:'.78rem',fontWeight:700,textTransform:'capitalize'}}>{r}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && <div style={{fontSize:'.78rem',color:'var(--danger)',marginTop:6}}>{errors.role}</div>}
          </div>

          <form onSubmit={handleSubmit} noValidate style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="form-row">
              <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="name">Full name <span>*</span></label>
                <input className="form-input" id="name" type="text" value={form.name} onChange={set('name')} placeholder="Ali Khan" />
                {errors.name && <div className="form-error" style={{display:'block'}}>{errors.name}</div>}
              </div>
              <div className={`form-group ${errors.username ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="username">Username <span>*</span></label>
                <div className="input-group">
                  <span className="input-group__icon" style={{fontSize:'.85rem',fontWeight:700}}>@</span>
                  <input className="form-input" id="username" type="text" value={form.username} onChange={set('username')} placeholder="AliKhan99" />
                </div>
                {errors.username && <div className="form-error" style={{display:'block'}}>{errors.username}</div>}
              </div>
            </div>

            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <label className="form-label" htmlFor="su-email">Email <span>*</span></label>
              <div className="input-group">
                <span className="input-group__icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                <input className="form-input" id="su-email" type="email" value={form.email} onChange={set('email')} placeholder="you@giki.edu.pk" />
              </div>
              {errors.email && <div className="form-error" style={{display:'block'}}>{errors.email}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="ign">In-game name (IGN)</label>
                <input className="form-input" id="ign" type="text" value={form.ign} onChange={set('ign')} placeholder="PhoenixAR#001" />
                <div className="form-hint">Shown on match cards & leaderboard.</div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="game">Primary game</label>
                <select className="form-select" id="game" value={form.game} onChange={set('game')}>
                  <option value="">Select…</option>
                  {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="su-pw">Password <span>*</span></label>
                <input className="form-input" id="su-pw" type="password" value={form.password} onChange={set('password')} placeholder="min. 6 chars" />
                {errors.password && <div className="form-error" style={{display:'block'}}>{errors.password}</div>}
              </div>
              <div className={`form-group ${errors.confirm ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="su-confirm">Confirm <span>*</span></label>
                <input className="form-input" id="su-confirm" type="password" value={form.confirm} onChange={set('confirm')} placeholder="repeat" />
                {errors.confirm && <div className="form-error" style={{display:'block'}}>{errors.confirm}</div>}
              </div>
            </div>

            {apiError && (
              <div className="alert alert--danger">
                <div className="alert__content">{apiError}</div>
              </div>
            )}

            <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={{textAlign:'center',marginTop:20,fontSize:'.875rem',color:'var(--text-muted)'}}>
            Already have an account? <Link to="/login" style={{color:'var(--accent)',fontWeight:600}}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
