import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const ROLES = ['Duelist','Controller','Initiator','Sentinel','Flex']

const INITIAL_ROSTER = [
  { id:'p1', avatar:'AR', name:'Ahmed Raza',  ign:'PhoenixAR#001', role:'Duelist',    email:'ahmed@giki.edu.pk', status:'active',  online:true  },
  { id:'p2', avatar:'SM', name:'Sara Malik',  ign:'SaraM#999',     role:'Controller', email:'sara@giki.edu.pk',  status:'active',  online:true  },
  { id:'p3', avatar:'HA', name:'Hamza Ali',   ign:'HamzaGG#002',   role:'Initiator',  email:'hamza@giki.edu.pk', status:'active',  online:true  },
  { id:'p4', avatar:'OB', name:'Omar Baig',   ign:'OmarB#007',     role:'Sentinel',   email:'omar@giki.edu.pk',  status:'active',  online:false },
  { id:'p5', avatar:'ZK', name:'Zain Khan',   ign:'ZainK99#003',   role:'Flex',       email:'zain@giki.edu.pk',  status:'active',  online:false },
]

export default function Roster() {
  const { user } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()

  const [players,     setPlayers]     = useState(INITIAL_ROSTER)
  const [sub,         setSub]         = useState(null)
  const [editModal,   setEditModal]   = useState(null)   // player object
  const [addModal,    setAddModal]    = useState(false)
  const [addType,     setAddType]     = useState('core') // 'core' | 'sub'
  const [removeConfirm, setRemoveConfirm] = useState(null)
  const [editForm,    setEditForm]    = useState({})
  const [newPlayer,   setNewPlayer]   = useState({ name:'', ign:'', role:'', email:'' })
  const [errors,      setErrors]      = useState({})

  const isManager = user?.role === 'manager' || true // allow everyone in demo

  const openEdit = (p) => { setEditForm({...p}); setEditModal(p) }

  const saveEdit = () => {
    if (!editForm.name.trim()) { setErrors({name:'Name required'}); return }
    if (!editForm.ign.trim())  { setErrors({ign:'IGN required'}); return }
    setPlayers(ps => ps.map(p => p.id === editForm.id ? editForm : p))
    setEditModal(null)
    setErrors({})
    toast.success('Player updated', `${editForm.name}'s info has been saved.`)
  }

  const removePlayer = (id) => {
    setPlayers(ps => ps.filter(p => p.id !== id))
    setRemoveConfirm(null)
    toast.warn('Player removed', 'The player has been removed from the roster.')
  }

  const addPlayer = () => {
    if (!newPlayer.name.trim()) { setErrors({npName:'Name required'}); return }
    if (!newPlayer.ign.trim())  { setErrors({npIgn:'IGN required'}); return }
    if (!newPlayer.role)        { setErrors({npRole:'Role required'}); return }
    const np = { id:`p${Date.now()}`, avatar: newPlayer.name.slice(0,2).toUpperCase(), ...newPlayer, status:'active', online:false }
    if (addType === 'sub') { setSub(np) }
    else { setPlayers(ps => [...ps, np]) }
    setNewPlayer({ name:'', ign:'', role:'', email:'' })
    setAddModal(false)
    setErrors({})
    toast.success('Player added', `${np.name} has been added to the roster.`)
  }

  const readyCount = players.filter(p => p.status === 'active').length

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container" style={{maxWidth:800}}>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16,marginBottom:32}}>
            <div>
              <div className="label-sm" style={{color:'var(--warn)',marginBottom:6}}>TEAM MANAGEMENT</div>
              <h1 style={{fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',fontSize:'clamp(1.4rem,3vw,2rem)'}}>Nova Esports Roster</h1>
              <p className="text-secondary" style={{marginTop:4}}>Spring University Cup 2025</p>
            </div>
            <div style={{display:'flex',gap:8}}>
              {players.length < 5 && (
                <button className="btn btn--primary btn--sm" onClick={() => { setAddType('core'); setAddModal(true) }}>+ Add Player</button>
              )}
              {!sub && (
                <button className="btn btn--outline btn--sm" onClick={() => { setAddType('sub'); setAddModal(true) }}>+ Add Sub</button>
              )}
            </div>
          </div>

          {/* Status banner */}
          {readyCount >= 5
            ? <Alert type="success" style={{marginBottom:24}} title={`${readyCount}/5 core players · ${sub ? '1 sub' : 'No sub'}`}>
                Your roster is complete and ready to compete.
              </Alert>
            : <Alert type="warn" style={{marginBottom:24}} title={`${readyCount}/5 players · Roster incomplete`}>
                Add {5 - readyCount} more player{5 - readyCount > 1 ? 's' : ''} to complete your roster.
              </Alert>
          }

          {/* Core Roster */}
          <div className="section-header" style={{marginBottom:12}}>
            <div className="section-title">Core Players (5)</div>
          </div>
          <div className="card card__body" style={{display:'flex',flexDirection:'column',gap:0,marginBottom:24,padding:0,overflow:'hidden'}}>
            {players.map((p, i) => (
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 20px',borderBottom: i<players.length-1 ? '1px solid var(--border)' : 'none'}}>
                {/* Avatar */}
                <div style={{position:'relative',flexShrink:0}}>
                  <div style={{width:44,height:44,borderRadius:'50%',background:'var(--accent-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'.9rem',fontWeight:700,color:'var(--accent)'}}>
                    {p.avatar}
                  </div>
                  <div style={{position:'absolute',bottom:1,right:1,width:10,height:10,borderRadius:'50%',background:p.online ? 'var(--accent)' : 'var(--bg-4)',border:'2px solid var(--bg-2)'}} />
                </div>
                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                  <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{p.role} · {p.ign}</div>
                </div>
                {/* Email */}
                <div style={{fontSize:'.75rem',color:'var(--text-faint)',display:'none',flex:'0 0 auto'}} className="hide-mobile">{p.email}</div>
                {/* Status */}
                <span className="badge badge--accent">Ready</span>
                {/* Actions */}
                {isManager && (
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <button className="btn btn--ghost btn--icon-sm" title="Edit" onClick={() => openEdit(p)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="btn btn--ghost btn--icon-sm" title="Remove" style={{color:'var(--danger)'}} onClick={() => setRemoveConfirm(p)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
            {players.length === 0 && (
              <div className="empty-state" style={{padding:'32px 0'}}>
                <div className="empty-state__icon">👥</div>
                <div className="empty-state__desc">No players yet. Add your first player.</div>
              </div>
            )}
          </div>

          {/* Substitute */}
          <div className="section-header" style={{marginBottom:12}}>
            <div className="section-title">Substitute (Optional)</div>
          </div>
          <div className="card card__body" style={{marginBottom:32}}>
            {sub ? (
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:'var(--blue-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'.9rem',fontWeight:700,color:'var(--blue)',flexShrink:0}}>
                  {sub.avatar}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700}}>{sub.name}</div>
                  <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>Sub · {sub.ign}</div>
                </div>
                <span className="badge badge--blue">Sub</span>
                <button className="btn btn--ghost btn--icon-sm" style={{color:'var(--danger)'}} onClick={() => { setSub(null); toast.warn('Sub removed','') }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            ) : (
              <div style={{display:'flex',alignItems:'center',gap:14,borderStyle:'dashed',border:'2px dashed var(--border)',borderRadius:'var(--radius)',padding:14}}>
                <div style={{width:44,height:44,borderRadius:'50%',border:'2px dashed var(--text-faint)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-faint)',fontSize:'1.2rem',flexShrink:0}}>+</div>
                <div style={{flex:1}}>
                  <div style={{color:'var(--text-muted)',fontWeight:600}}>No substitute added</div>
                  <div style={{fontSize:'.75rem',color:'var(--text-faint)'}}>Optional — covers in case of emergency</div>
                </div>
                <button className="btn btn--outline btn--sm" onClick={() => { setAddType('sub'); setAddModal(true) }}>Add Sub</button>
              </div>
            )}
          </div>

          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <Link to="/dashboard/manager" className="btn btn--ghost btn--sm">← Back to Dashboard</Link>
            <Link to="/register-team"     className="btn btn--primary btn--sm">Register for Tournament</Link>
          </div>

        </div>
      </div>

      {/* Edit Player Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Player" size="sm"
        footer={
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn btn--ghost btn--sm" onClick={() => setEditModal(null)}>Cancel</button>
            <button className="btn btn--primary btn--sm" onClick={saveEdit}>Save Changes</button>
          </div>
        }
      >
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={editForm.name||''} onChange={e => setEditForm(f=>({...f,name:e.target.value}))} />
            {errors.name && <div className="form-error" style={{display:'block'}}>{errors.name}</div>}
          </div>
          <div className={`form-group ${errors.ign ? 'has-error' : ''}`}>
            <label className="form-label">IGN *</label>
            <input className="form-input" value={editForm.ign||''} onChange={e => setEditForm(f=>({...f,ign:e.target.value}))} />
            {errors.ign && <div className="form-error" style={{display:'block'}}>{errors.ign}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={editForm.role||''} onChange={e => setEditForm(f=>({...f,role:e.target.value}))}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={editForm.email||''} onChange={e => setEditForm(f=>({...f,email:e.target.value}))} />
          </div>
        </div>
      </Modal>

      {/* Add Player Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title={addType === 'sub' ? 'Add Substitute' : 'Add Player'} size="sm"
        footer={
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn btn--ghost btn--sm" onClick={() => setAddModal(false)}>Cancel</button>
            <button className="btn btn--primary btn--sm" onClick={addPlayer}>Add Player</button>
          </div>
        }
      >
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className={`form-group ${errors.npName ? 'has-error' : ''}`}>
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={newPlayer.name} onChange={e => setNewPlayer(p=>({...p,name:e.target.value}))} placeholder="Player Name" />
            {errors.npName && <div className="form-error" style={{display:'block'}}>{errors.npName}</div>}
          </div>
          <div className={`form-group ${errors.npIgn ? 'has-error' : ''}`}>
            <label className="form-label">IGN *</label>
            <input className="form-input" value={newPlayer.ign} onChange={e => setNewPlayer(p=>({...p,ign:e.target.value}))} placeholder="PlayerName#001" />
            {errors.npIgn && <div className="form-error" style={{display:'block'}}>{errors.npIgn}</div>}
          </div>
          <div className={`form-group ${errors.npRole ? 'has-error' : ''}`}>
            <label className="form-label">Role *</label>
            <select className="form-select" value={newPlayer.role} onChange={e => setNewPlayer(p=>({...p,role:e.target.value}))}>
              <option value="">Select…</option>
              {[...ROLES, 'Substitute'].map(r => <option key={r}>{r}</option>)}
            </select>
            {errors.npRole && <div className="form-error" style={{display:'block'}}>{errors.npRole}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={newPlayer.email} onChange={e => setNewPlayer(p=>({...p,email:e.target.value}))} placeholder="player@giki.edu.pk" />
          </div>
        </div>
      </Modal>

      {/* Remove Confirm Modal */}
      <Modal open={!!removeConfirm} onClose={() => setRemoveConfirm(null)} title="Remove Player" size="sm"
        footer={
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button className="btn btn--ghost btn--sm" onClick={() => setRemoveConfirm(null)}>Cancel</button>
            <button className="btn btn--danger btn--sm" onClick={() => removePlayer(removeConfirm?.id)}>Remove</button>
          </div>
        }
      >
        {removeConfirm && (
          <Alert type="danger" title={`Remove ${removeConfirm.name}?`}>
            This will remove them from the roster. You'll need to re-add them if you change your mind.
          </Alert>
        )}
      </Modal>
    </>
  )
}
