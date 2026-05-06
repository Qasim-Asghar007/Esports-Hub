import { useAnnouncement } from '../context/AnnouncementContext'

const TYPE_META = {
  maintenance: {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    label: 'Maintenance',
  },
  info: {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M3 11l19-9-9 19-2-8-8-2z"/>
      </svg>
    ),
    label: 'Announcement',
  },
  warning: {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    label: 'Warning',
  },
  update: {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
    ),
    label: 'Notice',
  },
}

function fmtTime(iso) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

export default function AnnouncementBanner() {
  const { announcement, clear } = useAnnouncement()
  if (!announcement?.active) return null

  const meta = TYPE_META[announcement.type] || TYPE_META.info
  const start = fmtTime(announcement.startTime)
  const end   = fmtTime(announcement.endTime)

  return (
    <div className="ann-banner" role="alert" aria-live="polite">
      <div className="ann-banner__inner">
        <span className="ann-banner__icon">{meta.icon}</span>
        <div className="ann-banner__body">
          <strong className="ann-banner__label">{meta.label}:</strong>
          <span className="ann-banner__title"> {announcement.title}</span>
          {announcement.message && (
            <span className="ann-banner__msg"> — {announcement.message}</span>
          )}
          {(start || end) && (
            <span className="ann-banner__time">
              {start && end ? ` · ${start} → ${end}` : start ? ` · From ${start}` : ` · Until ${end}`}
            </span>
          )}
        </div>
      </div>
      <button className="ann-banner__close" onClick={clear} aria-label="Dismiss announcement" title="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  )
}
