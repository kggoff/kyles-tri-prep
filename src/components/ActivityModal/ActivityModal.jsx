import { useState } from 'react'
import Modal from '../common/Modal'
import ActivityForm from '../ActivityForm/ActivityForm'
import { formatDateLong, toDateKey } from '../../utils/dateUtils'
import { getContrastText } from '../../utils/colorUtils'
import styles from './ActivityModal.module.css'

const INTENSITY_CLASS = {
  easy: styles.intensityEasy,
  moderate: styles.intensityModerate,
  hard: styles.intensityHard,
}

export default function ActivityModal({
  date,
  entries,
  activityTypes,
  readOnly,
  onClose,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  if (!date) return null

  const dateKey = toDateKey(date)
  const typeMap = Object.fromEntries(activityTypes.map(t => [t.id, t]))

  const handleSave = (data) => {
    if (editingId) {
      onUpdateEntry(dateKey, editingId, data)
      setEditingId(null)
    } else {
      onAddEntry(dateKey, data)
    }
    setShowForm(false)
  }

  const handleEdit = (entry) => {
    setEditingId(entry.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const editingEntry = editingId ? entries.find(e => e.id === editingId) : null

  return (
    <Modal isOpen={true} onClose={onClose} title="Training Log">
      <div className={styles.dateLabel}>{formatDateLong(date)}</div>

      {entries.length > 0 && !showForm && (
        <div className={styles.entries}>
          {entries.map(entry => {
            const type = typeMap[entry.activityTypeId]
            return (
              <div key={entry.id} className={styles.entry}>
                <span
                  className={styles.typeBadge}
                  style={{
                    backgroundColor: type?.color || '#9ca3af',
                    color: type ? getContrastText(type.color) : '#fff',
                  }}
                >
                  {type?.label || 'Unknown'}
                </span>
                <div className={styles.entryDetails}>
                  <span className={styles.detail}>{entry.duration} min</span>
                  {entry.distance && (
                    <span className={styles.detail}>
                      {entry.distance} {entry.distanceUnit}
                    </span>
                  )}
                  <span className={`${styles.intensityPill} ${INTENSITY_CLASS[entry.intensity]}`}>
                    {entry.intensity}
                  </span>
                  {entry.notes && (
                    <span className={styles.entryNotes}>{entry.notes}</span>
                  )}
                </div>
                {!readOnly && (
                  <div className={styles.entryActions}>
                    <button className={styles.iconBtn} onClick={() => handleEdit(entry)} title="Edit">
                      &#9998;
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.deleteBtn}`}
                      onClick={() => onDeleteEntry(dateKey, entry.id)}
                      title="Delete"
                    >
                      &#128465;
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {entries.length === 0 && !showForm && (
        <div className={styles.empty}>
          {readOnly ? 'No activities logged for this day.' : 'No activities logged. Click below to add one!'}
        </div>
      )}

      {!readOnly && (
        showForm ? (
          <ActivityForm
            activityTypes={activityTypes}
            initialData={editingEntry}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <button className={styles.addBtn} onClick={() => { setEditingId(null); setShowForm(true) }}>
            + Add Activity
          </button>
        )
      )}
    </Modal>
  )
}
