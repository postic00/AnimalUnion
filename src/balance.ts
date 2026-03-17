import { CONFIG } from './config'
import type { Factory } from './types/factory'
import type { Item } from './types/item'
import type { Animal } from './types/animal'

// 라인 확장 비용
export function getBundleCost(bundleCount: number): number {
  return Math.floor(CONFIG.BUNDLE_COST_BASE * Math.pow(bundleCount + 1, CONFIG.BUNDLE_COST_EXPONENT))
}

// PR 건설 비용
export function getProducerBuildCost(builtCount: number = 0): number {
  return Math.floor(CONFIG.PR_BUILD_COST_BASE * Math.pow(2, builtCount))
}

// PR 업그레이드 비용
export function getProducerUpgradeCost(level: number): number {
  return Math.floor(CONFIG.PRODUCER_UPGRADE_BASE * Math.pow(level, CONFIG.PRODUCER_UPGRADE_EXPONENT))
}

// PR 생산 주기
export function getProducerInterval(level: number): number {
  if (level === 0) return Infinity
  return CONFIG.PRODUCE_INTERVAL / Math.pow(CONFIG.PRODUCE_INTERVAL_MULTIPLIER, level - 1)
}

// 아이템 가치: 등급 기본값 × 가치레벨 배수
export function getItemValue(grade: number, itemValueLevel = 1): number {
  const idx = Math.max(0, Math.min(grade - 1, 19))
  const baseValue = CONFIG.GRADE_BASE_VALUES[idx] ?? 1
  const safeLevel = Math.max(1, itemValueLevel)
  return baseValue * (1 + (safeLevel - 1) * CONFIG.ITEM_VALUE_PER_LEVEL)
}

// PR 아이템 가치
export function getProducerValue(grade: number, itemValueLevel = 1): number {
  return getItemValue(grade, itemValueLevel)
}

// 아이템 가치 레벨업 비용
export function getItemValueLevelCost(level: number): number {
  return Math.floor(CONFIG.ITEM_VALUE_LEVEL_COST_BASE * Math.pow(level, CONFIG.ITEM_VALUE_LEVEL_COST_EXPONENT))
}


// FA 건설 비용
export function getFactoryBuildCost(): number {
  return CONFIG.FA_BUILD_COST_BASE
}

// FA 등급 업그레이드 비용
export function getFactoryGradeUpgradeCost(grade: number): number {
  return Math.floor(CONFIG.FA_LEVEL_UPGRADE_BASE * Math.pow(grade, CONFIG.FA_LEVEL_UPGRADE_EXPONENT))
}

// FA 레벨 업그레이드 비용
export function getFactoryLevelUpgradeCost(level: number): number {
  return Math.floor(CONFIG.FA_LEVEL_UPGRADE_BASE * Math.pow(level, CONFIG.FA_LEVEL_UPGRADE_EXPONENT))
}

// FA 잡기/놓기 시간 (고정)
export function getFactoryPickTime(): number {
  return CONFIG.FA_PICK_TIME
}

// FA 처리 시간: PROCESS_TIME_BASE × quantity / EFFICIENCY^(level-1)
export function getFactoryProcessTime(level: number, quantity: number): number {
  const safeQty = Math.max(1, quantity)
  if (level <= 0) return CONFIG.FA_PROCESS_TIME_BASE * safeQty
  return (CONFIG.FA_PROCESS_TIME_BASE * safeQty) / Math.pow(CONFIG.FA_LEVEL_EFFICIENCY, level - 1)
}

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

// WA 보너스 적용 (가치만 증가, 등급 변경 없음)
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

// PA/PK 출력 아이템 생성 (레시피 조합 결과)
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
    id: '',  // caller sets id
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

// 재료 수량: 2^(level-1)
export function getMaterialQuantity(level: number): number {
  return Math.pow(2, Math.max(1, level) - 1)
}

// 클릭커 1클릭당 기여량: 2^(level-1)
export function getClickerValue(level: number): number {
  return Math.pow(2, Math.max(1, level) - 1)
}

// 클릭커 업그레이드 비용 (생산기와 동일 공식)
export function getClickerUpgradeCost(level: number): number {
  return Math.floor(CONFIG.PRODUCER_UPGRADE_BASE * Math.pow(level + 1, CONFIG.PRODUCER_UPGRADE_EXPONENT))
}

// 클릭커 threshold 계산
export function getClickerThreshold(quantity: number, clickerLevel: number): number {
  return Math.max(1, Math.ceil(quantity / getClickerValue(clickerLevel)))
}

// 재료 수량 레벨업 비용
export function getMaterialQuantityLevelCost(level: number): number {
  return Math.floor(CONFIG.MATERIAL_QUANTITY_COST_BASE * Math.pow(level, CONFIG.MATERIAL_QUANTITY_COST_EXPONENT))
}

// RS 버퍼 용량
export function getRsBufferCapacity(level: number): number {
  return CONFIG.RS_BUFFER_BASE + (level - 1) * CONFIG.RS_BUFFER_PER_LEVEL
}

// FA 버퍼 용량
export function getFaBufferCapacity(level: number): number {
  return CONFIG.FA_BUFFER_BASE + (level - 1) * CONFIG.FA_BUFFER_PER_LEVEL
}

// 버퍼 업그레이드 비용
export function getBufferUpgradeCost(level: number): number {
  return Math.floor(CONFIG.BUFFER_UPGRADE_COST_BASE * Math.pow(level, CONFIG.BUFFER_UPGRADE_COST_EXPONENT))
}

// 동물 해금 비용
export function getAnimalUnlockCost(): number {
  return CONFIG.ANIMAL_UNLOCK_COST
}

// 동물 업그레이드 비용
export function getAnimalUpgradeCost(level: number): number {
  return Math.floor(CONFIG.ANIMAL_UPGRADE_COST_BASE * Math.pow(level, CONFIG.ANIMAL_UPGRADE_COST_EXPONENT))
}

// 동물 stat
export function getAnimalStat(level: number): number {
  return CONFIG.ANIMAL_STAT_BASE + (level - 1) * CONFIG.ANIMAL_STAT_PER_LEVEL
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

// 조합 레시피 정의 (outputGrade → 필요 재료)
export const RECIPES: Record<number, { grade: number; count: number }[]> = {
  4:  [{ grade: 1, count: 2 }],
  5:  [{ grade: 2, count: 2 }],
  6:  [{ grade: 3, count: 2 }],
  7:  [{ grade: 5, count: 3 }],
  8:  [{ grade: 4, count: 2 }, { grade: 6, count: 1 }],
  9:  [{ grade: 5, count: 2 }, { grade: 7, count: 1 }],
  10: [{ grade: 8, count: 2 }, { grade: 4, count: 2 }],
  11: [{ grade: 9, count: 2 }, { grade: 7, count: 2 }],
  12: [{ grade: 10, count: 2 }, { grade: 11, count: 2 }, { grade: 3, count: 3 }],
  13: [{ grade: 12, count: 1 }, { grade: 10, count: 2 }],
  14: [{ grade: 12, count: 1 }, { grade: 11, count: 2 }],
  15: [{ grade: 13, count: 2 }, { grade: 8, count: 2 }],
  16: [{ grade: 14, count: 2 }, { grade: 9, count: 2 }],
  17: [{ grade: 15, count: 2 }, { grade: 12, count: 2 }],
  18: [{ grade: 16, count: 3 }, { grade: 14, count: 2 }],
  19: [{ grade: 17, count: 2 }, { grade: 15, count: 2 }, { grade: 12, count: 2 }],
  20: [{ grade: 19, count: 1 }, { grade: 18, count: 1 }],
}
