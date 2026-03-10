import type { Producer } from '../types/producer'
import { getProducerValue, getProducerUpgradeCost } from '../balance'
import styles from './ProductionTab.module.css'

interface Props {
  producers: Producer[]
  gold: number
  onUpgrade: (index: number) => void
}

export default function ProductionTab({ producers, gold, onUpgrade }: Props) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>생산</h2>
      {producers.map((producer, index) => {
        const cost = getProducerUpgradeCost(producer.level)
        const canUpgrade = gold >= cost
        return (
          <div key={index} className={styles.row}>
            <div className={styles.info}>
              <span className={styles.name}>생산기 {index + 1}</span>
              <span className={styles.level}>
                Lv.{producer.level} · {producer.level === 0 ? '비활성' : `🪙${getProducerValue()}/개`}
              </span>
            </div>
            <button
              className={styles.upgradeButton}
              onClick={() => onUpgrade(index)}
              disabled={!canUpgrade}
            >
              업그레이드 🪙{cost.toLocaleString()}
            </button>
          </div>
        )
      })}
    </div>
  )
}
