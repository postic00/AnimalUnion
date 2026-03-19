import { CONFIG } from './config'
import type { Factory } from './types/factory'
import type { Item } from './types/item'
import type { Animal } from './types/animal'

function memo1(fn: (a: number) => number): (a: number) => number {
  const cache = new Map<number, number>()
  return (a: number) => {
    if (cache.has(a)) return cache.get(a)!
    const v = fn(a); cache.set(a, v); return v
  }
}

function memo2(fn: (a: number, b: number) => number): (a: number, b: number) => number {
  const cache = new Map<number, number>()
  return (a: number, b: number) => {
    const k = a * 10000 + b
    if (cache.has(k)) return cache.get(k)!
    const v = fn(a, b); cache.set(k, v); return v
  }
}

// 공통 COST 함수: BASE * RATE^(lv*EXP + lv²*ACC)
export function calcCost(base: number, rate: number, exp: number, acc: number, lv: number): number {
  return Math.floor(base * Math.pow(rate, lv * exp + lv * lv * acc))
}

// 공통 PROC 함수: BASE * lv * EXP * ACC
export function calcProc(base: number, exp: number, acc: number, lv: number): number {
  return base * lv * exp * acc
}

// 라인 확장 비용
export function getBundleCost(bundleCount: number): number {
  return calcCost(CONFIG.BD_COST_BASE, CONFIG.BD_COST_RATE, CONFIG.BD_COST_EXP, CONFIG.BD_COST_ACC, bundleCount + 1)
}

// PR 건설 비용
export function getProducerBuildCost(_builtCount: number = 0): number {
  return CONFIG.PR_BUILD_COST_BASE
}

// PR 업그레이드 비용
export function getProducerUpgradeCost(level: number): number {
  return calcCost(CONFIG.PR_COST_BASE, CONFIG.PR_COST_RATE, CONFIG.PR_COST_EXP, CONFIG.PR_COST_ACC, level)
}

// PR 생산 주기
export const getProducerInterval = memo1((level: number): number => {
  if (level === 0) return Infinity
  return CONFIG.PR_PROC_BASE / Math.pow(CONFIG.PR_PROC_RATE, level - 1)
})

// 아이템 가치: 등급 기본값 × 가치레벨 배수
export function getItemValue(grade: number, itemValueLevel = 1): number {
  const idx = Math.max(0, Math.min(grade - 1, 19))
  const baseValue = CONFIG.GRADE_BASE_VALUES[idx] ?? 1
  return baseValue * calcProc(CONFIG.IT_PROC_BASE, CONFIG.IT_PROC_EXP, CONFIG.IT_PROC_ACC, Math.max(1, itemValueLevel))
}

// PR 아이템 가치
export function getProducerValue(grade: number, itemValueLevel = 1): number {
  return getItemValue(grade, itemValueLevel)
}

// 아이템 가치 레벨업 비용
export function getItemValueLevelCost(level: number): number {
  return calcCost(CONFIG.IT_COST_BASE, CONFIG.IT_COST_RATE, CONFIG.IT_COST_EXP, CONFIG.IT_COST_ACC, level)
}

// FA 건설 비용
export function getFactoryBuildCost(): number {
  return CONFIG.FA_BUILD_COST_BASE
}

// FA 등급 업그레이드 비용
export function getFactoryGradeUpgradeCost(grade: number): number {
  return calcCost(CONFIG.FA_COST_BASE, CONFIG.FA_COST_RATE, CONFIG.FA_COST_EXP, CONFIG.FA_COST_ACC, grade)
}

// FA 레벨 업그레이드 비용
export function getFactoryLevelUpgradeCost(level: number): number {
  return calcCost(CONFIG.FA_COST_BASE, CONFIG.FA_COST_RATE, CONFIG.FA_COST_EXP, CONFIG.FA_COST_ACC, level)
}

// FA 잡기/놓기 시간 (고정)
export function getFactoryPickTime(): number {
  return CONFIG.FA_PICK_TIME
}

// FA 처리 시간: PROC_BASE × quantity / PROC_RATE^(level-1)
export const getFactoryProcessTime = memo2((level: number, quantity: number): number => {
  const safeQty = Math.max(1, quantity)
  if (level <= 0) return CONFIG.FA_PROC_BASE * safeQty
  return (CONFIG.FA_PROC_BASE * safeQty) / Math.pow(CONFIG.FA_PROC_RATE, level - 1)
})

