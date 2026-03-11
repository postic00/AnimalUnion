import type { Producer } from '../types/producer'
import { getProducerUpgradeCost, getProducerBuildCost, getMaterialQuantity } from '../balance'
import { formatGold, formatQuantity } from '../utils/formatGold'
import styles from './ProductionTab.module.css'

interface Props {
  producers: Producer[]
  gold: number
  materialQuantityLevels: number[]
  onBuild: (index: number) => void
  onUpgrade: (index: number) => void
}

const GRADE_NAMES: Record<number, string> = { 1: '고추', 2: '양파', 3: '마늘' }

export default function ProductionTab({ producers, gold, materialQuantityLevels, onBuild, onUpgrade }: Props) {
  const buildCost = getProducerBuildCost()
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>생산</h2>
      {producers.map((producer, index) => {
        const gradeName = GRADE_NAMES[producer.grade] ?? `등급${producer.grade}`
        const quantity = getMaterialQuantity(materialQuantityLevels[producer.grade - 1] ?? 1)
        if (!producer.built) {
          return (
            <div key={index} className={styles.row}>
              <div className={styles.info}>
                <span className={styles.name}>생산기 {index + 1} ({gradeName})</span>
                <span className={styles.level}>미건설</span>
              </div>
              <button
                className={styles.upgradeButton}
                onClick={() => onBuild(index)}
                disabled={gold < buildCost}
              >
                🪙{formatGold(buildCost)}
              </button>
            </div>
          )
        }
        const cost = getProducerUpgradeCost(producer.level)
        return (
          <div key={index} className={styles.row}>
            <div className={styles.info}>
              <span className={styles.name}>생산기 {index + 1} ({gradeName})</span>
              <span className={styles.level}>
                {producer.level === 0 ? '비활성' : `가동중 x${formatQuantity(quantity)}`}
              </span>
            </div>
            <div className={styles.btnGroup}>
              <span className={styles.level}>Lv.{producer.level}</span>
              <button
                className={styles.upgradeButton}
                onClick={() => onUpgrade(index)}
                disabled={gold < cost}
              >
                🪙{formatGold(cost)}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
