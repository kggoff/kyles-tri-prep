import { useState, useMemo } from 'react'
import { toDateKey } from '../../utils/dateUtils'
import { ActivityIcon } from '../icons/ActivityIcons'
import styles from './WeeklySummary.module.css'

function getWeekRange(offset) {
  const today = new Date()
  const day = today.getDay()
  const start = new Date(today)
  start.setDate(today.getDate() - day + offset * 7)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start, end }
}

function formatWeekLabel(start, end, offset) {
  if (offset === 0) return 'This Week'
  const opts = { month: 'short', day: 'numeric' }
  const startStr = start.toLocaleDateString('en-US', opts)
  const endStr = end.toLocaleDateString('en-US', opts)
  return `${startStr} – ${endStr}`
}

function formatDistance(distance, unit) {
  if (!distance) return null
  const rounded = Math.round(distance * 100) / 100
  return `${rounded} ${unit}`
}

export default function WeeklySummary({ entries, activityTypes }) {
  const [weekOffset, setWeekOffset] = useState(0)

  const { start, end } = useMemo(() => getWeekRange(weekOffset), [weekOffset])

  const summary = useMemo(() => {
    const byType = {}
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = toDateKey(d)
      const dayEntries = entries[key] || []
      for (const entry of dayEntries) {
        if (!byType[entry.activityTypeId]) {
          byType[entry.activityTypeId] = { totalMinutes: 0, distances: {} }
        }
        byType[entry.activityTypeId].totalMinutes += entry.duration || 0
        if (entry.distance) {
          const unit = entry.distanceUnit || 'mi'
          byType[entry.activityTypeId].distances[unit] =
            (byType[entry.activityTypeId].distances[unit] || 0) + entry.distance
        }
      }
    }
    return byType
  }, [entries, start, end])

  const typeMap = useMemo(() => {
    const map = {}
    for (const t of activityTypes) map[t.id] = t
    return map
  }, [activityTypes])

  const label = formatWeekLabel(start, end, weekOffset)
  const typeIds = Object.keys(summary)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={() => setWeekOffset(w => w - 1)}>&#8592;</button>
        <h3 className={styles.heading}>{label}</h3>
        <button
          className={styles.navBtn}
          onClick={() => setWeekOffset(w => w + 1)}
          disabled={weekOffset >= 0}
        >&#8594;</button>
        {weekOffset !== 0 && (
          <button className={styles.todayBtn} onClick={() => setWeekOffset(0)}>Current</button>
        )}
      </div>

      {typeIds.length === 0 ? (
        <p className={styles.empty}>No activities logged this week</p>
      ) : (
        <div className={styles.grid}>
          {typeIds.map(typeId => {
            const type = typeMap[typeId]
            if (!type) return null
            const data = summary[typeId]
            const hours = Math.floor(data.totalMinutes / 60)
            const mins = data.totalMinutes % 60
            const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
            const distEntries = Object.entries(data.distances)

            return (
              <div key={typeId} className={styles.card}>
                <div className={styles.iconWrap} style={{ color: type.color }}>
                  <ActivityIcon typeId={typeId} size={28} color={type.color} />
                </div>
                <div className={styles.label}>{type.label}</div>
                <div className={styles.time}>{timeStr}</div>
                {distEntries.map(([unit, dist]) => (
                  <div key={unit} className={styles.distance}>{formatDistance(dist, unit)}</div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
