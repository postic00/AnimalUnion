import { supabase, fetchPrestigeRank } from './supabase'
import { APP_VERSION } from '../config'
import { saveWeekConfig, getDeviceId } from '../utils/saveLoad'
import type { Board } from '../types/board'
import type { GameState } from '../types/gameState'
import type { WorkData } from '../types/workData'

export async function fetchAndSaveWeekConfig(): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('game_config')
    .select('week, config, start_date, end_date')
    .lte('start_date', today)
    .gte('end_date', today)
    .maybeSingle()

  if (error || !data) return

  const weekConfig = {
    ...(data.config ?? {}),
    WEEK: data.week,
    WEEK_START_DATE: data.start_date,
    WEEK_END_DATE: data.end_date,
  }
  saveWeekConfig(weekConfig)
}

interface CloudSaveData {
  gameState: GameState
  board: Board
  boosts?: { speedBoostRemaining: number; goldBoostRemaining: number }
  workData?: WorkData
  items?: unknown[]
  faStates?: Record<string, unknown>
  rsQueues?: Record<string, unknown[]>
  produceTimers?: Record<string, number>
  prStates?: Record<string, unknown>
}

export async function ensureProfile(playerName: string, platform: string): Promise<void> {
  const deviceId = getDeviceId()
  await supabase
    .from('user_profiles')
    .upsert(
      { device_id: deviceId, player_name: playerName, platform, last_online_at: new Date().toISOString() },
      { onConflict: 'device_id', ignoreDuplicates: false }
    )
}

export async function saveToCloud(
  playerName: string,
  gameState: GameState,
  board: Board,
  platform: string,
  extras?: {
    boosts?: { speedBoostRemaining: number; goldBoostRemaining: number }
    workData?: WorkData
    items?: unknown[]
    faStates?: Record<string, unknown>
    rsQueues?: Record<string, unknown[]>
    produceTimers?: Record<string, number>
    prStates?: Record<string, unknown>
  }
): Promise<boolean> {
  const deviceId = getDeviceId()
  const { error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        device_id: deviceId,
        player_name: playerName,
        game_state: {
          gameState,
          board,
          boosts: extras?.boosts,
          workData: extras?.workData,
          items: extras?.items,
          faStates: extras?.faStates,
          rsQueues: extras?.rsQueues,
          produceTimers: extras?.produceTimers,
          prStates: extras?.prStates,
        },
        platform,
        app_version: APP_VERSION,
        last_online_at: new Date().toISOString(),
      },
      { onConflict: 'device_id' }
    )
  return !error
}

function isValidCloudSave(raw: unknown): raw is CloudSaveData {
  if (!raw || typeof raw !== 'object') return false
  const r = raw as Record<string, unknown>
  if (!r.gameState || typeof r.gameState !== 'object') return false
  if (!r.board || !Array.isArray(r.board)) return false
  const gs = r.gameState as Record<string, unknown>
  if (typeof gs.gold !== 'number' || !isFinite(gs.gold) || gs.gold < 0) return false
  if (typeof gs.totalEarned !== 'number' || !isFinite(gs.totalEarned) || gs.totalEarned < 0) return false
  if (!Array.isArray(gs.producers)) return false
  return true
}

// ── 기기 이전 ──────────────────────────────────────────────────────────────

export async function clearCloudSave(deviceId: string): Promise<void> {
  await supabase.rpc('delete_all_user_data', { p_device_id: deviceId })
}

export async function issueTransferCode(): Promise<string | null> {
  const deviceId = getDeviceId()
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
  const { error } = await supabase
    .from('user_profiles')
    .update({ transfer_code: code, transfer_expires_at: expiresAt })
    .eq('device_id', deviceId)
  return error ? null : code
}

