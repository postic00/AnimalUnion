import type { Board } from '../types/board'
import type { GameState } from '../types/gameState'
import {
  saveGame as _saveGame,
  loadGame as _loadGame,
  deleteSave as _deleteSave,
  saveItems, loadItems,
  saveFaStates, loadFaStates,
  saveRsQueues, loadRsQueues,
  saveProduceTimers, loadProduceTimers,
  savePrStates, loadPrStates,
  saveWeekConfig as _saveWeekConfig,
  loadWeekConfig as _loadWeekConfig,
  saveMuted as _saveMuted,
  loadMuted as _loadMuted,
  getDeviceId as _getDeviceId,
} from '../utils/saveLoad'

export interface EngineState {
  items: unknown[]
  faStates: Record<string, unknown>
  rsQueues: Record<string, unknown[]>
  produceTimers: Record<string, number>
  prStates: Record<string, unknown>
}

export const SaveService = {
  // ── 게임 저장/로드 ────────────────────────────────────────────────────────
  saveGame(
    board: Board,
    gameState: GameState,
    boosts?: { speedBoostUntil: number; goldBoostUntil: number }
  ): boolean {
    return _saveGame(board, gameState, boosts)
  },

  loadGame() {
    return _loadGame()
  },

  deleteSave(): void {
    _deleteSave()
  },

  // ── 엔진 상태 일괄 저장/로드 ─────────────────────────────────────────────
  saveEngineState(state: Partial<EngineState>): void {
    if (state.items !== undefined) saveItems(state.items)
    if (state.faStates !== undefined) saveFaStates(state.faStates)
    if (state.rsQueues !== undefined) saveRsQueues(state.rsQueues)
    if (state.produceTimers !== undefined) saveProduceTimers(state.produceTimers)
    if (state.prStates !== undefined) savePrStates(state.prStates)
  },

  loadEngineState(): EngineState {
    return {
      items: (loadItems() ?? []) as unknown[],
      faStates: (loadFaStates() ?? {}) as Record<string, unknown>,
      rsQueues: (loadRsQueues() ?? {}) as Record<string, unknown[]>,
      produceTimers: (loadProduceTimers() ?? {}) as Record<string, number>,
      prStates: (loadPrStates() ?? {}) as Record<string, unknown>,
    }
  },

  // ── 엔진 상태 개별 저장/로드 (하위 호환) ─────────────────────────────────
  saveItems,
  loadItems,
  saveFaStates,
  loadFaStates,
  saveRsQueues,
  loadRsQueues,
  saveProduceTimers,
  loadProduceTimers,
  savePrStates,
  loadPrStates,

  // ── 주차 설정 ─────────────────────────────────────────────────────────────
  saveWeekConfig(config: Record<string, unknown>): boolean {
    return _saveWeekConfig(config)
  },

  loadWeekConfig(): Record<string, unknown> | null {
    return _loadWeekConfig()
  },

  // ── 사운드 설정 ───────────────────────────────────────────────────────────
  saveMuted(muted: boolean): void {
    _saveMuted(muted)
  },

  loadMuted(): boolean {
    return _loadMuted()
  },

  // ── 디바이스 ─────────────────────────────────────────────────────────────
  getDeviceId(): string {
    return _getDeviceId()
  },
}
