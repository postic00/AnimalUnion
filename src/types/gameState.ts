import type { Producer } from './producer'
import type { Clicker } from './clicker'
import type { Factory } from './factory'

export interface GameState {
  gold: number
  goldPerSec: number
  bundleCount: number
  producers: Producer[]
  clicker: Clicker
  factories: Factory[]
}

export const initialGameState: GameState = {
  gold: 10000,
  goldPerSec: 0,
  bundleCount: 0,
  producers: [
    { row: 0, col: 1, built: false, level: 0 },
    { row: 0, col: 3, built: false, level: 0 },
    { row: 0, col: 5, built: false, level: 0 },
  ],
  clicker: { clickCount: 0, threshold: 2 },
  factories: [],
}
