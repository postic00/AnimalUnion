import { useEffect, useState } from 'react'
import type { Board as BoardType } from '../types/board'
import Cell from './Cell'
import styles from './Board.module.css'

interface Props {
  board: BoardType
  onAddBundle: () => void
}

export default function Board({ board, onAddBundle }: Props) {
  const [cellSize, setCellSize] = useState(0)

  useEffect(() => {
    const updateSize = () => {
      setCellSize(Math.floor(window.innerWidth / 7))
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  if (cellSize === 0) return null

  return (
    <div className={styles.board}>
      {board.map((row, rowIdx) => (
        <div key={rowIdx} className={styles.row}>
          {row.map((cell, colIdx) => (
            <Cell key={colIdx} cell={cell} size={cellSize} />
          ))}
        </div>
      ))}
      <button
        onClick={onAddBundle}
        className={styles.addButton}
        style={{ width: cellSize * 7, height: cellSize * 2 }}
      >
        묶음을 추가해요
      </button>
    </div>
  )
}
