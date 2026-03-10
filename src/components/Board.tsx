import { useEffect, useState } from 'react'
import type { Board as BoardType } from '../types/board'
import Cell from './Cell'
import ItemLayer from './ItemLayer'
import { useGameLoop } from '../hooks/useGameLoop'
import styles from './Board.module.css'

interface Props {
  board: BoardType
  onAddBundle: () => void
  onGoldEarned: (amount: number) => void
  bundleCost: number
  canAddBundle: boolean
}

export default function Board({ board, onAddBundle, onGoldEarned, bundleCost, canAddBundle }: Props) {
  const [cellSize, setCellSize] = useState(0)

  useEffect(() => {
    const updateSize = () => {
      setCellSize(Math.floor(window.innerWidth / 7))
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const items = useGameLoop(board, cellSize, onGoldEarned)

  if (cellSize === 0) return null

  return (
    <div className={styles.board}>
      <div className={styles.grid} style={{ position: 'relative' }}>
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className={styles.row}>
            {row.map((cell, colIdx) => (
              <Cell key={colIdx} cell={cell} size={cellSize} />
            ))}
          </div>
        ))}
        <ItemLayer items={items} cellSize={cellSize} />
      </div>
      <button
        onClick={onAddBundle}
        className={styles.addButton}
        style={{ width: cellSize * 7, height: cellSize * 2 }}
        disabled={!canAddBundle}
      >
        공장 라인 확장 🪙{bundleCost.toLocaleString()}
      </button>
    </div>
  )
}
