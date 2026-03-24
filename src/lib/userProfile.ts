import { supabase, fetchPrestigeRank } from './supabase'
import { CONFIG } from '../config'
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
        app_version: CONFIG.WEEK_END_DATE ? '1.2' : '1.0',
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

export interface FriendRequestRow {
  id: string
  from_device_id: string
  from_player_name: string
  to_device_id: string
  to_player_name: string
}

// B가 A의 코드 입력 → friend_requests에 { from: B, to: A } 삽입 + A 정보 반환
export async function sendFriendRequest(
  inviteCode: string,
  myDeviceId: string,
  myPlayerName: string,
): Promise<{ deviceId: string; playerName: string; rank: number } | null> {
  // 코드로 A 조회
  const { data, error } = await supabase
    .from('user_profiles')
    .select('device_id, player_name, invite_expires_at')
    .eq('invite_code', inviteCode)
    .single()
  if (error || !data) return null
  if (new Date(data.invite_expires_at) < new Date()) return null
  // 자기 자신 방지
  if (data.device_id === myDeviceId) return null
  // 코드 소진
  await supabase
    .from('user_profiles')
    .update({ invite_code: null, invite_expires_at: null })
    .eq('device_id', data.device_id)
  // friend_requests 삽입 (B → A)
  const { error: insertError } = await supabase
    .from('friend_requests')
    .insert({
      from_device_id: myDeviceId,
      from_player_name: myPlayerName,
      to_device_id: data.device_id,
      to_player_name: data.player_name ?? '친구',
    })
  if (insertError) return null
  const rank = await fetchPrestigeRank(data.device_id)
  return { deviceId: data.device_id, playerName: data.player_name ?? '친구', rank }
}

// 앱 로드 시 나에게 온 pending 요청 조회
export async function getPendingFriendRequests(): Promise<FriendRequestRow[]> {
  const deviceId = getDeviceId()
  const { data, error } = await supabase
    .from('friend_requests')
    .select('id, from_device_id, from_player_name, to_device_id, to_player_name')
    .eq('to_device_id', deviceId)
    .eq('status', 'pending')
  if (error || !data) return []
  return data as FriendRequestRow[]
}

// A가 요청 수락 → status 업데이트 + from 유저의 rank 반환
export async function acceptFriendRequest(requestId: string, fromDeviceId: string): Promise<number | null> {
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)
  if (error) return null
  return fetchPrestigeRank(fromDeviceId)
}

// 요청 거절 → 삭제
export async function rejectFriendRequest(requestId: string): Promise<boolean> {
  const { error } = await supabase
    .from('friend_requests')
    .delete()
    .eq('id', requestId)
  return !error
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
