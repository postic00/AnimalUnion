import type { Item } from '../types/item'
import { CONFIG } from '../config'
import { formatQuantity } from '../utils/formatGold'
import styles from './ItemLayer.module.css'

const GRADE_EMOJIS: Record<number, string> = {
  1: '🌶️', 2: '🧅', 3: '🧄', 4: '🫙', 5: '🍓',
  6: '🫒', 7: '🍢', 8: '🌰', 9: '🍇', 10: '🍯',
  11: '🧁', 12: '🍤', 13: '⭐', 14: '✨', 15: '🍲',
  16: '🍡', 17: '🫗', 18: '🍭', 19: '🥘', 20: '🏆',
}

interface Props {
  items: Item[]
  cellSize: number
}

export default function ItemLayer({ items, cellSize }: Props) {
  const size = cellSize * CONFIG.ITEM_SIZE_RATIO
  const emojiSize = Math.round(size * 0.55)

  return (
    <div className={styles.layer}>
      {items.map(item => {
        const emoji = GRADE_EMOJIS[item.grade] ?? '📦'
        const bonuses = [
          item.waBonus > 0 ? { val: item.waBonus, cls: styles.bonusWA } : null,
          item.paBonus > 0 ? { val: item.paBonus, cls: styles.bonusPA } : null,
          item.pkBonus > 0 ? { val: item.pkBonus, cls: styles.bonusPK } : null,
        ].filter(Boolean) as { val: number; cls: string }[]

        return (
          <div
            key={item.id}
            className={styles.plate}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              left: item.x - size / 2,
              top: item.y - size / 2,
            }}
          >
            <span className={styles.emoji} style={{ fontSize: emojiSize }}>{emoji}</span>

            {/* 좌측 하단: 갯수 */}
            {item.quantity > 1 && (
              <span className={styles.qtyBadge}>{formatQuantity(item.quantity)}</span>
            )}

            {/* 우측 하단: 세척/가공/포장 수치 */}
            {bonuses.length > 0 && (
              <div className={styles.bonusList}>
                {bonuses.map((b, i) => (
                  <span key={i} className={`${styles.bonusBadge} ${b.cls}`}>
                    {b.val.toFixed(1)}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
