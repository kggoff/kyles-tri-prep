import styles from './RaceDatePicker.module.css'

export default function RaceDatePicker({ raceDate, onSetRaceDate }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>🏁 Race Date</div>
      <div className={styles.row}>
        <input
          type="date"
          className={styles.input}
          value={raceDate || ''}
          onChange={e => onSetRaceDate(e.target.value || null)}
        />
        {raceDate && (
          <button className={styles.clearBtn} onClick={() => onSetRaceDate(null)}>
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
