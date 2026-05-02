import '../styles/skeleton.css'

/* Usage:
 *   <Skeleton />                  — single text line
 *   <Skeleton width="60%" />      — narrower line
 *   <Skeleton variant="circle" /> — avatar circle
 *   <Skeleton variant="rect" height={120} /> — block
 *   <Skeleton.Card />             — full card skeleton
 *   <Skeleton.Table rows={5} />   — table skeleton
 *   <Skeleton.StatGrid />         — 4-stat grid skeleton
 */

function Skeleton({ variant = 'text', width, height, style = {}, className = '' }) {
  const styles = {
    width:  width  || (variant === 'circle' ? 40 : '100%'),
    height: height || (variant === 'circle' ? 40 : variant === 'rect' ? 120 : 16),
    borderRadius: variant === 'circle' ? '50%' : variant === 'text' ? 4 : 'var(--radius)',
    ...style,
  }
  return <div className={`skeleton ${className}`} style={styles} />
}

Skeleton.Card = function SkeletonCard() {
  return (
    <div className="card card__body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <Skeleton variant="rect" height={8} width="40%" />
      <Skeleton width="70%" height={20} />
      <Skeleton width="90%" />
      <Skeleton width="55%" />
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <Skeleton width={80} height={28} style={{ borderRadius:'var(--radius)' }} />
        <Skeleton width={80} height={28} style={{ borderRadius:'var(--radius)' }} />
      </div>
    </div>
  )
}

Skeleton.TournamentCard = function SkeletonTournamentCard() {
  return (
    <div className="card" style={{ overflow:'hidden' }}>
      <Skeleton variant="rect" height={6} style={{ borderRadius:0 }} />
      <div className="card__body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <Skeleton width={60} height={20} style={{ borderRadius:9999 }} />
          <Skeleton width={50} height={20} style={{ borderRadius:9999 }} />
        </div>
        <Skeleton width="80%" height={22} />
        <Skeleton width="60%" />
        <Skeleton variant="rect" height={6} style={{ borderRadius:3, marginTop:4 }} />
        <div style={{ display:'flex', gap:8, marginTop:4 }}>
          <Skeleton width="50%" height={32} style={{ borderRadius:'var(--radius)' }} />
          <Skeleton width="40%" height={32} style={{ borderRadius:'var(--radius)' }} />
        </div>
      </div>
    </div>
  )
}

Skeleton.StatCard = function SkeletonStatCard() {
  return (
    <div className="card card__body stat-card" style={{ gap:10 }}>
      <Skeleton variant="circle" width={40} height={40} style={{ marginBottom:4 }} />
      <Skeleton width="60%" height={28} />
      <Skeleton width="80%" height={14} />
      <Skeleton width="50%" height={12} />
    </div>
  )
}

Skeleton.StatGrid = function SkeletonStatGrid() {
  return (
    <div className="grid-4" style={{ marginBottom:32 }}>
      {[1,2,3,4].map(i => <Skeleton.StatCard key={i} />)}
    </div>
  )
}

Skeleton.Table = function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="card">
      <div className="table-wrap" style={{ border:'none', borderRadius:0 }}>
        <table>
          <thead>
            <tr>
              {Array.from({length:cols}).map((_,i) => (
                <th key={i}><Skeleton width={`${50+i*10}%`} height={12} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({length:rows}).map((_,ri) => (
              <tr key={ri}>
                {Array.from({length:cols}).map((_,ci) => (
                  <td key={ci}><Skeleton width={`${60+Math.sin(ri*ci)*20}%`} height={14} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

Skeleton.PlayerRow = function SkeletonPlayerRow() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0' }}>
      <Skeleton variant="circle" width={44} height={44} style={{ flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <Skeleton width="50%" height={14} style={{ marginBottom:6 }} />
        <Skeleton width="35%" height={12} />
      </div>
      <Skeleton width={56} height={22} style={{ borderRadius:9999 }} />
    </div>
  )
}

Skeleton.Dashboard = function SkeletonDashboard() {
  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <Skeleton width={120} height={12} style={{ marginBottom:8 }} />
          <Skeleton width="45%" height={36} style={{ marginBottom:8 }} />
          <Skeleton width="60%" height={14} />
        </div>
        {/* Stat grid */}
        <Skeleton.StatGrid />
        {/* Two-col */}
        <div className="grid-2" style={{ marginBottom:32 }}>
          <Skeleton.Card />
          <Skeleton.Card />
        </div>
        {/* Table */}
        <Skeleton.Table rows={3} cols={4} />
      </div>
    </div>
  )
}

export default Skeleton
