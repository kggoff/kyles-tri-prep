import { useState } from 'react'
import { getContrastText } from '../../utils/colorUtils'
import styles from './ActivityForm.module.css'

const INTENSITIES = ['easy', 'moderate', 'hard']
const DISTANCE_UNITS = ['km', 'mi', 'm', 'yd']

export default function ActivityForm({ activityTypes, initialData, onSave, onCancel }) {
  const [activityTypeId, setActivityTypeId] = useState(initialData?.activityTypeId || '')
  const [duration, setDuration] = useState(initialData?.duration || '')
  const [distance, setDistance] = useState(initialData?.distance || '')
  const [distanceUnit, setDistanceUnit] = useState(initialData?.distanceUnit || 'km')
  const [intensity, setIntensity] = useState(initialData?.intensity || 'moderate')
  const [notes, setNotes] = useState(initialData?.notes || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!activityTypeId || !duration) return
    onSave({
      activityTypeId,
      duration: Number(duration),
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
          <label className={styles.label}>Duration (min)</label>
          <input
            type="number"
            className={styles.input}
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="45"
            min="1"
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Distance</label>
          <div className={styles.row} style={{ gap: 'var(--space-xs)' }}>
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
        <button type="submit" className={styles.saveBtn} disabled={!activityTypeId || !duration}>Save</button>
      </div>
    </form>
  )
}
