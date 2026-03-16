import { ActivityIcon } from '../icons/ActivityIcons'
import styles from './CalendarDay.module.css'

const MAX_VISIBLE = 3

function formatDuration(min) {
  if (!min) return ''
  if (min >= 60) {
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h${m}m` : `${h}h`
  }
  return `${min}m`
}

export default function CalendarDay({ date, isToday, isRaceDay, isCurrentMonth, activities, activityTypes, onClick }) {
  const typeMap = Object.fromEntries(activityTypes.map(t => [t.id, t]))
  const visible = activities.slice(0, MAX_VISIBLE)
  const overflow = activities.length - MAX_VISIBLE

  const classNames = [
    styles.day,
    isToday && styles.today,
    isRaceDay && styles.raceDay,
    !isCurrentMonth && styles.outsideMonth,
  ].filter(Boolean).join(' ')

  return (
    <button className={classNames} onClick={() => onClick(date)}>
      <span className={styles.dayNumber}>{date.getDate()}</span>
      {isRaceDay && <span className={styles.raceBadge}>RACE</span>}
      {activities.length > 0 && (
        <div className={styles.activityList}>
          {visible.map(a => {
            const type = typeMap[a.activityTypeId]
            return (
              <div
                key={a.id}
                className={styles.activityChip}
                style={{ backgroundColor: type?.color || '#9ca3af' }}
              >
                <span className={styles.chipIcon}>
                  <ActivityIcon typeId={type?.id} size={12} color="#fff" />
                </span>
                <span className={styles.chipText}>{formatDuration(a.duration)}</span>
              </div>
            )
          })}
          {overflow > 0 && <span className={styles.overflow}>+{overflow} more</span>}
        </div>
      )}
    </button>
  )
}
