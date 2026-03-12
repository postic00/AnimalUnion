import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export interface LeaderboardEntry {
  id: string
  player_name: string
  score: number
  prestige_count: number
  created_at: string
}

export async function submitScore(playerName: string, score: number, prestigeCount: number) {
  const { error } = await supabase
    .from('leaderboard')
    .insert({ player_name: playerName, score, prestige_count: prestigeCount })
  return !error
}

export async function fetchLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit)
  return error ? [] : (data as LeaderboardEntry[])
}
