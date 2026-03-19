import type { Producer } from '../types/producer'
import type { Clicker } from '../types/clicker'
import { getProducerUpgradeCost, getProducerBuildCost, getMaterialQuantity, getProducerInterval, getClickerValue, getClickerUpgradeCost } from '../balance'
import { formatGold, formatQuantity } from '../utils/formatGold'
import { GradeIcon } from './GradeIcon'
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
  2: { name: '설탕', emoji: '🍬', color: '#fffbeb', border: '#fcd34d', text: '#92400e', sub: '#d97706' },
  3: { name: '딸기', emoji: '🍓', color: '#fdf2f8', border: '#f9a8d4', text: '#9d174d', sub: '#db2777' },
}

export default function ProductionTab({ producers, gold, materialQuantityLevels, clicker, onBuild, onUpgrade, onUpgradeClicker }: Props) {
  const builtCount = producers.filter(p => p.built).length
  const buildCost = getProducerBuildCost(builtCount)
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
                <span className={styles.cardName} style={{ color: '#1e40af' }}>클릭 생산기</span>
                <span className={styles.levelBadge} style={{ background: '#3b82f6' }}>Lv.{clicker.level}</span>
              </div>
              <span className={styles.cardSub} style={{ color: '#2563eb' }}>
                클릭당 ×{clickerValue % 1 === 0 ? clickerValue : clickerValue.toFixed(3)}
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
          const interval = getProducerInterval(producer.level) * quantity
          const perSec = interval > 0 && isFinite(interval) ? quantity * 1000 / interval : 0

          if (!producer.built) {
            return (
              <div key={index} className={styles.card} style={{ background: '#fafafa', borderColor: '#e5e7eb' }}>
                <div className={styles.cardLeft}>
                  <span className={styles.gradeEmoji} style={{ opacity: 0.35 }}><GradeIcon size={36} grade={producer.grade}/></span>
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
                <span className={styles.gradeEmoji}><GradeIcon size={36} grade={producer.grade}/></span>
                <div className={styles.cardInfo}>
                  <div className={styles.cardNameRow}>
                    <span className={styles.cardName} style={{ color: grade.text }}>생산기 {index + 1}</span>
                    <span className={styles.levelBadge} style={{ background: grade.sub }}>Lv.{producer.level}</span>
                  </div>
                  <span className={styles.cardSub} style={{ color: grade.sub }}>
                    {isActive ? `${perSec < 1 ? perSec.toFixed(3) : formatQuantity(perSec)}/s` : '비활성'}
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
