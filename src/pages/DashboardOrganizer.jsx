import { useState, useRef, useEffect } from 'react'
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

const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const toDateTimeLocal = (date) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00`
}

const isBeforeToday = (value) => {
  if (!value) return false
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  return d < startOfToday()
}

const UNDO_WINDOW_MS = 10 * 60 * 1000

const formatUndoTime = (expiresAt, now) => {
  const remaining = Math.max(0, expiresAt - now)
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export default function DashboardOrganizer() {
  const { user } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()
  const { announcement, publish, clear: clearAnn } = useAnnouncement()

  const [annForm,      setAnnForm]      = useState(EMPTY_ANN)
  const [annErrors,    setAnnErrors]    = useState({})

  const [tournForm, setTournForm] = useState({ title: '', game: '', maxTeams: '16', customMaxTeams: '', prize: '', format: 'Single Elimination', coverImage: null, startDate: '', registrationDeadline: '' })
  const [tournErrors, setTournErrors] = useState({})
  const createTournRef = useRef(null)

  const [tournConfirm, setTournConfirm] = useState(false)
  const [tournUndoTimer, setTournUndoTimer] = useState(null) // { id, timeout }

  const [verifyModal,  setVerifyModal]  = useState(null)  // result object
  const [rejectConfirm,setRejectConfirm]= useState(null)  // { type:'result'|'team', id, name }
  const [resultUndoTimers, setResultUndoTimers] = useState({})   // id -> { timeout, expiresAt }
  const [teamUndoTimers,   setTeamUndoTimers]   = useState({})   // id -> { timeout, expiresAt }
  const [resultRejectUndoTimers, setResultRejectUndoTimers] = useState({}) // id -> { timeout, expiresAt }
  const [teamRejectUndoTimers,   setTeamRejectUndoTimers]   = useState({}) // id -> { timeout, expiresAt }
  const [now, setNow] = useState(Date.now())
  const [verified,     setVerified]     = useState([])
  const [rejected,     setRejected]     = useState([])
  const [approvedTeams,setApprovedTeams]= useState([])
  const [rejectedTeams,setRejectedTeams]= useState([])

  const firstName = user?.name?.split(' ')[0] || 'Organizer'
  const todayMin = toDateTimeLocal(startOfToday())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleVerify = (result) => {
    setVerifyModal(null)
    setVerified(v => v.includes(result.id) ? v : [...v, result.id])
    toast.success('Result verified!', `${result.winner} advances. 10-min undo window active.`)
    const expiresAt = Date.now() + UNDO_WINDOW_MS
    const t = setTimeout(() => {
      setResultUndoTimers(prev => {
        const next = { ...prev }
        delete next[result.id]
        return next
      })
      toast.info('Undo expired', 'The result is now permanent.')
    }, UNDO_WINDOW_MS)
    setResultUndoTimers(prev => ({ ...prev, [result.id]: { timeout: t, expiresAt } }))
  }

  const handleUndo = (id) => {
    if (resultUndoTimers[id]) {
      clearTimeout(resultUndoTimers[id].timeout)
      setResultUndoTimers(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
    setVerified(v => v.filter(x => x !== id))
    toast.warn('Verification undone', 'The result has been reset to pending.')
  }

  const handleApproveTeam = (id) => {
    setApprovedTeams(a => a.includes(id) ? a : [...a, id])
    toast.success('Team approved', 'The team can now compete. 10-min undo window active.')
    const expiresAt = Date.now() + UNDO_WINDOW_MS
    const t = setTimeout(() => {
      setTeamUndoTimers(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      toast.info('Undo expired', 'The team approval is now permanent.')
    }, UNDO_WINDOW_MS)
    setTeamUndoTimers(prev => ({ ...prev, [id]: { timeout: t, expiresAt } }))
  }

  const handleUndoTeamApproval = (id) => {
    if (teamUndoTimers[id]) {
      clearTimeout(teamUndoTimers[id].timeout)
      setTeamUndoTimers(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
    setApprovedTeams(a => a.filter(x => x !== id))
    toast.warn('Approval undone', 'The team has been moved back to pending.')
  }
  const handleRejectTeam = (id) => {
    setRejectedTeams(r => r.includes(id) ? r : [...r, id])
    setRejectConfirm(null)
    toast.error('Team rejected', 'The team manager has been notified. 10-min undo window active.')
    const expiresAt = Date.now() + UNDO_WINDOW_MS
    const t = setTimeout(() => {
      setTeamRejectUndoTimers(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      toast.info('Undo expired', 'The team rejection is now permanent.')
    }, UNDO_WINDOW_MS)
    setTeamRejectUndoTimers(prev => ({ ...prev, [id]: { timeout: t, expiresAt } }))
  }

  const handleUndoTeamRejection = (id) => {
    if (teamRejectUndoTimers[id]) {
      clearTimeout(teamRejectUndoTimers[id].timeout)
      setTeamRejectUndoTimers(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
    setRejectedTeams(r => r.filter(x => x !== id))
    toast.warn('Rejection undone', 'The team has been moved back to pending.')
  }

  const handlePublishAnn = () => {
    const e = {}
    if (!annForm.title.trim()) e.title = 'Title is required'
    if (!annForm.type)         e.type  = 'Select a type'
    if (isBeforeToday(annForm.startTime)) e.startTime = 'Start time must be today or later'
    if (isBeforeToday(annForm.endTime)) e.endTime = 'End time must be today or later'
    if (annForm.startTime && annForm.endTime && new Date(annForm.startTime) >= new Date(annForm.endTime)) {
      e.endTime = 'End time must be after start time'
    }
    setAnnErrors(e)
    if (Object.keys(e).length) return
    publish({ ...annForm, createdBy: user?.name })
    toast.success('Announcement published!', 'All users will see it at the top of every page.')
    setAnnForm(EMPTY_ANN)
    setAnnErrors({})
  }

  const handleCreateTournament = () => {
    const e = {}
    if (!tournForm.title.trim()) e.title = 'Title is required'
    if (!tournForm.game) e.game = 'Please select a game'
    if (!tournForm.startDate) e.startDate = 'Start date is required'
    if (!tournForm.registrationDeadline) e.registrationDeadline = 'Deadline is required'
    if (isBeforeToday(tournForm.startDate)) e.startDate = 'Start date must be today or later'
    if (isBeforeToday(tournForm.registrationDeadline)) e.registrationDeadline = 'Deadline must be today or later'
    
    if (tournForm.startDate && tournForm.registrationDeadline) {
      if (new Date(tournForm.registrationDeadline) >= new Date(tournForm.startDate)) {
        e.registrationDeadline = 'Deadline must be before start date'
      }
    }
    
    const isCustom = tournForm.maxTeams === 'custom'
    const finalMaxTeams = isCustom ? parseInt(tournForm.customMaxTeams, 10) : parseInt(tournForm.maxTeams, 10)
    
    if (isCustom) {
      if (!finalMaxTeams || isNaN(finalMaxTeams)) e.maxTeams = 'Please enter a valid number'
      else if (finalMaxTeams <= 32) e.maxTeams = 'Custom teams must be greater than 32'
      else if (Math.log2(finalMaxTeams) % 1 !== 0) e.maxTeams = 'Must be a power of 2 (64, 128, etc.)'
    }

    const prizeNum = parseInt(tournForm.prize, 10)
    if (tournForm.prize && (isNaN(prizeNum) || prizeNum < 0 || prizeNum > 200000)) {
      e.prize = 'Must be a number between 0 and 200000'
    }

    setTournErrors(e)
    if (Object.keys(e).length) return

    setTournConfirm(true)
  }

  const confirmCreateTournament = async () => {
    if (isBeforeToday(tournForm.startDate) || isBeforeToday(tournForm.registrationDeadline)) {
      setTournErrors({
        ...(isBeforeToday(tournForm.startDate) ? { startDate: 'Start date must be today or later' } : {}),
        ...(isBeforeToday(tournForm.registrationDeadline) ? { registrationDeadline: 'Deadline must be today or later' } : {}),
      })
      setTournConfirm(false)
      return
    }

    if (tournForm.startDate && tournForm.registrationDeadline && new Date(tournForm.registrationDeadline) >= new Date(tournForm.startDate)) {
      setTournErrors({ registrationDeadline: 'Deadline must be before start date' })
      setTournConfirm(false)
      return
    }

    setTournConfirm(false)
    
    const isCustom = tournForm.maxTeams === 'custom'
    const finalMaxTeams = isCustom ? parseInt(tournForm.customMaxTeams, 10) : parseInt(tournForm.maxTeams, 10)

    const payload = {
      title: tournForm.title,
      game: tournForm.game,
      format: tournForm.format,
      maxTeams: finalMaxTeams,
      prizePool: tournForm.prize ? `PKR ${parseInt(tournForm.prize, 10).toLocaleString()}` : '',
      coverImage: tournForm.coverImage,
      organizer: user?.name,
      registeredTeams: 0,
      status: 'upcoming',
      startDate: tournForm.startDate,
      registrationDeadline: tournForm.registrationDeadline,
      description: `${tournForm.game} tournament in ${tournForm.format} format. Registration closes before matches begin.`,
    }

    const t = { id: 't' + Date.now(), ...payload }
    MockDB._tournaments.unshift(t) // add to top
    MockDB.addNotification({
      targetRole: 'manager',
      type: 'tournament',
      message: `<strong>${tournForm.title}</strong> registration is open for managers.`,
    })
    MockDB.addNotification({
      targetRole: 'player',
      type: 'tournament',
      message: `<strong>${tournForm.title}</strong> has been announced for ${tournForm.game}.`,
    })
    
    publish({ 
      title: 'New Tournament Available', 
      message: `${tournForm.title} for ${tournForm.game} is now open for registration!`, 
      type: 'info', 
      createdBy: user?.name 
    })

    toast.success('Tournament Created!', `${t.title} is now open for registration. 10-min undo window active.`)
    
    const timeout = setTimeout(() => {
      setTournUndoTimer(u => u?.id === t.id ? null : u)
      toast.info('Undo expired', 'The tournament creation is now permanent.')
    }, 10 * 60 * 1000)
    
    setTournUndoTimer({ id: t.id, timeout })
    
    setTournForm({ title: '', game: '', maxTeams: '16', customMaxTeams: '', prize: '', format: 'Single Elimination', coverImage: null, startDate: '', registrationDeadline: '' })
    setTournErrors({})
  }

  const handleUndoTournament = (id) => {
    if (tournUndoTimer?.id === id) {
      clearTimeout(tournUndoTimer.timeout)
      setTournUndoTimer(null)
    }
    const idx = MockDB._tournaments.findIndex(x => x.id === id)
    if (idx !== -1) MockDB._tournaments.splice(idx, 1)
    toast.warn('Tournament creation undone', 'The tournament has been deleted.')
  }
  
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large', 'Cover image must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setTournForm(f => ({ ...f, coverImage: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleClearAnn = () => {
    clearAnn()
    toast.info('Announcement cleared', 'The banner has been removed for all users.')
  }

  const confirmReject = () => {
    if (!rejectConfirm) return
    if (rejectConfirm.type === 'result') {
      const id = rejectConfirm.id
      setRejected(x => x.includes(id) ? x : [...x, id])
      setRejectConfirm(null)
      toast.error('Result rejected', 'The submitting team has been notified. 10-min undo window active.')
      const expiresAt = Date.now() + UNDO_WINDOW_MS
      const t = setTimeout(() => {
        setResultRejectUndoTimers(prev => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        toast.info('Undo expired', 'The result rejection is now permanent.')
      }, UNDO_WINDOW_MS)
      setResultRejectUndoTimers(prev => ({ ...prev, [id]: { timeout: t, expiresAt } }))
    } else {
      handleRejectTeam(rejectConfirm.id)
    }
  }

  const handleUndoResultRejection = (id) => {
    if (resultRejectUndoTimers[id]) {
      clearTimeout(resultRejectUndoTimers[id].timeout)
      setResultRejectUndoTimers(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
    setRejected(r => r.filter(x => x !== id))
    toast.warn('Rejection undone', 'The result has been moved back to pending.')
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
              <button className="btn btn--primary btn--lg" onClick={() => createTournRef.current?.scrollIntoView({ behavior: 'smooth' })}>Create Tournament</button>
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
                  const resultUndo = resultUndoTimers[r.id]
                  const resultRejectUndo = resultRejectUndoTimers[r.id]
                  return (
                    <div key={r.id} style={{padding:14,background:'var(--bg-3)',borderRadius:'var(--radius)',border:`1px solid ${isVerified ? 'var(--accent)' : isRejected ? 'var(--danger)' : 'var(--border)'}`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:'.875rem'}}>{r.match}</div>
                          <div style={{fontSize:'.75rem',color:'var(--text-muted)',marginTop:2}}>{r.stage} · Submitted {r.time} by {r.submittedBy}</div>
                        </div>
                        {isVerified ? <span className="badge badge--accent">Verified</span>
                          : isRejected ? <span className="badge badge--danger">Rejected</span>
                          : <span className="badge badge--warn">Pending</span>}
                      </div>
                      <div style={{display:'flex',gap:16,fontSize:'.8rem',marginBottom:12}}>
                        <span><span style={{color:'var(--text-muted)'}}>Winner: </span><strong style={{color:'var(--accent)'}}>{r.winner}</strong></span>
                        <span><span style={{color:'var(--text-muted)'}}>Score: </span><strong>{r.score}</strong></span>
                        {r.evidence && <span style={{color:'var(--blue)'}}>📎 Evidence attached</span>}
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        {isVerified ? (
                          resultUndo && (
                            <button className="btn btn--outline btn--sm" onClick={() => handleUndo(r.id)}>
                              ↩ Undo ({formatUndoTime(resultUndo.expiresAt, now)})
                            </button>
                          )
                        ) : isRejected ? (
                          resultRejectUndo && (
                            <button className="btn btn--outline btn--sm" onClick={() => handleUndoResultRejection(r.id)}>
                              â†© Undo Reject ({formatUndoTime(resultRejectUndo.expiresAt, now)})
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
                  const approvalUndo = teamUndoTimers[t.id]
                  const rejectionUndo = teamRejectUndoTimers[t.id]
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
                      {isApproved && approvalUndo && (
                        <div style={{display:'flex',gap:8}}>
                          <button className="btn btn--outline btn--sm" onClick={() => handleUndoTeamApproval(t.id)}>
                            ↩ Undo ({formatUndoTime(approvalUndo.expiresAt, now)})
                          </button>
                        </div>
                      )}
                      {isRejected && rejectionUndo && (
                        <div style={{display:'flex',gap:8}}>
                          <button className="btn btn--outline btn--sm" onClick={() => handleUndoTeamRejection(t.id)}>
                            Undo Reject ({formatUndoTime(rejectionUndo.expiresAt, now)})
                          </button>
                        </div>
                      )}
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
                <div className={`form-group ${annErrors.startTime ? 'has-error' : ''}`} style={{margin:0}}>
                  <label className="form-label">Start Time <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    min={todayMin}
                    max={annForm.endTime || undefined}
                    value={annForm.startTime}
                    onChange={e => setAnnForm(f => ({ ...f, startTime: e.target.value }))}
                    onClick={e => { try { e.target.showPicker() } catch {} }}
                  />
                  {annErrors.startTime && <div className="form-error" style={{display:'block'}}>{annErrors.startTime}</div>}
                </div>
                <div className={`form-group ${annErrors.endTime ? 'has-error' : ''}`} style={{margin:0}}>
                  <label className="form-label">End Time <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    min={annForm.startTime || todayMin}
                    value={annForm.endTime}
                    onChange={e => setAnnForm(f => ({ ...f, endTime: e.target.value }))}
                    onClick={e => { try { e.target.showPicker() } catch {} }}
                  />
                  {annErrors.endTime && <div className="form-error" style={{display:'block'}}>{annErrors.endTime}</div>}
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

          {/* ── Create Tournament ── */}
          <div ref={createTournRef} style={{marginBottom:32}}>
            <div className="section-header" style={{marginBottom:16}}>
              <div className="section-title">
                🏆 Create New Tournament
              </div>
            </div>
            <div className="card card__body">
              <div className="form-row" style={{marginBottom:16}}>
                <div className={`form-group ${tournErrors.title ? 'has-error' : ''}`} style={{margin:0}}>
                  <label className="form-label">Tournament Title <span style={{color:'var(--danger)'}}>*</span></label>
                  <input className="form-input" placeholder="e.g. Summer Championship" value={tournForm.title} onChange={e => setTournForm(f => ({ ...f, title: e.target.value }))} />
                  {tournErrors.title && <div className="form-error" style={{display:'block'}}>{tournErrors.title}</div>}
                </div>
                <div className={`form-group ${tournErrors.game ? 'has-error' : ''}`} style={{margin:0}}>
                  <label className="form-label">Game <span style={{color:'var(--danger)'}}>*</span></label>
                  <select className="form-select" value={tournForm.game} onChange={e => setTournForm(f => ({ ...f, game: e.target.value }))}>
                    <option value="">Select Game…</option>
                    {['Valorant', 'CS2', 'League of Legends', 'PUBG Mobile', 'Fortnite'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {tournErrors.game && <div className="form-error" style={{display:'block'}}>{tournErrors.game}</div>}
                </div>
              </div>
              <div className="form-row" style={{marginBottom:20}}>
                <div className="form-group" style={{margin:0}}>
                  <label className="form-label">Format</label>
                  <select className="form-select" value={tournForm.format} onChange={e => setTournForm(f => ({ ...f, format: e.target.value }))}>
                    <option value="Single Elimination">Single Elimination</option>
                    <option value="Double Elimination">Double Elimination</option>
                    <option value="Round Robin">Round Robin</option>
                  </select>
                </div>
                <div className={`form-group ${tournErrors.maxTeams ? 'has-error' : ''}`} style={{margin:0}}>
                  <label className="form-label">Max Teams <span className="text-muted" style={{fontWeight:400}}>(8, 16, 32, or power of 2 &gt; 32)</span></label>
                  <select className="form-select" value={tournForm.maxTeams} onChange={e => setTournForm(f => ({ ...f, maxTeams: e.target.value }))}>
                    <option value="8">8 Teams</option>
                    <option value="16">16 Teams</option>
                    <option value="32">32 Teams</option>
                    <option value="custom">Custom</option>
                  </select>
                  {tournForm.maxTeams === 'custom' && (
                    <input className="form-input" style={{marginTop:8}} type="number" placeholder="e.g. 64" value={tournForm.customMaxTeams} onChange={e => setTournForm(f => ({ ...f, customMaxTeams: e.target.value }))} />
                  )}
                  {tournErrors.maxTeams && <div className="form-error" style={{display:'block'}}>{tournErrors.maxTeams}</div>}
                </div>
                <div className={`form-group ${tournErrors.prize ? 'has-error' : ''}`} style={{margin:0}}>
                  <label className="form-label">Prize Pool (PKR)</label>
                  <input className="form-input" type="number" min="0" max="200000" placeholder="e.g. 50000" value={tournForm.prize} onChange={e => setTournForm(f => ({ ...f, prize: e.target.value }))} />
                  {tournErrors.prize && <div className="form-error" style={{display:'block'}}>{tournErrors.prize}</div>}
                </div>
              </div>
              <div className="form-row" style={{marginBottom:20}}>
                <div className={`form-group ${tournErrors.startDate ? 'has-error' : ''}`} style={{margin:0}}>
                  <label className="form-label">Start Date & Time <span style={{color:'var(--danger)'}}>*</span></label>
                  <input className="form-input" type="datetime-local" min={tournForm.registrationDeadline || todayMin} value={tournForm.startDate} onChange={e => setTournForm(f => ({ ...f, startDate: e.target.value }))} onClick={e => { try { e.target.showPicker() } catch {} }} />
                  {tournErrors.startDate && <div className="form-error" style={{display:'block'}}>{tournErrors.startDate}</div>}
                </div>
                <div className={`form-group ${tournErrors.registrationDeadline ? 'has-error' : ''}`} style={{margin:0}}>
                  <label className="form-label">Registration Deadline <span style={{color:'var(--danger)'}}>*</span></label>
                  <input className="form-input" type="datetime-local" min={todayMin} max={tournForm.startDate || undefined} value={tournForm.registrationDeadline} onChange={e => setTournForm(f => ({ ...f, registrationDeadline: e.target.value }))} onClick={e => { try { e.target.showPicker() } catch {} }} />
                  {tournErrors.registrationDeadline && <div className="form-error" style={{display:'block'}}>{tournErrors.registrationDeadline}</div>}
                </div>
              </div>
              <div className="form-group" style={{marginBottom:20}}>
                <label className="form-label">Tournament Cover Picture <span className="text-muted" style={{fontWeight:400}}>(optional, max 2MB)</span></label>
                <input className="form-input" type="file" accept="image/*" onChange={handleCoverImageChange} style={{padding: '8px 12px'}} />
                {tournForm.coverImage && (
                  <div style={{marginTop: 12, borderRadius: 'var(--radius)', overflow: 'hidden', height: 100, border: '1px solid var(--border)'}}>
                    <img src={tournForm.coverImage} alt="Cover preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  </div>
                )}
              </div>
              <button className="btn btn--primary btn--sm" onClick={handleCreateTournament}>
                Create Tournament
              </button>
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
                      const registeredTeams = t.registeredTeams ?? t.registered ?? 0
                      const pct = Math.round((registeredTeams / t.maxTeams) * 100)
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
                              <span style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{registeredTeams}/{t.maxTeams}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge--${t.status === 'live' ? 'live' : t.status === 'upcoming' ? 'blue' : 'accent'}`}>
                              {t.status === 'live' ? 'LIVE' : t.status === 'upcoming' ? 'Upcoming' : t.status}
                            </span>
                          </td>
                          <td>
                            <div style={{display:'flex', gap: 8}}>
                              {tournUndoTimer?.id === t.id && (
                                <button className="btn btn--outline btn--sm" onClick={e => { e.stopPropagation(); handleUndoTournament(t.id); }}>↩ Undo</button>
                              )}
                              <button className="btn btn--ghost btn--sm" onClick={e => { e.stopPropagation(); navigate(`/tournaments/${t.id}`) }}>Manage</button>
                            </div>
                          </td>
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

      {/* Tournament Creation Confirmation Modal */}
      <Modal
        open={tournConfirm}
        onClose={() => setTournConfirm(false)}
        title="Confirm Tournament Details"
        size="md"
        footer={
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn btn--ghost btn--sm" onClick={() => setTournConfirm(false)}>Cancel</button>
            <button className="btn btn--primary btn--sm" onClick={confirmCreateTournament}>Yes, Create Tournament</button>
          </div>
        }
      >
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Alert type="warn" title="Beware!">
            Once created, you can not edit the tournament details. You can only delete the tournament.
          </Alert>
          <div style={{padding:16,background:'var(--bg-3)',borderRadius:'var(--radius)'}}>
            <div style={{fontWeight:700,fontSize:'1.1rem',marginBottom:12}}>{tournForm.title}</div>
            <div className="grid-2" style={{gap:12,fontSize:'.9rem'}}>
              <div><span style={{color:'var(--text-muted)'}}>Game:</span> {tournForm.game}</div>
              <div><span style={{color:'var(--text-muted)'}}>Format:</span> {tournForm.format}</div>
              <div><span style={{color:'var(--text-muted)'}}>Max Teams:</span> {tournForm.maxTeams === 'custom' ? tournForm.customMaxTeams : tournForm.maxTeams}</div>
              <div><span style={{color:'var(--text-muted)'}}>Prize Pool:</span> {tournForm.prize ? `PKR ${parseInt(tournForm.prize, 10).toLocaleString()}` : 'None'}</div>
              <div><span style={{color:'var(--text-muted)'}}>Start Date:</span> {tournForm.startDate ? new Date(tournForm.startDate).toLocaleString() : 'TBA'}</div>
              <div><span style={{color:'var(--text-muted)'}}>Deadline:</span> {tournForm.registrationDeadline ? new Date(tournForm.registrationDeadline).toLocaleString() : 'TBA'}</div>
            </div>
            {tournForm.coverImage && (
              <div style={{marginTop: 16, borderRadius: 'var(--radius)', overflow: 'hidden', height: 120, border: '1px solid var(--border)'}}>
                <img src={tournForm.coverImage} alt="Cover preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </div>
            )}
          </div>
        </div>
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
              This action can be undone for 10 minutes. The {rejectConfirm.type === 'result' ? 'submitting team' : 'team manager'} will be notified.
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
