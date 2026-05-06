import { createContext, useContext, useState, useEffect } from 'react'

const AnnouncementContext = createContext(null)

export function AnnouncementProvider({ children }) {
  const [announcement, setAnnouncement] = useState(null)

  useEffect(() => {
    if (announcement?.active) {
      document.body.classList.add('has-announcement')
    } else {
      document.body.classList.remove('has-announcement')
    }
    return () => document.body.classList.remove('has-announcement')
  }, [announcement?.active])

  const publish = (data) =>
    setAnnouncement({ ...data, id: 'ann' + Date.now(), active: true, createdAt: new Date().toISOString() })

  const clear = () => setAnnouncement(null)

  return (
    <AnnouncementContext.Provider value={{ announcement, publish, clear }}>
      {children}
    </AnnouncementContext.Provider>
  )
}

export function useAnnouncement() {
  return useContext(AnnouncementContext)
}
