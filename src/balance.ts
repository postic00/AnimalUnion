import { CONFIG } from './config'
import type { Factory } from './types/factory'
import type { Item } from './types/item'
import type { Animal } from './types/animal'

// 라인 확장 비용: BASE * (count+1)^EXPONENT
export function getBundleCost(bundleCount: number): number {
  return Math.floor(CONFIG.BUNDLE_COST_BASE * Math.pow(bundleCount + 1, CONFIG.BUNDLE_COST_EXPONENT))
}

// PR 건설 비용
export function getProducerBuildCost(): number {
  return Math.floor(CONFIG.PR_BUILD_COST_BASE * Math.pow(1, CONFIG.PR_BUILD_COST_EXPONENT))
}

// PR 업그레이드 비용: BASE * (level+1)^EXPONENT
export function getProducerUpgradeCost(level: number): number {
  return Math.floor(CONFIG.PRODUCER_UPGRADE_BASE * Math.pow(level + 1, CONFIG.PRODUCER_UPGRADE_EXPONENT))
}

// PR 생산 주기: PRODUCE_INTERVAL / (level * MULTIPLIER)
export function getProducerInterval(level: number): number {
  if (level === 0) return Infinity
  return CONFIG.PRODUCE_INTERVAL / (level * CONFIG.PRODUCE_INTERVAL_MULTIPLIER)
}

// 아이템 가치: itemValueLevel 반영
export function getItemValue(itemValueLevel = 1): number {
  return CONFIG.ITEM_BASE_VALUE + (itemValueLevel - 1) * CONFIG.ITEM_VALUE_PER_LEVEL
}

// PR 아이템 가치 (하위호환)
export function getProducerValue(itemValueLevel = 1): number {
  return getItemValue(itemValueLevel)
}

// 아이템 가치 레벨업 비용: BASE * level^EXPONENT
export function getItemValueLevelCost(level: number): number {
  return Math.floor(CONFIG.ITEM_VALUE_LEVEL_COST_BASE * Math.pow(level, CONFIG.ITEM_VALUE_LEVEL_COST_EXPONENT))
}

// 클릭커 임계값
export function getClickerThreshold(): number {
  return CONFIG.CLICKER_THRESHOLD
}

// FA 건설 비용
export function getFactoryBuildCost(): number {
  return Math.floor(CONFIG.FA_BUILD_COST_BASE * Math.pow(1, CONFIG.FA_BUILD_COST_EXPONENT))
}

// FA 등급 업그레이드 비용: BASE * (grade+1)^EXPONENT
export function getFactoryGradeUpgradeCost(grade: number): number {
  return Math.floor(CONFIG.FA_GRADE_UPGRADE_BASE * Math.pow(grade + 1, CONFIG.FA_GRADE_UPGRADE_EXPONENT))
}

// FA 레벨 업그레이드 비용: BASE * (level+1)^EXPONENT
export function getFactoryLevelUpgradeCost(level: number): number {
  return Math.floor(CONFIG.FA_LEVEL_UPGRADE_BASE * Math.pow(level + 1, CONFIG.FA_LEVEL_UPGRADE_EXPONENT))
}

// FA 처리 시간: PICK_TIME / (level * MULTIPLIER)
export function getFactoryPickTime(level: number): number {
  if (level === 0) return CONFIG.FA_PICK_TIME
  return CONFIG.FA_PICK_TIME / (level * CONFIG.FA_PICK_TIME_MULTIPLIER)
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

// FA 보너스 적용 (공장 처리 후 아이템 수치 갱신)
export function applyFactoryBonus(item: Item, factory: Factory, animals: Animal[]): Item {
  const { type, grade } = factory
  if (grade === 0) return item
  const baseBonus = getFactoryBonus(type, grade)
  const animal = factory.animalId ? animals.find(a => a.id === factory.animalId && a.unlocked) : null
  const animalBonus = animal ? getAnimalStat(animal.level) : 0
  const bonus = baseBonus + animalBonus
  if (type === 'WA') {
    if (item.waGrades.includes(grade)) return item
    return { ...item, waBonus: item.waBonus + bonus, waGrades: [...item.waGrades, grade] }
  } else if (type === 'PA') {
    if (item.paGrades.includes(grade)) return item
    return { ...item, paBonus: item.paBonus + bonus, paGrades: [...item.paGrades, grade] }
  } else {
    if (item.pkGrades.includes(grade)) return item
    return { ...item, pkBonus: item.pkBonus + bonus, pkGrades: [...item.pkGrades, grade] }
  }
}

// 재료 수량: 2^(level-1)
export function getMaterialQuantity(level: number): number {
  return Math.pow(2, level - 1)
}

// 재료 수량 레벨업 비용
export function getMaterialQuantityLevelCost(level: number): number {
  return Math.floor(CONFIG.MATERIAL_QUANTITY_COST_BASE * Math.pow(level, CONFIG.MATERIAL_QUANTITY_COST_EXPONENT))
}

// 동물 해금 비용
export function getAnimalUnlockCost(): number {
  return CONFIG.ANIMAL_UNLOCK_COST
}

// 동물 업그레이드 비용: BASE * level^EXPONENT
export function getAnimalUpgradeCost(level: number): number {
  return Math.floor(CONFIG.ANIMAL_UPGRADE_COST_BASE * Math.pow(level, CONFIG.ANIMAL_UPGRADE_COST_EXPONENT))
}

// 동물 stat: BASE + (level-1) * PER_LEVEL
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

// productGrade 해금 비용: 2^(grade-2) 포인트
export function getProductGradeUnlockCost(grade: number): number {
  return Math.pow(2, grade - 2)
}
