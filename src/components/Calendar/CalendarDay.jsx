import { ActivityIcon } from '../icons/ActivityIcons'
import styles from './CalendarDay.module.css'

const MAX_VISIBLE = 3

function formatDistance(distance, unit) {
  if (!distance) return ''
  const rounded = Math.round(distance * 10) / 10
  return `${rounded}${unit}`
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
                  <ActivityIcon typeId={type?.id} label={type?.label} size={12} color="#fff" />
                </span>
                <span className={styles.chipText}>{formatDistance(a.distance, a.distanceUnit || 'mi')}</span>
              </div>
            )
          })}
          {overflow > 0 && <span className={styles.overflow}>+{overflow} more</span>}
        </div>
      )}
    </button>
  )
}
