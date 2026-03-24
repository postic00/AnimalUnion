import { supabase } from './supabase'
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
