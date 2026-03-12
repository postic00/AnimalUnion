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

export async function submitPrestigeScore(playerName: string, score: number, prestigeCount: number) {
  const { error } = await supabase
    .from('leaderboard')
    .insert({ player_name: playerName, score, prestige_count: prestigeCount })
  return !error
}

export async function submitGoldScore(playerName: string, score: number) {
  const { error } = await supabase
    .from('leaderboard_gold')
    .insert({ player_name: playerName, score })
  return !error
}

export async function fetchPrestigeLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit)
  return error ? [] : (data as LeaderboardEntry[])
}

export async function fetchGoldLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_gold')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit)
  return error ? [] : (data as LeaderboardEntry[])
}
