import type { GameState } from '../types/gameState'
import { canPrestige, getPrestigePoints, getItemValueLevelCost, getItemValue, getBufferUpgradeCost, getRsBufferCapacity, getFaBufferCapacity } from '../balance'
import { formatGold } from '../utils/formatGold'
import { CONFIG } from '../config'
import coinIcon from '../assets/coin.svg'
import styles from './PrestigeTab.module.css'

const PRODUCT_NAMES: Record<number, string> = {
  1: '고추', 2: '양파', 3: '마늘', 4: '고추기름', 5: '딸기',
  6: '마늘기름', 7: '꼬치', 8: '화자오', 9: '포도', 10: '두반장',
  11: '설탕시럽', 12: '새우튀김', 13: '팔각', 14: '코팅액', 15: '마라육수',
  16: '탕후루꼬치', 17: '마라소스', 18: '탕후루', 19: '마라탕', 20: '마라탕후루',
}

const PRODUCT_EMOJIS: Record<number, string> = {
  1: '🌶️', 2: '🧅', 3: '🧄', 4: '🫙', 5: '🍓',
  6: '🫒', 7: '🍢', 8: '🌰', 9: '🍇', 10: '🍯',
  11: '🧁', 12: '🍤', 13: '⭐', 14: '✨', 15: '🍲',
  16: '🍡', 17: '🫗', 18: '🍭', 19: '🥘', 20: '🏆',
}

interface Props {
  gameState: GameState
  section: 'item' | 'buffer'
  onPrestige: () => void
  onPrestigeReset: () => void
  onPrestigeKeepPoints: () => void
  onLevelUpItemValue: (gradeIndex: number) => void
  onUpgradeRsBuffer: () => void
  onUpgradeFaBuffer: () => void
}

export default function PrestigeTab({ gameState, section, onPrestige, onPrestigeKeepPoints, onLevelUpItemValue, onUpgradeRsBuffer, onUpgradeFaBuffer }: Props) {
  const { totalEarned, prestigePoints, itemValueLevels, rsBufferLevel, faBufferLevel } = gameState
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
                  <span className={styles.cardEmoji}>{PRODUCT_EMOJIS[grade] ?? '📦'}</span>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardNameRow}>
                      <span className={styles.cardName}>{PRODUCT_NAMES[grade] ?? `${grade}등급`}</span>
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

      {/* 저장소 */}
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
        </div>
      )}
    </div>
  )
}
