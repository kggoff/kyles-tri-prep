import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_ACTIVITY_TYPES } from '../data/defaults'

const CACHE_KEY = 'tri-tracker-supabase-cache'

function rowsToEntriesMap(rows) {
  const map = {}
  for (const row of rows) {
    const { date_key, user_id, created_at, ...rest } = row
    const entry = {
      id: rest.id,
      activityTypeId: rest.activity_type_id,
      duration: rest.duration,
      distance: rest.distance,
      distanceUnit: rest.distance_unit,
      intensity: rest.intensity,
      notes: rest.notes,
    }
    if (!map[date_key]) map[date_key] = []
    map[date_key].push(entry)
  }
  return map
}

function rowsToActivityTypes(rows) {
  return rows.map(({ id, label, color }) => ({ id, label, color }))
}

export function useSupabaseData(user) {
  const [entries, setEntries] = useState({})
  const [activityTypes, setActivityTypes] = useState(DEFAULT_ACTIVITY_TYPES)
  const [raceDate, setRaceDateState] = useState(null)
  const [loaded, setLoaded] = useState(false)

  // Fetch all data from Supabase on mount / user change
  useEffect(() => {
    if (!user || !supabase) return

    let cancelled = false

    async function fetchAll() {
      const [entriesRes, typesRes, settingsRes] = await Promise.all([
        supabase.from('entries').select('*'),
        supabase.from('activity_types').select('*'),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      ])

      if (cancelled) return

      if (entriesRes.error && entriesRes.error.code !== 'PGRST116') {
        console.error('Failed to fetch entries:', entriesRes.error)
      }
      if (typesRes.error && typesRes.error.code !== 'PGRST116') {
        console.error('Failed to fetch activity types:', typesRes.error)
      }

      const entriesMap = rowsToEntriesMap(entriesRes.data || [])
      const types = typesRes.data?.length ? rowsToActivityTypes(typesRes.data) : DEFAULT_ACTIVITY_TYPES
      const race = settingsRes.data?.race_date ?? null

      setEntries(entriesMap)
      setActivityTypes(types)
      setRaceDateState(race)
      setLoaded(true)

      // Cache for offline use
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ entries: entriesMap, activityTypes: types, raceDate: race }))
      } catch {}
    }

    // Try cache first for instant render
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
      if (cached) {
        setEntries(cached.entries || {})
        setActivityTypes(cached.activityTypes || DEFAULT_ACTIVITY_TYPES)
        setRaceDateState(cached.raceDate ?? null)
      }
    } catch {}

    fetchAll()

    return () => { cancelled = true }
  }, [user])

  const getEntriesForDate = useCallback((dateKey) => {
    return entries[dateKey] || []
  }, [entries])

  const addEntry = useCallback(async (dateKey, entry) => {
    const id = crypto.randomUUID()
    const newEntry = { ...entry, id }

    // Optimistic update
    setEntries(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newEntry]
    }))

    const { error } = await supabase.from('entries').insert({
      id,
      user_id: user.id,
      date_key: dateKey,
      activity_type_id: entry.activityTypeId,
      duration: entry.duration,
      distance: entry.distance ?? null,
      distance_unit: entry.distanceUnit ?? null,
      intensity: entry.intensity,
      notes: entry.notes ?? '',
    })

    if (error) console.error('Failed to add entry:', error)
  }, [user])

  const updateEntry = useCallback(async (dateKey, entryId, updates) => {
    setEntries(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map(e => e.id === entryId ? { ...e, ...updates } : e)
    }))

    const dbUpdates = {}
    if (updates.activityTypeId !== undefined) dbUpdates.activity_type_id = updates.activityTypeId
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration
    if (updates.distance !== undefined) dbUpdates.distance = updates.distance
    if (updates.distanceUnit !== undefined) dbUpdates.distance_unit = updates.distanceUnit
    if (updates.intensity !== undefined) dbUpdates.intensity = updates.intensity
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes

    const { error } = await supabase.from('entries').update(dbUpdates).eq('id', entryId)
    if (error) console.error('Failed to update entry:', error)
  }, [])

  const deleteEntry = useCallback(async (dateKey, entryId) => {
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

    const { error } = await supabase.from('entries').delete().eq('id', entryId)
    if (error) console.error('Failed to delete entry:', error)
  }, [])

  const addActivityType = useCallback(async (type) => {
    const id = crypto.randomUUID()
    const newType = { ...type, id }

    setActivityTypes(prev => [...prev, newType])

    const { error } = await supabase.from('activity_types').insert({
      id,
      user_id: user.id,
      label: type.label,
      color: type.color,
    })
    if (error) console.error('Failed to add activity type:', error)
  }, [user])

  const updateActivityType = useCallback(async (id, updates) => {
    setActivityTypes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))

    const { error } = await supabase.from('activity_types').update(updates).eq('id', id)
    if (error) console.error('Failed to update activity type:', error)
  }, [])

  const deleteActivityType = useCallback(async (id) => {
    setActivityTypes(prev => prev.filter(t => t.id !== id))

    const { error } = await supabase.from('activity_types').delete().eq('id', id)
    if (error) console.error('Failed to delete activity type:', error)
  }, [])

  const setRaceDate = useCallback(async (date) => {
    setRaceDateState(date)

    const { error } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      race_date: date,
      updated_at: new Date().toISOString(),
    })
    if (error) console.error('Failed to set race date:', error)
  }, [user])

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
    loaded,
  }
}
