import type { Board } from '../types/board'
import type { GameState } from '../types/gameState'
import type { WorkData } from '../types/workData'
import {
  fetchAndSaveWeekConfig as _fetchAndSaveWeekConfig,
  saveToCloud as _saveToCloud,
  loadFromCloud as _loadFromCloud,
} from '../lib/userProfile'

export interface CloudExtras {
  boosts?: { speedBoostRemaining: number; goldBoostRemaining: number }
  workData?: WorkData
  items?: unknown[]
  faStates?: Record<string, unknown>
  rsQueues?: Record<string, unknown[]>
  produceTimers?: Record<string, number>
  prStates?: Record<string, unknown>
}

export const CloudService = {
  // ── 주차 설정 동기화 ─────────────────────────────────────────────────────
  fetchAndSaveWeekConfig(): Promise<void> {
    return _fetchAndSaveWeekConfig()
  },

  // ── 클라우드 저장/로드 ────────────────────────────────────────────────────
  save(
    playerName: string,
    gameState: GameState,
    board: Board,
    platform: string,
    extras?: CloudExtras
  ): Promise<boolean> {
    return _saveToCloud(playerName, gameState, board, platform, extras)
  },

  load() {
    return _loadFromCloud()
  },
}
