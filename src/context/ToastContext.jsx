import { createContext, useState, useCallback, useRef } from 'react'

export const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const playTing = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }, [])

  const addToast = useCallback((type, title, message = '', duration = 4500) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, type, title, message, duration }])
    playTing()
    return id
  }, [playTing])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (title, msg, dur) => addToast('success', title, msg, dur),
    error:   (title, msg, dur) => addToast('error',   title, msg, dur),
    warn:    (title, msg, dur) => addToast('warn',    title, msg, dur),
    info:    (title, msg, dur) => addToast('info',    title, msg, dur),
  }

  return (
    <ToastContext.Provider value={{ toasts, removeToast, toast }}>
      {children}
    </ToastContext.Provider>
  )
}
