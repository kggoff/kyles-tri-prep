import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS } from '../utils/storage'
import { DEFAULT_ACTIVITY_TYPES } from '../data/defaults'

export function useTrainingData() {
  const [entries, setEntries] = useLocalStorage(STORAGE_KEYS.ENTRIES, {})
  const [activityTypes, setActivityTypes] = useLocalStorage(STORAGE_KEYS.ACTIVITY_TYPES, DEFAULT_ACTIVITY_TYPES)
  const [raceDate, setRaceDate] = useLocalStorage(STORAGE_KEYS.RACE_DATE, null)

  const getEntriesForDate = useCallback((dateKey) => {
    return entries[dateKey] || []
  }, [entries])

  const addEntry = useCallback((dateKey, entry) => {
    setEntries(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { ...entry, id: crypto.randomUUID() }]
    }))
  }, [setEntries])

  const updateEntry = useCallback((dateKey, entryId, updates) => {
    setEntries(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map(e => e.id === entryId ? { ...e, ...updates } : e)
    }))
  }, [setEntries])

  const deleteEntry = useCallback((dateKey, entryId) => {
    setEntries(prev => {
      const updated = (prev[dateKey] || []).filter(e => e.id !== entryId)
      const next = { ...prev }
      if (updated.length === 0) {
        delete next[dateKey]
      } else {
        next[dateKey] = updated
      }
      return next
    })
  }, [setEntries])

  const addActivityType = useCallback((type) => {
    setActivityTypes(prev => [...prev, { ...type, id: crypto.randomUUID() }])
  }, [setActivityTypes])

  const updateActivityType = useCallback((id, updates) => {
    setActivityTypes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [setActivityTypes])

  const deleteActivityType = useCallback((id) => {
    setActivityTypes(prev => prev.filter(t => t.id !== id))
  }, [setActivityTypes])

  return {
    entries,
    activityTypes,
    raceDate,
    setRaceDate,
    getEntriesForDate,
    addEntry,
    updateEntry,
    deleteEntry,
    addActivityType,
    updateActivityType,
    deleteActivityType,
  }
}