// FA 등급 보너스
export function getFactoryBonus(type: Factory['type'], grade: number): number {
  if (grade === 0) return 0
  const idx = Math.min(grade - 1, 19)
  if (type === 'WA') return CONFIG.WA_BONUS[idx]
  if (type === 'PA') return CONFIG.PA_BONUS[idx]
  return CONFIG.PK_BONUS[idx]
}

// 아이템 최종 골드 계산
export function getFinalGold(item: Item): number {
  return item.value * item.quantity * (1 + item.waBonus) * (1 + item.paBonus) * (1 + item.pkBonus)
}

// WA 보너스 적용
export function applyWaBonus(item: Item, factory: Factory, animals: Animal[]): Item {
  const { grade } = factory
  if (grade === 0) return item
  if (item.waGrades.includes(grade)) return item
  const animal = factory.animalId ? animals.find(a => a.id === factory.animalId && a.unlocked) : null
  const animalBonus = animal ? getAnimalStat(animal.level) : 0
  const bonus = getFactoryBonus('WA', grade) + animalBonus
  return { ...item, waBonus: item.waBonus + bonus, waGrades: [...item.waGrades, grade] }
}

export function applyPkBonus(item: Item, factory: Factory, animals: Animal[]): Item {
  const { grade } = factory
  if (grade === 0) return item
  if (item.pkGrades.includes(grade)) return item
  const animal = factory.animalId ? animals.find(a => a.id === factory.animalId && a.unlocked) : null
  const animalBonus = animal ? getAnimalStat(animal.level) : 0
  const bonus = getFactoryBonus('PK', grade) + animalBonus
  return { ...item, pkBonus: item.pkBonus + bonus, pkGrades: [...item.pkGrades, grade] }
}

// PA/PK 출력 아이템 생성
export function createRecipeOutput(
  outputGrade: number,
  factory: Factory,
  animals: Animal[],
  itemValueLevel: number,
  materialQuantityLevel: number,
): Item {
  const quantity = getMaterialQuantity(materialQuantityLevel)
  const value = getItemValue(outputGrade, itemValueLevel)
  const animal = factory.animalId ? animals.find(a => a.id === factory.animalId && a.unlocked) : null
  const animalBonus = animal ? getAnimalStat(animal.level) : 0
  const bonus = getFactoryBonus(factory.type, factory.grade) + animalBonus
  const paBonus = factory.type === 'PA' ? bonus : 0
  const pkBonus = factory.type === 'PK' ? bonus : 0
  return {
    id: '',
    x: 0, y: 0, dx: 0, dy: 0, targetX: 0, targetY: 0,
    grade: outputGrade,
    value,
    quantity,
    waBonus: 0,
    paBonus,
    pkBonus,
    waGrades: [],
    paGrades: factory.type === 'PA' && factory.grade > 0 ? [factory.grade] : [],
    pkGrades: factory.type === 'PK' && factory.grade > 0 ? [factory.grade] : [],
  }
}

// FA 보너스 적용 (하위호환 - WA용)
export function applyFactoryBonus(item: Item, factory: Factory, animals: Animal[]): Item {
  if (factory.type === 'WA') return applyWaBonus(item, factory, animals)
  return item
}

// 재료 수량: RATE^(level-1)
export const getMaterialQuantity = memo1((level: number): number => {
  return Math.pow(CONFIG.IC_PROC_RATE, Math.max(1, level) - 1)
})

// 클릭커 1클릭당 기여량
export function getClickerValue(level: number): number {
  return Math.pow(CONFIG.IC_PROC_RATE, Math.max(1, level) - 1)
}

// 클릭커 업그레이드 비용
export function getClickerUpgradeCost(level: number): number {
  return calcCost(CONFIG.PR_COST_BASE, CONFIG.PR_COST_RATE, CONFIG.PR_COST_EXP, CONFIG.PR_COST_ACC, level + 1)
}

// 클릭커 threshold 계산
export function getClickerThreshold(quantity: number, clickerLevel: number): number {
  return Math.max(1, Math.ceil(quantity / getClickerValue(clickerLevel)))
}

// 재료 수량 레벨업 비용
export function getMaterialQuantityLevelCost(level: number): number {
  return calcCost(CONFIG.IC_COST_BASE, CONFIG.IC_COST_RATE, CONFIG.IC_COST_EXP, CONFIG.IC_COST_ACC, level)
}

// RS 버퍼 용량
export function getRsBufferCapacity(level: number): number {
  return Math.floor(calcProc(CONFIG.BF_PROC_BASE, CONFIG.BF_PROC_EXP, CONFIG.BF_PROC_ACC, level))
}

