import { useState } from 'react'
import { getContrastText } from '../../utils/colorUtils'
import styles from './ActivityForm.module.css'

const INTENSITIES = ['easy', 'moderate', 'hard']
const DISTANCE_UNITS = ['mi', 'km', 'm', 'yd']

function minutesToHM(totalMin) {
  if (!totalMin) return { hours: '', minutes: '' }
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return { hours: h > 0 ? String(h) : '', minutes: m > 0 ? String(m) : '' }
}

export default function ActivityForm({ activityTypes, initialData, onSave, onCancel }) {
  const [activityTypeId, setActivityTypeId] = useState(initialData?.activityTypeId || '')
  const initHM = minutesToHM(initialData?.duration)
  const [hours, setHours] = useState(initHM.hours)
  const [minutes, setMinutes] = useState(initHM.minutes)
  const [distance, setDistance] = useState(initialData?.distance || '')
  const [distanceUnit, setDistanceUnit] = useState(initialData?.distanceUnit || 'mi')
  const [intensity, setIntensity] = useState(initialData?.intensity || 'moderate')
  const [notes, setNotes] = useState(initialData?.notes || '')

  const totalMinutes = (Number(hours) || 0) * 60 + (Number(minutes) || 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!activityTypeId || totalMinutes <= 0) return
    onSave({
      activityTypeId,
      duration: totalMinutes,
      distance: distance ? Number(distance) : null,
      distanceUnit,
      intensity,
      notes,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div>
        <div className={styles.label}>Activity</div>
        <div className={styles.typePills}>
          {activityTypes.map(type => (
            <button
              key={type.id}
              type="button"
              className={`${styles.typePill} ${activityTypeId === type.id ? styles.typePillSelected : ''}`}
              style={{
                backgroundColor: type.color,
                color: getContrastText(type.color),
              }}
              onClick={() => setActivityTypeId(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Duration</label>
          <div className={styles.durationRow}>
            <input
              type="number"
              className={styles.input}
              value={hours}
              onChange={e => setHours(e.target.value)}
              placeholder="0"
              min="0"
            />
            <span className={styles.unitLabel}>hr</span>
            <input
              type="number"
              className={styles.input}
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              placeholder="0"
              min="0"
              max="59"
            />
            <span className={styles.unitLabel}>min</span>
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Distance</label>
          <div className={styles.distanceRow}>
            <input
              type="number"
              className={styles.input}
              value={distance}
              onChange={e => setDistance(e.target.value)}
              placeholder="--"
              min="0"
              step="any"
            />
            <select className={styles.select} value={distanceUnit} onChange={e => setDistanceUnit(e.target.value)}>
              {DISTANCE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className={styles.label}>Intensity</div>
        <div className={styles.intensityGroup}>
          {INTENSITIES.map(level => (
            <button
              key={level}
              type="button"
              className={`${styles.intensityBtn} ${intensity === level ? `${styles.intensityBtnActive} ${styles[level]}` : ''}`}
              onClick={() => setIntensity(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={styles.label}>Notes</label>
        <textarea
          className={styles.textarea}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How did it go?"
        />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.saveBtn} disabled={!activityTypeId || totalMinutes <= 0}>Save</button>
      </div>
    </form>
  )
}
