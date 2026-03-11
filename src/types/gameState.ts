import type { Producer } from './producer'
import type { Clicker } from './clicker'
import type { Factory } from './factory'
import { type Animal, initialAnimals } from './animal'

export interface GameState {
  gold: number
  goldPerSec: number
  bundleCount: number
  producers: Producer[]
  clicker: Clicker
  factories: Factory[]
  // 환생 리셋 필드
  totalEarned: number
  // 환생 유지 필드
  prestigeCount: number
  prestigePoints: number
  itemValueLevels: number[]  // 인덱스 = 아이템 등급-1, 값 = 가치 레벨
  materialQuantityLevels: number[]  // 등급별 재료 수량 레벨 (환생 시 리셋)
  animals: Animal[]          // 환생 유지
}

export const initialGameState: GameState = {
  gold: 100_000_000_000_000,
  goldPerSec: 0,
  bundleCount: 0,
  producers: [
    { row: 0, col: 1, built: false, level: 0 },
    { row: 0, col: 3, built: false, level: 0 },
    { row: 0, col: 5, built: false, level: 0 },
  ],
  clicker: { clickCount: 0, threshold: 2 },
  factories: [],
  totalEarned: 0,
  prestigeCount: 0,
  prestigePoints: 100_000_000_000_000,
  itemValueLevels: Array(20).fill(1),
  materialQuantityLevels: Array(20).fill(1),
  animals: initialAnimals,
}
