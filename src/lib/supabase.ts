import { createClient } from '@supabase/supabase-js'
import { CONFIG } from '../config'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
  console.error('[supabase] VITE_SUPABASE_URL이 올바르지 않습니다:', url)
}
if (!key || typeof key !== 'string' || key.length < 20) {
  console.error('[supabase] VITE_SUPABASE_ANON_KEY가 올바르지 않습니다')
}

export const supabase = createClient(url as string, key as string)

export interface LeaderboardEntry {
  id: string
  player_name: string
  score: number
  prestige_count?: number
  created_at: string
}

export async function updatePlayerName(deviceId: string, playerName: string) {
  if (!deviceId || !playerName.trim()) return
  await Promise.all([
    supabase.from('leaderboard').update({ player_name: playerName }).eq('id', deviceId),
    supabase.from('leaderboard_gold').update({ player_name: playerName }).eq('id', deviceId),
  ])
}

export async function recordSession(deviceId: string, platform: string) {
  if (!deviceId) return
  const date = new Date().toISOString().slice(0, 10)
  await supabase.rpc('record_session', { p_id: deviceId, p_date: date, p_platform: platform })
}

export async function recordAd(deviceId: string) {
  if (!deviceId) return
  const date = new Date().toISOString().slice(0, 10)
  await supabase.rpc('record_ad', { p_id: deviceId, p_date: date })
}

export async function deleteAllScores(deviceId: string) {
  if (!deviceId) return
  await Promise.all([
    supabase.from('leaderboard').delete().eq('id', deviceId),
    supabase.from('leaderboard_gold').delete().eq('id', deviceId),
  ])
}

export async function submitPrestigeScore(deviceId: string, playerName: string, score: number, prestigeCount: number) {
  if (!playerName.trim() || !isFinite(score) || score < 0 || prestigeCount < 0) return false
  const { error } = await supabase
    .from('leaderboard')
    .upsert({ id: deviceId, player_name: playerName, score: Math.floor(score), prestige_count: prestigeCount, last_seen: new Date().toISOString() }, { onConflict: 'id' })
  return !error
}

export async function submitGoldScore(deviceId: string, playerName: string, score: number) {
  if (!playerName.trim() || !isFinite(score) || score < 0) return false
  const { error } = await supabase
    .from('leaderboard_gold')
    .upsert({ id: deviceId, player_name: playerName, score: Math.floor(score), week: CONFIG.CURRENT_WEEK, last_seen: new Date().toISOString() }, { onConflict: 'id,week' })
  return !error
}

export async function fetchPrestigeLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(Math.max(1, limit))
  if (error || !Array.isArray(data)) return []
  return data.filter(e => e && typeof e.player_name === 'string' && typeof e.score === 'number') as LeaderboardEntry[]
}

export async function fetchGoldLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_gold')
    .select('*')
    .eq('week', CONFIG.CURRENT_WEEK)
    .order('score', { ascending: false })
    .limit(Math.max(1, limit))
  if (error || !Array.isArray(data)) return []
  return data.filter(e => e && typeof e.player_name === 'string' && typeof e.score === 'number') as LeaderboardEntry[]
}

export interface AroundResult {
  entries: LeaderboardEntry[]
  startRank: number
}

export async function fetchPrestigeAround(deviceId: string, range = 5): Promise<AroundResult> {
  const { data: myData } = await supabase.from('leaderboard').select('score').eq('id', deviceId).single()
  if (!myData) return { entries: [], startRank: 1 }
  const { count } = await supabase.from('leaderboard').select('*', { count: 'exact', head: true }).gt('score', myData.score)
  const rank = (count ?? 0) + 1
  const offset = Math.max(0, rank - range - 1)
  const { data, error } = await supabase.from('leaderboard').select('*').order('score', { ascending: false }).range(offset, offset + range * 2)
  if (error || !Array.isArray(data)) return { entries: [], startRank: rank }
  return { entries: data.filter(e => e && typeof e.player_name === 'string' && typeof e.score === 'number') as LeaderboardEntry[], startRank: offset + 1 }
}

export async function fetchGoldAround(deviceId: string, range = 5): Promise<AroundResult> {
  const { data: myData } = await supabase.from('leaderboard_gold').select('score').eq('id', deviceId).eq('week', CONFIG.CURRENT_WEEK).single()
  if (!myData) return { entries: [], startRank: 1 }
  const { count } = await supabase.from('leaderboard_gold').select('*', { count: 'exact', head: true }).eq('week', CONFIG.CURRENT_WEEK).gt('score', myData.score)
  const rank = (count ?? 0) + 1
  const offset = Math.max(0, rank - range - 1)
  const { data, error } = await supabase.from('leaderboard_gold').select('*').eq('week', CONFIG.CURRENT_WEEK).order('score', { ascending: false }).range(offset, offset + range * 2)
  if (error || !Array.isArray(data)) return { entries: [], startRank: rank }
  return { entries: data.filter(e => e && typeof e.player_name === 'string' && typeof e.score === 'number') as LeaderboardEntry[], startRank: offset + 1 }
}
