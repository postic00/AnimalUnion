import type { Producer } from './producer'
import type { Clicker } from './clicker'
import type { Factory } from './factory'
import { type Animal, initialAnimals } from './animal'
import { CONFIG } from '../config'

export interface GameState {
  playerName: string
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
  prestigePoints: { current: number; total: number }
  itemValueLevels: number[]  // 인덱스 = 아이템 등급-1, 값 = 가치 레벨
  materialQuantityLevels: number[]  // 등급별 재료 수량 레벨 (환생 시 리셋)
  animals: Animal[]          // 환생 유지
  rsBufferLevel: number      // RS 버퍼 레벨 (환생 유지)
  faBufferLevel: number      // FA 버퍼 레벨 (환생 유지)
  railSpeedLevel: number     // 레일 속도 레벨 (환생 유지)
  buildDiscountLevel: number   // 건설 비용 할인 레벨 (환생 유지)
  bundleDiscountLevel: number  // 번들 비용 할인 레벨 (환생 유지)
  producerStartLevel: number   // 생산자 시작 레벨 (환생 유지)
  goldMultiplierLevel: number  // 골드 배율 레벨 (환생 유지)
  initialGoldLevel: number     // 초기 골드 레벨 (환생 유지)
	currentWeek: number
}

export const initialGameState: GameState = {
  playerName: '',
  gold: 0,
  goldPerSec: 0,
  bundleCount: 0,
  producers: [
    { row: 0, col: 1, built: false, level: 1, grade: 1 },
    { row: 0, col: 3, built: false, level: 1, grade: 2 },
    { row: 0, col: 5, built: false, level: 1, grade: 3 },
  ],
  clicker: { clickCount: 0, threshold: CONFIG.CM_CLICKER_THRESHOLD, level: 1 },
  factories: [],
  totalEarned: 0,
  prestigeCount: 0,
  prestigePoints: { current: 0, total: 0 },
  itemValueLevels: Array(20).fill(0),
  materialQuantityLevels: Array(20).fill(1),
  animals: initialAnimals,
  rsBufferLevel: 0,
  faBufferLevel: 0,
  railSpeedLevel: 0,
  buildDiscountLevel: 0,
  bundleDiscountLevel: 0,
  producerStartLevel: 0,
  goldMultiplierLevel: 0,
  initialGoldLevel: 0,
	currentWeek: 0,
}
