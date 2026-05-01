import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export default function Login() {
  const { login, demoLogin, isLoggedIn, user } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [errors,   setErrors]   = useState({})

  // redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      const dest = { player:'/dashboard/player', manager:'/dashboard/manager', organizer:'/dashboard/organizer' }
      navigate(dest[user.role] || '/', { replace: true })
    }
  }, [isLoggedIn, user, navigate])

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email.'
    if (!password) e.password = 'Password is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    const { data, error: err } = await login(email.trim(), password)
    setLoading(false)
    if (err) { setError(err); return }
    toast.success('Signed in!', `Welcome back, ${data.name}`)
    const dest = { player:'/dashboard/player', manager:'/dashboard/manager', organizer:'/dashboard/organizer' }
    navigate(dest[data.role] || '/', { replace: true })
  }

  const handleDemo = (role) => {
    const u = demoLogin(role)
    toast.success('Signed in!', `Welcome, ${u.name}`)
    const dest = { player:'/dashboard/player', manager:'/dashboard/manager', organizer:'/dashboard/organizer' }
    navigate(dest[role], { replace: true })
  }

  return (
    <div className="auth-page">
      {/* Left branding */}
      <div className="auth-page__left">
        <div style={{position:'relative',zIndex:1}}>
          <Link to="/" className="auth-form__logo" style={{marginBottom:48,display:'flex',textDecoration:'none'}}>
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" style={{flexShrink:0}}><rect width="32" height="32" rx="8" fill="rgba(0,229,160,0.15)"/><path d="M8 16l8-8 8 8-8 8-8-8z" fill="none" stroke="#00e5a0" strokeWidth="2.5"/><circle cx="16" cy="16" r="3" fill="#00e5a0"/></svg>
            Esports<span style={{color:'var(--accent)'}}>Hub</span>
          </Link>
          <h1 className="display-lg" style={{marginBottom:16}}>Your university.<br />Your tournaments.<br /><span style={{color:'var(--accent)'}}>Your trophy.</span></h1>
          <p style={{color:'var(--text-secondary)',lineHeight:1.7,maxWidth:380}}>Join hundreds of players competing across Valorant, CS2, LoL and more.</p>
          <div style={{marginTop:40,display:'flex',flexDirection:'column',gap:16}}>
            {['Register your team in under 3 minutes','Live countdown timers for your matches','PKR 50,000+ in prize pools this semester'].map(t => (
              <div key={t} style={{display:'flex',alignItems:'center',gap:12,fontSize:'.875rem',color:'var(--text-secondary)'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-page__right">
        <div className="auth-form">
          <Link to="/" className="auth-form__logo" style={{display:'flex',textDecoration:'none',marginBottom:32}}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="rgba(0,229,160,0.15)"/><path d="M8 16l8-8 8 8-8 8-8-8z" fill="none" stroke="#00e5a0" strokeWidth="2.5"/><circle cx="16" cy="16" r="3" fill="#00e5a0"/></svg>
            EsportsHub
          </Link>
          <h2 className="auth-form__title">Welcome back</h2>
          <p className="auth-form__sub">Sign in to continue</p>

          {/* Demo buttons */}
          <div style={{background:'var(--accent-bg)',border:'1px solid rgba(0,229,160,.2)',borderRadius:'var(--radius)',padding:16,marginBottom:24}}>
            <div style={{fontSize:'.78rem',fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:12}}>Quick Demo Login</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="btn btn--blue btn--sm"   onClick={() => handleDemo('player')}>Player</button>
              <button className="btn btn--warn btn--sm"   onClick={() => handleDemo('manager')}>Manager</button>
              <button className="btn btn--purple btn--sm" onClick={() => handleDemo('organizer')}>Organizer</button>
            </div>
          </div>

          <div className="auth-divider"><span>or sign in with credentials</span></div>

          <form onSubmit={handleSubmit} noValidate style={{display:'flex',flexDirection:'column',gap:16,marginTop:24}}>
            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <label className="form-label" htmlFor="email">Email address <span>*</span></label>
              <div className="input-group">
                <span className="input-group__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <input className="form-input" type="email" id="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p=>({...p,email:''})) }} placeholder="you@giki.edu.pk" autoComplete="email" />
              </div>
              {errors.email && <div className="form-error" style={{display:'block'}}>{errors.email}</div>}
            </div>

            <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
              <label className="form-label" htmlFor="password">Password <span>*</span></label>
              <div className="input-group">
                <span className="input-group__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input className="form-input" type={showPw ? 'text' : 'password'} id="password" value={password} onChange={e => { setPassword(e.target.value); setErrors(p=>({...p,password:''})) }} placeholder="••••••••" autoComplete="current-password" style={{paddingRight:44}} />
                <button type="button" className="btn btn--ghost btn--icon-sm" style={{position:'absolute',right:4}} onClick={() => setShowPw(p=>!p)} title={showPw ? 'Hide' : 'Show'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              {errors.password && <div className="form-error" style={{display:'block'}}>{errors.password}</div>}
            </div>

            {error && (
              <div className="alert alert--danger">
                <svg className="alert__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                <div className="alert__content">{error}</div>
              </div>
            )}

            <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{textAlign:'center',marginTop:24,fontSize:'.875rem',color:'var(--text-muted)'}}>
            Don't have an account? <Link to="/signup" style={{color:'var(--accent)',fontWeight:600}}>Sign up free</Link>
          </p>
          <p style={{textAlign:'center',marginTop:8,fontSize:'.8rem',color:'var(--text-faint)'}}>
            Demo password: <code style={{background:'var(--bg-4)',padding:'2px 6px',borderRadius:4,color:'var(--text-muted)'}}>demo123</code>
          </p>
        </div>
      </div>
    </div>
  )
}
