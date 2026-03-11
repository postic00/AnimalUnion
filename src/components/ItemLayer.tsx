import type { Item } from '../types/item'
import { CONFIG } from '../config'
import { formatQuantity } from '../utils/formatGold'
import styles from './ItemLayer.module.css'

interface Props {
  items: Item[]
  cellSize: number
}

const GRADE_COLORS: { bg: string; border: string; text: string }[] = [
  { bg: '#bbf7d0', border: '#22c55e', text: '#14532d' }, // 1
  { bg: '#e9d5ff', border: '#a855f7', text: '#6b21a8' }, // 2
  { bg: '#d1fae5', border: '#10b981', text: '#064e3b' }, // 3
  { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' }, // 4
  { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' }, // 5
  { bg: '#d1fae5', border: '#34d399', text: '#065f46' }, // 6
  { bg: '#ffedd5', border: '#f97316', text: '#9a3412' }, // 7
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' }, // 8
  { bg: '#ede9fe', border: '#8b5cf6', text: '#4c1d95' }, // 9
  { bg: '#fee2e2', border: '#f87171', text: '#7f1d1d' }, // 10
  { bg: '#fce7f3', border: '#f472b6', text: '#831843' }, // 11
  { bg: '#fff7ed', border: '#fb923c', text: '#7c2d12' }, // 12
  { bg: '#fef9c3', border: '#facc15', text: '#713f12' }, // 13
  { bg: '#dbeafe', border: '#60a5fa', text: '#1e3a8a' }, // 14
  { bg: '#fee2e2', border: '#dc2626', text: '#450a0a' }, // 15
  { bg: '#fdf4ff', border: '#e879f9', text: '#701a75' }, // 16
  { bg: '#f0f9ff', border: '#38bdf8', text: '#0c4a6e' }, // 17
  { bg: '#fce7f3', border: '#db2777', text: '#500724' }, // 18
  { bg: '#fff7ed', border: '#ea580c', text: '#431407' }, // 19
  { bg: '#fef9c3', border: '#eab308', text: '#422006' }, // 20
]

export default function ItemLayer({ items, cellSize }: Props) {
  const size = cellSize * CONFIG.ITEM_SIZE_RATIO

  return (
    <div className={styles.layer}>
      {items.map(item => {
        const color = GRADE_COLORS[(item.grade - 1) % GRADE_COLORS.length]
        return (
          <div
            key={item.id}
            className={styles.item}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              left: item.x - size / 2,
              top: item.y - size / 2,
              background: color.bg,
              borderColor: color.border,
              color: color.text,
            }}
          >
            <span className={styles.grade}>{item.grade}</span>
            {item.quantity > 1 && (
              <span className={styles.quantity}>x{formatQuantity(item.quantity)}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
