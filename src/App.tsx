import { useState } from 'react'
import Board from './components/Board'
import Navigation from './components/Navigation'
import { initialBoard } from './data/initialBoard'
import type { Board as BoardType, Cell } from './types/board'

function addBundle(board: BoardType): BoardType {
  const newBoard = board.map(row => [...row])

  const lastRow = newBoard[newBoard.length - 1]
  const reIndex = lastRow.findIndex(cell => cell.type === 'RE')
  if (reIndex !== -1) {
    lastRow[reIndex] = { type: 'RD' }
  }

  const goRight = reIndex === 0

  const rowA: Cell[] = goRight
    ? [{ type: 'RD' }, { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'EM' }]
    : [{ type: 'EM' }, { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'RD' }]

  const rowB: Cell[] = goRight
    ? [{ type: 'RR' }, { type: 'RR' }, { type: 'RR' }, { type: 'RR' }, { type: 'RR' }, { type: 'RR' }, { type: 'RE' }]
    : [{ type: 'RE' }, { type: 'RL' }, { type: 'RL' }, { type: 'RL' }, { type: 'RL' }, { type: 'RL' }, { type: 'RL' }]

  return [...newBoard, rowA, rowB]
}

export default function App() {
  const [board, setBoard] = useState<BoardType>(initialBoard)

  const handleAddBundle = () => {
    setBoard(prev => addBundle(prev))
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Navigation />
      <Board board={board} onAddBundle={handleAddBundle} />
    </div>
  )
}
