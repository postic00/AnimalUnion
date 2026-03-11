import type { GameState } from '../types/gameState'
import { getMaterialQuantity, getMaterialQuantityLevelCost, RECIPES } from '../balance'
import { formatGold, formatQuantity } from '../utils/formatGold'
import coinIcon from '../assets/coin.svg'
import styles from './MaterialTab.module.css'

const MATERIALS: Record<number, { name: string; emoji: string; color: string; bg: string; border: string; sub: string }> = {
  1:  { name: '고추',        emoji: '🌶️', color: '#991b1b', bg: '#fff1f1', border: '#fca5a5', sub: '#dc2626' },
  2:  { name: '양파',        emoji: '🧅', color: '#5b21b6', bg: '#f5f3ff', border: '#c4b5fd', sub: '#7c3aed' },
  3:  { name: '마늘',        emoji: '🧄', color: '#14532d', bg: '#f0fdf4', border: '#86efac', sub: '#16a34a' },
  4:  { name: '고추기름',    emoji: '🫙', color: '#7c2d12', bg: '#fff7ed', border: '#fdba74', sub: '#ea580c' },
  5:  { name: '딸기',        emoji: '🍓', color: '#9d174d', bg: '#fdf2f8', border: '#f9a8d4', sub: '#db2777' },
  6:  { name: '마늘기름',    emoji: '🫒', color: '#14532d', bg: '#f0fdf4', border: '#6ee7b7', sub: '#059669' },
  7:  { name: '꼬치',        emoji: '🍢', color: '#92400e', bg: '#fffbeb', border: '#fcd34d', sub: '#d97706' },
  8:  { name: '화자오',      emoji: '🌰', color: '#78350f', bg: '#fefce8', border: '#fde68a', sub: '#b45309' },
  9:  { name: '포도',        emoji: '🍇', color: '#4c1d95', bg: '#f5f3ff', border: '#c4b5fd', sub: '#7c3aed' },
  10: { name: '두반장',      emoji: '🍯', color: '#78350f', bg: '#fff7ed', border: '#fdba74', sub: '#c2410c' },
  11: { name: '설탕시럽',    emoji: '🧁', color: '#9d174d', bg: '#fdf2f8', border: '#f9a8d4', sub: '#be185d' },
  12: { name: '새우튀김',    emoji: '🍤', color: '#92400e', bg: '#fff7ed', border: '#fcd34d', sub: '#d97706' },
  13: { name: '팔각',        emoji: '⭐', color: '#78350f', bg: '#fefce8', border: '#FFD700', sub: '#ca8a04' },
  14: { name: '코팅액',      emoji: '✨', color: '#1e3a5f', bg: '#eff6ff', border: '#93c5fd', sub: '#2563eb' },
  15: { name: '마라육수',    emoji: '🍲', color: '#991b1b', bg: '#fff1f2', border: '#fca5a5', sub: '#dc2626' },
  16: { name: '탕후루꼬치',  emoji: '🍡', color: '#9d174d', bg: '#fdf2f8', border: '#f9a8d4', sub: '#db2777' },
  17: { name: '마라소스',    emoji: '🌊', color: '#1e3a5f', bg: '#eff6ff', border: '#93c5fd', sub: '#0891b2' },
  18: { name: '탕후루',      emoji: '🍡', color: '#be185d', bg: '#fdf2f8', border: '#f9a8d4', sub: '#db2777' },
  19: { name: '마라탕',      emoji: '🍲', color: '#7c2d12', bg: '#fff7ed', border: '#fdba74', sub: '#b91c1c' },
  20: { name: '마라탕후루',  emoji: '🌈', color: '#3b1f00', bg: '#fefce8', border: '#FFD700', sub: '#B8860B' },
}

interface Props {
  gameState: GameState
  onUpgradeQuantity: (gradeIndex: number) => void
}

export default function MaterialTab({ gameState, onUpgradeQuantity }: Props) {
  const { gold, materialQuantityLevels } = gameState

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>재료 관리</h2>
      <div className={styles.list}>
        {materialQuantityLevels.map((level, i) => {
          const grade = i + 1
          const mat = MATERIALS[grade] ?? MATERIALS[1]
          const quantity = getMaterialQuantity(level)
          const cost = getMaterialQuantityLevelCost(level)

          return (
            <div key={grade} className={styles.card} style={{ background: mat.bg, borderColor: mat.border }}>
              <div className={styles.cardLeft}>
                <span className={styles.emoji}>{mat.emoji}</span>
                <div className={styles.info}>
                  <div className={styles.nameRow}>
                    <span className={styles.name} style={{ color: mat.color }}>{mat.name}</span>
                    <span className={styles.levelBadge} style={{ background: mat.sub }}>Lv.{level}</span>
                  </div>
                  <div className={styles.bottomRow}>
                    <span className={styles.quantity} style={{ color: mat.sub }}>×{formatQuantity(quantity)}</span>
                    {RECIPES[grade] && (
                      <div className={styles.recipe}>
                        {RECIPES[grade].map((r, ri) => (
                          <span key={ri} className={styles.ingredient}>
                            {MATERIALS[r.grade]?.emoji}
                            <span className={styles.ingredientCount}>×{r.count}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
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
