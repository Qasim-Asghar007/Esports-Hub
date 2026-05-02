import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Skeleton from '../components/Skeleton'
import { MockDB } from '../api/index'
import { useAuth } from '../hooks/useAuth'

const TABS = ['global','tournament']
const GAMES = ['All Games','Valorant','CS2','League of Legends']

export default function Leaderboard() {
  const { user } = useAuth()
  const [tab,         setTab]        = useState('global')
  const [game,        setGame]       = useState('All Games')
  const [pageLoading, setPageLoading]= useState(true)

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  const entries = MockDB._leaderboard || []
  const filtered = game === 'All Games' ? entries : entries.filter(e => e.game === game)

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  if (pageLoading) return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container">
          <div style={{ marginBottom:32 }}>
            <Skeleton width={100} height={12} style={{ marginBottom:8 }} />
            <Skeleton width="40%" height={36} style={{ marginBottom:8 }} />
            <Skeleton width="50%" height={14} />
          </div>
          <Skeleton.Table rows={10} cols={9} />
        </div>
      </div>
    </>
  )

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container">

          <div style={{marginBottom:32}}>
            <div className="label-sm" style={{color:'var(--accent)',marginBottom:8}}>LEADERBOARD</div>
            <h1 style={{fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',fontSize:'clamp(1.5rem,4vw,2.25rem)'}}>University Rankings</h1>
            <p className="text-secondary" style={{marginTop:4}}>Spring Semester 2025 · All tournaments</p>
          </div>

          {/* Top 3 podium */}
          {filtered.length >= 3 && (
            <div style={{display:'flex',alignItems:'flex-end',justifyContent:'center',gap:16,marginBottom:40,flexWrap:'wrap'}}>
              {/* 2nd */}
              <div style={{textAlign:'center',order:1}}>
                <div style={{width:72,height:72,borderRadius:'50%',background:'var(--blue-bg)',border:'3px solid var(--blue)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'1.2rem',fontWeight:700,color:'var(--blue)',margin:'0 auto 8px'}}>
                  {filtered[1]?.avatar || filtered[1]?.name?.slice(0,2).toUpperCase()}
                </div>
                <div style={{fontWeight:700,fontSize:'.875rem'}}>{filtered[1]?.name}</div>
                <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{filtered[1]?.wins}W · {filtered[1]?.winRate}%</div>
                <div style={{marginTop:8,background:'var(--blue)',color:'#fff',padding:'8px 20px',borderRadius:'var(--radius) var(--radius) 0 0',fontSize:'1.25rem',fontWeight:700}}>🥈</div>
                <div style={{height:60,background:'linear-gradient(to bottom, var(--blue), var(--blue-bg))',borderRadius:'0 0 var(--radius) var(--radius)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--blue)',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:'1.5rem'}}>2</div>
              </div>
              {/* 1st */}
              <div style={{textAlign:'center',order:0}}>
                <div style={{width:88,height:88,borderRadius:'50%',background:'var(--warn-bg)',border:'3px solid var(--warn)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'1.4rem',fontWeight:700,color:'var(--warn)',margin:'0 auto 8px'}}>
                  {filtered[0]?.avatar || filtered[0]?.name?.slice(0,2).toUpperCase()}
                </div>
                <div style={{fontWeight:700}}>{filtered[0]?.name}</div>
                <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{filtered[0]?.wins}W · {filtered[0]?.winRate}%</div>
                <div style={{marginTop:8,background:'var(--warn)',color:'#000',padding:'10px 24px',borderRadius:'var(--radius) var(--radius) 0 0',fontSize:'1.5rem',fontWeight:700}}>🥇</div>
                <div style={{height:80,background:'linear-gradient(to bottom, var(--warn), var(--warn-bg))',borderRadius:'0 0 var(--radius) var(--radius)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--warn)',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:'2rem'}}>1</div>
              </div>
              {/* 3rd */}
              <div style={{textAlign:'center',order:2}}>
                <div style={{width:64,height:64,borderRadius:'50%',background:'var(--danger-bg)',border:'3px solid var(--danger)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'1rem',fontWeight:700,color:'var(--danger)',margin:'0 auto 8px'}}>
                  {filtered[2]?.avatar || filtered[2]?.name?.slice(0,2).toUpperCase()}
                </div>
                <div style={{fontWeight:700,fontSize:'.875rem'}}>{filtered[2]?.name}</div>
                <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{filtered[2]?.wins}W · {filtered[2]?.winRate}%</div>
                <div style={{marginTop:8,background:'#cd7f32',color:'#fff',padding:'6px 18px',borderRadius:'var(--radius) var(--radius) 0 0',fontSize:'1.1rem',fontWeight:700}}>🥉</div>
                <div style={{height:40,background:'linear-gradient(to bottom, #cd7f32, rgba(205,127,50,.15))',borderRadius:'0 0 var(--radius) var(--radius)',display:'flex',alignItems:'center',justifyContent:'center',color:'#cd7f32',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:'1.25rem'}}>3</div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:20}}>
            <div style={{display:'flex',gap:4}}>
              {TABS.map(t => (
                <button key={t} className={`btn btn--sm ${tab===t?'btn--primary':'btn--ghost'}`} onClick={() => setTab(t)}>
                  {t === 'global' ? '🌐 Global' : '🏆 By Tournament'}
                </button>
              ))}
            </div>
            <select className="form-select" style={{width:'auto'}} value={game} onChange={e => setGame(e.target.value)}>
              {GAMES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="card">
            <div className="table-wrap" style={{border:'none',borderRadius:0}}>
              <table>
                <thead>
                  <tr>
                    <th style={{width:60}}>Rank</th>
                    <th>Player</th>
                    <th>Game</th>
                    <th>Team</th>
                    <th>W</th>
                    <th>L</th>
                    <th>Win %</th>
                    <th>K/D</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, i) => {
                    const isMe = user && (entry.name === user.name || entry.userId === user.id)
                    return (
                      <tr key={entry.id || i} style={{background: isMe ? 'rgba(0,229,160,.05)' : undefined}}>
                        <td style={{textAlign:'center',fontSize:'1.1rem',fontWeight:700}}>
                          {getRankIcon(i + 1)}
                        </td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <div style={{width:34,height:34,borderRadius:'50%',background:'var(--accent-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'.8rem',fontWeight:700,color:'var(--accent)',flexShrink:0}}>
                              {entry.avatar || entry.name?.slice(0,2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{fontWeight:700,display:'flex',alignItems:'center',gap:6}}>
                                {entry.name}
                                {isMe && <span className="badge badge--accent" style={{fontSize:'.65rem'}}>YOU</span>}
                              </div>
                              <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{entry.ign || entry.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{fontSize:'.8rem',color:'var(--text-muted)'}}>{entry.game || '—'}</td>
                        <td style={{fontSize:'.8rem'}}>{entry.team || '—'}</td>
                        <td style={{color:'var(--accent)',fontWeight:700}}>{entry.wins}</td>
                        <td style={{color:'var(--danger)',fontWeight:700}}>{entry.losses}</td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{height:4,width:50,background:'var(--bg-4)',borderRadius:2}}>
                              <div style={{height:'100%',width:`${entry.winRate}%`,background:'var(--accent)',borderRadius:2}} />
                            </div>
                            <span style={{fontSize:'.8rem',fontWeight:700,color:'var(--accent)'}}>{entry.winRate}%</span>
                          </div>
                        </td>
                        <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:'.875rem'}}>{entry.kd || '—'}</td>
                        <td style={{fontFamily:'JetBrains Mono,monospace',fontWeight:700,color:'var(--warn)'}}>{entry.points || entry.wins * 100}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
