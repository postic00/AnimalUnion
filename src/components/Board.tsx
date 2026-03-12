import { useEffect, useState } from 'react'
import { formatGold } from '../utils/formatGold'
import type { MutableRefObject } from 'react'
import type { Board as BoardType } from '../types/board'
import type { Producer } from '../types/producer'
import type { Factory } from '../types/factory'
import type { Animal } from '../types/animal'
import type { AnimalId } from '../types/animal'
import Cell from './Cell'
import ItemLayer from './ItemLayer'
import HandLayer from './HandLayer'
import { useGameLoop } from '../hooks/useGameLoop'
import coinIcon from '../assets/coin.svg'
import styles from './Board.module.css'

interface Props {
  board: BoardType
  onAddBundle: () => void
  onGoldEarned: (amount: number) => void
  bundleCost: number
  canAddBundle: boolean
  producers: Producer[]
  factories: Factory[]
  animals: Animal[]
  materialQuantityLevels: number[]
  itemValueLevels: number[]
  faBufferLevel: number
  rsBufferLevel: number
  placingAnimalId: AnimalId | null
  onPlaceAnimal: (row: number, col: number) => void
  onCancelPlacing: () => void
  spawnClickerItemRef: MutableRefObject<((grade: number) => void) | null>
}

export default function Board({ board, onAddBundle, onGoldEarned, bundleCost, canAddBundle, producers, factories, animals, materialQuantityLevels, itemValueLevels, faBufferLevel, rsBufferLevel, placingAnimalId, onPlaceAnimal, onCancelPlacing, spawnClickerItemRef }: Props) {
  const [cellSize, setCellSize] = useState(0)

  useEffect(() => {
    const updateSize = () => {
      setCellSize(Math.floor(window.innerWidth / 7))
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const { items, progresses, faPhases, spawnClickerItem } = useGameLoop(board, cellSize, onGoldEarned, producers, factories, animals, materialQuantityLevels, itemValueLevels, faBufferLevel, rsBufferLevel)
  spawnClickerItemRef.current = spawnClickerItem

  if (cellSize === 0) return null

  return (
    <div className={styles.board}>
      <div className={styles.grid} style={{ position: 'relative' }}>
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className={styles.row}>
            {row.map((cell, colIdx) => (
              <Cell
                key={colIdx}
                cell={cell}
                size={cellSize}
                factory={cell.type === 'FA' ? factories.find(f => f.row === rowIdx && f.col === colIdx) : undefined}
                producer={cell.type === 'PR' ? producers.find(p => p.row === rowIdx && p.col === colIdx) : undefined}
                progress={progresses[`${rowIdx}-${colIdx}`]}
                placing={!!placingAnimalId && cell.type === 'FA'}
                onClick={placingAnimalId && cell.type === 'FA' ? () => onPlaceAnimal(rowIdx, colIdx) : undefined}
              />
            ))}
          </div>
        ))}
        {placingAnimalId && (
          <button className={styles.cancelPlacing} onClick={onCancelPlacing}>
            배치 취소
          </button>
        )}
        <HandLayer factories={factories} cellSize={cellSize} faPhases={faPhases} />
        <ItemLayer items={items} cellSize={cellSize} />
      </div>
      <button
        onClick={onAddBundle}
        className={styles.addButton}
        style={{ width: cellSize * 7 }}
        disabled={!canAddBundle}
      >
        <div className={styles.addButtonLeft}>
          <span className={styles.addButtonPlus}>+</span>
          <span className={styles.addButtonText}>라인 추가</span>
        </div>
        <span className={styles.addButtonCost}><img src={coinIcon} className={styles.addButtonCostIcon} alt="gold" />{formatGold(bundleCost)}</span>
      </button>
    </div>
  )
}
