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
const SAVE_VERSION = '1.0.0'

interface SaveData {
  version: string
  savedAt: number
  board: Board
  gameState: GameState
  boosts?: { speedBoostUntil: number; goldBoostUntil: number }
}

export function saveGame(
  board: Board,
  gameState: GameState,
  boosts?: { speedBoostUntil: number; goldBoostUntil: number }
): void {
  try {
    const data: SaveData = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      board,
      gameState,
      boosts,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('저장 실패:', e)
  }
}

export function loadGame(): { board: Board; gameState: GameState; savedAt: number; boosts?: { speedBoostUntil: number; goldBoostUntil: number } } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data: SaveData = JSON.parse(raw)
    if (data.version !== SAVE_VERSION) return null
    return { board: data.board, gameState: data.gameState, savedAt: data.savedAt, boosts: data.boosts }
  } catch (e) {
    console.warn('로드 실패:', e)
    return null
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY)
  localStorage.removeItem(ITEMS_KEY)
  localStorage.removeItem(FA_STATES_KEY)
}

const ITEMS_KEY = 'animal-union-items'
const FA_STATES_KEY = 'animal-union-fa-states'

export function saveItems(items: unknown): void {
  try { localStorage.setItem(ITEMS_KEY, JSON.stringify(items)) } catch { /* ignore */ }
}

export function loadItems(): unknown[] | null {
  try {
    const raw = localStorage.getItem(ITEMS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveFaStates(faStates: unknown): void {
  try { localStorage.setItem(FA_STATES_KEY, JSON.stringify(faStates)) } catch { /* ignore */ }
}

export function loadFaStates(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(FA_STATES_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const WEEK_CONFIG_KEY = 'animal-union-week-config'

export function saveWeekConfig(config: Record<string, unknown>): void {
  try {
    localStorage.setItem(WEEK_CONFIG_KEY, JSON.stringify(config))
  } catch (e) {
    console.warn('week config 저장 실패:', e)
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
