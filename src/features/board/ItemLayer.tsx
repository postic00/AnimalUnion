import { memo } from 'react'
import type { Item } from '../../types/item'
import { CONFIG } from '../../config'
import { formatQuantity } from '../../utils/formatGold'
import { GradeIcon } from '../common/GradeIcon'
import styles from './ItemLayer.module.css'

function getTierStyle(grade: number): { bg: string; border: string; inset: string } {
  if (grade <= 3)  return { bg: '#fff0f0', border: '#f87171', inset: 'rgba(248,113,113,0.22)' }  // 1~3  빨
  if (grade <= 6)  return { bg: '#fff4ee', border: '#fb923c', inset: 'rgba(251,146,60,0.22)' }   // 4~6  주
  if (grade <= 9)  return { bg: '#f0fff4', border: '#4ade80', inset: 'rgba(74,222,128,0.22)' }   // 7~9  초
  if (grade <= 12) return { bg: '#e8f8ff', border: '#38bdf8', inset: 'rgba(56,189,248,0.22)' }   // 10~12 하늘
  if (grade <= 15) return { bg: '#eef2ff', border: '#3730a3', inset: 'rgba(55,48,163,0.22)' }   // 13~15 남색
  if (grade <= 18) return { bg: '#f5f0ff', border: '#a78bfa', inset: 'rgba(167,139,250,0.22)' }  // 16~18 보
  return { bg: '#fffbe8', border: '#fbbf24', inset: 'rgba(251,191,36,0.30)' }                    // 19~20 금
}

interface Props {
  items: Item[]
  cellSize: number
}

export default memo(function ItemLayer({ items, cellSize }: Props) {
  const size = cellSize * CONFIG.CM_SIZE_RATIO
  const emojiSize = Math.round(size * 0.65)

  return (
    <div className={styles.layer}>
      {items.map(item => {
        const isPacked = (item.pkGrades?.length ?? 0) > 0
        const bonuses = [
          item.waBonus > 0 ? { val: item.waBonus, cls: styles.bonusWA } : null,
          item.paBonus > 0 ? { val: item.paBonus, cls: styles.bonusPA } : null,
          item.pkBonus > 0 ? { val: item.pkBonus, cls: styles.bonusPK } : null,
        ].filter(Boolean) as { val: number; cls: string }[]

        const tier = getTierStyle(item.grade)
        return (
          <div
            key={item.id}
            className={styles.plate}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: `translate(${item.x - size / 2}px, ${item.y - size / 2}px)`,
              transition: 'transform 100ms linear',
              background: `radial-gradient(circle at 35% 28%, #ffffff 0%, ${tier.bg} 55%, ${tier.border} 100%)`,
              border: `2.5px solid ${tier.border}`,
              boxShadow: `inset 0 0 0 2.5px ${tier.inset}, inset 0 2px 5px rgba(255,255,255,0.95), inset 0 -3px 8px rgba(0,0,0,0.10), 0 5px 12px rgba(0,0,0,0.22), 0 2px 4px rgba(0,0,0,0.10)`,
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
