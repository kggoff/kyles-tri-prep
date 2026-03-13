import styles from './CalendarDay.module.css'

const MAX_DOTS = 4

export default function CalendarDay({ date, isToday, isRaceDay, isCurrentMonth, activities, activityTypes, onClick }) {
  const typeMap = Object.fromEntries(activityTypes.map(t => [t.id, t]))
  const visibleActivities = activities.slice(0, MAX_DOTS)
  const overflow = activities.length - MAX_DOTS

  const classNames = [
    styles.day,
    isToday && styles.today,
    isRaceDay && styles.raceDay,
    !isCurrentMonth && styles.outsideMonth,
  ].filter(Boolean).join(' ')

  return (
    <button className={classNames} onClick={() => onClick(date)}>
      <span className={styles.dayNumber}>{date.getDate()}</span>
      {isRaceDay && <span className={styles.raceBadge}>🏁</span>}
      {activities.length > 0 && (
        <div className={styles.dots}>
          {visibleActivities.map(a => (
            <span
              key={a.id}
              className={styles.dot}
              style={{ backgroundColor: typeMap[a.activityTypeId]?.color || '#9ca3af' }}
            />
          ))}
          {overflow > 0 && <span className={styles.overflow}>+{overflow}</span>}
        </div>
      )}
    </button>
  )
}
