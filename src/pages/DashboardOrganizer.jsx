import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useAnnouncement } from '../context/AnnouncementContext'
import { MockDB } from '../api/index'

const ANN_TYPES = [
  { id:'maintenance', label:'Maintenance', icon:'🔧', desc:'Scheduled downtime or server work' },
  { id:'info',        label:'Announcement', icon:'📢', desc:'General info for all players' },
  { id:'warning',     label:'Warning',      icon:'⚠️',  desc:'Urgent notice requiring attention' },
  { id:'update',      label:'Notice',       icon:'🕐', desc:'Schedule change or time update' },
]

const PENDING_RESULTS = [
  { id:'r1', match:'Nova Esports vs Phoenix Squad', stage:'QF', submittedBy:'Ahmed Raza', time:'5 min ago', winner:'Nova Esports', score:'2–0', evidence:true },
  { id:'r2', match:'Storm Riders vs Cyber Wolves',  stage:'QF', submittedBy:'Omar Baig',  time:'12 min ago',winner:'Storm Riders', score:'2–1', evidence:true },
]

const TEAM_APPROVALS = [
  { id:'t1', name:'Nexus Gaming',   game:'Valorant', captain:'Bilal Ahmed', players:5, submitted:'Apr 30' },
  { id:'t2', name:'Iron Wolves',    game:'CS2',      captain:'Sana Mirza',  players:4, submitted:'May 1'  },
]

const EMPTY_ANN = { title:'', message:'', type:'maintenance', startTime:'', endTime:'' }

