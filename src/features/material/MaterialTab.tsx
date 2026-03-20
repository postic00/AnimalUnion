import type { GameState } from '../../types/gameState'
import { getMaterialQuantity, getMaterialQuantityLevelCost, RECIPES } from '../../balance'
import { formatGold, formatQuantity } from '../../utils/formatGold'
import { GradeIcon } from '../common/GradeIcon'
import { getGradeData } from '../../data/grades'
import coinIcon from '../../assets/coin.svg'
import styles from './MaterialTab.module.css'

interface Props {
  gameState: GameState
  gold: number
  onUpgradeQuantity: (gradeIndex: number) => void
}

export default function MaterialTab({ gameState, gold, onUpgradeQuantity }: Props) {
  const { materialQuantityLevels } = gameState

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {materialQuantityLevels.map((level, i) => {
          const grade = i + 1
          const mat = getGradeData(grade)
          const quantity = getMaterialQuantity(level)
          const cost = getMaterialQuantityLevelCost(level)

          return (
            <div key={grade} className={styles.card} style={{ background: mat.bg, borderColor: mat.border }}>
              <div className={styles.cardLeft}>
                <span className={styles.emoji}><GradeIcon size={36} grade={grade}/></span>
                <div className={styles.info}>
                  <div className={styles.nameRow}>
                    <span className={styles.name} style={{ color: mat.color }}>{mat.name}</span>
                    <span className={styles.levelBadge} style={{ background: mat.sub }}>Lv.{level}</span>
                    <span className={styles.quantity} style={{ color: mat.sub }}>×{formatQuantity(quantity)}</span>
                  </div>
                  {RECIPES[grade] && (
                    <div className={styles.recipe}>
                      {RECIPES[grade].map((r, ri) => (
                        <span key={ri} className={styles.ingredient} style={{ borderColor: mat.border }}>
                          <GradeIcon size={28} grade={r.grade}/>
                          <span className={styles.ingredientCount} style={{ color: mat.color }}>×{r.count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                className={styles.upgradeBtn}
                style={{ background: mat.sub }}
                onClick={() => onUpgradeQuantity(i)}
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
