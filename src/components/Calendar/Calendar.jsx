import { generateCalendarGrid, getDayNames, toDateKey, isSameDay } from '../../utils/dateUtils'
import CalendarDay from './CalendarDay'
import styles from './Calendar.module.css'

export default function Calendar({ year, month, entries, activityTypes, raceDate, onDayClick }) {
  const grid = generateCalendarGrid(year, month)
  const today = new Date()
  const raceDateObj = raceDate ? new Date(raceDate + 'T00:00:00') : null

  return (
    <div>
      <div className={styles.weekdays}>
        {getDayNames().map(d => (
          <div key={d} className={styles.weekday}>{d}</div>
        ))}
      </div>
      <div className={styles.grid}>
        {grid.map(({ date, isCurrentMonth }) => {
          const dateKey = toDateKey(date)
          const activities = entries[dateKey] || []
          return (
            <CalendarDay
              key={dateKey}
              date={date}
              isToday={isSameDay(date, today)}
              isRaceDay={raceDateObj ? isSameDay(date, raceDateObj) : false}
              isCurrentMonth={isCurrentMonth}
              activities={activities}
              activityTypes={activityTypes}
              onClick={onDayClick}
            />
          )
        })}
      </div>
    </div>
  )
}
