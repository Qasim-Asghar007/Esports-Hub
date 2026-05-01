import { useEffect, useRef } from 'react'

/**
 * Reusable modal overlay.
 *
 * Props:
 *   open       {bool}    – show/hide
 *   onClose    {fn}      – called on Escape or backdrop click or close btn
 *   title      {string}  – header text
 *   size       {'sm'|'lg'|undefined}
 *   footer     {node}    – optional footer JSX (defaults to a Close button)
 *   children   {node}
 */
export default function Modal({ open, onClose, title, size, footer, children }) {
  const overlayRef = useRef(null)

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const cls = ['modal', size ? `modal--${size}` : ''].filter(Boolean).join(' ')

  return (
    <div
      className="modal-overlay open"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.() }}
    >
      <div className={cls} role="dialog" aria-modal="true" aria-label={title}>
        {title != null && (
          <div className="modal__header">
            <span className="modal__title">{title}</span>
            <button className="modal__close btn btn--ghost btn--icon-sm" onClick={onClose} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}
        <div className="modal__body">{children}</div>
        {footer !== undefined ? (
          footer && <div className="modal__footer">{footer}</div>
        ) : (
          <div className="modal__footer">
            <button className="btn btn--secondary" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}