export async function loadByTransferCode(code: string): Promise<CloudSaveData | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('game_state, transfer_expires_at, device_id')
    .eq('transfer_code', code)
    .single()
  if (error || !data) return null
  if (new Date(data.transfer_expires_at) < new Date()) return null
  // 1회용: 코드 소진
  await supabase
    .from('user_profiles')
    .update({ transfer_code: null, transfer_expires_at: null })
    .eq('device_id', data.device_id)
  const raw = data.game_state
  if (!isValidCloudSave(raw)) return null
  return {
    gameState: raw.gameState,
    board: raw.board,
    boosts: raw.boosts,
    workData: raw.workData as WorkData | undefined,
    items: raw.items,
    faStates: raw.faStates,
    rsQueues: raw.rsQueues,
    produceTimers: raw.produceTimers,
    prStates: raw.prStates,
  }
}

// ── 친구 요청 ──────────────────────────────────────────────────────────────

export async function issueInviteCode(): Promise<string | null> {
  const deviceId = getDeviceId()
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const { error } = await supabase
    .from('user_profiles')
    .update({ invite_code: code, invite_expires_at: expiresAt })
    .eq('device_id', deviceId)
  return error ? null : code
}

// B가 A의 코드 입력 → friends에 (A,B),(B,A) 삽입 + A 정보 반환
export async function sendFriendRequest(
  inviteCode: string,
  myDeviceId: string,
): Promise<{ deviceId: string; playerName: string; rank: number } | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('device_id, player_name, invite_expires_at')
    .eq('invite_code', inviteCode)
    .single()
  if (error || !data) return null
  if (new Date(data.invite_expires_at) < new Date()) return null
  if (data.device_id === myDeviceId) return null
  await supabase
    .from('user_profiles')
    .update({ invite_code: null, invite_expires_at: null })
    .eq('device_id', data.device_id)
  const { error: insertError } = await supabase
    .from('friends')
    .insert([
      { from_device_id: myDeviceId, to_device_id: data.device_id },
      { from_device_id: data.device_id, to_device_id: myDeviceId },
    ])
  if (insertError) return null
  const rank = await fetchPrestigeRank(data.device_id)
  return { deviceId: data.device_id, playerName: data.player_name ?? '친구', rank }
}

// 친구 목록 조회 (rank 포함)
export async function fetchFriends(myDeviceId: string): Promise<{ deviceId: string; playerName: string; rank: number }[]> {
  const { data, error } = await supabase
    .from('friends')
    .select('to_device_id')
    .eq('from_device_id', myDeviceId)
  if (error || !data || data.length === 0) return []

  const friendIds = data.map(r => r.to_device_id)
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('device_id, player_name')
    .in('device_id', friendIds)
  const nameMap = new Map((profiles ?? []).map(p => [p.device_id, p.player_name as string]))

  const friends = friendIds.map(id => ({ deviceId: id, playerName: nameMap.get(id) ?? '친구' }))

  const { data: lb } = await supabase
    .from('leaderboard')
    .select('id, score')
    .in('id', friendIds)
  const scoreMap = new Map((lb ?? []).map(r => [r.id, r.score as number]))

  const ranks = await Promise.all(
    friends.map(async f => {
      const score = scoreMap.get(f.deviceId)
      if (score === undefined) return 9999
      const { count } = await supabase
        .from('leaderboard')
        .select('*', { count: 'exact', head: true })
        .gt('score', score)
      return (count ?? 0) + 1
    })
  )

  return friends.map((f, i) => ({ ...f, rank: ranks[i] }))
}

// 초기화 시 내 친구 관계 전체 삭제
export async function removeFriends(myDeviceId: string): Promise<void> {
  await supabase
    .from('friends')
    .delete()
    .or(`from_device_id.eq.${myDeviceId},to_device_id.eq.${myDeviceId}`)
}

export async function loadFromCloud(): Promise<CloudSaveData | null> {
  const deviceId = getDeviceId()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('game_state')
    .eq('device_id', deviceId)
    .single()

  if (error || !data) return null

  const raw = data.game_state
  if (!isValidCloudSave(raw)) {
    console.error('[loadFromCloud] 데이터 검증 실패', raw)
    return null
  }
  return {
    gameState: raw.gameState,
    board: raw.board,
    boosts: raw.boosts,
    workData: raw.workData as WorkData | undefined,
    items: raw.items,
    faStates: raw.faStates,
    rsQueues: raw.rsQueues,
    produceTimers: raw.produceTimers,
    prStates: raw.prStates,
  }
}