// FA 버퍼 용량
export function getFaBufferCapacity(level: number): number {
  return Math.floor(calcProc(CONFIG.BF_PROC_BASE, CONFIG.BF_PROC_EXP, CONFIG.BF_PROC_ACC, level))
}

// 버퍼 업그레이드 비용
export function getBufferUpgradeCost(level: number): number {
  return calcCost(CONFIG.BF_COST_BASE, CONFIG.BF_COST_RATE, CONFIG.BF_COST_EXP, CONFIG.BF_COST_ACC, level)
}

// 레일 이동 속도
export function getRailMoveSpeed(level: number): number {
  const safeLevel = Math.max(1, Math.min(level, CONFIG.RAIL_SPEED_MAX_LEVEL))
  const t = (safeLevel - 1) / (CONFIG.RAIL_SPEED_MAX_LEVEL - 1)
  const multiplier = CONFIG.RL_PROC_RATE + (CONFIG.RAIL_SPEED_MAX_MULTIPLIER - CONFIG.RL_PROC_RATE) * t
  return CONFIG.RL_PROC_BASE / multiplier
}

// 레일 속도 업그레이드 비용
export function getRailSpeedUpgradeCost(level: number): number {
  return calcCost(CONFIG.RL_COST_BASE, CONFIG.RL_COST_RATE, CONFIG.RL_COST_EXP, CONFIG.RL_COST_ACC, level)
}

// 동물 해금 비용
export function getAnimalUnlockCost(): number {
  return CONFIG.AM_UNLOCK_COST
}

// 동물 업그레이드 비용
export function getAnimalUpgradeCost(level: number): number {
  return calcCost(CONFIG.AM_COST_BASE, CONFIG.AM_COST_RATE, CONFIG.AM_COST_EXP, CONFIG.AM_COST_ACC, level)
}

// 동물 stat
export function getAnimalStat(level: number): number {
  return calcProc(CONFIG.AM_PROC_BASE, CONFIG.AM_PROC_EXP, CONFIG.AM_PROC_ACC, level)
}

// 아이템 가치 초기화 시 환급 포인트
export function getItemValueResetRefund(itemValueLevels: number[]): number {
  return itemValueLevels.reduce((total, level) => {
    for (let l = 1; l < level; l++) total += getItemValueLevelCost(l)
    return total
  }, 0)
}

// 동물 초기화 시 환급 포인트
export function getAnimalResetRefund(animals: { unlocked: boolean; level: number }[]): number {
  return animals.reduce((total, a) => {
    if (!a.unlocked) return total
    total += getAnimalUnlockCost()
    for (let l = 1; l < a.level; l++) total += getAnimalUpgradeCost(l)
    return total
  }, 0)
}

// 환생 가능 여부
export function canPrestige(totalEarned: number): boolean {
  return totalEarned >= CONFIG.PRESTIGE_CONDITION
}

// 환생 시 획득 포인트
export function getPrestigePoints(totalEarned: number): number {
  return Math.floor(totalEarned / CONFIG.PRESTIGE_POINTS_DIVISOR)
}

// productGrade 해금 비용
export function getProductGradeUnlockCost(grade: number): number {
  return Math.pow(2, grade - 2)
}

// 조합 레시피 정의
export const RECIPES: Record<number, { grade: number; count: number }[]> = {
  4:  [{ grade: 1, count: 5 }],
  5:  [{ grade: 2, count: 5 }],
  6:  [{ grade: 3, count: 5 }],
  7:  [{ grade: 4, count: 5 }, { grade: 5, count: 5 }],
  8:  [{ grade: 5, count: 5 }, { grade: 6, count: 5 }],
  9:  [{ grade: 4, count: 5 }, { grade: 5, count: 5 }, { grade: 6, count: 5 }],
  10: [{ grade: 7, count: 5 }],
  11: [{ grade: 7, count: 5 }, { grade: 8, count: 5 }],
  12: [{ grade: 8, count: 5 }, { grade: 9, count: 5 }],
  13: [{ grade: 10, count: 5 }],
  14: [{ grade: 10, count: 5 }, { grade: 11, count: 5 }],
  15: [{ grade: 11, count: 5 }, { grade: 12, count: 5 }],
  16: [{ grade: 13, count: 5 }],
  17: [{ grade: 13, count: 5 }, { grade: 14, count: 5 }],
  18: [{ grade: 14, count: 5 }, { grade: 15, count: 5 }],
  19: [{ grade: 16, count: 5 }, { grade: 17, count: 5 }],
  20: [{ grade: 17, count: 5 }, { grade: 18, count: 5 }],
}
