import { create } from 'zustand'
import type { Board } from '../types/board'
import type { GameState } from '../types/gameState'
import { initialGameState } from '../types/gameState'
import { initialBoard } from '../data/initialBoard'

// 모듈 레벨 ref — RAF 루프/핸들러에서 React 사이클 밖에서 읽음
export const gameStateRef = { current: initialGameState as GameState }
export const boardRef = { current: initialBoard as Board }
export const mutedRef = { current: false }
export const goldMultiplierLevelRef = { current: 0 }

interface GameStoreState {
  gameState: GameState
  board: Board
  resetKey: number
  savedAt: number | null
  muted: boolean
}

interface GameStoreActions {
  setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void
  setBoard: (updater: Board | ((prev: Board) => Board)) => void
  setResetKey: (updater: (prev: number) => number) => void
  setSavedAt: (at: number | null) => void
  setMuted: (muted: boolean) => void
  init: (gameState: GameState, board: Board) => void
}

export const useGameStore = create<GameStoreState & GameStoreActions>((set) => ({
  gameState: initialGameState,
  board: initialBoard,
  resetKey: 0,
  savedAt: null,
  muted: false,

  setGameState: (updater) => {
    if (typeof updater === 'function') {
      set(s => ({ gameState: (updater as (prev: GameState) => GameState)(s.gameState) }))
    } else {
      set({ gameState: updater })
    }
  },

  setBoard: (updater) => {
    if (typeof updater === 'function') {
      set(s => ({ board: (updater as (prev: Board) => Board)(s.board) }))
    } else {
      set({ board: updater })
    }
  },

  setResetKey: (updater) => set(s => ({ resetKey: updater(s.resetKey) })),
  setSavedAt: (at) => set({ savedAt: at }),
  setMuted: (muted) => set({ muted }),

  init: (gameState, board) => set({ gameState, board }),
}))

useGameStore.subscribe(state => {
  gameStateRef.current = state.gameState
  boardRef.current = state.board
  mutedRef.current = state.muted
  goldMultiplierLevelRef.current = state.gameState.goldMultiplierLevel ?? 0
})
