import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Alert from '../components/Alert'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { API, MockDB } from '../api/index'

const STEPS = [
  { id:1, label:'Tournament',     icon:'🏆' },
  { id:2, label:'Team Info',      icon:'📋' },
  { id:3, label:'Roster',        icon:'👥' },
  { id:4, label:'Rules',         icon:'📜' },
  { id:5, label:'Confirm',       icon:'✅' },
]

const ROLES = ['Duelist','Controller','Initiator','Sentinel','Flex','Substitute']

const emptyPlayer = { name:'', ign:'', role:'', email:'' }

export default function RegisterTeam() {
  const { user } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()

  const [step,     setStep]    = useState(1)
  const [loading,  setLoading] = useState(false)
  const [errors,   setErrors]  = useState({})
  const [rulesRead, setRulesRead] = useState(false)
  const rulesRef = useRef(null)

  const [form, setForm] = useState({
    tournament: '',
    teamName:   '',
    tag:        '',
    game:       '',
    players:    [
      { ...emptyPlayer },
      { ...emptyPlayer },
      { ...emptyPlayer },
      { ...emptyPlayer },
      { ...emptyPlayer },
    ],
    sub:        { ...emptyPlayer },
    rulesAccepted: false,
    contactEmail:  user?.email || '',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const setPlayer = (i, key, val) => {
    const players = [...form.players]
    players[i] = { ...players[i], [key]: val }
    setForm(f => ({ ...f, players }))
  }

  const validate = () => {
    const e = {}
    if (step === 1 && !form.tournament) e.tournament = 'Please select a tournament.'
    if (step === 2) {
      if (!form.teamName.trim()) e.teamName = 'Team name is required.'
      if (!form.game)            e.game     = 'Select a game.'
    }
    if (step === 3) {
      form.players.forEach((p, i) => {
        if (!p.name.trim()) e[`p${i}name`] = 'Name required'
        if (!p.ign.trim())  e[`p${i}ign`]  = 'IGN required'
        if (!p.role)        e[`p${i}role`] = 'Role required'
        if (!p.email.trim())                          e[`p${i}email`] = 'Email required'
        else if (!p.email.endsWith('@giki.edu.pk'))   e[`p${i}email`] = 'Must use a @giki.edu.pk address'
      })
    }
    if (step === 4 && !form.rulesAccepted) e.rules = 'You must accept the rules.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => {
    if (!validate()) return
    setErrors({})
    setStep(s => Math.min(s+1, STEPS.length))
  }
  const prevStep = () => { setErrors({}); setStep(s => Math.max(s-1, 1)) }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    const res = await API.teams.register(form.tournament, form)
    setLoading(false)
    if (res.error) {
      toast.error('Registration failed', res.error)
      return
    }
    navigate('/register-success')
  }

  const selectedTournament = MockDB._tournaments.find(t => t.id === form.tournament)

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container" style={{maxWidth:760}}>

          <div style={{marginBottom:32}}>
            <div className="label-sm" style={{color:'var(--accent)',marginBottom:8}}>TEAM REGISTRATION</div>
            <h1 style={{fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',fontSize:'clamp(1.5rem,4vw,2rem)'}}>Register Your Team</h1>
          </div>

          {/* Stepper */}
          <div style={{display:'flex',alignItems:'center',marginBottom:40,overflowX:'auto',paddingBottom:4}}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{display:'flex',alignItems:'center',flex: i < STEPS.length-1 ? 1 : 'none'}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,flexShrink:0}}>
                  <div style={{
                    width:40,height:40,borderRadius:'50%',
                    background: step > s.id ? 'var(--accent)' : step === s.id ? 'var(--accent-bg)' : 'var(--bg-3)',
                    border:`2px solid ${step >= s.id ? 'var(--accent)' : 'var(--border)'}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize: step > s.id ? '1rem' : '.9rem',
                    color: step >= s.id ? (step > s.id ? '#000' : 'var(--accent)') : 'var(--text-faint)',
                    fontWeight:700,
                    transition:'all .2s',
                  }}>
                    {step > s.id ? '✓' : s.icon}
                  </div>
                  <div style={{fontSize:'.7rem',fontWeight: step===s.id?700:400,color:step>=s.id?'var(--text-primary)':'var(--text-faint)',whiteSpace:'nowrap'}}>
                    {s.label}
                  </div>
                </div>
                {i < STEPS.length-1 && (
                  <div style={{flex:1,height:2,background:step > s.id ? 'var(--accent)' : 'var(--border)',margin:'0 8px',marginBottom:24,transition:'background .2s'}} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="card card__body" style={{marginBottom:24}}>

            {/* Step 1: Tournament */}
            {step === 1 && (
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                <div>
                  <h2 style={{marginBottom:4}}>Select Tournament</h2>
                  <p className="text-secondary">Choose the tournament you want to register for.</p>
                </div>
                {errors.tournament && <Alert type="danger">{errors.tournament}</Alert>}
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {MockDB._tournaments.filter(t => t.status === 'registration' || t.status === 'upcoming').map(t => {
                    const pct = Math.round((t.registered / t.maxTeams) * 100)
                    const full = t.registered >= t.maxTeams
                    return (
                      <label key={t.id} style={{cursor: full ? 'not-allowed' : 'pointer', opacity: full ? .5 : 1}}>
                        <div
                          onClick={() => !full && set('tournament', t.id)}
                          style={{
                            padding:16,
                            background:'var(--bg-3)',
                            border:`2px solid ${form.tournament===t.id ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius:'var(--radius)',
                            transition:'all var(--t-fast)',
                          }}
                        >
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                            <div>
                              <div style={{fontWeight:700}}>{t.title}</div>
                              <div style={{fontSize:'.8rem',color:'var(--text-muted)',marginTop:2}}>{t.game} · {t.format || 'Single Elimination'}</div>
                            </div>
                            <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}>
                              <span className="badge badge--warn">{t.prize}</span>
                              {full && <span className="badge badge--danger">FULL</span>}
                            </div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:10,fontSize:'.8rem'}}>
                            <div style={{height:4,flex:1,background:'var(--bg-4)',borderRadius:2}}>
                              <div style={{height:'100%',width:`${pct}%`,background:pct>80?'var(--danger)':'var(--accent)',borderRadius:2}} />
                            </div>
                            <span style={{color:'var(--text-muted)',flexShrink:0}}>{t.registered}/{t.maxTeams} teams</span>
                          </div>
                          {t.deadline && <div style={{fontSize:'.75rem',color:'var(--text-muted)',marginTop:8}}>Deadline: {t.deadline}</div>}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Team Info */}
            {step === 2 && (
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                <div>
                  <h2 style={{marginBottom:4}}>Team Information</h2>
                  <p className="text-secondary">Set your team's name and details.</p>
                </div>
                <div className="form-row">
                  <div className={`form-group ${errors.teamName ? 'has-error' : ''}`}>
                    <label className="form-label">Team Name <span style={{color:'var(--danger)'}}>*</span></label>
                    <input className="form-input" value={form.teamName} onChange={e => set('teamName', e.target.value)} placeholder="Nova Esports" />
                    {errors.teamName && <div className="form-error" style={{display:'block'}}>{errors.teamName}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Team Tag</label>
                    <input className="form-input" value={form.tag} onChange={e => set('tag', e.target.value)} placeholder="NE" maxLength={5} />
                    <div className="form-hint">Up to 5 characters shown in brackets</div>
                  </div>
                </div>
                <div className={`form-group ${errors.game ? 'has-error' : ''}`}>
                  <label className="form-label">Game <span style={{color:'var(--danger)'}}>*</span></label>
                  <select className="form-select" value={form.game} onChange={e => set('game', e.target.value)}>
                    <option value="">Select game…</option>
                    {['Valorant','CS2','League of Legends','PUBG Mobile'].map(g => <option key={g}>{g}</option>)}
                  </select>
                  {errors.game && <div className="form-error" style={{display:'block'}}>{errors.game}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input className="form-input" type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="manager@giki.edu.pk" />
                </div>
                {selectedTournament && (
                  <div style={{padding:14,background:'var(--accent-bg)',border:'1px solid rgba(0,229,160,.2)',borderRadius:'var(--radius)',fontSize:'.875rem'}}>
                    Registering for: <strong>{selectedTournament.title}</strong> · {selectedTournament.game}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Roster */}
            {step === 3 && (
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                <div>
                  <h2 style={{marginBottom:4}}>Build Your Roster</h2>
                  <p className="text-secondary">Add 5 core players. You may also add 1 substitute.</p>
                </div>
                {form.players.map((player, i) => (
                  <div key={i} style={{padding:16,background:'var(--bg-3)',borderRadius:'var(--radius)',border:'1px solid var(--border)'}}>
                    <div style={{fontWeight:700,fontSize:'.8rem',color:'var(--accent)',marginBottom:12,textTransform:'uppercase'}}>
                      Player {i+1} {i === 0 && <span style={{color:'var(--warn)'}}>· Team Captain</span>}
                    </div>
                    <div className="player-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                      <div className={`form-group ${errors[`p${i}name`] ? 'has-error' : ''}`} style={{margin:0}}>
                        <label className="form-label">Full Name *</label>
                        <input className="form-input" value={player.name} onChange={e => setPlayer(i,'name',e.target.value)} placeholder="Ali Khan" />
                        {errors[`p${i}name`] && <div className="form-error" style={{display:'block'}}>{errors[`p${i}name`]}</div>}
                      </div>
                      <div className={`form-group ${errors[`p${i}ign`] ? 'has-error' : ''}`} style={{margin:0}}>
                        <label className="form-label">In-Game Name *</label>
                        <input className="form-input" value={player.ign} onChange={e => setPlayer(i,'ign',e.target.value)} placeholder="AliKhan#001" />
                        {errors[`p${i}ign`] && <div className="form-error" style={{display:'block'}}>{errors[`p${i}ign`]}</div>}
                      </div>
                      <div className={`form-group ${errors[`p${i}role`] ? 'has-error' : ''}`} style={{margin:0}}>
                        <label className="form-label">Role *</label>
                        <select className="form-select" value={player.role} onChange={e => setPlayer(i,'role',e.target.value)}>
                          <option value="">Select…</option>
                          {ROLES.filter(r => r !== 'Substitute').map(r => <option key={r}>{r}</option>)}
                        </select>
                        {errors[`p${i}role`] && <div className="form-error" style={{display:'block'}}>{errors[`p${i}role`]}</div>}
                      </div>
                      <div className={`form-group ${errors[`p${i}email`] ? 'has-error' : ''}`} style={{margin:0}}>
                        <label className="form-label">Email <span style={{color:'var(--danger)'}}>*</span></label>
                        <input
                          className="form-input"
                          type="email"
                          value={player.email}
                          onChange={e => setPlayer(i,'email',e.target.value)}
                          placeholder="player@giki.edu.pk"
                          style={errors[`p${i}email`] ? {borderColor:'var(--danger)'} : {}}
                        />
                        {errors[`p${i}email`] && <div className="form-error" style={{display:'block'}}>{errors[`p${i}email`]}</div>}
                      </div>
                    </div>
                  </div>
                ))}
                {/* Substitute */}
                <div style={{padding:16,background:'var(--bg-3)',borderRadius:'var(--radius)',border:'1px dashed var(--border)'}}>
                  <div style={{fontWeight:700,fontSize:'.8rem',color:'var(--text-muted)',marginBottom:12,textTransform:'uppercase'}}>
                    Substitute (Optional)
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div className="form-group" style={{margin:0}}>
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={form.sub.name} onChange={e => set('sub', {...form.sub, name:e.target.value})} placeholder="Sub player" />
                    </div>
                    <div className="form-group" style={{margin:0}}>
                      <label className="form-label">In-Game Name</label>
                      <input className="form-input" value={form.sub.ign} onChange={e => set('sub', {...form.sub, ign:e.target.value})} placeholder="SubPlayer#001" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Rules */}
            {step === 4 && (
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                <div>
                  <h2 style={{marginBottom:4}}>Tournament Rules</h2>
                  <p className="text-secondary">Read and accept the rules before proceeding.</p>
                </div>
                <div
                  ref={rulesRef}
                  onScroll={() => {
                    const el = rulesRef.current
                    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setRulesRead(true)
                  }}
                  style={{maxHeight:320,overflowY:'auto',padding:16,background:'var(--bg-3)',borderRadius:'var(--radius)',border:`1px solid ${rulesRead ? 'var(--accent)' : 'var(--border)'}`,fontSize:'.875rem',lineHeight:1.7,color:'var(--text-secondary)',transition:'border-color .2s'}}
                >
                  {[
                    ['Eligibility', 'All players must be currently enrolled university students with valid student ID. Players may only represent one team per tournament.'],
                    ['Team Composition', 'Teams must have exactly 5 core players registered before the deadline. One optional substitute may be added. No last-minute roster changes are allowed.'],
                    ['Match Conduct', 'Players must be in the lobby 10 minutes before match time. Failure to show results in a forfeit. All players must maintain sportsmanlike conduct.'],
                    ['Check-in', 'All 5 team members must confirm attendance at least 30 minutes before each match. Missing check-ins will be treated as forfeits.'],
                    ['Result Submission', 'The winning team must submit a screenshot as evidence within 15 minutes. Organizers will verify and advance the bracket within 30 minutes.'],
                    ['Disputes', 'Disputes must be raised within 10 minutes of result posting. Include clear evidence. The organizer\'s decision is final and binding.'],
                    ['Fair Play', 'Use of cheats, exploits, or unauthorized software will result in immediate disqualification. EsportsHub reserves the right to ban repeat offenders.'],
                  ].map(([title, body]) => (
                    <div key={title} style={{marginBottom:16}}>
                      <strong style={{color:'var(--text-primary)'}}>{title}</strong>
                      <p style={{marginTop:4}}>{body}</p>
                    </div>
                  ))}
                </div>
                {!rulesRead && (
                  <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'rgba(255,181,71,.08)',border:'1px solid rgba(255,181,71,.2)',borderRadius:'var(--radius-sm)',fontSize:'.8rem',color:'var(--warn)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                    Scroll through the rules to enable the checkbox
                  </div>
                )}
                {errors.rules && <Alert type="danger">{errors.rules}</Alert>}
                <label style={{display:'flex',alignItems:'flex-start',gap:12,cursor: rulesRead ? 'pointer' : 'not-allowed',opacity: rulesRead ? 1 : 0.5}}>
                  <input
                    type="checkbox"
                    checked={form.rulesAccepted}
                    onChange={e => rulesRead && set('rulesAccepted', e.target.checked)}
                    disabled={!rulesRead}
                    style={{marginTop:3,accentColor:'var(--accent)',width:16,height:16,flexShrink:0}}
                  />
                  <span style={{fontSize:'.875rem',lineHeight:1.5}}>
                    I have read and agree to the tournament rules. I confirm all team members meet eligibility requirements.
                  </span>
                </label>
              </div>
            )}

            {/* Step 5: Confirm */}
            {step === 5 && (
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                <div>
                  <h2 style={{marginBottom:4}}>Confirm Registration</h2>
                  <p className="text-secondary">Review your details before submitting.</p>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {[
                    { label:'Tournament', value: selectedTournament?.title || form.tournament },
                    { label:'Team Name',  value: form.teamName },
                    { label:'Team Tag',   value: form.tag || 'N/A' },
                    { label:'Game',       value: form.game },
                    { label:'Players',    value: `${form.players.filter(p=>p.name).length}/5 core${form.sub.name ? ' + 1 sub' : ''}` },
                    { label:'Contact',    value: form.contactEmail },
                  ].map(row => (
                    <div key={row.label} style={{display:'flex',justifyContent:'space-between',padding:'10px 14px',background:'var(--bg-3)',borderRadius:'var(--radius)',fontSize:'.875rem'}}>
                      <span style={{color:'var(--text-muted)'}}>{row.label}</span>
                      <strong>{row.value}</strong>
                    </div>
                  ))}
                </div>
                <Alert type="success" title="Ready to submit!">
                  Your registration will be reviewed by the organizer. You'll receive a notification once approved.
                </Alert>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{display:'flex',justifyContent:'space-between',gap:12}}>
            <div>
              {step > 1
                ? <button className="btn btn--ghost btn--lg" onClick={prevStep}>← Back</button>
                : <Link to="/dashboard/manager" className="btn btn--ghost btn--lg">Cancel</Link>
              }
            </div>
            <div>
              {step < STEPS.length
                ? <button className="btn btn--primary btn--lg" onClick={nextStep}>Continue →</button>
                : <button className="btn btn--primary btn--lg" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Submitting…' : '🚀 Submit Registration'}
                  </button>
              }
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
