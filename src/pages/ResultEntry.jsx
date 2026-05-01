import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { MockDB } from '../api/index'

export default function ResultEntry() {
  const navigate      = useNavigate()
  const [searchParams]= useSearchParams()
  const toast         = useToast()
  const { user }      = useAuth()

  const matchId = searchParams.get('match') || 'm1'
  const match   = MockDB._matches?.find(m => m.id === matchId) || {
    id: 'm1',
    teamA: 'Nova Esports',
    teamB: 'Phoenix Squad',
    stage: 'Quarterfinal',
    game: 'Valorant',
    format: 'Best of 3',
  }

  const [form, setForm] = useState({
    winner:     match.teamA,
    scoreA:     '',
    scoreB:     '',
    map1:       '',
    map2:       '',
    map3:       '',
    notes:      '',
    screenshot: null,
  })
  const [errors,      setErrors]     = useState({})
  const [loading,     setLoading]    = useState(false)
  const [submitModal, setSubmitModal]= useState(false)
  const [submitted,   setSubmitted]  = useState(false)

  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}))

  const validate = () => {
    const e = {}
    if (!form.winner)          e.winner = 'Select the winning team.'
    if (!form.scoreA || isNaN(form.scoreA)) e.scoreA = 'Enter score.'
    if (!form.scoreB || isNaN(form.scoreB)) e.scoreB = 'Enter score.'
    const a = parseInt(form.scoreA), b = parseInt(form.scoreB)
    if (!isNaN(a) && !isNaN(b)) {
      if (a < 0 || b < 0)     e.scoreA = 'Scores must be 0 or above.'
      if (a === b)             e.scoreB = 'Scores cannot be equal — there must be a winner.'
      if (form.winner === match.teamA && a < b) e.winner = 'Winner must have higher score.'
      if (form.winner === match.teamB && b < a) e.winner = 'Winner must have higher score.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitModal(false)
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setSubmitted(true)
    toast.success('Result submitted!', 'An organizer will verify the result shortly.')
  }

  if (submitted) {
    return (
      <>
        <Header />
        <div className="page-wrapper">
          <div className="container" style={{maxWidth:560}}>
            <div className="card card__body" style={{textAlign:'center',padding:'48px 32px'}}>
              <div style={{fontSize:'3rem',marginBottom:16}}>✅</div>
              <h2 style={{marginBottom:8}}>Result Submitted!</h2>
              <p className="text-secondary" style={{marginBottom:24}}>
                Your result has been submitted. An organizer will verify it within 30 minutes.
              </p>
              <div style={{padding:16,background:'var(--bg-3)',borderRadius:'var(--radius)',marginBottom:24,fontSize:'.875rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{color:'var(--text-muted)'}}>Winner</span>
                  <strong style={{color:'var(--accent)'}}>{form.winner}</strong>
                </div>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{color:'var(--text-muted)'}}>Score</span>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:700}}>{match.teamA} {form.scoreA}–{form.scoreB} {match.teamB}</span>
                </div>
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
                <Link to="/schedule"         className="btn btn--primary btn--sm">Go to Schedule</Link>
                <Link to="/dashboard/player" className="btn btn--ghost btn--sm">Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container" style={{maxWidth:640}}>

          {/* Breadcrumb */}
          <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:24,fontSize:'.875rem',color:'var(--text-muted)'}}>
            <Link to="/schedule" style={{color:'var(--text-muted)',textDecoration:'none'}}>Schedule</Link>
            <span>/</span>
            <Link to={`/match/${matchId}`} style={{color:'var(--text-muted)',textDecoration:'none'}}>{match.teamA} vs {match.teamB}</Link>
            <span>/</span>
            <span style={{color:'var(--text-primary)'}}>Submit Result</span>
          </div>

          <div style={{marginBottom:24}}>
            <div className="label-sm" style={{color:'var(--accent)',marginBottom:6}}>RESULT ENTRY</div>
            <h1 style={{fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',fontSize:'clamp(1.4rem,3vw,2rem)'}}>Submit Match Result</h1>
          </div>

          {/* Match context */}
          <div style={{padding:16,background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',marginBottom:24,fontSize:'.875rem'}}>
            <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
              <span><span style={{color:'var(--text-muted)'}}>Match: </span><strong>{match.teamA} vs {match.teamB}</strong></span>
              <span><span style={{color:'var(--text-muted)'}}>Stage: </span>{match.stage}</span>
              <span><span style={{color:'var(--text-muted)'}}>Format: </span>{match.format}</span>
              <span><span style={{color:'var(--text-muted)'}}>Game: </span>{match.game}</span>
            </div>
          </div>

          <Alert type="warn" title="Submit accurate results only" style={{marginBottom:24}}>
            False result submissions are a violation of the tournament rules and may result in disqualification.
            Attach screenshot evidence for faster verification.
          </Alert>

          <div className="card card__body" style={{display:'flex',flexDirection:'column',gap:20}}>

            {/* Winner selection */}
            <div className={`form-group ${errors.winner ? 'has-error' : ''}`} style={{margin:0}}>
              <label className="form-label">Winning Team <span style={{color:'var(--danger)'}}>*</span></label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[match.teamA, match.teamB].map(team => (
                  <label key={team} onClick={() => setForm(f=>({...f,winner:team}))} style={{cursor:'pointer'}}>
                    <div style={{
                      padding:'14px 16px',
                      background:'var(--bg-3)',
                      border:`2px solid ${form.winner === team ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius:'var(--radius)',
                      textAlign:'center',
                      transition:'all var(--t-fast)',
                    }}>
                      <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'1.1rem',fontWeight:700,marginBottom:4,color:form.winner===team?'var(--accent)':'var(--text-primary)'}}>
                        {team.slice(0,2).toUpperCase()}
                      </div>
                      <div style={{fontWeight:600,fontSize:'.875rem'}}>{team}</div>
                      {form.winner === team && <div style={{fontSize:'.7rem',color:'var(--accent)',marginTop:4}}>🏆 WINNER</div>}
                    </div>
                  </label>
                ))}
              </div>
              {errors.winner && <div className="form-error" style={{display:'block',marginTop:8}}>{errors.winner}</div>}
            </div>

            {/* Scores */}
            <div>
              <label className="form-label" style={{marginBottom:12}}>Match Score <span style={{color:'var(--danger)'}}>*</span></label>
              <div style={{display:'flex',alignItems:'center',gap:16}}>
                <div style={{flex:1}}>
                  <div style={{textAlign:'center',fontSize:'.75rem',color:'var(--text-muted)',marginBottom:6,textTransform:'uppercase'}}>{match.teamA}</div>
                  <input
                    className={`form-input ${errors.scoreA ? 'has-error' : ''}`}
                    type="number" min="0" max="3"
                    value={form.scoreA}
                    onChange={set('scoreA')}
                    placeholder="0"
                    style={{textAlign:'center',fontFamily:'JetBrains Mono,monospace',fontSize:'1.5rem',fontWeight:700,padding:'12px'}}
                  />
                </div>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'1.5rem',fontWeight:700,color:'var(--text-muted)',flexShrink:0,marginTop:20}}>–</div>
                <div style={{flex:1}}>
                  <div style={{textAlign:'center',fontSize:'.75rem',color:'var(--text-muted)',marginBottom:6,textTransform:'uppercase'}}>{match.teamB}</div>
                  <input
                    className={`form-input ${errors.scoreB ? 'has-error' : ''}`}
                    type="number" min="0" max="3"
                    value={form.scoreB}
                    onChange={set('scoreB')}
                    placeholder="0"
                    style={{textAlign:'center',fontFamily:'JetBrains Mono,monospace',fontSize:'1.5rem',fontWeight:700,padding:'12px'}}
                  />
                </div>
              </div>
              {(errors.scoreA || errors.scoreB) && (
                <div className="form-error" style={{display:'block',marginTop:8}}>{errors.scoreA || errors.scoreB}</div>
              )}
            </div>

            {/* Map results */}
            <div>
              <label className="form-label" style={{marginBottom:12}}>Map Results (optional)</label>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {['Map 1','Map 2','Map 3 (if played)'].map((label, i) => (
                  <div key={label} style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{minWidth:80,fontSize:'.8rem',color:'var(--text-muted)'}}>{label}</span>
                    <input
                      className="form-input"
                      placeholder="e.g. Haven 13–7"
                      value={form[`map${i+1}`]}
                      onChange={set(`map${i+1}`)}
                      style={{flex:1}}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence */}
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Screenshot Evidence</label>
              <div
                style={{border:'2px dashed var(--border)',borderRadius:'var(--radius)',padding:'28px',textAlign:'center',cursor:'pointer',color:'var(--text-muted)',transition:'border-color var(--t-fast)'}}
                onClick={() => toast.info('File upload','Will be available once backend is connected. For the demo, submission works without files.')}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{fontSize:'1.5rem',marginBottom:8}}>📎</div>
                <div style={{fontWeight:600,marginBottom:4}}>Click to upload screenshot</div>
                <div style={{fontSize:'.75rem'}}>PNG, JPG up to 10MB · Strongly recommended</div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-input"
                rows={3}
                value={form.notes}
                onChange={set('notes')}
                placeholder="Any technical issues, disconnects, or important details…"
                style={{resize:'vertical'}}
              />
            </div>

          </div>

          {/* Buttons */}
          <div style={{display:'flex',gap:12,marginTop:24,flexWrap:'wrap'}}>
            <button
              className="btn btn--primary btn--lg"
              onClick={() => { if(validate()) setSubmitModal(true) }}
              disabled={loading}
            >
              {loading ? 'Submitting…' : '📤 Submit Result'}
            </button>
            <Link to={`/match/${matchId}`} className="btn btn--ghost btn--lg">Cancel</Link>
          </div>

        </div>
      </div>

      {/* Confirm Submit Modal */}
      <Modal
        open={submitModal}
        onClose={() => setSubmitModal(false)}
        title="Confirm Result Submission"
        size="sm"
        footer={
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn btn--ghost btn--sm" onClick={() => setSubmitModal(false)}>Go Back</button>
            <button className="btn btn--primary btn--sm" onClick={handleSubmit}>Submit</button>
          </div>
        }
      >
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <p style={{color:'var(--text-secondary)',fontSize:'.875rem'}}>
            You are about to submit the following result. Please confirm the details are correct — submitting false results is a rule violation.
          </p>
          <div style={{padding:16,background:'var(--bg-3)',borderRadius:'var(--radius)',fontSize:'.875rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{color:'var(--text-muted)'}}>Match</span>
              <span>{match.teamA} vs {match.teamB}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{color:'var(--text-muted)'}}>Winner</span>
              <strong style={{color:'var(--accent)'}}>{form.winner} 🏆</strong>
            </div>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{color:'var(--text-muted)'}}>Score</span>
              <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:700}}>{form.scoreA} – {form.scoreB}</span>
            </div>
          </div>
          {!form.screenshot && (
            <Alert type="warn" title="No screenshot attached">
              Results without evidence take longer to verify. Consider attaching one if available.
            </Alert>
          )}
        </div>
      </Modal>
    </>
  )
}
