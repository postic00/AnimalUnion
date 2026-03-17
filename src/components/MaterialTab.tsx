import type { GameState } from '../types/gameState'
import { getMaterialQuantity, getMaterialQuantityLevelCost, RECIPES } from '../balance'
import { formatGold, formatQuantity } from '../utils/formatGold'
import { GradeIcon } from './GradeIcon'
import coinIcon from '../assets/coin.svg'
import styles from './MaterialTab.module.css'

const MATERIALS: Record<number, { name: string; emoji: string; color: string; bg: string; border: string; sub: string }> = {
  1:  { name: '고추',          emoji: '🌶️', color: '#991b1b', bg: '#fff1f1', border: '#fca5a5', sub: '#dc2626' },
  2:  { name: '설탕',          emoji: '🍬', color: '#92400e', bg: '#fffbeb', border: '#fcd34d', sub: '#d97706' },
  3:  { name: '딸기',          emoji: '🍓', color: '#9d174d', bg: '#fdf2f8', border: '#f9a8d4', sub: '#db2777' },
  4:  { name: '고추장',        emoji: '🫙', color: '#7c2d12', bg: '#fff7ed', border: '#fdba74', sub: '#ea580c' },
  5:  { name: '설탕시럽',      emoji: '🍯', color: '#78350f', bg: '#fefce8', border: '#fde68a', sub: '#b45309' },
  6:  { name: '딸기잼',        emoji: '🍮', color: '#be185d', bg: '#fdf2f8', border: '#fda4af', sub: '#e11d48' },
  7:  { name: '고추사탕',      emoji: '🍭', color: '#831843', bg: '#fdf2f8', border: '#f9a8d4', sub: '#be185d' },
  8:  { name: '딸기에이드',    emoji: '🥤', color: '#7e22ce', bg: '#faf5ff', border: '#d8b4fe', sub: '#9333ea' },
  9:  { name: '딸기고추소스',  emoji: '🫕', color: '#9f1239', bg: '#fff1f2', border: '#fda4af', sub: '#e11d48' },
  10: { name: '딸기고추잼',    emoji: '🥣', color: '#7f1d1d', bg: '#fef2f2', border: '#fca5a5', sub: '#dc2626' },
  11: { name: '고추설탕크래커',emoji: '🍪', color: '#c2410c', bg: '#fff7ed', border: '#fed7aa', sub: '#ea580c' },
  12: { name: '프리미엄소스',  emoji: '🥫', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe', sub: '#7c3aed' },
  13: { name: '매운케이크',    emoji: '🎂', color: '#be185d', bg: '#fdf2f8', border: '#fda4af', sub: '#db2777' },
  14: { name: '딸기크림파이',  emoji: '🥧', color: '#db2777', bg: '#fdf2f8', border: '#f9a8d4', sub: '#ec4899' },
  15: { name: '딸기젤리',      emoji: '🍡', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', sub: '#8b5cf6' },
  16: { name: '딸기크림',      emoji: '🍦', color: '#9d174d', bg: '#fdf2f8', border: '#f9a8d4', sub: '#db2777' },
  17: { name: '고추딸기파이',  emoji: '🥮', color: '#7f1d1d', bg: '#fff1f2', border: '#fca5a5', sub: '#ef4444' },
  18: { name: '딸기설탕케이크',emoji: '🍰', color: '#be185d', bg: '#fdf2f8', border: '#fbcfe8', sub: '#ec4899' },
  19: { name: '딸기고추마카롱',emoji: '🧁', color: '#86198f', bg: '#fdf4ff', border: '#e879f9', sub: '#a21caf' },
  20: { name: '딸기고추설탕왕',emoji: '🏆', color: '#3b1f00', bg: '#fefce8', border: '#FFD700', sub: '#B8860B' },
}

interface Props {
  gameState: GameState
  onUpgradeQuantity: (gradeIndex: number) => void
}

export default function MaterialTab({ gameState, onUpgradeQuantity }: Props) {
  const { gold, materialQuantityLevels } = gameState

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {materialQuantityLevels.map((level, i) => {
          const grade = i + 1
          const mat = MATERIALS[grade] ?? MATERIALS[1]
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
                  </div>
                  <div className={styles.bottomRow}>
                    <span className={styles.quantity} style={{ color: mat.sub }}>×{formatQuantity(quantity)}</span>
                    {RECIPES[grade] && (
                      <div className={styles.recipe}>
                        {RECIPES[grade].map((r, ri) => (
                          <span key={ri} className={styles.ingredient}>
                            <GradeIcon size={18} grade={r.grade}/>
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
