import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Countdown from '../components/Countdown'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const MATCH = {
  id: 'm1',
  teamA: 'Nova Esports',
  teamB: 'Phoenix Squad',
  stage: 'Quarterfinal',
  game: 'Valorant',
  format: 'Best of 3',
  scheduledAt: new Date(Date.now() + 1.75 * 3600000).toISOString(),
  status: 'upcoming',
  lobbyCode: null,
  server: 'Middle East',
  tournament: 'Spring University Cup 2025',
  teamAPlayers: [
    { name:'Ahmed Raza',  ign:'PhoenixAR', role:'Duelist',    confirmed:true  },
    { name:'Sara Malik',  ign:'SaraM',     role:'Controller', confirmed:true  },
    { name:'Hamza Ali',   ign:'HamzaGG',   role:'Initiator',  confirmed:true  },
    { name:'Omar Baig',   ign:'OmarB',     role:'Sentinel',   confirmed:false },
    { name:'Zain Khan',   ign:'ZainK99',   role:'Flex',       confirmed:true  },
  ],
  teamBPlayers: [
    { name:'Bilal Ahmed', ign:'BilalFPS',  role:'Duelist',    confirmed:true  },
    { name:'Sana Mirza',  ign:'SanaMirza', role:'Controller', confirmed:true  },
    { name:'Ali Raza',    ign:'AliRaza01', role:'Initiator',  confirmed:true  },
    { name:'Fatima K',    ign:'FatimaK',   role:'Sentinel',   confirmed:true  },
    { name:'Umar Farooq', ign:'UmarFPS',   role:'Flex',       confirmed:false },
  ],
}

