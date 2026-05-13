import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Countdown from '../components/Countdown'
import Alert from '../components/Alert'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { MockDB } from '../api/index'

const GAME_COLORS = {
  Valorant:          { from:'#ff4655', to:'#bd3944' },
  CS2:               { from:'#f0a500', to:'#b37b00' },
  'League of Legends':{ from:'#c89b3c', to:'#785a28' },
  'PUBG Mobile':     { from:'#f5a623', to:'#c17d0a' },
  Fortnite:          { from:'#00d4ff', to:'#0099cc' },
}

const TABS = ['overview','bracket','teams','schedule','rules']

const formatScore = (score) => {
  if (!score) return 'Completed'
  if (typeof score === 'string') return score
  if (typeof score === 'object') {
    const left = score.team1 ?? score.teamA ?? 0
    const right = score.team2 ?? score.teamB ?? 0
    return `${left}-${right}`
  }
  return String(score)
}

export default function TournamentDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const toast      = useToast()
  const { isLoggedIn, user } = useAuth()

  const [tab,        setTab]        = useState('overview')
  const [registered, setRegistered] = useState(false)

  const tournament = MockDB._tournaments.find(t => t.id === id) || MockDB._tournaments[0]
  const colors     = GAME_COLORS[tournament.game] || { from:'#00e5a0', to:'#00b37a' }
  const registeredTeams = tournament.registeredTeams ?? tournament.registered ?? 0
  const startDate = tournament.startDate ?? tournament.date
  const endDate = tournament.endDate
  const deadline = tournament.registrationDeadline ?? tournament.deadline
  const prizePool = tournament.prizePool ?? tournament.prize
  const tournamentTeams = MockDB._teams.filter(team => (team.tournamentId ?? team.tournament) === tournament.id)
  const tournamentMatches = MockDB._matches.filter(match => (match.tournamentId ?? match.tournament) === tournament.id)
  const displayTeams = tournamentTeams.length
    ? tournamentTeams
    : Array.from({ length: Math.min(registeredTeams, 6) }, (_, i) => ({
      id: `${tournament.id}-seed-${i + 1}`,
      name: `${tournament.game} Seed ${i + 1}`,
      status: 'approved',
      roster: Array.from({ length: tournament.teamSize || 5 }),
    }))
  const pct        = Math.round((registeredTeams / tournament.maxTeams) * 100)
  const isLive     = tournament.status === 'live' || tournament.status === 'active'

  const handleRegister = () => {
    if (!isLoggedIn) { navigate('/login'); return }
    setRegistered(true)
    toast.success('Registration started!', 'Complete your team registration to secure your spot.')
    navigate('/register-team')
  }

  const PRIZE_SPLITS = [
    { place:'🥇 1st Place', prize: tournament.prizePool ? `PKR ${Math.round(parseInt(tournament.prizePool.replace(/\D/g,'')) * 0.5).toLocaleString()}` : 'TBA' },
    { place:'🥈 2nd Place', prize: tournament.prizePool ? `PKR ${Math.round(parseInt(tournament.prizePool.replace(/\D/g,'')) * 0.3).toLocaleString()}` : 'TBA' },
    { place:'🥉 3rd Place', prize: tournament.prizePool ? `PKR ${Math.round(parseInt(tournament.prizePool.replace(/\D/g,'')) * 0.2).toLocaleString()}` : 'TBA' },
  ]

  return (
    <>
      <Header />

      {/* Banner */}
      <div style={{background:`linear-gradient(135deg, ${colors.from}22, ${colors.to}11)`,borderBottom:'1px solid var(--border)',padding:'40px 0 0'}}>
        <div className="container">
          <div style={{marginBottom:20}}>
            <Link to="/tournaments" style={{color:'var(--text-muted)',fontSize:'.875rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Back to Tournaments
            </Link>
          </div>
          <div style={{display:'flex',alignItems:'flex-start',gap:24,flexWrap:'wrap',marginBottom:24}}>
            {/* Game icon */}
            <div style={{width:80,height:80,borderRadius:'var(--radius-lg)',background:`linear-gradient(135deg,${colors.from},${colors.to})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',flexShrink:0}}>
              {tournament.game === 'Valorant' ? '🎯' : tournament.game === 'CS2' ? '💣' : tournament.game === 'League of Legends' ? '⚔️' : '🎮'}
            </div>
            <div style={{flex:1,minWidth:200}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,flexWrap:'wrap'}}>
                {isLive && <span className="badge badge--live">LIVE</span>}
                <span className="badge badge--blue">{tournament.game}</span>
                <span style={{fontSize:'.8rem',color:'var(--text-muted)'}}>{tournament.format}</span>
              </div>
              <h1 style={{fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',fontSize:'clamp(1.5rem,4vw,2rem)',marginBottom:8}}>{tournament.title}</h1>
              <p className="text-secondary">{tournament.description || `Compete in ${tournament.game} and claim the championship. Register your team today.`}</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
              {user?.role === 'organizer' && (
                <button className="btn btn--danger btn--lg" style={{marginBottom: 8}} onClick={() => {
                  if (window.confirm('Are you sure you want to delete this tournament?')) {
                    const idx = MockDB._tournaments.findIndex(x => x.id === tournament.id)
                    if (idx !== -1) MockDB._tournaments.splice(idx, 1)
                    toast.success('Tournament deleted')
                    navigate('/tournaments')
                  }
                }}>Delete Tournament</button>
              )}
              {tournament.status === 'registration' && !registered && user?.role === 'manager' && (
                <button className="btn btn--primary btn--lg" onClick={handleRegister}>Register Team</button>
              )}
              {registered && <span className="badge badge--accent" style={{fontSize:'.875rem',padding:'8px 16px'}}>✓ Registration Started</span>}
              {isLive && <Link to="/bracket" className="btn btn--outline btn--sm">View Bracket</Link>}
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:2,borderBottom:'1px solid var(--border)',marginBottom:0}}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{padding:'10px 20px',background:'none',border:'none',cursor:'pointer',color:tab===t?'var(--accent)':'var(--text-muted)',borderBottom:`2px solid ${tab===t?'var(--accent)':'transparent'}`,fontWeight:tab===t?700:400,textTransform:'capitalize',transition:'all var(--t-fast)',fontSize:'.875rem'}}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-wrapper" style={{paddingTop:32}}>
        <div className="container">

          {tab === 'overview' && (
            <div className="grid-2" style={{alignItems:'start'}}>
              <div style={{display:'flex',flexDirection:'column',gap:24}}>
                {/* Info cards */}
                <div className="card card__body">
                  <div style={{fontWeight:700,marginBottom:16,fontSize:'.9rem',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-muted)'}}>Tournament Info</div>
                  {[
                    { label:'Status',     value: <span className={`badge badge--${isLive?'live':tournament.status==='upcoming'?'blue':'accent'}`}>{isLive?'LIVE':tournament.status}</span> },
                    { label:'Format',     value: tournament.format || 'Single Elimination' },
                    { label:'Platform',   value: tournament.platform || 'PC' },
                    { label:'Organizer',  value: tournament.organizer || 'GIKI Esports Club' },
                    { label:'Max Teams',  value: `${tournament.maxTeams} teams` },
                    { label:'Registered', value: `${registeredTeams} / ${tournament.maxTeams}` },
                    { label:'Prize Pool', value: <strong style={{color:'var(--warn)'}}>{prizePool || 'TBA'}</strong> },
                    { label:'Start Date', value: startDate ? new Date(startDate).toLocaleString() : 'TBA' },
                    { label:'End Date',   value: endDate ? new Date(endDate).toLocaleString() : 'TBA' },
                    { label:'Deadline',   value: deadline ? new Date(deadline).toLocaleString() : 'TBA' },
                  ].map(row => (
                    <div key={row.label} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:'.875rem',gap:16}}>
                      <span style={{color:'var(--text-muted)',flexShrink:0}}>{row.label}</span>
                      <span style={{textAlign:'right'}}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Prize breakdown */}
                <div className="card card__body">
                  <div style={{fontWeight:700,marginBottom:16,fontSize:'.9rem',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-muted)'}}>Prize Distribution</div>
                  {PRIZE_SPLITS.map(p => (
                    <div key={p.place} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)',fontSize:'.875rem'}}>
                      <span>{p.place}</span>
                      <strong style={{color:'var(--warn)'}}>{p.prize}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:24}}>
                {/* Registration progress */}
                <div className="card card__body">
                  <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-muted)'}}>Registration</div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:'.875rem',color:'var(--text-muted)'}}>Slots filled</span>
                    <span style={{fontWeight:700}}>{registeredTeams}/{tournament.maxTeams}</span>
                  </div>
                  <div style={{height:8,background:'var(--bg-4)',borderRadius:4,overflow:'hidden',marginBottom:12}}>
                    <div style={{height:'100%',width:`${pct}%`,background:pct>80?'var(--danger)':pct>60?'var(--warn)':'var(--accent)',borderRadius:4,transition:'width .4s ease'}} />
                  </div>
                  {pct > 80 && <Alert type="warn" style={{marginBottom:12}}>Only {tournament.maxTeams - registeredTeams} spots left!</Alert>}
                  {tournament.status === 'registration' && !registered && user?.role === 'manager' && (
                    <button className="btn btn--primary btn--full" onClick={handleRegister}>Register Your Team</button>
                  )}
                  {deadline && (
                    <div style={{marginTop:12,textAlign:'center'}}>
                      <div style={{fontSize:'.75rem',color:'var(--text-muted)',marginBottom:8}}>REGISTRATION CLOSES IN</div>
                      <Countdown target={new Date(deadline).toISOString()} size="sm" />
                    </div>
                  )}
                </div>

                {/* Recent results in this tournament */}
                <div className="card card__body">
                  <div style={{fontWeight:700,marginBottom:12,fontSize:'.9rem',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-muted)'}}>Latest Results</div>
                  {tournamentMatches.slice(0,3).map(m => (
                    <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:'.8rem'}}>
                      <span style={{color:'var(--text-muted)'}}>{m.team1?.name || m.teamA || 'TBD'} vs {m.team2?.name || m.teamB || 'TBD'}</span>
                      <span className={`badge badge--${m.status === 'completed' ? 'accent' : 'blue'}`}>{m.status === 'completed' ? formatScore(m.score) : m.status}</span>
                    </div>
                  ))}
                  {tournamentMatches.length === 0 && (
                    <div style={{padding:'12px 0',fontSize:'.85rem',color:'var(--text-muted)'}}>No results have been posted yet.</div>
                  )}
                  <Link to="/bracket" className="btn btn--ghost btn--sm" style={{marginTop:12,width:'100%',justifyContent:'center'}}>View Full Bracket</Link>
                </div>
              </div>
            </div>
          )}

          {tab === 'bracket' && (
            <div style={{textAlign:'center',padding:'40px 0'}}>
              <div style={{marginBottom:16,fontSize:'2rem'}}>🏆</div>
              <h3 style={{marginBottom:8}}>View the Full Bracket</h3>
              <p className="text-secondary" style={{marginBottom:24}}>See all match-ups and track the path to the championship.</p>
              <Link to="/bracket" className="btn btn--primary btn--lg">Open Bracket View</Link>
            </div>
          )}

          {tab === 'teams' && (
            <div>
              <div className="grid-3">
                {displayTeams.map(team => (
                  <div key={team.id} className="card card__body">
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                      <div style={{width:44,height:44,borderRadius:'var(--radius)',background:'var(--accent-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'1rem',fontWeight:700,color:'var(--accent)',flexShrink:0}}>
                        {team.name.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:'.9rem'}}>{team.name}</div>
                        <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>Seed #{team.seed || Math.floor(Math.random()*16)+1}</div>
                      </div>
                      <span className={`badge badge--${team.status === 'approved' ? 'accent' : 'blue'}`} style={{marginLeft:'auto'}}>
                        {team.status === 'approved' ? 'Active' : 'Registered'}
                      </span>
                    </div>
                    <div style={{fontSize:'.8rem',color:'var(--text-muted)'}}>{team.players?.length || team.roster?.length || tournament.teamSize || 5}/{tournament.teamSize || 5} players</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'schedule' && (
            <div>
              <div className="card">
                <div className="table-wrap" style={{border:'none',borderRadius:0}}>
                  <table>
                    <thead><tr><th>Match</th><th>Stage</th><th>Date & Time</th><th>Status</th></tr></thead>
                    <tbody>
                      {tournamentMatches.map(m => (
                        <tr key={m.id} style={{cursor:'pointer'}} onClick={() => navigate(`/match/${m.id}`)}>
                          <td><strong>{m.team1?.name || m.teamA || 'TBD'}</strong> vs <strong>{m.team2?.name || m.teamB || 'TBD'}</strong></td>
                          <td>{m.stage || 'Quarterfinal'}</td>
                          <td style={{color:'var(--text-muted)'}}>{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : 'TBD'}</td>
                          <td><span className={`badge badge--${m.status==='completed'?'accent':m.status==='live'?'live':'blue'}`}>{m.status}</span></td>
                        </tr>
                      ))}
                      {tournamentMatches.length === 0 && (
                        <tr>
                          <td colSpan="4" style={{textAlign:'center',color:'var(--text-muted)',padding:24}}>No matches scheduled yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'rules' && (
            <div className="card card__body" style={{maxWidth:720}}>
              <h3 style={{marginBottom:16}}>Tournament Rules</h3>
              {[
                { title:'Eligibility', body:'All players must be currently enrolled university students. Each player may only represent one team per tournament.' },
                { title:'Team Composition', body:'Teams must have 5 core players and may register 1 substitute. All team members must be confirmed before the registration deadline.' },
                { title:'Match Format', body:`All matches are played in ${tournament.format || 'Single Elimination'} format. Finals are Best of 5; all other rounds are Best of 3.` },
                { title:'Check-in', body:'Teams must confirm attendance at least 30 minutes before the scheduled match time. Failure to check in results in a forfeit.' },
                { title:'Result Submission', body:'The winning team must submit a screenshot as evidence within 15 minutes of match completion. Organizers will verify and advance the bracket.' },
                { title:'Disputes', body:'Disputes must be submitted within 10 minutes of result posting. The organizer\'s decision is final.' },
              ].map(rule => (
                <div key={rule.title} style={{marginBottom:20,paddingBottom:20,borderBottom:'1px solid var(--border)'}}>
                  <div style={{fontWeight:700,marginBottom:6,color:'var(--accent)'}}>{rule.title}</div>
                  <p style={{fontSize:'.875rem',color:'var(--text-secondary)',lineHeight:1.6}}>{rule.body}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}
