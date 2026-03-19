import { memo } from 'react'
import type { Item } from '../types/item'
import { CONFIG } from '../config'
import { formatQuantity } from '../utils/formatGold'
import { GradeIcon } from './GradeIcon'
import styles from './ItemLayer.module.css'

interface Props {
  items: Item[]
  cellSize: number
}

export default memo(function ItemLayer({ items, cellSize }: Props) {
  const size = cellSize * CONFIG.ITEM_SIZE_RATIO
  const emojiSize = Math.round(size * 0.55)

  return (
    <div className={styles.layer}>
      {items.map(item => {
        const isPacked = (item.pkGrades?.length ?? 0) > 0
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
              transform: `translate(${item.x - size / 2}px, ${item.y - size / 2}px)`,
            }}
          >
            <GradeIcon size={emojiSize} grade={item.grade} packed={isPacked}/>
            {isPacked && (
              <span className={styles.gradeBadge}>
                <GradeIcon size={Math.round(size * 0.35)} grade={item.grade}/>
              </span>
            )}

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
})
