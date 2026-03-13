import { useState } from 'react'
import { COLOR_PALETTE, getNextColor } from '../../utils/colorUtils'
import styles from './ActivityTypeManager.module.css'

export default function ActivityTypeManager({
  activityTypes,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState(() => getNextColor(activityTypes.map(t => t.color)))
  const [editingId, setEditingId] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const [editColor, setEditColor] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newLabel.trim()) return
    onAdd({ label: newLabel.trim(), color: newColor })
    setNewLabel('')
    setNewColor(getNextColor([...activityTypes.map(t => t.color), newColor]))
  }

  const startEdit = (type) => {
    setEditingId(type.id)
    setEditLabel(type.label)
    setEditColor(type.color)
  }

  const saveEdit = () => {
    if (!editLabel.trim()) return
    onUpdate(editingId, { label: editLabel.trim(), color: editColor })
    setEditingId(null)
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Activity Types</div>

      <div className={styles.types}>
        {activityTypes.map(type => (
          editingId === type.id ? (
            <div key={type.id} className={styles.editRow}>
              <input
                type="color"
                className={styles.colorInput}
                value={editColor}
                onChange={e => setEditColor(e.target.value)}
              />
              <input
                className={styles.nameInput}
                value={editLabel}
                onChange={e => setEditLabel(e.target.value)}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
              />
              <button className={styles.addBtn} onClick={saveEdit}>Save</button>
              <button className={styles.iconBtn} onClick={() => setEditingId(null)}>&#10005;</button>
            </div>
          ) : (
            <div key={type.id} className={styles.typeRow}>
              <div className={styles.colorSwatch} style={{ backgroundColor: type.color }} />
              <span className={styles.typeLabel}>{type.label}</span>
              <button className={styles.iconBtn} onClick={() => startEdit(type)} title="Edit">&#9998;</button>
              <button
                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                onClick={() => onDelete(type.id)}
                title="Delete"
              >
                &#128465;
              </button>
            </div>
          )
        ))}
      </div>

      <form className={styles.addForm} onSubmit={handleAdd}>
        <div className={styles.colorPalette}>
          {COLOR_PALETTE.map(color => (
            <button
              key={color}
              type="button"
              className={`${styles.paletteColor} ${newColor === color ? styles.paletteColorSelected : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setNewColor(color)}
            />
          ))}
        </div>
      </form>
      <form className={styles.addForm} onSubmit={handleAdd}>
        <div className={styles.colorSwatch} style={{ backgroundColor: newColor }} />
        <input
          className={styles.nameInput}
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="New activity name..."
        />
        <button type="submit" className={styles.addBtn} disabled={!newLabel.trim()}>Add</button>
      </form>
    </div>
  )
}
