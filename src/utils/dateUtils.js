const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DAY_NAMES_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

export function getMonthLabel(year, month) {
  return `${MONTH_NAMES[month]} ${year}`
}

export function getDayNames() {
  return DAY_NAMES
}

export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDateLong(date) {
  const dayName = DAY_NAMES_LONG[date.getDay()]
  const monthName = MONTH_NAMES[date.getMonth()]
  return `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

export function generateCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const grid = []

  for (let i = 0; i < startDayOfWeek; i++) {
    const prevDate = new Date(year, month, -startDayOfWeek + i + 1)
    grid.push({ date: prevDate, isCurrentMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    grid.push({ date: new Date(year, month, day), isCurrentMonth: true })
  }

  const remaining = 7 - (grid.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      grid.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
  }

  return grid
}

export function getRaceCountdown(raceDateStr) {
  if (!raceDateStr) return null
  const race = new Date(raceDateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffMs = race - today
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { days: Math.abs(diffDays), label: `${Math.abs(diffDays)} days ago`, status: 'past' }
  if (diffDays === 0) return { days: 0, label: 'Race day!', status: 'today' }
  return {
    days: diffDays,
    label: `${diffDays} day${diffDays !== 1 ? 's' : ''} to race`,
    status: diffDays <= 14 ? 'urgent' : diffDays <= 30 ? 'soon' : 'normal'
  }
}
