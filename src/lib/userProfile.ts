import { supabase } from './supabase'
import { CONFIG } from '../config'
import { saveWeekConfig, getDeviceId } from '../utils/saveLoad'
import type { Board } from '../types/board'
import type { GameState } from '../types/gameState'

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
  game_state: GameState
  board: Board
}

export async function saveToCloud(
  playerName: string,
  gameState: GameState,
  board: Board,
  platform: string,
): Promise<boolean> {
  const deviceId = getDeviceId()
  const { error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        device_id: deviceId,
        player_name: playerName,
        game_state: { game_state: gameState, board },
        platform,
        app_version: CONFIG.WEEK_END_DATE ? '1.2' : '1.0',
        last_online_at: new Date().toISOString(),
      },
      { onConflict: 'device_id' }
    )
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

  const { game_state, board } = data.game_state as { game_state: GameState; board: Board }
  return { game_state, board }
}
