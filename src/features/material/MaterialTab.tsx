import type { GameState } from '../../types/gameState'
import { getMaterialQuantityLevelCost, RECIPES, getEffectiveItemValue } from '../../balance'
import { formatGold } from '../../utils/formatGold'
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
          const cost = getMaterialQuantityLevelCost(level)
          const sellPrice = getEffectiveItemValue(grade, gameState.itemValueLevels)

          return (
            <div key={grade} className={styles.card} >
              <span className={styles.emoji}><GradeIcon size={36} grade={grade}/></span>
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{mat.name}</span>
                  <span className={styles.levelBadge}>Lv.{level}</span>
                </div>
                <div className={styles.priceRow}>
                  {RECIPES[grade]?.map((r, ri) => (
                    <span key={ri} className={styles.ingredient} style={{ borderColor: mat.border }}>
                      <GradeIcon size={18} grade={r.grade}/>
                      <span className={styles.ingredientCount}>×{r.count}</span>
                    </span>
                  ))}
                  <span className={styles.price}>💰 {formatGold(sellPrice)}G</span>
                </div>
              </div>
              <button
                className={styles.upgradeBtn}
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
