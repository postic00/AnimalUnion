import type { GameState } from '../../types/gameState'
import { canPrestige, getPrestigePoints, getItemValueLevelCost, getEffectiveItemValue, getBufferUpgradeCost, getRsBufferCapacity, getFaBufferCapacity, getRailSpeedUpgradeCost, getRailMoveSpeed, getBuildCostDiscount, getBundleCostDiscount, getGoldMultiplierBonus, getBuildDiscountCost, getBundleDiscountCost, getProducerStartCost, getGoldMultiplierCost, getInitialGold, getInitialGoldCost, getBulkCost, getBulkCount } from '../../balance'
import type { UpgradeAmount } from '../navigation/UpgradeAmountToggle'
import { formatGold } from '../../utils/formatGold'
import { CONFIG } from '../../config'
import coinIcon from '../../assets/coin.svg'
import styles from './PrestigeTab.module.css'

import { getGradeData } from '../../data/grades'
import { GradeIcon } from '../common/GradeIcon'

interface Props {
  gameState: GameState
  section: 'item' | 'buffer'
  upgradeAmount: UpgradeAmount
  onPrestige: () => void
  onPrestigeKeepPoints: () => void
  onLevelUpItemValue: (gradeIndex: number) => void
  onUpgradeRsBuffer: () => void
  onUpgradeFaBuffer: () => void
  onUpgradeRailSpeed: () => void
  onUpgradeBuildDiscount: () => void
  onUpgradeBundleDiscount: () => void
  onUpgradeProducerStart: () => void
  onUpgradeGoldMultiplier: () => void
  onUpgradeInitialGold: () => void
}

