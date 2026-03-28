import type { Producer } from '../../types/producer'
import type { Clicker } from '../../types/clicker'
import { getProducerUpgradeCost, getProducerBuildCost, getMaterialQuantity, getProducerInterval, getClickerValue, getClickerUpgradeCost, getBulkCost, getBulkCount } from '../../balance'
import type { UpgradeAmount } from '../navigation/UpgradeAmountToggle'
import { formatGold, formatQuantity } from '../../utils/formatGold'
import { GradeIcon } from '../common/GradeIcon'
import coinIcon from '../../assets/coin.svg'
import styles from './ProductionTab.module.css'

interface Props {
  producers: Producer[]
  gold: number
  materialQuantityLevels: number[]
  clicker: Clicker
  upgradeAmount: UpgradeAmount
  onBuild: (index: number) => void
  onUpgrade: (index: number) => void
  onUpgradeClicker: () => void
  onGradeChange: (index: number, grade: number) => void
}

const GRADES: Record<number, { name: string; emoji: string; color: string; border: string; text: string; sub: string }> = {
  1: { name: '고추', emoji: '🌶️', color: '#fff1f1', border: '#fca5a5', text: '#991b1b', sub: '#dc2626' },
  2: { name: '설탕', emoji: '🍬', color: '#fffbeb', border: '#fcd34d', text: '#92400e', sub: '#d97706' },
  3: { name: '딸기', emoji: '🍓', color: '#fdf2f8', border: '#f9a8d4', text: '#9d174d', sub: '#db2777' },
}

export default function ProductionTab({ producers, gold, materialQuantityLevels, clicker, upgradeAmount, onBuild, onUpgrade, onUpgradeClicker, onGradeChange }: Props) {
  const builtCount = producers.filter(p => p.built).length
  const buildCost = getProducerBuildCost(builtCount)
  const clickerCost = getBulkCost(getClickerUpgradeCost, clicker.level, upgradeAmount, gold)
  const clickerCount = upgradeAmount === 'MAX' ? Math.max(1, getBulkCount(getClickerUpgradeCost, clicker.level, 'MAX', gold)) : upgradeAmount
  const clickerValue = getClickerValue(clicker.level)

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {/* 클릭커 업그레이드 */}
        <div className={styles.card}>
          <span className={styles.gradeEmoji}>👆</span>
          <div className={styles.cardInfo}>
            <div className={styles.cardNameRow}>
              <span className={styles.cardName}>클릭 레벨</span>
              <span className={styles.levelBadge}>Lv.{clicker.level}</span>
              <span className={styles.cardStat}>×{formatQuantity(clickerValue)}</span>
            </div>
            <span className={styles.cardSub}>클릭당 생산 증가</span>
          </div>
          <button
            className={styles.upgradeBtn}
            onClick={onUpgradeClicker}
            disabled={gold < clickerCost}
          >
            <span className={styles.btnMain}>
              <img src={coinIcon} className={styles.btnIcon} alt="" />
              {formatGold(clickerCost)}
            </span>
            {clickerCount > 0 && <span className={styles.lvSub}>+lv{clickerCount}</span>}
          </button>
        </div>

        {/* 생산기 목록 */}
        {producers.map((producer, index) => {
          const quantity = getMaterialQuantity(materialQuantityLevels[producer.grade - 1] ?? 1)
          const interval = getProducerInterval(producer.level) * quantity
          const perSec = interval > 0 && isFinite(interval) ? quantity * 1000 / interval : 0

          if (!producer.built) {
            return (
              <div key={index} className={styles.card}>
                <span className={styles.gradeEmoji}>🏭</span>
                <div className={styles.cardInfo}>
                  <div className={styles.cardNameRow}>
                    <span className={styles.cardName}>생산공장</span>
                    <span className={styles.levelBadge} style={{ background: 'var(--c-gray-300)' }}>미건설</span>
                  </div>
                </div>
                <button
                  className={styles.buildBtn}
                  onClick={() => onBuild(index)}
                  disabled={gold < buildCost}
                >
                  <span className={styles.btnMain}>
                    <img src={coinIcon} className={styles.btnIcon} alt="" />
                    {formatGold(buildCost)}
                  </span>
                </button>
              </div>
            )
          }

          const cost = getBulkCost(getProducerUpgradeCost, producer.level, upgradeAmount, gold)
          const count = upgradeAmount === 'MAX' ? Math.max(1, getBulkCount(getProducerUpgradeCost, producer.level, 'MAX', gold)) : upgradeAmount
          const isActive = producer.level > 0

          return (
            <div key={index} className={styles.card}>
              <span className={styles.gradeEmoji}><GradeIcon size={36} grade={producer.grade}/></span>
              <div className={styles.cardInfo}>
                <div className={styles.cardNameRow}>
                  <span className={styles.cardName}>생산공장</span>
                  <span className={styles.levelBadge}>Lv.{producer.level}</span>
                  <span className={styles.cardStat}>
                    {isActive ? `${perSec < 10 ? perSec.toFixed(2) : perSec < 1000 ? perSec.toFixed(1) : formatQuantity(perSec)}/s` : '비활성'}
                  </span>
                </div>
                <div className={styles.gradeSelector}>
                  {[1, 2, 3].map(g => (
                    <button
                      key={g}
                      className={`${styles.gradePill} ${producer.grade === g ? styles.gradePillActive : ''}`}
                      style={producer.grade === g ? { backgroundColor: GRADES[g].border, color: GRADES[g].text, borderColor: GRADES[g].border } : { color: GRADES[g].text, borderColor: GRADES[g].border }}
                      onClick={() => onGradeChange(index, g)}
                    >
                      {GRADES[g].emoji}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className={styles.upgradeBtn}
                onClick={() => onUpgrade(index)}
                disabled={gold < cost}
              >
                <span className={styles.btnMain}>
                  <img src={coinIcon} className={styles.btnIcon} alt="" />
                  {formatGold(cost)}
                </span>
                {count > 0 && <span className={styles.lvSub}>+lv{count}</span>}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
