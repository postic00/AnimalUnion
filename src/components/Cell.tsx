import type { Cell as CellType } from '../types/board'
import styles from './Cell.module.css'

interface Props {
  cell: CellType
  size: number
}

export default function Cell({ cell, size }: Props) {
  return (
    <div
      className={`${styles.cell} ${styles[cell.type]}`}
      style={{ width: size, height: size }}
    >
      {cell.type !== 'EM' ? cell.type : ''}
    </div>
  )
}
