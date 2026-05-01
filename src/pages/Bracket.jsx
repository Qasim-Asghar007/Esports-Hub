import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

// 16-team bracket data
const ROUNDS = [
  {
    name: 'Quarter Finals',
    matches: [
      { id:'qf1', teamA:'Nova Esports',   teamB:'Phoenix Squad',  scoreA:2, scoreB:0, winner:'Nova Esports',   status:'completed' },
      { id:'qf2', teamA:'Storm Riders',   teamB:'Cyber Wolves',   scoreA:2, scoreB:1, winner:'Storm Riders',   status:'completed' },
      { id:'qf3', teamA:'Lunar Force',    teamB:'BlazeCore',      scoreA:0, scoreB:2, winner:'BlazeCore',      status:'completed' },
      { id:'qf4', teamA:'Iron Wolves',    teamB:'Nexus Gaming',   scoreA:null, scoreB:null, winner:null,        status:'upcoming'  },
    ]
  },
  {
    name: 'Semi Finals',
    matches: [
      { id:'sf1', teamA:'Nova Esports',   teamB:'Storm Riders',   scoreA:null, scoreB:null, winner:null, status:'upcoming' },
      { id:'sf2', teamA:'BlazeCore',      teamB:'TBD',            scoreA:null, scoreB:null, winner:null, status:'pending'  },
    ]
  },
  {
    name: 'Grand Final',
    matches: [
      { id:'gf1', teamA:'TBD',            teamB:'TBD',            scoreA:null, scoreB:null, winner:null, status:'pending'  },
    ]
  },
]

