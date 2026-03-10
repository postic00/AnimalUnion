import { useState } from 'react'
import Board from './components/Board'
import { initialBoard } from './data/initialBoard'
import type { Board as BoardType } from './types/board'

export default function App() {
  const [board] = useState<BoardType>(initialBoard)

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900">
      <h1 className="text-xl font-bold py-4">파 Idle Game</h1>
      <Board board={board} />
    </div>
  )
}
