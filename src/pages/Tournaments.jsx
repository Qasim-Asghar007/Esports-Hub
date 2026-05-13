import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import TournamentCard from '../components/TournamentCard'
import Skeleton from '../components/Skeleton'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { MockDB } from '../api/index'

const GAMES   = ['All Games', 'Valorant', 'CS2', 'League of Legends', 'PUBG Mobile', 'Fortnite']
const STATUSES = ['All', 'live', 'upcoming', 'registration', 'completed']

export default function Tournaments() {
  const { isLoggedIn, user } = useAuth()
  const toast          = useToast()
  const navigate       = useNavigate()

  const [search,    setSearch]    = useState('')
  const [game,      setGame]      = useState('All Games')
  const [status,    setStatus]    = useState('All')
  const [sort,      setSort]      = useState('newest')
  const [registered,setRegistered]= useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Simulate initial data fetch (replace with real API call when backend connected)
  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const tournaments = useMemo(() => {
    let list = [...MockDB._tournaments]
    if (search.trim()) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.game.toLowerCase().includes(search.toLowerCase()))
    if (game !== 'All Games') list = list.filter(t => t.game === game)
    if (status !== 'All') list = list.filter(t => status === 'live' ? (t.status === 'live' || t.status === 'active') : t.status === status)
    if (sort === 'az')       list.sort((a,b) => a.title.localeCompare(b.title))
    if (sort === 'prize')    list.sort((a,b) => parseInt(b.prizePool || b.prize || 0) - parseInt(a.prizePool || a.prize || 0))
    if (sort === 'slots')    list.sort((a,b) => (b.maxTeams - (b.registeredTeams ?? b.registered ?? 0)) - (a.maxTeams - (a.registeredTeams ?? a.registered ?? 0)))
    return list
  }, [search, game, status, sort, refreshKey])

  const handleRegister = (t) => {
    if (!isLoggedIn) { navigate('/login'); return }
    setRegistered(r => [...r, t.id])
    toast.success('Registration started!', `Opening team registration for ${t.title}`)
    setTimeout(() => navigate('/register-team', { state: { tournamentId: t.id } }), 500)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return
    const idx = MockDB._tournaments.findIndex(t => t.id === id)
    if (idx !== -1) {
      MockDB._tournaments.splice(idx, 1)
      setRefreshKey(k => k + 1)
      toast.success('Tournament deleted successfully')
    }
  }

  const liveCount     = MockDB._tournaments.filter(t => t.status === 'live' || t.status === 'active').length
  const upcomingCount = MockDB._tournaments.filter(t => t.status === 'upcoming' || t.status === 'registration').length

  if (pageLoading) return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container">
          <div style={{ marginBottom:32 }}>
            <Skeleton width={100} height={12} style={{ marginBottom:8 }} />
            <Skeleton width="40%" height={36} style={{ marginBottom:8 }} />
            <Skeleton width="55%" height={14} />
          </div>
          <div style={{ height:80, background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', marginBottom:32 }} />
          <div className="grid-3">
            {[1,2,3,4,5,6].map(i => <Skeleton.TournamentCard key={i} />)}
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container">

          {/* Page header */}
          <div style={{marginBottom:32}}>
            <div className="label-sm" style={{color:'var(--accent)',marginBottom:8}}>TOURNAMENTS</div>
            <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
              <div>
                <h1 style={{fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',fontSize:'clamp(1.5rem,4vw,2.25rem)'}}>All Tournaments</h1>
                <p className="text-secondary" style={{marginTop:4}}>
                  {liveCount > 0 && <><span className="badge badge--live" style={{marginRight:8}}>LIVE</span>{liveCount} happening now · </>}
                  {upcomingCount} upcoming
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:20,marginBottom:32}}>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
              {/* Search */}
              <div style={{position:'relative',flex:'1 1 220px',minWidth:180}}>
                <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-faint)',pointerEvents:'none'}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </span>
                <input
                  className="form-input"
                  style={{paddingLeft:34}}
                  placeholder="Search tournaments…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {/* Game filter */}
              <select className="form-select" style={{flex:'0 0 160px'}} value={game} onChange={e => setGame(e.target.value)}>
                {GAMES.map(g => <option key={g}>{g}</option>)}
              </select>
              {/* Status filter */}
              <select className="form-select" style={{flex:'0 0 140px'}} value={status} onChange={e => setStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
              {/* Sort */}
              <select className="form-select" style={{flex:'0 0 140px'}} value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="az">A → Z</option>
                <option value="prize">By Prize</option>
                <option value="slots">Most Slots</option>
              </select>
              {(search || game !== 'All Games' || status !== 'All') && (
                <button className="btn btn--ghost btn--sm" onClick={() => { setSearch(''); setGame('All Games'); setStatus('All') }}>
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Count */}
          <div style={{marginBottom:20,color:'var(--text-muted)',fontSize:'.875rem'}}>
            Showing <strong style={{color:'var(--text-primary)'}}>{tournaments.length}</strong> tournament{tournaments.length !== 1 ? 's' : ''}
          </div>

          {/* Grid */}
          {tournaments.length === 0 ? (
            <div className="empty-state" style={{padding:'64px 0'}}>
              <div className="empty-state__icon">🔍</div>
              <div className="empty-state__title">No tournaments found</div>
              <div className="empty-state__desc">Try adjusting your filters</div>
              <button className="btn btn--outline btn--sm" style={{marginTop:16}} onClick={() => { setSearch(''); setGame('All Games'); setStatus('All') }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid-3">
              {tournaments.map(t => (
                (() => {
                  const registeredTeams = t.registeredTeams ?? t.registered ?? 0
                  const canRegisterTeam = user?.role === 'manager'
                    && (t.status === 'registration' || t.status === 'upcoming')
                    && registeredTeams < t.maxTeams
                  return (
                    <TournamentCard
                      key={t.id}
                      tournament={t}
                      actionLabel="Details"
                      registered={registered.includes(t.id)}
                      isOrganizer={user?.role === 'organizer'}
                      onDelete={handleDelete}
                      onRegister={canRegisterTeam ? handleRegister : null}
                    />
                  )
                })()
              ))}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}
