import { useEffect, useState } from 'react'
import type { Board as BoardType } from '../types/board'
import Cell from './Cell'

interface Props {
  board: BoardType
}

export default function Board({ board }: Props) {
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
    <div className="flex flex-col">
      {board.map((row, rowIdx) => (
        <div key={rowIdx} className="flex">
          {row.map((cell, colIdx) => (
            <Cell key={colIdx} cell={cell} size={cellSize} />
          ))}
        </div>
      ))}
    </div>
  )
}
