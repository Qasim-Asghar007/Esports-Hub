import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { MockDB } from '../api/index'
import Modal from './Modal'

const LOGO = (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="rgba(0,229,160,0.15)"/>
    <path d="M8 16l8-8 8 8-8 8-8-8z" fill="none" stroke="#00e5a0" strokeWidth="2.5"/>
    <circle cx="16" cy="16" r="3" fill="#00e5a0"/>
  </svg>
)

const NAV_LINKS = [
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/bracket',     label: 'Bracket'     },
  { to: '/schedule',    label: 'Schedule'     },
  { to: '/leaderboard', label: 'Leaderboard'  },
]

function dashHref(role) {
  return { player: '/dashboard/player', manager: '/dashboard/manager', organizer: '/dashboard/organizer' }[role] || '/'
}

export default function Header() {
  const { user, isLoggedIn, logout, switchRole, triggerTutorial } = useAuth()
  const toast  = useToast()
  const loc    = useLocation()
  const nav    = useNavigate()

  const [searchQ,      setSearchQ]      = useState('')
  const [searchResults,setSearchResults] = useState([])
  const [showSearch,   setShowSearch]   = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const [helpOpen,     setHelpOpen]     = useState(false)
  const [mobileNavOpen,setMobileNavOpen]= useState(false)
  const [notifications, setNotifications] = useState(() => MockDB.notificationsFor(user))
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const dropRef   = useRef(null)
  const notifRef  = useRef(null)
  const searchRef = useRef(null)

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') { setDropdownOpen(false); setNotifOpen(false); setMobileNavOpen(false) }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', onKey) }
  }, [])

  useEffect(() => {
    setNotifications(MockDB.notificationsFor(user))
    setShowUnreadOnly(false)
  }, [user?.id, user?.role])

  // Search
  const handleSearch = (q) => {
    setSearchQ(q)
    if (!q.trim()) { setShowSearch(false); return }
    const matches = MockDB._tournaments
      .filter(t => t.title.toLowerCase().includes(q.toLowerCase()) || t.game.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 6)
    setSearchResults(matches)
    setShowSearch(true)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    const visibleIds = new Set(notifications.map(n => n.id))
    MockDB._notifications.forEach(n => {
      if (visibleIds.has(n.id)) n.read = true
    })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('Done', 'All notifications marked as read')
    setNotifOpen(false)
  }

  const handleRoleSwitch = (role) => {
    const u = switchRole(role)
    if (u) {
      toast.info('Role switched', `Now viewing as ${u.name}`)
      setTimeout(() => nav(dashHref(u.role)), 500)
    }
  }

  const handleLogout = async () => {
    await logout()
    nav('/login')
  }

  const roleHints = {
    player:    ['Check Next Match for your countdown','Confirm attendance 30 min before','Submit results with screenshots'],
    manager:   ['Register your team before the deadline','Keep roster full (5 core + 1 sub)','Check Pending Actions queue daily'],
    organizer: ['Verify results from the queue','10-min undo window after verification','Advance bracket only after both teams confirm'],
  }

  return (
    <>
      <header id="site-header">
        <nav className="nav">
          {/* Logo */}
          <Link to={isLoggedIn ? dashHref(user?.role) : '/'} className="nav__logo">
            {LOGO}
            Esports<span>Hub</span>
          </Link>

          {/* Search */}
          <div className="nav__search" ref={searchRef}>
            <span className="nav__search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </span>
            <input
              type="text"
              placeholder="Search tournaments…"
              value={searchQ}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => searchQ && setShowSearch(true)}
              autoComplete="off"
            />
            {showSearch && (
              <div className="nav__search-results open">
                {searchResults.length === 0
                  ? <div className="nav__search-result" style={{color:'var(--text-muted)',justifyContent:'center'}}>No results</div>
                  : searchResults.map(t => (
                    <Link
                      key={t.id}
                      className="nav__search-result"
                      to={`/tournaments/${t.id}`}
                      onClick={() => { setShowSearch(false); setSearchQ('') }}
                    >
                      <span className="nav__search-result-type">Tournament</span>
                      <span>{t.title}</span>
                      <span style={{marginLeft:'auto',fontSize:'.75rem',color:'var(--text-muted)'}}>{t.game}</span>
                    </Link>
                  ))
                }
              </div>
            )}
          </div>

          {/* Nav links */}
          <div className="nav__links">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} className={`nav__link ${loc.pathname === l.to ? 'active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="nav__actions">
            {isLoggedIn && user ? (
              <>
                {/* Role switcher */}
                <div className="nav__role-switcher">
                  {['player','manager','organizer'].map(r => (
                    <button
                      key={r}
                      className={`nav__role-btn ${user.role === r ? 'active' : ''}`}
                      data-role={r}
                      onClick={() => handleRoleSwitch(r)}
                    >
                      {r === 'manager' ? 'Mgr' : r === 'organizer' ? 'Org' : 'Player'}
                    </button>
                  ))}
                </div>

                {/* Notifications */}
                <div style={{position:'relative'}} ref={notifRef}>
                  <button
                    className="nav__icon-btn"
                    onClick={() => setNotifOpen(o => !o)}
                    title="Notifications"
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                    aria-expanded={notifOpen}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                    {unreadCount > 0 && <span className="badge-dot" />}
                  </button>
                  {notifOpen && (
                    <div className="notif-dropdown">
                      <div className="notif-dropdown__header">
                        <span className="notif-dropdown__title">Notifications</span>
                        {unreadCount > 0 && <span className="badge badge--danger" style={{fontSize:'.7rem'}}>{unreadCount} unread</span>}
                        <button
                          onClick={() => setShowUnreadOnly(v => !v)}
                          className={`notif-dropdown__filter ${showUnreadOnly ? 'active' : ''}`}
                        >
                          Unread only
                        </button>
                      </div>
                      <div className="notif-dropdown__list">
                        {(() => {
                          const filtered = showUnreadOnly ? notifications.filter(n => !n.read) : notifications
                          if (filtered.length === 0) return (
                            <div style={{padding:'24px 16px',textAlign:'center',color:'var(--text-muted)',fontSize:'.85rem'}}>
                              {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
                            </div>
                          )
                          return filtered.map((n, idx) => (
                            <div key={n.id}>
                              {idx > 0 && <div style={{height:1,background:'var(--border)',margin:'0 16px'}} />}
                              <div
                                className={`notif-item ${!n.read ? 'unread' : ''}`}
                                onClick={() => {
                                  const stored = MockDB._notifications.find(x => x.id === n.id)
                                  if (stored) stored.read = true
                                  setNotifications(prev => prev.map(x => x.id === n.id ? {...x, read:true} : x))
                                }}
                              >
                                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flexShrink:0,paddingTop:2}}>
                                  <div className={`notif-item__dot ${n.read ? 'notif-item__dot--read' : ''}`}/>
                                </div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div className="notif-item__text" dangerouslySetInnerHTML={{__html: n.message}}/>
                                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:4}}>
                                    <div className="notif-item__time">{n.time}</div>
                                    {!n.read && <span style={{fontSize:'.68rem',fontWeight:600,color:'var(--accent)',letterSpacing:'.04em'}}>NEW</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        })()}
                      </div>
                      <div className="notif-dropdown__footer">
                        <button className="btn btn--ghost btn--sm" onClick={markAllRead}>Mark all read</button>
                        <button className="btn btn--ghost btn--sm" onClick={() => setNotifOpen(false)}>Close</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Help */}
                <button className="nav__icon-btn" onClick={() => setHelpOpen(true)} title="Help" aria-label="Help">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </button>

                {/* Avatar + dropdown */}
                <div style={{ position:'relative' }} ref={dropRef}>
                  <div
                    className="nav__avatar"
                    role="button"
                    tabIndex={0}
                    aria-label="User menu"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    onClick={() => setDropdownOpen(o => !o)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setDropdownOpen(o => !o)}
                  >
                    {user.avatar || user.name?.slice(0,2).toUpperCase()}
                  </div>
                  {dropdownOpen && (
                    <div className="nav__dropdown open">
                      <div className="nav__dropdown-header">
                        <div className="nav__dropdown-name">{user.name}</div>
                        <div className="nav__dropdown-email">{user.email} · {user.role}</div>
                      </div>
                      <Link to={dashHref(user.role)} className="nav__dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        Dashboard
                      </Link>
                      <Link to="/profile" className="nav__dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        My Profile
                      </Link>
                      <div style={{height:1,background:'var(--border)',margin:'4px 0'}}/>
                      <button className="nav__dropdown-item danger" onClick={handleLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login"  className="btn btn--ghost btn--sm">Sign In</Link>
                <Link to="/signup" className="btn btn--primary btn--sm">Sign Up</Link>
              </>
            )}

            {/* Hamburger — visible only on mobile via CSS */}
            <button
              className="nav__hamburger"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileNavOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="mobile-nav-overlay open" onClick={e => { if (e.target === e.currentTarget) setMobileNavOpen(false) }}>
          <div className="mobile-nav-panel">
            <div className="mobile-nav-header">
              <span>Menu</span>
              <button className="nav__icon-btn" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {isLoggedIn && user && (
              <div className="mobile-nav-user">
                <div className="mobile-nav-user__name">{user.name}</div>
                <div className="mobile-nav-user__email">{user.email} · {user.role}</div>
              </div>
            )}

            <div className="mobile-nav-links">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`mobile-nav-link ${loc.pathname === l.to ? 'active' : ''}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {l.label}
                </Link>
              ))}

              {isLoggedIn && user && (
                <>
                  <div className="mobile-nav-divider" />
                  <Link to={dashHref(user.role)} className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                    My Profile
                  </Link>
                  <div className="mobile-nav-divider" />
                  <div style={{padding:'8px 14px',fontSize:'.75rem',color:'var(--text-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em'}}>Switch Role</div>
                  {['player','manager','organizer'].map(r => (
                    <button
                      key={r}
                      className={`mobile-nav-link ${user.role === r ? 'active' : ''}`}
                      onClick={() => { handleRoleSwitch(r); setMobileNavOpen(false) }}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                      {user.role === r && <span style={{marginLeft:'auto',fontSize:'.7rem',background:'var(--accent)',color:'var(--bg-0)',padding:'1px 6px',borderRadius:4}}>Active</span>}
                    </button>
                  ))}
                </>
              )}
            </div>

            {isLoggedIn && (
              <div className="mobile-nav-footer">
                <button className="btn btn--ghost btn--sm btn--full" style={{justifyContent:'center',color:'var(--danger)'}} onClick={() => { handleLogout(); setMobileNavOpen(false) }}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Modal */}
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title={`Quick Help — ${user?.role || 'Guide'}`} size="sm">
        <ul style={{display:'flex',flexDirection:'column',gap:12,listStyle:'none'}}>
          {(roleHints[user?.role] || roleHints.player).map((tip, i) => (
            <li key={i} style={{display:'flex',gap:10,fontSize:'.875rem',color:'var(--text-secondary)'}}>
              <span style={{color:'var(--accent)',fontWeight:700,flexShrink:0}}>→</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <div style={{marginTop:20,padding:14,background:'var(--accent-bg)',borderRadius:8,fontSize:'.8rem',color:'var(--accent)'}}>
          <strong>Demo logins:</strong> ali@giki.edu.pk · ahmed@giki.edu.pk · usman@giki.edu.pk<br/>
          Password: <code style={{background:'rgba(0,0,0,.2)',padding:'1px 6px',borderRadius:4}}>demo123</code>
        </div>
        {/* Tutorial replay button */}
        <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid var(--border)'}}>
          <button
            className="btn btn--outline btn--sm btn--full"
            style={{justifyContent:'center'}}
            onClick={() => { setHelpOpen(false); triggerTutorial() }}
          >
            🎓 Replay Onboarding Tutorial
          </button>
        </div>
      </Modal>
    </>
  )
}
