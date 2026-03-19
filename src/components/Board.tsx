import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatGold } from '../utils/formatGold'
import { soundByAnimalId } from '../utils/sound'
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
import { saveItems, loadItems, saveFaStates, loadFaStates } from '../utils/saveLoad'
import type { FAState, FALiveStates } from '../hooks/useGameLoop'
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
  railSpeedLevel: number
  placingAnimalId: AnimalId | null
  onPlaceAnimal: (row: number, col: number) => void
  onCancelPlacing: () => void
  spawnClickerItemRef: MutableRefObject<((grade: number) => void) | null>
  onSaveRef: MutableRefObject<() => void>
  muted: boolean
  speedMultiplier: number
  onFactoryClick?: (row: number, col: number) => void
  onProducerClick?: (row: number, col: number) => void
  onFaLiveStateChange?: (states: FALiveStates) => void
}

export default memo(function Board({ board, onAddBundle, onGoldEarned, bundleCost, canAddBundle, producers, factories, animals, materialQuantityLevels, itemValueLevels, faBufferLevel, rsBufferLevel, railSpeedLevel, placingAnimalId, onPlaceAnimal, onCancelPlacing, spawnClickerItemRef, onSaveRef, muted, speedMultiplier, onFactoryClick, onProducerClick, onFaLiveStateChange }: Props) {
  const [cellSize, setCellSize] = useState(0)

  useEffect(() => {
    const updateSize = () => {
      setCellSize(Math.floor(window.innerWidth / 7))
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const savedItemsRef = useRef(loadItems())
  const savedFaStatesRef = useRef(loadFaStates())

  const handleFactoryProcess = useCallback((animalId: string | null) => {
    if (!muted) soundByAnimalId(animalId)
  }, [muted])

  const { items, progresses, faPhases, bufferCounts, spawnClickerItem, faStatesRef, itemsRef } = useGameLoop(board, cellSize, onGoldEarned, producers, factories, animals, materialQuantityLevels, itemValueLevels, faBufferLevel, rsBufferLevel, railSpeedLevel, handleFactoryProcess, speedMultiplier, savedItemsRef.current as never, savedFaStatesRef.current as Record<string, FAState> ?? undefined, onFaLiveStateChange)

  onSaveRef.current = () => {
    saveItems(itemsRef.current)
    saveFaStates(faStatesRef.current)
  }
  spawnClickerItemRef.current = spawnClickerItem

  const producersByPos = useMemo(() =>
    new Map(producers.map(p => [`${p.row}-${p.col}`, p])),
    [producers]
  )
  const factoriesByPos = useMemo(() =>
    new Map(factories.map(f => [`${f.row}-${f.col}`, f])),
    [factories]
  )

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
                factory={cell.type === 'FA' ? factoriesByPos.get(`${rowIdx}-${colIdx}`) : undefined}
                producer={cell.type === 'PR' ? producersByPos.get(`${rowIdx}-${colIdx}`) : undefined}
                progress={progresses[`${rowIdx}-${colIdx}`]}
                bufferInfo={bufferCounts[`${rowIdx}-${colIdx}`]}
                placing={!!placingAnimalId && cell.type === 'FA'}
                onClick={
                  placingAnimalId && cell.type === 'FA' ? () => onPlaceAnimal(rowIdx, colIdx)
                  : !placingAnimalId && cell.type === 'FA' ? () => onFactoryClick?.(rowIdx, colIdx)
                  : !placingAnimalId && cell.type === 'PR' ? () => onProducerClick?.(rowIdx, colIdx)
                  : undefined
                }
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
})
