import { createContext, useState, useCallback, useRef } from 'react'

export const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const addToast = useCallback((type, title, message = '', duration = 4500) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, type, title, message, duration }])
    return id
  }, [])

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