export default function DashboardOrganizer() {
  const { user } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()
  const { announcement, publish, clear: clearAnn } = useAnnouncement()

  const [annForm,      setAnnForm]      = useState(EMPTY_ANN)
  const [annErrors,    setAnnErrors]    = useState({})

  const [verifyModal,  setVerifyModal]  = useState(null)  // result object
  const [rejectConfirm,setRejectConfirm]= useState(null)  // { type:'result'|'team', id, name }
  const [undoTimer,    setUndoTimer]    = useState(null)   // { id, timeout }
  const [verified,     setVerified]     = useState([])
  const [rejected,     setRejected]     = useState([])
  const [approvedTeams,setApprovedTeams]= useState([])
  const [rejectedTeams,setRejectedTeams]= useState([])

  const firstName = user?.name?.split(' ')[0] || 'Organizer'

  const handleVerify = (result) => {
    setVerifyModal(null)
    setVerified(v => [...v, result.id])
    toast.success('Result verified!', `${result.winner} advances. 10-min undo window active.`)
    const t = setTimeout(() => {
      setUndoTimer(u => u?.id === result.id ? null : u)
      toast.info('Undo expired', 'The result is now permanent.')
    }, 10 * 60 * 1000)
    setUndoTimer({ id: result.id, timeout: t })
  }

  const handleUndo = (id) => {
    if (undoTimer?.id === id) {
      clearTimeout(undoTimer.timeout)
      setUndoTimer(null)
    }
    setVerified(v => v.filter(x => x !== id))
    toast.warn('Verification undone', 'The result has been reset to pending.')
  }

  const handleApproveTeam = (id) => {
    setApprovedTeams(a => [...a, id])
    toast.success('Team approved', 'The team can now compete.')
  }
  const handleRejectTeam = (id) => {
    setRejectedTeams(r => [...r, id])
    setRejectConfirm(null)
    toast.error('Team rejected', 'The team manager has been notified.')
  }

  const handlePublishAnn = () => {
    const e = {}
    if (!annForm.title.trim()) e.title = 'Title is required'
    if (!annForm.type)         e.type  = 'Select a type'
    setAnnErrors(e)
    if (Object.keys(e).length) return
    publish({ ...annForm, createdBy: user?.name })
    toast.success('Announcement published!', 'All users will see it at the top of every page.')
    setAnnForm(EMPTY_ANN)
    setAnnErrors({})
  }

  const handleClearAnn = () => {
    clearAnn()
    toast.info('Announcement cleared', 'The banner has been removed for all users.')
  }

  const confirmReject = () => {
    if (!rejectConfirm) return
    if (rejectConfirm.type === 'result') {
      setRejected(x => [...x, rejectConfirm.id])
      setRejectConfirm(null)
      toast.error('Result rejected', 'The submitting team has been notified.')
    } else {
      handleRejectTeam(rejectConfirm.id)
    }
  }

  const pendingCount  = PENDING_RESULTS.filter(r => !verified.includes(r.id) && !rejected.includes(r.id)).length
  const approvalCount = TEAM_APPROVALS.filter(t => !approvedTeams.includes(t.id) && !rejectedTeams.includes(t.id)).length

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container">

          {/* Header */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:32}}>
            <div>
              <div className="label-sm" style={{color:'var(--purple)',marginBottom:6}}>TOURNAMENT ORGANIZER</div>
              <h1 style={{fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',fontSize:'clamp(1.5rem,4vw,2.25rem)'}}>Welcome back, {firstName}</h1>
              <p className="text-secondary" style={{marginTop:4}}>Spring University Cup 2025 · Quarterfinal Stage</p>
            </div>
            <div className="page-header-btns" style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <Link to="/tournaments" className="btn btn--secondary btn--lg">Manage Tournaments</Link>
              <Link to="/bracket"     className="btn btn--ghost btn--lg">View Bracket</Link>
            </div>
          </div>

          {/* Pending actions alert */}
          {(pendingCount > 0 || approvalCount > 0) && (
            <Alert type="warn" title={`${pendingCount + approvalCount} pending action${pendingCount + approvalCount > 1 ? 's' : ''} need your attention`} style={{marginBottom:24}}>
              {pendingCount > 0 && `${pendingCount} result${pendingCount>1?'s':''} awaiting verification. `}
              {approvalCount > 0 && `${approvalCount} team${approvalCount>1?'s':''} awaiting approval.`}
            </Alert>
          )}

          {/* Stats */}
          <div className="grid-4" style={{marginBottom:32}}>
            {[
              { icon:'🏆', color:'purple', value:'3',  label:'Active Tournaments', note:'1 in registration'  },
              { icon:'👥', color:'accent', value:'16', label:'Registered Teams',   note:'2 pending approval' },
              { icon:'📅', color:'blue',   value:'8',  label:'Matches This Week',  note:'4 completed'        },
              { icon:'⚡', color:'warn',   value:`${pendingCount}`,  label:'Pending Verifications', note:'Action required'   },
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
            {/* Result Verification Queue */}
            <div>
              <div className="section-header">
                <div className="section-title">✅ Result Verification Queue</div>
                {pendingCount > 0 && <span className="badge badge--danger">{pendingCount} pending</span>}
              </div>
              <div className="card card__body" style={{display:'flex',flexDirection:'column',gap:12}}>
                {PENDING_RESULTS.map(r => {
                  const isVerified = verified.includes(r.id)
                  const isRejected = rejected.includes(r.id)
                  if (isRejected) return null
                  return (
                    <div key={r.id} style={{padding:14,background:'var(--bg-3)',borderRadius:'var(--radius)',border:`1px solid ${isVerified ? 'var(--accent)' : 'var(--border)'}`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:'.875rem'}}>{r.match}</div>
                          <div style={{fontSize:'.75rem',color:'var(--text-muted)',marginTop:2}}>{r.stage} · Submitted {r.time} by {r.submittedBy}</div>
                        </div>
                        {isVerified
                          ? <span className="badge badge--accent">Verified</span>
                          : <span className="badge badge--warn">Pending</span>
                        }
                      </div>
                      <div style={{display:'flex',gap:16,fontSize:'.8rem',marginBottom:12}}>
                        <span><span style={{color:'var(--text-muted)'}}>Winner: </span><strong style={{color:'var(--accent)'}}>{r.winner}</strong></span>
                        <span><span style={{color:'var(--text-muted)'}}>Score: </span><strong>{r.score}</strong></span>
                        {r.evidence && <span style={{color:'var(--blue)'}}>📎 Evidence attached</span>}
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        {isVerified ? (
                          undoTimer?.id === r.id && (
                            <button className="btn btn--outline btn--sm" onClick={() => handleUndo(r.id)}>
                              ↩ Undo (within 10 min)
                            </button>
                          )
                        ) : (
                          <>
                            <button className="btn btn--accent btn--sm" onClick={() => setVerifyModal(r)}>Verify Result</button>
                            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/schedule')}>Review Details</button>
                            <button className="btn btn--ghost btn--sm" style={{color:'var(--danger)',marginLeft:'auto'}} onClick={() => setRejectConfirm({ type:'result', id:r.id, name:r.match })}>Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
                {PENDING_RESULTS.every(r => verified.includes(r.id) || rejected.includes(r.id)) && (
                  <div className="empty-state" style={{padding:'24px 0'}}>
                    <div className="empty-state__icon">✅</div>
                    <div className="empty-state__desc">All results verified</div>
                  </div>
                )}
              </div>
            </div>

            {/* Team Approval Queue */}
            <div>
              <div className="section-header">
                <div className="section-title">👥 Team Approvals</div>
                {approvalCount > 0 && <span className="badge badge--warn">{approvalCount} pending</span>}
              </div>
              <div className="card card__body" style={{display:'flex',flexDirection:'column',gap:12}}>
                {TEAM_APPROVALS.map(t => {
                  const isApproved = approvedTeams.includes(t.id)
                  const isRejected = rejectedTeams.includes(t.id)
                  return (
                    <div key={t.id} style={{padding:14,background:'var(--bg-3)',borderRadius:'var(--radius)',border:`1px solid ${isApproved ? 'var(--accent)' : isRejected ? 'var(--danger)' : 'var(--border)'}`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:'.875rem'}}>{t.name}</div>
                          <div style={{fontSize:'.75rem',color:'var(--text-muted)',marginTop:2}}>{t.game} · Captain: {t.captain}</div>
                        </div>
                        {isApproved ? <span className="badge badge--accent">Approved</span>
                         : isRejected ? <span className="badge badge--danger">Rejected</span>
                         : <span className="badge badge--blue">Pending</span>}
                      </div>
                      <div style={{fontSize:'.8rem',color:'var(--text-muted)',marginBottom:12}}>
                        {t.players}/5 players · Submitted {t.submitted}
                      </div>
                      {!isApproved && !isRejected && (
                        <div style={{display:'flex',gap:8}}>
                          <button className="btn btn--accent btn--sm" onClick={() => handleApproveTeam(t.id)}>Approve</button>
                          <button className="btn btn--ghost btn--sm" style={{color:'var(--danger)'}} onClick={() => setRejectConfirm({ type:'team', id:t.id, name:t.name })}>Reject</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Announcement Composer ── */}
          <div style={{marginBottom:32}}>
            <div className="section-header" style={{marginBottom:16}}>
              <div className="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'#d97706'}}>
                  <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                </svg>
                Broadcast Announcement
              </div>
              {announcement?.active && (
                <span className="badge" style={{background:'rgba(217,119,6,.15)',color:'#d97706',border:'1px solid rgba(217,119,6,.3)'}}>
                  1 Active
                </span>
              )}
            </div>

            {/* Active announcement preview */}
            {announcement?.active && (
              <div style={{marginBottom:16,padding:16,background:'rgba(245,158,11,.08)',border:'2px solid rgba(245,158,11,.3)',borderRadius:'var(--radius-lg)',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
                <div>
                  <div style={{fontSize:'.75rem',fontWeight:700,color:'#d97706',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>Currently Live</div>
                  <div style={{fontWeight:700,color:'var(--text-primary)'}}>{announcement.title}</div>
                  {announcement.message && <div style={{fontSize:'.85rem',color:'var(--text-secondary)',marginTop:4}}>{announcement.message}</div>}
                </div>
                <button className="btn btn--ghost btn--sm" style={{color:'var(--danger)',flexShrink:0}} onClick={handleClearAnn}>Clear</button>
              </div>
            )}

            <div className="card card__body">
              {/* Type selector */}
              <div style={{marginBottom:20}}>
                <div className="form-label" style={{marginBottom:8}}>Announcement Type</div>
                <div className="ann-type-grid">
                  {ANN_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`ann-type-btn ${annForm.type === t.id ? 'active' : ''}`}
                      onClick={() => setAnnForm(f => ({ ...f, type: t.id }))}
                      title={t.desc}
                    >
                      <span className="ann-type-btn__icon">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
                {annErrors.type && <div className="form-error" style={{display:'block',marginTop:6}}>{annErrors.type}</div>}
              </div>

              {/* Title */}
              <div className={`form-group ${annErrors.title ? 'has-error' : ''}`} style={{marginBottom:16}}>
                <label className="form-label">Title <span style={{color:'var(--danger)'}}>*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Scheduled Server Maintenance"
                  value={annForm.title}
                  onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))}
                  maxLength={80}
                />
                <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                  {annErrors.title
                    ? <div className="form-error" style={{display:'block'}}>{annErrors.title}</div>
                    : <div className="form-hint">Shown in bold in the banner</div>
                  }
                  <span style={{fontSize:'.72rem',color:'var(--text-faint)'}}>{annForm.title.length}/80</span>
                </div>
              </div>

              {/* Message */}
              <div className="form-group" style={{marginBottom:16}}>
                <label className="form-label">Message <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label>
                <textarea
                  className="form-input"
                  placeholder="e.g. Servers will be unavailable for 2 hours. Save your work beforehand."
                  value={annForm.message}
                  onChange={e => setAnnForm(f => ({ ...f, message: e.target.value }))}
                  rows={2}
                  maxLength={200}
                  style={{resize:'vertical',minHeight:64}}
                />
                <div style={{display:'flex',justifyContent:'flex-end',marginTop:4}}>
                  <span style={{fontSize:'.72rem',color:'var(--text-faint)'}}>{annForm.message.length}/200</span>
                </div>
              </div>

              {/* Time range */}
              <div className="form-row" style={{marginBottom:20}}>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Start Time <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={annForm.startTime}
                    onChange={e => setAnnForm(f => ({ ...f, startTime: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">End Time <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={annForm.endTime}
                    onChange={e => setAnnForm(f => ({ ...f, endTime: e.target.value }))}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <button
                  className="btn btn--primary btn--sm"
                  style={{background:'#d97706',borderColor:'#d97706'}}
                  onClick={handlePublishAnn}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginRight:6}}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                  Publish Announcement
                </button>
                {(annForm.title || annForm.message) && (
                  <button className="btn btn--ghost btn--sm" onClick={() => { setAnnForm(EMPTY_ANN); setAnnErrors({}) }}>
                    Reset Form
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tournament Overview */}
          <div>
            <div className="section-header">
              <div className="section-title">🏆 Active Tournaments</div>
              <Link to="/tournaments" className="btn btn--ghost btn--sm">Manage All</Link>
            </div>
            <div className="card">
              <div className="table-wrap" style={{border:'none',borderRadius:0}}>
                <table>
                  <thead><tr><th>Tournament</th><th>Game</th><th>Stage</th><th>Teams</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {MockDB._tournaments.slice(0,4).map(t => {
                      const pct = Math.round((t.registered / t.maxTeams) * 100)
                      return (
                        <tr key={t.id} style={{cursor:'pointer'}} onClick={() => navigate(`/tournaments/${t.id}`)}>
                          <td><strong>{t.title}</strong></td>
                          <td>{t.game}</td>
                          <td>{t.stage || 'Registration'}</td>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div style={{height:4,width:60,background:'var(--bg-4)',borderRadius:2}}>
                                <div style={{height:'100%',width:`${pct}%`,background:'var(--accent)',borderRadius:2}} />
                              </div>
                              <span style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{t.registered}/{t.maxTeams}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge--${t.status === 'live' ? 'live' : t.status === 'upcoming' ? 'blue' : 'accent'}`}>
                              {t.status === 'live' ? 'LIVE' : t.status === 'upcoming' ? 'Upcoming' : t.status}
                            </span>
                          </td>
                          <td><button className="btn btn--ghost btn--sm" onClick={e => { e.stopPropagation(); navigate(`/tournaments/${t.id}`) }}>Manage</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Verify Result Modal */}
      <Modal
        open={!!verifyModal}
        onClose={() => setVerifyModal(null)}
        title="Verify Match Result"
        size="sm"
        footer={
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn btn--ghost btn--sm" onClick={() => setVerifyModal(null)}>Cancel</button>
            <button className="btn btn--accent btn--sm" onClick={() => handleVerify(verifyModal)}>Confirm & Verify</button>
          </div>
        }
      >
        {verifyModal && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <Alert type="warn" title="Review before verifying">
              Once verified, the winner advances in the bracket. A 10-minute undo window will be available.
            </Alert>
            <div style={{padding:16,background:'var(--bg-3)',borderRadius:'var(--radius)'}}>
              <div style={{fontWeight:700,marginBottom:8}}>{verifyModal.match}</div>
              <div style={{display:'flex',gap:20,fontSize:'.875rem'}}>
                <div><span style={{color:'var(--text-muted)'}}>Winner: </span><strong style={{color:'var(--accent)'}}>{verifyModal.winner}</strong></div>
                <div><span style={{color:'var(--text-muted)'}}>Score: </span><strong>{verifyModal.score}</strong></div>
              </div>
            </div>
            <div style={{fontSize:'.8rem',color:'var(--text-muted)'}}>
              Submitted by <strong>{verifyModal.submittedBy}</strong> · {verifyModal.time}
              {verifyModal.evidence && <span style={{color:'var(--blue)',marginLeft:8}}>📎 Screenshot evidence provided</span>}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        open={!!rejectConfirm}
        onClose={() => setRejectConfirm(null)}
        title="Confirm Rejection"
        size="sm"
        footer={
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn btn--ghost btn--sm" onClick={() => setRejectConfirm(null)}>Cancel</button>
            <button className="btn btn--danger btn--sm" onClick={confirmReject}>Yes, Reject</button>
          </div>
        }
      >
        {rejectConfirm && (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Alert type="danger" title="Are you sure?">
              This action cannot be undone. The {rejectConfirm.type === 'result' ? 'submitting team' : 'team manager'} will be notified.
            </Alert>
            <div style={{padding:14,background:'var(--bg-3)',borderRadius:'var(--radius)',fontSize:'.875rem'}}>
              <span style={{color:'var(--text-muted)'}}>Rejecting: </span>
              <strong>{rejectConfirm.name}</strong>
            </div>
          </div>
        )}
      </Modal>

    </>
  )
}