function MatchCard({ match, onSelect, selected }) {
  const isCompleted = match.status === 'completed'
  const isLive      = match.status === 'live'

  return (
    <div
      onClick={() => match.status !== 'pending' && onSelect(match)}
      style={{
        background:'var(--bg-2)',
        border:`1px solid ${selected ? 'var(--accent)' : isLive ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius:'var(--radius)',
        overflow:'hidden',
        cursor: match.status !== 'pending' ? 'pointer' : 'default',
        transition:'all var(--t-fast)',
        minWidth:200,
      }}
    >
      {isLive && (
        <div style={{background:'var(--danger)',padding:'2px 8px',fontSize:'.65rem',fontWeight:700,letterSpacing:'.08em',textAlign:'center'}}>
          ● LIVE
        </div>
      )}
      {[
        { name: match.teamA, score: match.scoreA, isWinner: match.winner === match.teamA },
        { name: match.teamB, score: match.scoreB, isWinner: match.winner === match.teamB },
      ].map((team, i) => (
        <div key={i} style={{
          display:'flex',
          alignItems:'center',
          gap:8,
          padding:'8px 12px',
          background: team.isWinner ? 'rgba(0,229,160,.08)' : 'transparent',
          borderBottom: i === 0 ? '1px solid var(--border)' : 'none',
        }}>
          <div style={{
            width:24,height:24,borderRadius:4,
            background: team.name === 'TBD' ? 'var(--bg-4)' : 'var(--accent-bg)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'.6rem',fontWeight:700,
            color: team.name === 'TBD' ? 'var(--text-faint)' : 'var(--accent)',
            flexShrink:0,
          }}>
            {team.name === 'TBD' ? '?' : team.name.slice(0,2).toUpperCase()}
          </div>
          <span style={{
            fontSize:'.8rem',
            fontWeight: team.isWinner ? 700 : 400,
            color: team.name === 'TBD' ? 'var(--text-faint)' : team.isWinner ? 'var(--accent)' : 'var(--text-secondary)',
            flex:1,
            whiteSpace:'nowrap',
            overflow:'hidden',
            textOverflow:'ellipsis',
          }}>
            {team.name}
          </span>
          {isCompleted && team.score !== null && (
            <span style={{
              fontFamily:'JetBrains Mono,monospace',
              fontWeight:700,
              fontSize:'.875rem',
              color: team.isWinner ? 'var(--accent)' : 'var(--text-muted)',
              flexShrink:0,
            }}>
              {team.score}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Bracket() {
  const navigate    = useNavigate()
  const [selected,  setSelected]  = useState(null)
  const [tournament, setTournament] = useState('Spring University Cup 2025')

  const completedCount = ROUNDS.flatMap(r => r.matches).filter(m => m.status === 'completed').length

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="container">

          {/* Header */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:32}}>
            <div>
              <div className="label-sm" style={{color:'var(--accent)',marginBottom:6}}>BRACKET</div>
              <h1 style={{fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',fontSize:'clamp(1.5rem,4vw,2.25rem)'}}>{tournament}</h1>
              <p className="text-secondary" style={{marginTop:4}}>Valorant · Single Elimination · {completedCount} matches completed</p>
            </div>
            <select className="form-select" style={{width:'auto'}} value={tournament} onChange={e => setTournament(e.target.value)}>
              <option>Spring University Cup 2025</option>
              <option>CS2 Open Championship</option>
              <option>LoL Clash</option>
            </select>
          </div>

          {/* Legend */}
          <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:24,fontSize:'.8rem'}}>
            {[
              { color:'var(--accent)',  label:'Winner' },
              { color:'var(--danger)',  label:'Live match' },
              { color:'var(--border)',  label:'Upcoming' },
              { color:'var(--bg-4)',    label:'TBD' },
            ].map(l => (
              <div key={l.label} style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:12,height:12,borderRadius:2,background:l.color}} />
                <span style={{color:'var(--text-muted)'}}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Bracket */}
          <div style={{overflowX:'auto',paddingBottom:16}}>
            <div style={{display:'flex',gap:0,alignItems:'stretch',minWidth:720}}>
              {ROUNDS.map((round, ri) => (
                <div key={round.name} style={{flex:1,display:'flex',flexDirection:'column',gap:0}}>
                  {/* Round header */}
                  <div style={{textAlign:'center',padding:'8px 16px',marginBottom:16,borderBottom:'1px solid var(--border)'}}>
                    <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,textTransform:'uppercase',fontSize:'.85rem',letterSpacing:'.05em'}}>{round.name}</div>
                    <div style={{fontSize:'.7rem',color:'var(--text-muted)',marginTop:2}}>
                      {round.matches.filter(m=>m.status==='completed').length}/{round.matches.length} completed
                    </div>
                  </div>

                  {/* Match slots — vertically distributed */}
                  <div style={{
                    flex:1,
                    display:'flex',
                    flexDirection:'column',
                    justifyContent:'space-around',
                    padding:`0 ${ri === 0 ? 8 : 16}px`,
                    gap:12,
                  }}>
                    {round.matches.map(match => (
                      <div key={match.id} style={{display:'flex',alignItems:'center',gap:0}}>
                        <MatchCard
                          match={match}
                          selected={selected?.id === match.id}
                          onSelect={setSelected}
                        />
                        {/* Connector line */}
                        {ri < ROUNDS.length - 1 && (
                          <div style={{width:16,height:2,background:'var(--border)',flexShrink:0}} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected match detail */}
          {selected && (
            <div style={{marginTop:32}}>
              <div className="section-header">
                <div className="section-title">Match Details</div>
                <button className="btn btn--ghost btn--sm" onClick={() => setSelected(null)}>Close</button>
              </div>
              <div className="card card__body" style={{maxWidth:480}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <span className="badge badge--blue">{ROUNDS.find(r => r.matches.find(m=>m.id===selected.id))?.name}</span>
                  <span className={`badge badge--${selected.status==='completed'?'accent':selected.status==='live'?'live':'blue'}`}>
                    {selected.status}
                  </span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:20}}>
                  {[{name:selected.teamA,score:selected.scoreA},{name:selected.teamB,score:selected.scoreB}].map((t,i) => (
                    <div key={i} style={{flex:1,textAlign:'center'}}>
                      <div style={{width:48,height:48,borderRadius:'var(--radius)',background:'var(--accent-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontSize:'1rem',fontWeight:700,color:'var(--accent)',margin:'0 auto 8px'}}>
                        {t.name === 'TBD' ? '?' : t.name.slice(0,2).toUpperCase()}
                      </div>
                      <div style={{fontWeight:700,fontSize:'.875rem'}}>{t.name}</div>
                      {t.score !== null && <div style={{fontSize:'1.5rem',fontFamily:'JetBrains Mono,monospace',fontWeight:700,color:'var(--accent)',marginTop:4}}>{t.score}</div>}
                    </div>
                  ))}
                </div>
                {selected.winner && (
                  <div style={{textAlign:'center',padding:'8px',background:'var(--accent-bg)',borderRadius:'var(--radius)',fontSize:'.875rem'}}>
                    <span style={{color:'var(--accent)',fontWeight:700}}>🏆 Winner: {selected.winner}</span>
                  </div>
                )}
                {selected.status !== 'pending' && (
                  <button className="btn btn--outline btn--sm btn--full" style={{marginTop:12,justifyContent:'center'}} onClick={() => navigate('/schedule')}>
                    View Full Match Details
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}
