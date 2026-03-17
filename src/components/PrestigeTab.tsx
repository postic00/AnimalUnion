import type { GameState } from '../types/gameState'
import { canPrestige, getPrestigePoints, getItemValueLevelCost, getItemValue, getBufferUpgradeCost, getRsBufferCapacity, getFaBufferCapacity } from '../balance'
import { formatGold } from '../utils/formatGold'
import { CONFIG } from '../config'
import coinIcon from '../assets/coin.svg'
import styles from './PrestigeTab.module.css'

const PRODUCT_NAMES: Record<number, string> = {
  1: '고추', 2: '설탕', 3: '딸기', 4: '고추장', 5: '설탕시럽',
  6: '딸기잼', 7: '고추사탕', 8: '딸기에이드', 9: '딸기고추소스', 10: '딸기고추잼',
  11: '고추설탕크래커', 12: '프리미엄소스', 13: '매운케이크', 14: '딸기크림파이', 15: '딸기젤리',
  16: '딸기크림', 17: '고추딸기파이', 18: '딸기설탕케이크', 19: '딸기고추마카롱', 20: '마라탕후루',
}

const PRODUCT_EMOJIS: Record<number, string> = {
  1: '🌶️', 2: '🍬', 3: '🍓', 4: '🫙', 5: '🍯',
  6: '🍓', 7: '🍭', 8: '🥤', 9: '🍲', 10: '🍜',
  11: '🍪', 12: '🥫', 13: '🎂', 14: '🥧', 15: '🍡',
  16: '🍦', 17: '🥧', 18: '🎂', 19: '🍬', 20: '🏆',
}

interface Props {
  gameState: GameState
  section: 'item' | 'buffer'
  onPrestige: () => void
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
