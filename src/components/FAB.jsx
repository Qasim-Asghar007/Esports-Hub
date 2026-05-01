import { useState } from 'react'

/**
 * Floating Action Button with expandable actions.
 * actions = [{ label, icon (JSX), onClick }]
 */
export default function FAB({ actions = [] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`fab-container ${open ? 'open' : ''}`}>
      <div className="fab-actions">
        {actions.map((a, i) => (
          <div className="fab-action" key={i}>
            <span className="fab-action__label">{a.label}</span>
            <button className="fab-action__btn" onClick={() => { a.onClick?.(); setOpen(false) }} aria-label={a.label}>
              {a.icon}
            </button>
          </div>
        ))}
      </div>
      <button
        className="fab"
        aria-label={open ? 'Close quick actions' : 'Quick actions'}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  )
}
