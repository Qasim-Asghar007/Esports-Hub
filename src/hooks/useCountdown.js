import { useState, useEffect } from 'react'

/**
 * Returns { days, hours, minutes, seconds, expired } that updates every second.
 * @param {string|Date|number} target - ISO string, Date, or ms timestamp
 */
export function useCountdown(target) {
  const getRemaining = () => {
    const diff = new Date(target).getTime() - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false,
    }
  }

  const [remaining, setRemaining] = useState(getRemaining)

  useEffect(() => {
    if (remaining.expired) return
    const id = setInterval(() => setRemaining(getRemaining()), 1000)
    return () => clearInterval(id)
  }, [target, remaining.expired])

  return remaining
}
