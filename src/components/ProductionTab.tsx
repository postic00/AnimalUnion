import type { Producer } from '../types/producer'
import type { Clicker } from '../types/clicker'
import { getProducerUpgradeCost, getProducerBuildCost, getMaterialQuantity, getClickerValue, getClickerUpgradeCost } from '../balance'
import { formatGold, formatQuantity } from '../utils/formatGold'
import coinIcon from '../assets/coin.svg'
import styles from './ProductionTab.module.css'

interface Props {
  producers: Producer[]
  gold: number
  materialQuantityLevels: number[]
  clicker: Clicker
  onBuild: (index: number) => void
  onUpgrade: (index: number) => void
  onUpgradeClicker: () => void
}

const GRADES: Record<number, { name: string; emoji: string; color: string; border: string; text: string; sub: string }> = {
  1: { name: '고추', emoji: '🌶️', color: '#fff1f1', border: '#fca5a5', text: '#991b1b', sub: '#dc2626' },
  2: { name: '양파', emoji: '🧅', color: '#f5f3ff', border: '#c4b5fd', text: '#5b21b6', sub: '#7c3aed' },
  3: { name: '마늘', emoji: '🧄', color: '#f0fdf4', border: '#86efac', text: '#14532d', sub: '#16a34a' },
}

export default function ProductionTab({ producers, gold, materialQuantityLevels, clicker, onBuild, onUpgrade, onUpgradeClicker }: Props) {
  const buildCost = getProducerBuildCost()
  const clickerCost = getClickerUpgradeCost(clicker.level)
  const clickerValue = getClickerValue(clicker.level)

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {/* 클릭커 업그레이드 */}
        <div className={styles.card} style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div className={styles.cardLeft}>
            <span className={styles.gradeEmoji}>👆</span>
            <div className={styles.cardInfo}>
              <div className={styles.cardNameRow}>
                <span className={styles.cardName} style={{ color: '#1e40af' }}>클릭커</span>
                <span className={styles.levelBadge} style={{ background: '#3b82f6' }}>Lv.{clicker.level}</span>
              </div>
              <span className={styles.cardSub} style={{ color: '#2563eb' }}>
                클릭당 ×{clickerValue % 1 === 0 ? clickerValue : clickerValue.toFixed(1)}
              </span>
            </div>
          </div>
          <button
            className={styles.upgradeBtn}
            style={{ background: '#3b82f6' }}
            onClick={onUpgradeClicker}
            disabled={gold < clickerCost}
          >
            <img src={coinIcon} className={styles.btnIcon} alt="" />
            {formatGold(clickerCost)}
          </button>
        </div>

        {/* 생산기 목록 */}
        {producers.map((producer, index) => {
          const grade = GRADES[producer.grade] ?? GRADES[1]
          const quantity = getMaterialQuantity(materialQuantityLevels[producer.grade - 1] ?? 1)

          if (!producer.built) {
            return (
              <div key={index} className={styles.card} style={{ background: '#fafafa', borderColor: '#e5e7eb' }}>
                <div className={styles.cardLeft}>
                  <span className={styles.gradeEmoji} style={{ opacity: 0.35 }}>{grade.emoji}</span>
                  <div className={styles.cardInfo}>
                    <span className={styles.cardName} style={{ color: '#6b7280' }}>생산기 {index + 1}</span>
                    <span className={styles.cardSub} style={{ color: '#9ca3af' }}>미건설 · {grade.name}</span>
                  </div>
                </div>
                <button
                  className={styles.buildBtn}
                  onClick={() => onBuild(index)}
                  disabled={gold < buildCost}
                >
                  <img src={coinIcon} className={styles.btnIcon} alt="" />
                  {formatGold(buildCost)}
                </button>
              </div>
            )
          }

          const cost = getProducerUpgradeCost(producer.level)
          const isActive = producer.level > 0

          return (
            <div key={index} className={styles.card} style={{ background: grade.color, borderColor: grade.border }}>
              <div className={styles.cardLeft}>
                <span className={styles.gradeEmoji}>{grade.emoji}</span>
                <div className={styles.cardInfo}>
                  <div className={styles.cardNameRow}>
                    <span className={styles.cardName} style={{ color: grade.text }}>생산기 {index + 1}</span>
                    <span className={styles.levelBadge} style={{ background: grade.sub }}>Lv.{producer.level}</span>
                  </div>
                  <span className={styles.cardSub} style={{ color: grade.sub }}>
                    {isActive ? `가동중 · ×${formatQuantity(quantity)}` : '비활성'}
                  </span>
                </div>
              </div>
              <button
                className={styles.upgradeBtn}
                style={{ background: grade.sub }}
                onClick={() => onUpgrade(index)}
                disabled={gold < cost}
              >
                <img src={coinIcon} className={styles.btnIcon} alt="" />
                {formatGold(cost)}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
