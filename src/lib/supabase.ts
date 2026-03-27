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
  rank?: number
  prestige_count?: number
  created_at?: string
}

export async function updatePlayerName(deviceId: string, playerName: string) {
  if (!deviceId || !playerName.trim()) return
  await supabase.rpc('update_player_name', { p_device_id: deviceId, p_player_name: playerName })
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
    .upsert({ id: deviceId, player_name: playerName, score: Math.floor(score), week: CONFIG.WEEK, last_seen: new Date().toISOString() }, { onConflict: 'id,week' })
  return !error
}

export interface AroundResult {
  entries: LeaderboardEntry[]
  startRank: number
}

export async function lbTop(
  table: string,
  { page = 1, pageSize = 10, week = 0, friendOnly = false, deviceId = '', range = 5 }: {
    page?: number; pageSize?: number; week?: number; friendOnly?: boolean; deviceId?: string; range?: number
  } = {}
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc('lb_top', {
    p_table: table, p_page: page, p_page_size: pageSize,
    p_week: week, p_friend_only: friendOnly, p_device_id: deviceId, p_range: range,
  })
  if (error || !Array.isArray(data)) return []
  return data as LeaderboardEntry[]
}

export async function lbAround(
  table: string,
  deviceId: string,
  { week = 0, range = 5 }: { week?: number; range?: number } = {}
): Promise<AroundResult> {
  const { data, error } = await supabase.rpc('lb_around', {
    p_table: table, p_page: 1, p_page_size: 10,
    p_week: week, p_friend_only: false, p_device_id: deviceId, p_range: range,
  })
  if (error || !Array.isArray(data) || data.length === 0) return { entries: [], startRank: 1 }
  const startRank = (data[0].start_rank as number) ?? 1
  return { entries: data as LeaderboardEntry[], startRank }
}

// 특정 deviceId의 환생 순위 조회 (없으면 9999)
export async function fetchPrestigeRank(deviceId: string): Promise<number> {
  const { data: myData } = await supabase.from("leaderboard").select("score").eq("id", deviceId).single()
  if (!myData) return 9999
  const { count } = await supabase.from("leaderboard").select("*", { count: "exact", head: true }).gt("score", myData.score)
  return (count ?? 0) + 1
}
