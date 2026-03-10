import type { Producer } from './producer'
import type { Clicker } from './clicker'

export interface GameState {
  gold: number
  goldPerSec: number
  bundleCount: number
  producers: Producer[]
  clicker: Clicker
}

export const initialGameState: GameState = {
  gold: 100,
  goldPerSec: 0,
  bundleCount: 0,
  producers: [
    { row: 0, col: 1, level: 0 },
    { row: 0, col: 3, level: 0 },
    { row: 0, col: 5, level: 0 },
  ],
  clicker: { clickCount: 0, threshold: 2 },
}
