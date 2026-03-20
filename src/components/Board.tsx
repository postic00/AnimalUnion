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
import { saveItems, loadItems, saveFaStates, loadFaStates, saveRsQueues, loadRsQueues, saveProduceTimers, loadProduceTimers, savePrStates, loadPrStates } from '../utils/saveLoad'
import type { FAState, FALiveStates, PRState } from '../hooks/useGameLoop'
import coinIcon from '../assets/coin.svg'
import styles from './Board.module.css'

export interface LevelConfig {
  materialQuantityLevels: number[]
  itemValueLevels: number[]
  faBufferLevel: number
  rsBufferLevel: number
  railSpeedLevel: number
}

interface Props {
  board: BoardType
  onAddBundle: () => void
  onGoldEarned: (amount: number) => void
  bundleCost: number
  canAddBundle: boolean
  producers: Producer[]
  factories: Factory[]
  animals: Animal[]
  levelConfig: LevelConfig
  placingAnimalId: AnimalId | null
  onPlaceAnimal: (row: number, col: number) => void
  onCancelPlacing: () => void
  spawnClickerItemRef: MutableRefObject<((grade: number) => void) | null>
  onSaveRef: MutableRefObject<() => void>
  muted: boolean
  speedMultiplier: number
  onFactoryClick?: (row: number, col: number) => void
  onProducerClick?: (row: number, col: number) => void
  onRsClick?: (row: number, col: number, rsKey: string, rsQueuesRef: MutableRefObject<Record<string, import('../types/item').Item[]>>) => void
  onFaLiveStateChange?: (states: FALiveStates) => void
  onProducerProgressChange?: (progresses: Record<string, number>) => void
  tutorialHighlight?: 'fa' | 'rs'
  disableDerail?: boolean
}

export default memo(function Board({ board, onAddBundle, onGoldEarned, bundleCost, canAddBundle, producers, factories, animals, levelConfig, placingAnimalId, onPlaceAnimal, onCancelPlacing, spawnClickerItemRef, onSaveRef, muted, speedMultiplier, onFactoryClick, onProducerClick, onRsClick, onFaLiveStateChange, onProducerProgressChange, tutorialHighlight, disableDerail }: Props) {
  const { materialQuantityLevels, itemValueLevels, faBufferLevel, rsBufferLevel, railSpeedLevel } = levelConfig
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
  const savedRsQueuesRef = useRef(loadRsQueues())
  const savedProduceTimersRef = useRef(loadProduceTimers())
  const savedPrStatesRef = useRef(loadPrStates())

  const [goldFloats, setGoldFloats] = useState<{ id: number; x: number; y: number; amount: number }[]>([])
  const floatIdRef = useRef(0)

  const handleGoldEarned = useCallback((amount: number, x: number, y: number) => {
    onGoldEarned(amount)
    const id = floatIdRef.current++
    setGoldFloats(prev => [...prev, { id, x, y, amount }])
    setTimeout(() => setGoldFloats(prev => prev.filter(f => f.id !== id)), 1000)
  }, [onGoldEarned])

  const handleFactoryProcess = useCallback((animalId: string | null) => {
    if (!muted) soundByAnimalId(animalId)
  }, [muted])

  const { items, progresses, faPhases, bufferCounts, spawnClickerItem, faStatesRef, itemsRef, rsQueuesRef, produceTimersRef, prStatesRef, hasDerailed, clearItems, dismissDerail } = useGameLoop(board, cellSize, handleGoldEarned, producers, factories, animals, materialQuantityLevels, itemValueLevels, faBufferLevel, rsBufferLevel, railSpeedLevel, handleFactoryProcess, speedMultiplier, savedItemsRef.current as never, savedFaStatesRef.current as Record<string, FAState> ?? undefined, savedRsQueuesRef.current as Record<string, import('../types/item').Item[]> ?? undefined, savedProduceTimersRef.current ?? undefined, savedPrStatesRef.current as Record<string, PRState> ?? undefined, onFaLiveStateChange, onProducerProgressChange)

  onSaveRef.current = () => {
    saveItems(itemsRef.current)
    saveFaStates(faStatesRef.current)
    saveRsQueues(rsQueuesRef.current)
    saveProduceTimers(produceTimersRef.current)
    savePrStates(prStatesRef.current)
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
                tutorialHighlight={
                  (tutorialHighlight === 'fa' && cell.type === 'FA') ||
                  (tutorialHighlight === 'rs' && cell.type === 'PR')
                }
                onClick={
                  placingAnimalId && cell.type === 'FA' ? () => onPlaceAnimal(rowIdx, colIdx)
                  : !placingAnimalId && cell.type === 'FA' ? () => onFactoryClick?.(rowIdx, colIdx)
                  : !placingAnimalId && cell.type === 'PR' ? () => onProducerClick?.(rowIdx, colIdx)
                  : !placingAnimalId && cell.type === 'RS' ? () => onRsClick?.(rowIdx, colIdx, `rs-${rowIdx}-${colIdx}`, rsQueuesRef)
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
        {goldFloats.map(f => (
          <div key={f.id} className={styles.goldFloat} style={{ left: f.x, top: f.y }}>
            +{formatGold(f.amount)}
          </div>
        ))}
      </div>
      {hasDerailed && !disableDerail && (
        <div className={styles.derailOverlay}>
          <div className={styles.derailBox}>
            <span className={styles.derailTitle}>⚠️ 레일 이탈 감지</span>
            <span className={styles.derailDesc}>아이템이 레일을 벗어났습니다.</span>
            <div className={styles.derailActions}>
              <button className={styles.derailBtnCancel} onClick={dismissDerail}>취소</button>
              <button className={styles.derailBtn} onClick={clearItems}>문제 해결</button>
            </div>
          </div>
        </div>
      )}
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
