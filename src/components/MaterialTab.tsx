import type { GameState } from '../types/gameState'
import { getMaterialQuantity, getMaterialQuantityLevelCost } from '../balance'
import { formatGold, formatQuantity } from '../utils/formatGold'
import styles from './MaterialTab.module.css'

const MATERIAL_NAMES: Record<number, string> = {
  1: '생파', 2: '세척파', 3: '양념파', 4: '마라파', 5: '마라탕후루',
  6: '프리미엄 마라탕후루', 7: '골드 마라탕후루', 8: '다이아 마라탕후루',
  9: '울트라 마라탕후루', 10: '레전드 마라탕후루',
}

interface Props {
  gameState: GameState
  onUpgradeQuantity: (gradeIndex: number) => void
}

export default function MaterialTab({ gameState, onUpgradeQuantity }: Props) {
  const { gold, materialQuantityLevels } = gameState

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>재료</h2>
      {materialQuantityLevels.map((level, i) => {
        const grade = i + 1
        const quantity = getMaterialQuantity(level)
        const cost = getMaterialQuantityLevelCost(level)
        const name = MATERIAL_NAMES[grade] ?? `${grade}등급`
        return (
          <div key={grade} className={styles.row}>
            <span className={styles.name}>{grade}. {name}</span>
            <span className={styles.quantity}>x{formatQuantity(quantity)}</span>
            <span className={styles.level}>Lv.{level}</span>
            <button
              className={styles.upgradeButton}
              onClick={() => onUpgradeQuantity(i)}
              disabled={gold < cost}
            >
              🪙{formatGold(cost)}
            </button>
          </div>
        )
      })}
    </div>
  )
}
