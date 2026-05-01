export default function PlayerCard({ player, actions, online = false }) {
  return (
    <div className="player-card">
      <div className={`player-card__avatar ${online ? 'player-card__avatar--online' : ''}`}>
        {player.avatar || player.name?.slice(0,2).toUpperCase() || '??'}
      </div>
      <div>
        <div className="player-card__name">{player.name || player.username}</div>
        <div className="player-card__role">
          {player.role && <span>{player.role}</span>}
          {player.ign  && <span style={{ color:'var(--text-faint)', marginLeft:4 }}>· {player.ign}</span>}
        </div>
      </div>
      {actions && <div className="player-card__actions">{actions}</div>}
    </div>
  )
}
