import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export interface LeaderboardEntry {
  id: string
  player_name: string
  score: number
  prestige_count?: number
  created_at: string
}

export async function deleteScores(playerName: string) {
  if (!playerName.trim()) return
  await Promise.all([
    supabase.from('leaderboard').delete().eq('player_name', playerName),
    supabase.from('leaderboard_gold').delete().eq('player_name', playerName),
  ])
}

export async function submitPrestigeScore(playerName: string, score: number, prestigeCount: number) {
  if (!playerName.trim() || !isFinite(score) || score < 0 || prestigeCount < 0) return false
  const { error } = await supabase
    .from('leaderboard')
    .upsert({ player_name: playerName, score, prestige_count: prestigeCount }, { onConflict: 'player_name' })
  return !error
}

export async function submitGoldScore(playerName: string, score: number) {
  if (!playerName.trim() || !isFinite(score) || score < 0) return false
  const { error } = await supabase
    .from('leaderboard_gold')
    .upsert({ player_name: playerName, score }, { onConflict: 'player_name' })
  return !error
}

export async function fetchPrestigeLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(Math.max(1, limit))
  if (error || !Array.isArray(data)) return []
  return data.filter(e => e && typeof e.player_name === 'string' && typeof e.score === 'number') as LeaderboardEntry[]
}

export async function fetchGoldLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_gold')
    .select('*')
    .order('score', { ascending: false })
    .limit(Math.max(1, limit))
  if (error || !Array.isArray(data)) return []
  return data.filter(e => e && typeof e.player_name === 'string' && typeof e.score === 'number') as LeaderboardEntry[]
}
