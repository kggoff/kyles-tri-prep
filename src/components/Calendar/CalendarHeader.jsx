import { getMonthLabel, getRaceCountdown } from '../../utils/dateUtils'
import styles from './CalendarHeader.module.css'

export default function CalendarHeader({ year, month, raceDate, onPrev, onNext, onToday }) {
  const countdown = getRaceCountdown(raceDate)

  const statusClass = countdown ? styles[countdown.status === 'today' ? 'today_status' : countdown.status] : ''

  return (
    <div className={styles.header}>
      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={onPrev}>&#8592;</button>
        <span className={styles.monthLabel}>{getMonthLabel(year, month)}</span>
        <button className={styles.navBtn} onClick={onNext}>&#8594;</button>
        <button className={styles.todayBtn} onClick={onToday}>Today</button>
      </div>
      {countdown && (
        <div className={`${styles.countdown} ${statusClass}`}>
          {countdown.label}
        </div>
      )}
    </div>
  )
}
