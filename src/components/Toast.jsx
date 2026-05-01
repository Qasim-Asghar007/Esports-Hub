import { useContext, useEffect } from 'react'
import { ToastContext } from '../context/ToastContext'

const ICONS = {
  success: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>,
  error:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>,
  warn:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4m0 4h.01"/></svg>,
  info:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>,
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), toast.duration || 4500)
    return () => clearTimeout(t)
  }, [toast.id, toast.duration, onRemove])

  return (
    <div className={`toast toast--${toast.type}`}>
      <span className="toast__icon">{ICONS[toast.type]}</span>
      <div className="toast__content">
        <div className="toast__title">{toast.title}</div>
        {toast.message && <div className="toast__msg">{toast.message}</div>}
      </div>
      <button className="toast__close" onClick={() => onRemove(toast.id)} aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  )
}

export default function Toast() {
  const { toasts, removeToast } = useContext(ToastContext)
  return (
    <div id="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  )
}
