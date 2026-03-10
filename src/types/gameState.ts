export interface GameState {
  gold: number
  goldPerSec: number
  bundleCount: number  // 추가된 라인 수
}

export const initialGameState: GameState = {
  gold: 0,
  goldPerSec: 0,
  bundleCount: 0,
}
