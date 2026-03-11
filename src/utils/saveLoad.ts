import type { Board } from '../types/board'
import type { GameState } from '../types/gameState'

const SAVE_KEY = 'animal-union-save'
const SAVE_VERSION = '1.0.0'

interface SaveData {
  version: string
  savedAt: number
  board: Board
  gameState: GameState
}

export function saveGame(board: Board, gameState: GameState): void {
  try {
    const data: SaveData = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      board,
      gameState,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('저장 실패:', e)
  }
}

export function loadGame(): { board: Board; gameState: GameState; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data: SaveData = JSON.parse(raw)
    if (data.version !== SAVE_VERSION) return null
    return { board: data.board, gameState: data.gameState, savedAt: data.savedAt }
  } catch (e) {
    console.warn('로드 실패:', e)
    return null
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY)
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
