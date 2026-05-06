import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'

export default function RegistrationSuccess() {
  const navigate = useNavigate()
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (count <= 0) { navigate('/dashboard/manager'); return }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, navigate])

  return (
    <>
      <Header />
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'70vh',padding:'0 16px'}}>
        <div style={{textAlign:'center',maxWidth:480}}>
          <div style={{fontSize:'5rem',marginBottom:24,lineHeight:1}}>🎉</div>
          <h1 style={{fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',fontSize:'clamp(1.75rem,5vw,2.5rem)',marginBottom:12}}>
            Team Registered!
          </h1>
          <p style={{color:'var(--text-secondary)',fontSize:'1rem',lineHeight:1.6,marginBottom:8}}>
            Your team registration has been submitted and is <strong style={{color:'var(--accent)'}}>pending organizer approval</strong>.
            You'll receive a notification once it's reviewed.
          </p>
          <p style={{color:'var(--text-muted)',fontSize:'.875rem',marginBottom:32}}>
            Redirecting to dashboard in{' '}
            <strong style={{color:'var(--accent)',fontSize:'1.1rem'}}>{count}</strong>
            {' '}second{count !== 1 ? 's' : ''}…
          </p>

          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <Link to="/dashboard/manager" className="btn btn--primary btn--lg">
              Go to Dashboard
            </Link>
            <Link to="/" className="btn btn--ghost btn--lg">
              Go to Home
            </Link>
          </div>

          <div style={{marginTop:40,padding:20,background:'var(--accent-bg)',border:'1px solid rgba(0,229,160,.2)',borderRadius:'var(--radius-lg)',textAlign:'left'}}>
            <div style={{fontWeight:700,color:'var(--accent)',marginBottom:8,fontSize:'.85rem',textTransform:'uppercase',letterSpacing:'.05em'}}>Next Steps</div>
            {[
              'Wait for organizer to approve your team registration',
              'Ensure all 5 players confirm their attendance',
              'Check in at least 30 minutes before your match',
              'Have your in-game names ready for lobby invites',
            ].map((tip, i) => (
              <div key={i} style={{display:'flex',gap:10,marginTop:8,fontSize:'.85rem',color:'var(--text-secondary)'}}>
                <span style={{color:'var(--accent)',fontWeight:700,flexShrink:0}}>→</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
