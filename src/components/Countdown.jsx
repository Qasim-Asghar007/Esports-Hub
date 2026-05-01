import { useCountdown } from '../hooks/useCountdown'

/**
 * Props:
 *   target  {string|Date}  ISO date or Date object
 *   size    {'sm'|'lg'|undefined}
 *   showDays {bool}  default false (shows H:M:S)
 */
export default function Countdown({ target, size, showDays = false }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(target)
  const cls = ['countdown', size ? `countdown--${size}` : ''].filter(Boolean).join(' ')
  const pad = (n) => String(n).padStart(2, '0')

  if (expired) {
    return <span className="badge badge--live">LIVE NOW</span>
  }

  return (
    <div className={cls}>
      {showDays && days > 0 && (
        <>
          <div className="countdown__unit">
            <span className="countdown__value">{pad(days)}</span>
            <span className="countdown__label">DAYS</span>
          </div>
          <span className="countdown__sep">:</span>
        </>
      )}
      <div className="countdown__unit">
        <span className="countdown__value">{pad(hours)}</span>
        <span className="countdown__label">HRS</span>
      </div>
      <span className="countdown__sep">:</span>
      <div className="countdown__unit">
        <span className="countdown__value">{pad(minutes)}</span>
        <span className="countdown__label">MIN</span>
      </div>
      <span className="countdown__sep">:</span>
      <div className="countdown__unit">
        <span className="countdown__value">{pad(seconds)}</span>
        <span className="countdown__label">SEC</span>
      </div>
    </div>
  )
}
