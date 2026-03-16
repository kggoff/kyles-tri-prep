import { STORAGE_KEYS } from './storage'

export async function migrateLocalDataToSupabase(supabase, userId) {
  const migrated = localStorage.getItem(STORAGE_KEYS.MIGRATED)
  if (migrated) return

  const rawEntries = localStorage.getItem(STORAGE_KEYS.ENTRIES)
  const rawTypes = localStorage.getItem(STORAGE_KEYS.ACTIVITY_TYPES)
  const rawRaceDate = localStorage.getItem(STORAGE_KEYS.RACE_DATE)

  const entries = rawEntries ? JSON.parse(rawEntries) : {}
  const activityTypes = rawTypes ? JSON.parse(rawTypes) : []
  const raceDate = rawRaceDate ? JSON.parse(rawRaceDate) : null

  const hasData = Object.keys(entries).length > 0 || activityTypes.length > 0 || raceDate

  if (!hasData) {
    localStorage.setItem(STORAGE_KEYS.MIGRATED, 'true')
    return
  }

  // Migrate activity types
  if (activityTypes.length > 0) {
    const typeRows = activityTypes.map(t => ({
      id: t.id,
      user_id: userId,
      label: t.label,
      color: t.color,
    }))
    const { error } = await supabase.from('activity_types').upsert(typeRows)
    if (error) console.error('Migration: failed to insert activity types:', error)
  }

  // Migrate entries
  const entryRows = []
  for (const [dateKey, dayEntries] of Object.entries(entries)) {
    for (const entry of dayEntries) {
      entryRows.push({
        id: entry.id,
        user_id: userId,
        date_key: dateKey,
        activity_type_id: entry.activityTypeId,
        duration: entry.duration,
        distance: entry.distance ?? null,
        distance_unit: entry.distanceUnit ?? null,
        intensity: entry.intensity,
        notes: entry.notes ?? '',
      })
    }
  }
  if (entryRows.length > 0) {
    const { error } = await supabase.from('entries').upsert(entryRows)
    if (error) console.error('Migration: failed to insert entries:', error)
  }

  // Migrate race date
  if (raceDate) {
    const { error } = await supabase.from('user_settings').upsert({
      user_id: userId,
      race_date: raceDate,
      updated_at: new Date().toISOString(),
    })
    if (error) console.error('Migration: failed to set race date:', error)
  }

  localStorage.setItem(STORAGE_KEYS.MIGRATED, 'true')
}
