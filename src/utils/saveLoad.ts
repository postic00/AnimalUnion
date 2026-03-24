import type { Board } from '../types/board'
import type { GameState } from '../types/gameState'

const DEVICE_ID_KEY = 'animal-union-device-id'

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

const SAVE_KEY = 'animal-union-save'
const SAVE_VERSION = '1.1.0'
const MIN_SAVE_VERSION = '1.1.0' // 이 버전 미만이면 로컬 데이터 삭제

function parseVer(v: string): number[] {
  return v.split('.').map(n => parseInt(n, 10) || 0)
}
function versionLt(a: string, b: string): boolean {
  const av = parseVer(a), bv = parseVer(b)
  for (let i = 0; i < Math.max(av.length, bv.length); i++) {
    const d = (av[i] ?? 0) - (bv[i] ?? 0)
    if (d !== 0) return d < 0
  }
  return false
}

interface SaveData {
  version: string
  savedAt: number
  board: Board
  gameState: GameState
  boosts?: { speedBoostRemaining: number; goldBoostRemaining: number; speedBoostUntil?: number; goldBoostUntil?: number }
}

export function saveGame(
  board: Board,
  gameState: GameState,
  boosts?: { speedBoostRemaining: number; goldBoostRemaining: number; speedBoostUntil?: number; goldBoostUntil?: number }
): boolean {
  try {
    const data: SaveData = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      board,
      gameState,
      boosts,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.warn('저장 실패:', e)
    return false
  }
}

export function loadGame(): { board: Board; gameState: GameState; savedAt: number; boosts?: { speedBoostRemaining: number; goldBoostRemaining: number; speedBoostUntil?: number; goldBoostUntil?: number } } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data: SaveData = JSON.parse(raw)
    if (!data.version || versionLt(data.version, MIN_SAVE_VERSION)) {
      deleteSave()
      return null
    }
    if (!Array.isArray(data.board) || !data.gameState || typeof data.gameState !== 'object') return null
    return { board: data.board, gameState: data.gameState, savedAt: data.savedAt ?? Date.now(), boosts: data.boosts }
  } catch (e) {
    console.warn('로드 실패:', e)
    return null
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY)
  localStorage.removeItem(ITEMS_KEY)
  localStorage.removeItem(FA_STATES_KEY)
  localStorage.removeItem(RS_QUEUES_KEY)
  localStorage.removeItem(PRODUCE_TIMERS_KEY)
  localStorage.removeItem(PR_STATES_KEY)
  localStorage.removeItem('animal-union-work-data')
}

const ITEMS_KEY = 'animal-union-items'
const FA_STATES_KEY = 'animal-union-fa-states'
const RS_QUEUES_KEY = 'animal-union-rs-queues'
const PRODUCE_TIMERS_KEY = 'animal-union-produce-timers'
const PR_STATES_KEY = 'animal-union-pr-states'

export function saveItems(items: unknown): boolean {
  try { localStorage.setItem(ITEMS_KEY, JSON.stringify(items)); return true } catch { return false }
}

export function loadItems(): unknown[] | null {
  try {
    const raw = localStorage.getItem(ITEMS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveFaStates(faStates: unknown): boolean {
  try { localStorage.setItem(FA_STATES_KEY, JSON.stringify(faStates)); return true } catch { return false }
}

export function loadFaStates(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(FA_STATES_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveRsQueues(rsQueues: unknown): boolean {
  try { localStorage.setItem(RS_QUEUES_KEY, JSON.stringify(rsQueues)); return true } catch { return false }
}

export function loadRsQueues(): Record<string, unknown[]> | null {
  try {
    const raw = localStorage.getItem(RS_QUEUES_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveProduceTimers(timers: unknown): boolean {
  try { localStorage.setItem(PRODUCE_TIMERS_KEY, JSON.stringify(timers)); return true } catch { return false }
}

export function loadProduceTimers(): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(PRODUCE_TIMERS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function savePrStates(prStates: unknown): boolean {
  try { localStorage.setItem(PR_STATES_KEY, JSON.stringify(prStates)); return true } catch { return false }
}

export function loadPrStates(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(PR_STATES_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const WEEK_CONFIG_KEY = 'animal-union-week-config'

export function saveWeekConfig(config: Record<string, unknown>): boolean {
  try {
    localStorage.setItem(WEEK_CONFIG_KEY, JSON.stringify(config))
    return true
  } catch (e) {
    console.warn('week config 저장 실패:', e)
    return false
  }
}

export function loadWeekConfig(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(WEEK_CONFIG_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const MUTED_KEY = 'animal-union-muted'

export function saveMuted(muted: boolean): void {
  localStorage.setItem(MUTED_KEY, JSON.stringify(muted))
}

export function loadMuted(): boolean {
  try {
    const raw = localStorage.getItem(MUTED_KEY)
    if (raw === null) return false
    return JSON.parse(raw) === true
  } catch {
    return false
  }
}

export function getSavedAt(): number | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data: SaveData = JSON.parse(raw)
    return data.savedAt ?? null
  } catch {
    return null
  }
}

const PRESTIGE_TOTAL_KEY = 'animal-union-prestige-total'

export function savePrestigeTotal(total: number): void {
  try { localStorage.setItem(PRESTIGE_TOTAL_KEY, String(total)) } catch {}
}

export function loadPrestigeTotal(): number {
  try {
    const raw = localStorage.getItem(PRESTIGE_TOTAL_KEY)
    if (!raw) return 0
    const n = Number(raw)
    return isFinite(n) ? n : 0
  } catch { return 0 }
}

const WORK_DATA_KEY = 'animal-union-work-data'

export function saveWorkData(data: unknown): void {
  try { localStorage.setItem(WORK_DATA_KEY, JSON.stringify(data)) } catch {}
}

export function loadWorkData(): unknown | null {
  try {
    const raw = localStorage.getItem(WORK_DATA_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
