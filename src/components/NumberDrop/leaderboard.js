import { supabase } from '../../lib/supabase.js'

const TABLE = 'number_drop_scores'

export async function fetchLeaderboard(limit = 10) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, player_name, score, level, max_combo, created_at')
    .order('score', { ascending: false })
    .limit(limit)
  if (error) {
    console.error('Leaderboard fetch error:', error)
    return []
  }
  return data || []
}

export async function submitScore({ playerName, score, level, maxCombo, numbersDestroyed }) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{
      player_name: playerName.trim().toUpperCase().slice(0, 12),
      score,
      level,
      max_combo: maxCombo,
      numbers_destroyed: numbersDestroyed,
    }])
    .select()
    .single()
  if (error) {
    console.error('Score submit error:', error)
    return null
  }
  return data
}

export function isSupabaseEnabled() {
  return supabase !== null
}
