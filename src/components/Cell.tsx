import type { Cell as CellType } from '../types/board'
import styles from './Cell.module.css'

interface Props {
  cell: CellType
  size: number
  placing?: boolean
  onClick?: () => void
}

export default function Cell({ cell, size, placing, onClick }: Props) {
  return (
    <div
      className={`${styles.cell} ${styles[cell.type]} ${placing ? styles.placing : ''}`}
      style={{ width: size, height: size, cursor: placing ? 'pointer' : undefined }}
      onClick={onClick}
    >
      {cell.type !== 'EM' ? cell.type : ''}
    </div>
  )
}
