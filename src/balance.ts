import { CONFIG } from './config'

// 라인 확장 비용: BASE * (count+1)^EXPONENT
export function getBundleCost(bundleCount: number): number {
  return Math.floor(CONFIG.BUNDLE_COST_BASE * Math.pow(bundleCount + 1, CONFIG.BUNDLE_COST_EXPONENT))
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

// PR 아이템 가치: 고정값 (FA 처리로 증가)
export function getProducerValue(): number {
  return CONFIG.ITEM_BASE_VALUE
}

// 클릭커 임계값
export function getClickerThreshold(): number {
  return CONFIG.CLICKER_THRESHOLD
}
