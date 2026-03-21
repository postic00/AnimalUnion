import type { Board } from '../types/board'
import type { GameState } from '../types/gameState'
import type { WorkData } from '../types/workData'
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
  saveWorkData as _saveWorkData,
  loadWorkData as _loadWorkData,
} from '../utils/saveLoad'

// saveLoad.ts의 MIN_SAVE_VERSION과 동기화 필요
const MIN_SUPPORTED_VERSION = '1.1.0'
const _PEEK_KEY = 'animal-union-save'

function _parseVer(v: string): number[] {
  return v.split('.').map(n => parseInt(n, 10) || 0)
}
function _versionLt(a: string, b: string): boolean {
  const av = _parseVer(a), bv = _parseVer(b)
  for (let i = 0; i < Math.max(av.length, bv.length); i++) {
    const d = (av[i] ?? 0) - (bv[i] ?? 0)
    if (d !== 0) return d < 0
  }
  return false
}

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

  // ── 근무 보상 데이터 ──────────────────────────────────────────────────────
  saveWorkData(data: WorkData): void {
    _saveWorkData(data)
  },

  loadWorkData(): WorkData | null {
    const raw = _loadWorkData()
    if (!raw || typeof raw !== 'object') return null
    return raw as WorkData
  },

  // ── 구버전 감지 ───────────────────────────────────────────────────────────
  peekSave(): { version: string } | null {
    try {
      const raw = localStorage.getItem(_PEEK_KEY)
      if (!raw) return null
      const data = JSON.parse(raw)
      return data.version ? { version: data.version } : null
    } catch { return null }
  },

  isUnsupportedVersion(version: string): boolean {
    return _versionLt(version, MIN_SUPPORTED_VERSION)
  },
}