export default function PrestigeTab({ gameState, section, upgradeAmount, onPrestige, onPrestigeKeepPoints, onLevelUpItemValue, onUpgradeRsBuffer, onUpgradeFaBuffer, onUpgradeRailSpeed, onUpgradeBuildDiscount, onUpgradeBundleDiscount, onUpgradeProducerStart, onUpgradeGoldMultiplier, onUpgradeInitialGold }: Props) {
  const { totalEarned, itemValueLevels, rsBufferLevel, faBufferLevel } = gameState
  const prestigePoints = gameState.prestigePoints.current
  const railSpeedLevel = gameState.railSpeedLevel ?? 1
  const buildDiscountLevel = gameState.buildDiscountLevel ?? 0
  const bundleDiscountLevel = gameState.bundleDiscountLevel ?? 0
  const producerStartLevel = gameState.producerStartLevel ?? 0
  const goldMultiplierLevel = gameState.goldMultiplierLevel ?? 0
  const initialGoldLevel = gameState.initialGoldLevel ?? 0
  const possible = canPrestige(totalEarned)
  const earnPoints = getPrestigePoints(totalEarned)
  return (
    <div className={styles.container}>

      {/* 환생 버튼 */}
      <div className={styles.prestigeBtns}>
        <button className={styles.prestigeBtn} onClick={onPrestige} disabled={!possible}>
          <span className={styles.prestigeBtnIcon}>⭐</span>
          <div className={styles.prestigeBtnTexts}>
            <span className={styles.prestigeBtnTitle}>환생</span>
            <span className={styles.prestigeBtnSub}>포인트 리셋</span>
          </div>
          <span className={styles.prestigeBtnPoints}>+{formatGold(earnPoints)}</span>
        </button>
        <button className={styles.prestigeBtnKeep} onClick={onPrestigeKeepPoints} disabled={!possible || CONFIG.WEEK > CONFIG.CURRENT_WEEK}>
          <span className={styles.prestigeBtnIcon}>⭐</span>
          <div className={styles.prestigeBtnTexts}>
            <span className={styles.prestigeBtnTitle}>환생</span>
            <span className={styles.prestigeBtnSub}>포인트 유지</span>
          </div>
          <span className={styles.prestigeBtnPoints}>+{formatGold(earnPoints)}</span>
        </button>
      </div>

      {/* 아이템 가치 */}
      {section === 'item' && (
        <div className={styles.list}>
          {Array.from({ length: CONFIG.CM_GRADE_MAX }, (_, i) => {
            const grade = i + 1
            const mat = getGradeData(grade)
            const level = itemValueLevels[i] ?? 1
            const cost = getBulkCost(getItemValueLevelCost, level, upgradeAmount, prestigePoints)
            const count = upgradeAmount === 'MAX' ? Math.max(1, getBulkCount(getItemValueLevelCost, level, 'MAX', prestigePoints)) : upgradeAmount
            return (
              <div key={grade} className={styles.card} >
                <div className={styles.iconArea}><GradeIcon size={36} grade={grade}/></div>
                <div className={styles.cardInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.cardName}>{mat.name}</span>
                    <span className={styles.levelBadge}>Lv.{level}</span>
                    <span className={styles.cardStat}>
                      <img src={coinIcon} className={styles.subIcon} alt="" />
                      {formatGold(getEffectiveItemValue(grade, itemValueLevels))}
                    </span>
                  </div>
                  <div className={styles.bottomRow}>
                    <span className={styles.cardSub}>아이템 판매 가치 증가</span>
                  </div>
                </div>
                <button className={styles.starBtn} onClick={() => onLevelUpItemValue(i)} disabled={prestigePoints < cost}>
                  <span>⭐ {formatGold(cost)}</span>
                  {count > 0 && <span className={styles.lvSub}>+lv{count}</span>}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 기타 */}
      {section === 'buffer' && (
        <div className={styles.list}>
          {[
            { icon: '💰', name: '골드 배율', level: `${goldMultiplierLevel}/${CONFIG.PF_GM_PROC_MAX}`, stat: `×${getGoldMultiplierBonus(goldMultiplierLevel).toFixed(1)}`, desc: '획득 골드에 배율 적용', isMax: goldMultiplierLevel >= CONFIG.PF_GM_PROC_MAX, cost: getBulkCost((l) => l >= CONFIG.PF_GM_PROC_MAX ? Infinity : getGoldMultiplierCost(l), goldMultiplierLevel, upgradeAmount, prestigePoints), count: upgradeAmount === 'MAX' ? Math.max(1, getBulkCount((l) => l >= CONFIG.PF_GM_PROC_MAX ? Infinity : getGoldMultiplierCost(l), goldMultiplierLevel, 'MAX', prestigePoints)) : upgradeAmount, onUpgrade: onUpgradeGoldMultiplier },
            { icon: '💵', name: '초기 골드', level: `${initialGoldLevel}`, stat: `${formatGold(getInitialGold(initialGoldLevel))}G`, desc: '환생 후 시작 골드 지급', isMax: false, cost: getBulkCost(getInitialGoldCost, initialGoldLevel, upgradeAmount, prestigePoints), count: upgradeAmount === 'MAX' ? Math.max(1, getBulkCount(getInitialGoldCost, initialGoldLevel, 'MAX', prestigePoints)) : upgradeAmount, onUpgrade: onUpgradeInitialGold },
            { icon: '🏗️', name: '건설 비용', level: `${buildDiscountLevel}/${CONFIG.PF_BC_PROC_MAX}`, stat: `-${Math.round(getBuildCostDiscount(buildDiscountLevel) * 100)}%`, desc: '모든 건설 비용 할인율', isMax: buildDiscountLevel >= CONFIG.PF_BC_PROC_MAX, cost: getBulkCost((l) => l >= CONFIG.PF_BC_PROC_MAX ? Infinity : getBuildDiscountCost(l), buildDiscountLevel, upgradeAmount, prestigePoints), count: upgradeAmount === 'MAX' ? Math.max(1, getBulkCount((l) => l >= CONFIG.PF_BC_PROC_MAX ? Infinity : getBuildDiscountCost(l), buildDiscountLevel, 'MAX', prestigePoints)) : upgradeAmount, onUpgrade: onUpgradeBuildDiscount },
            { icon: '📦', name: '라인 비용 할인', level: `${bundleDiscountLevel}/${CONFIG.PF_LC_PROC_MAX}`, stat: `-${Math.round(getBundleCostDiscount(bundleDiscountLevel) * 100)}%`, desc: '라인 추가 비용 할인율', isMax: bundleDiscountLevel >= CONFIG.PF_LC_PROC_MAX, cost: getBulkCost((l) => l >= CONFIG.PF_LC_PROC_MAX ? Infinity : getBundleDiscountCost(l), bundleDiscountLevel, upgradeAmount, prestigePoints), count: upgradeAmount === 'MAX' ? Math.max(1, getBulkCount((l) => l >= CONFIG.PF_LC_PROC_MAX ? Infinity : getBundleDiscountCost(l), bundleDiscountLevel, 'MAX', prestigePoints)) : upgradeAmount, onUpgrade: onUpgradeBundleDiscount },
            { icon: '🌱', name: '생산 레벨', level: `${producerStartLevel}`, stat: `Lv.${producerStartLevel + 1}`, desc: '생산자 건설 시 시작 레벨', isMax: false, cost: getBulkCost(getProducerStartCost, producerStartLevel, upgradeAmount, prestigePoints), count: upgradeAmount === 'MAX' ? Math.max(1, getBulkCount(getProducerStartCost, producerStartLevel, 'MAX', prestigePoints)) : upgradeAmount, onUpgrade: onUpgradeProducerStart },
            { icon: '🚄', name: '레일 속도', level: `${railSpeedLevel}/${CONFIG.RAIL_SPEED_MAX_LEVEL}`, stat: `${Math.round(getRailMoveSpeed(railSpeedLevel))}ms`, desc: '아이템 레일 이동 속도', isMax: railSpeedLevel >= CONFIG.RAIL_SPEED_MAX_LEVEL, cost: getBulkCost((l) => l >= CONFIG.RAIL_SPEED_MAX_LEVEL ? Infinity : getRailSpeedUpgradeCost(l), railSpeedLevel, upgradeAmount, prestigePoints), count: upgradeAmount === 'MAX' ? Math.max(1, getBulkCount((l) => l >= CONFIG.RAIL_SPEED_MAX_LEVEL ? Infinity : getRailSpeedUpgradeCost(l), railSpeedLevel, 'MAX', prestigePoints)) : upgradeAmount, onUpgrade: onUpgradeRailSpeed },
            { icon: '▶', name: '생산 저장소', level: `${rsBufferLevel}`, stat: `×${getRsBufferCapacity(rsBufferLevel)}`, desc: '생산자 버퍼 최대 용량', isMax: false, cost: getBulkCost(getBufferUpgradeCost, rsBufferLevel, upgradeAmount, prestigePoints), count: upgradeAmount === 'MAX' ? Math.max(1, getBulkCount(getBufferUpgradeCost, rsBufferLevel, 'MAX', prestigePoints)) : upgradeAmount, onUpgrade: onUpgradeRsBuffer },
            { icon: '🏭', name: '공장 저장소', level: `${faBufferLevel}`, stat: `×${getFaBufferCapacity(faBufferLevel)}`, desc: '공장 버퍼 최대 용량', isMax: false, cost: getBulkCost(getBufferUpgradeCost, faBufferLevel, upgradeAmount, prestigePoints), count: upgradeAmount === 'MAX' ? Math.max(1, getBulkCount(getBufferUpgradeCost, faBufferLevel, 'MAX', prestigePoints)) : upgradeAmount, onUpgrade: onUpgradeFaBuffer },
          ].map(({ icon, name, level, stat, desc, isMax, cost, count, onUpgrade }) => (
            <div key={name} className={styles.card}>
              <div className={styles.iconArea}>{icon}</div>
              <div className={styles.cardInfo}>
                <div className={styles.nameRow}>
                  <span className={styles.cardName}>{name}</span>
                  <span className={styles.levelBadge}>Lv.{level}</span>
                  <span className={styles.cardStat}>{stat}</span>
                </div>
                <div className={styles.bottomRow}>
                  <span className={styles.cardSub}>{desc}</span>
                </div>
              </div>
              {isMax ? (
                <span className={styles.maxBadge}>MAX</span>
              ) : (
                <button className={styles.starBtn} onClick={onUpgrade} disabled={prestigePoints < cost}>
                  <span>⭐ {formatGold(cost)}</span>
                  {count > 0 && <span className={styles.lvSub}>+lv{count}</span>}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