export default function MatchDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const toast    = useToast()
  const { user, isLoggedIn } = useAuth()

  const [confirmed,    setConfirmed]    = useState(false)
  const [resultModal,  setResultModal]  = useState(false)
  const [disputeModal, setDisputeModal] = useState(false)
  const [resultForm,   setResultForm]   = useState({ winner:'Nova Esports', scoreA:'', scoreB:'', notes:'' })

  const match = MATCH // in real app: fetch by id

  const isPlayer    = user?.role === 'player'
  const isManager   = user?.role === 'manager'
  const isOrganizer = user?.role === 'organizer'

  const confirmedA = match.teamAPlayers.filter(p => p.confirmed).length
  const confirmedB = match.teamBPlayers.filter(p => p.confirmed).length

  const handleConfirm = () => {
    setConfirmed(true)
    toast.success('Attendance confirmed!', 'Your team manager has been notified.')
  }

  const handleSubmitResult = () => {
    setResultModal(false)
    toast.success('Result submitted!', 'Waiting for organizer verification.')
  }

  const handleDispute = () => {
    setDisputeModal(false)
    toast.warn('Dispute filed', 'An organizer will review within 30 minutes.')
  }

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container" style={{maxWidth:900}}>

          {/* Breadcrumb */}
          <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:24,fontSize:'.875rem',color:'var(--text-muted)'}}>
            <Link to="/schedule" style={{color:'var(--text-muted)',textDecoration:'none'}}>Schedule</Link>
            <span>/</span>
            <span style={{color:'var(--text-primary)'}}>{match.teamA} vs {match.teamB}</span>
          </div>

          {/* Attendance alert */}
          {isPlayer && !confirmed && match.status === 'upcoming' && (
            <Alert type="warn" title="Confirm your attendance" style={{marginBottom:24}}
              action={<button className="btn btn--warn btn--sm" onClick={handleConfirm}>Confirm Now</button>}
            >
              Match in under 2 hours. Confirm you'll be present or your manager will see you as absent.
            </Alert>
          )}
          {isPlayer && confirmed && (
            <Alert type="success" title="Attendance confirmed" style={{marginBottom:24}}>You're ready to play!</Alert>
          )}

          {/* Match header card */}
          <div className="card card__body" style={{marginBottom:24}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:8}}>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <span className="badge badge--warn">{match.stage}</span>
                <span className="badge badge--blue">{match.game}</span>
                <span style={{fontSize:'.8rem',color:'var(--text-muted)',padding:'2px 8px'}}>{match.format}</span>
              </div>
              <span className="badge badge--blue">{match.status.charAt(0).toUpperCase()+match.status.slice(1)}</span>
            </div>

            <div style={{display:'flex',alignItems:'center',gap:24,marginBottom:24}}>
              {/* Team A */}
              <div style={{flex:1,textAlign:'center'}}>
                <div style={{width:72,height:72,borderRadius:'var(--radius-lg)',background:'var(--accent-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'1.4rem',fontWeight:700,color:'var(--accent)',margin:'0 auto 10px'}}>NE</div>
                <div style={{fontWeight:700}}>{match.teamA}</div>
                <div style={{fontSize:'.75rem',marginTop:4}}>
                  <span style={{color:confirmedA >= 5 ? 'var(--accent)' : 'var(--warn)'}}>{confirmedA}/5 confirmed</span>
                </div>
              </div>
              {/* VS */}
              <div style={{textAlign:'center',flexShrink:0}}>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'2rem',fontWeight:700,color:'var(--text-muted)'}}>VS</div>
                <div style={{fontSize:'.75rem',color:'var(--text-muted)',marginTop:4}}>{match.tournament}</div>
              </div>
              {/* Team B */}
              <div style={{flex:1,textAlign:'center'}}>
                <div style={{width:72,height:72,borderRadius:'var(--radius-lg)',background:'var(--blue-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'1.4rem',fontWeight:700,color:'var(--blue)',margin:'0 auto 10px'}}>PS</div>
                <div style={{fontWeight:700}}>{match.teamB}</div>
                <div style={{fontSize:'.75rem',marginTop:4}}>
                  <span style={{color:confirmedB >= 5 ? 'var(--accent)' : 'var(--warn)'}}>{confirmedB}/5 confirmed</span>
                </div>
              </div>
            </div>

            {match.status === 'upcoming' && (
              <div style={{textAlign:'center',marginBottom:20}}>
                <div style={{fontSize:'.75rem',color:'var(--text-muted)',marginBottom:8,textTransform:'uppercase'}}>Match Starts In</div>
                <Countdown target={match.scheduledAt} size="lg" />
              </div>
            )}

            {/* Match info grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12}}>
              {[
                { label:'Server',    value: match.server },
                { label:'Format',    value: match.format },
                { label:'Tournament',value: match.tournament },
                { label:'Lobby Code',value: match.lobbyCode || 'Shared 10 min before' },
              ].map(item => (
                <div key={item.label} style={{padding:12,background:'var(--bg-3)',borderRadius:'var(--radius)',fontSize:'.8rem'}}>
                  <div style={{color:'var(--text-muted)',marginBottom:4}}>{item.label}</div>
                  <div style={{fontWeight:700}}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rosters */}
          <div className="grid-2" style={{marginBottom:24}}>
            {[
              { name: match.teamA, players: match.teamAPlayers, color:'accent' },
              { name: match.teamB, players: match.teamBPlayers, color:'blue' },
            ].map(side => (
              <div key={side.name}>
                <div className="section-title" style={{marginBottom:12}}>{side.name}</div>
                <div className="card card__body" style={{display:'flex',flexDirection:'column',gap:8}}>
                  {side.players.map(p => (
                    <div key={p.ign} style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:`var(--${side.color}-bg)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.7rem',fontWeight:700,color:`var(--${side.color})`,flexShrink:0}}>
                        {p.name.slice(0,2).toUpperCase()}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:'.875rem',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                        <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{p.role} · {p.ign}</div>
                      </div>
                      <span className={`badge badge--${p.confirmed ? 'accent' : 'warn'}`} style={{fontSize:'.65rem'}}>
                        {p.confirmed ? '✓ Ready' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {(isPlayer || isManager) && match.status === 'upcoming' && !confirmed && (
              <button className="btn btn--warn btn--lg" onClick={handleConfirm}>✓ Confirm Attendance</button>
            )}
            {(isPlayer || isManager) && match.status === 'completed' && (
              <>
                <button className="btn btn--primary btn--lg" onClick={() => setResultModal(true)}>Submit Result</button>
                <button className="btn btn--ghost btn--lg" style={{color:'var(--danger)'}} onClick={() => setDisputeModal(true)}>File Dispute</button>
              </>
            )}
            {isOrganizer && match.status === 'pending_verification' && (
              <button className="btn btn--accent btn--lg" onClick={() => toast.success('Result verified!','The bracket has been updated.')}>Verify Result</button>
            )}
            <Link to="/schedule" className="btn btn--ghost btn--lg">← Back to Schedule</Link>
          </div>

        </div>
      </div>

      {/* Submit Result Modal */}
      <Modal
        open={resultModal}
        onClose={() => setResultModal(false)}
        title="Submit Match Result"
        size="sm"
        footer={
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn btn--ghost btn--sm" onClick={() => setResultModal(false)}>Cancel</button>
            <button className="btn btn--primary btn--sm" onClick={handleSubmitResult}>Submit Result</button>
          </div>
        }
      >
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Alert type="warn" title="Please attach screenshot evidence">Result submissions without evidence may be rejected.</Alert>
          <div className="form-group">
            <label className="form-label">Winner</label>
            <select className="form-select" value={resultForm.winner} onChange={e => setResultForm(p => ({...p,winner:e.target.value}))}>
              <option>{match.teamA}</option>
              <option>{match.teamB}</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{match.teamA} Score</label>
              <input className="form-input" type="number" min="0" max="3" placeholder="0–3" value={resultForm.scoreA} onChange={e => setResultForm(p=>({...p,scoreA:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">{match.teamB} Score</label>
              <input className="form-input" type="number" min="0" max="3" placeholder="0–3" value={resultForm.scoreB} onChange={e => setResultForm(p=>({...p,scoreB:e.target.value}))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Screenshot Evidence</label>
            <div style={{border:'2px dashed var(--border)',borderRadius:'var(--radius)',padding:'24px',textAlign:'center',cursor:'pointer',color:'var(--text-muted)',fontSize:'.875rem'}}
              onClick={() => toast.info('Upload','File upload will be available once backend is connected.')}>
              📎 Click to attach screenshot
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-input" rows={2} value={resultForm.notes} onChange={e => setResultForm(p=>({...p,notes:e.target.value}))} placeholder="Any additional notes…" style={{resize:'vertical'}} />
          </div>
        </div>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        open={disputeModal}
        onClose={() => setDisputeModal(false)}
        title="File a Dispute"
        size="sm"
        footer={
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn btn--ghost btn--sm" onClick={() => setDisputeModal(false)}>Cancel</button>
            <button className="btn btn--danger btn--sm" onClick={handleDispute}>Submit Dispute</button>
          </div>
        }
      >
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Alert type="danger" title="Disputes must be filed within 10 minutes of result submission." />
          <div className="form-group">
            <label className="form-label">Reason</label>
            <select className="form-select">
              <option>Incorrect score reported</option>
              <option>Technical issue / disconnect</option>
              <option>Rules violation by opponent</option>
              <option>Wrong winner selected</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={4} placeholder="Describe the dispute in detail…" style={{resize:'vertical'}} />
          </div>
        </div>
      </Modal>
    </>
  )
}
