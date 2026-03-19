import type { GameState } from '../types/gameState'
import { canPrestige, getPrestigePoints, getItemValueLevelCost, getItemValue, getBufferUpgradeCost, getRsBufferCapacity, getFaBufferCapacity, getRailSpeedUpgradeCost, getRailMoveSpeed } from '../balance'
import { formatGold } from '../utils/formatGold'
import { CONFIG } from '../config'
import coinIcon from '../assets/coin.svg'
import styles from './PrestigeTab.module.css'

import { getGradeData } from '../data/grades'

interface Props {
  gameState: GameState
  section: 'item' | 'buffer'
  onPrestige: () => void
  onPrestigeKeepPoints: () => void
  onLevelUpItemValue: (gradeIndex: number) => void
  onUpgradeRsBuffer: () => void
  onUpgradeFaBuffer: () => void
  onUpgradeRailSpeed: () => void
}

export default function PrestigeTab({ gameState, section, onPrestige, onPrestigeKeepPoints, onLevelUpItemValue, onUpgradeRsBuffer, onUpgradeFaBuffer, onUpgradeRailSpeed }: Props) {
  const { totalEarned, prestigePoints, itemValueLevels, rsBufferLevel, faBufferLevel } = gameState
  const railSpeedLevel = gameState.railSpeedLevel ?? 1
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
          {Array.from({ length: CONFIG.PRODUCT_GRADE_MAX }, (_, i) => {
            const grade = i + 1
            const level = itemValueLevels[i] ?? 1
            const cost = getItemValueLevelCost(level)
            return (
              <div key={grade} className={styles.card}>
                <div className={styles.cardLeft}>
                  <span className={styles.cardEmoji}>{getGradeData(grade).emoji}</span>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardNameRow}>
                      <span className={styles.cardName}>{getGradeData(grade).name}</span>
                      <span className={styles.levelBadge}>Lv.{level}</span>
                    </div>
                    <span className={styles.cardSub}>
                      <img src={coinIcon} className={styles.subIcon} alt="" />
                      {formatGold(getItemValue(grade, level))}
                    </span>
                  </div>
                </div>
                <button className={styles.starBtn} onClick={() => onLevelUpItemValue(i)} disabled={prestigePoints < cost}>
                  ⭐ {formatGold(cost)}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 기타 */}
      {section === 'buffer' && (
        <div className={styles.list}>
          <div className={styles.card}>
            <div className={styles.cardLeft}>
              <span className={styles.cardEmoji}>▶</span>
              <div className={styles.cardInfo}>
                <div className={styles.cardNameRow}>
                  <span className={styles.cardName}>생산 저장소</span>
                  <span className={styles.levelBadge}>Lv.{rsBufferLevel}</span>
                </div>
                <span className={styles.cardSub}>용량 ×{getRsBufferCapacity(rsBufferLevel)}</span>
              </div>
            </div>
            <button className={styles.starBtn} onClick={onUpgradeRsBuffer} disabled={prestigePoints < getBufferUpgradeCost(rsBufferLevel)}>
              ⭐ {formatGold(getBufferUpgradeCost(rsBufferLevel))}
            </button>
          </div>
          <div className={styles.card}>
            <div className={styles.cardLeft}>
              <span className={styles.cardEmoji}>🏭</span>
              <div className={styles.cardInfo}>
                <div className={styles.cardNameRow}>
                  <span className={styles.cardName}>공장 저장소</span>
                  <span className={styles.levelBadge}>Lv.{faBufferLevel}</span>
                </div>
                <span className={styles.cardSub}>용량 ×{getFaBufferCapacity(faBufferLevel)}</span>
              </div>
            </div>
            <button className={styles.starBtn} onClick={onUpgradeFaBuffer} disabled={prestigePoints < getBufferUpgradeCost(faBufferLevel)}>
              ⭐ {formatGold(getBufferUpgradeCost(faBufferLevel))}
            </button>
          </div>
          <div className={styles.card}>
            <div className={styles.cardLeft}>
              <span className={styles.cardEmoji}>🚄</span>
              <div className={styles.cardInfo}>
                <div className={styles.cardNameRow}>
                  <span className={styles.cardName}>레일 속도</span>
                  <span className={styles.levelBadge}>Lv.{railSpeedLevel}/{CONFIG.RAIL_SPEED_MAX_LEVEL}</span>
                </div>
                <span className={styles.cardSub}>{Math.round(getRailMoveSpeed(railSpeedLevel))}ms/칸</span>
              </div>
            </div>
            {railSpeedLevel >= CONFIG.RAIL_SPEED_MAX_LEVEL ? (
              <span className={styles.levelBadge}>MAX</span>
            ) : (
              <button className={styles.starBtn} onClick={onUpgradeRailSpeed} disabled={prestigePoints < getRailSpeedUpgradeCost(railSpeedLevel)}>
                ⭐ {formatGold(getRailSpeedUpgradeCost(railSpeedLevel))}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
