import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Item } from '../../types/item'
import { GradeIcon } from '../common/GradeIcon'
import { formatQuantity } from '../../utils/formatGold'
import styles from './RsInfoModal.module.css'

interface Props {
  rsKey: string
  rsQueuesRef: React.RefObject<Record<string, Item[]>>
  capacity: number
  onClose: () => void
}

export default function RsInfoModal({ rsKey, rsQueuesRef, capacity, onClose }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const rsKeyRef = useRef(rsKey)
  useLayoutEffect(() => { rsKeyRef.current = rsKey })

  useEffect(() => {
    const handler = () => {
      setItems([...(rsQueuesRef.current?.[rsKeyRef.current] ?? [])])
    }
    window.addEventListener('rs-queue-change', handler)
    return () => window.removeEventListener('rs-queue-change', handler)
  }, [rsQueuesRef])

  const grouped = items.reduce<Record<number, { count: number; totalQty: number }>>((acc, it) => {
    if (!acc[it.grade]) acc[it.grade] = { count: 0, totalQty: 0 }
    acc[it.grade].count++
    acc[it.grade].totalQty += it.quantity
    return acc
  }, {})

  const sortedGrades = Object.keys(grouped).map(Number).sort((a, b) => a - b)
  const fillRatio = Math.min(items.length / Math.max(capacity, 1), 1)
  const isFull = items.length >= capacity

  return (
    <div className="modal-overlay-soft" onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.icon}>🚉</span>
          <span className={styles.title}>RS 버퍼</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.fillRow}>
          <div className={styles.fillTrack}>
            <div
              className={styles.fillBar}
              style={{
                width: `${fillRatio * 100}%`,
                background: isFull ? '#dc2626' : '#3b82f6',
              }}
            />
          </div>
          <span className={styles.fillLabel} style={{ color: isFull ? '#dc2626' : '#374151' }}>
            {formatQuantity(items.length)}/{formatQuantity(capacity)}
          </span>
        </div>

        {sortedGrades.length === 0 ? (
          <div className={styles.empty}>버퍼가 비어있습니다</div>
        ) : (
          <div className={styles.list}>
            {sortedGrades.map(grade => {
              const info = grouped[grade]
              return (
                <div key={grade} className={styles.row}>
                  <GradeIcon size={22} grade={grade} />
                  <span className={styles.gradeLabel}>{grade}등급</span>
                  <span className={styles.countBadge}>{info.count}개</span>
                  <span className={styles.qty}>×{formatQuantity(info.totalQty / info.count)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
