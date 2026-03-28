import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { formatGold } from '../../utils/formatGold'
import { soundByAnimalId } from '../../utils/sound'
import type { MutableRefObject } from 'react'
import type { Board as BoardType } from '../../types/board'
import type { Producer } from '../../types/producer'
import type { Factory } from '../../types/factory'
import type { Animal } from '../../types/animal'
import type { AnimalId } from '../../types/animal'
import Cell from './Cell'
import ItemLayer from './ItemLayer'
import HandLayer from './HandLayer'
import { useGameLoop } from '../../hooks/useGameLoop'
import { SaveService } from '../../services/SaveService'
import type { FAState, FALiveStates, PRState } from '../../hooks/useGameLoop'
import coinIcon from '../../assets/coin.svg'
import bgSandWater from '../../assets/01_bg_sand_water.png'
import addLineBg from '../../assets/53_top_bg.png'
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
  onProducerClick?: (row: number, col: number, prStatesRef: MutableRefObject<Record<string, import('../../engine/types').PRState>>) => void
  onRsClick?: (row: number, col: number, rsKey: string, rsQueuesRef: MutableRefObject<Record<string, import('../../types/item').Item[]>>) => void
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

  const [{ items: initialItems, faStates: initialFaStates, rsQueues: initialRsQueues, produceTimers: initialProduceTimers, prStates: initialPrStates }] = useState(SaveService.loadEngineState)

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

  const { items, progresses, faPhases, bufferCounts, spawnClickerItem, faStatesRef, itemsRef, rsQueuesRef, produceTimersRef, prStatesRef, hasDerailed, clearItems, dismissDerail } = useGameLoop(board, cellSize, handleGoldEarned, producers, factories, animals, materialQuantityLevels, itemValueLevels, faBufferLevel, rsBufferLevel, railSpeedLevel, handleFactoryProcess, speedMultiplier, initialItems as never, initialFaStates as Record<string, FAState> ?? undefined, initialRsQueues as Record<string, import('../../types/item').Item[]> ?? undefined, initialProduceTimers ?? undefined, initialPrStates as Record<string, PRState> ?? undefined, onFaLiveStateChange, onProducerProgressChange)

  useLayoutEffect(() => {
    onSaveRef.current = () => {
      SaveService.saveEngineState({
        items: itemsRef.current,
        faStates: faStatesRef.current,
        rsQueues: rsQueuesRef.current,
        produceTimers: produceTimersRef.current,
        prStates: prStatesRef.current,
      })
    }
    spawnClickerItemRef.current = spawnClickerItem
  })

  const producersByPos = useMemo(() =>
    new Map(producers.map(p => [`${p.row}-${p.col}`, p])),
    [producers]
  )
  const factoriesByPos = useMemo(() =>
    new Map(factories.map(f => [`${f.row}-${f.col}`, f])),
    [factories]
  )
  const onPlaceAnimalRef = useRef(onPlaceAnimal)
  const onFactoryClickRef = useRef(onFactoryClick)
  const onProducerClickRef = useRef(onProducerClick)
  const onRsClickRef = useRef(onRsClick)
  useLayoutEffect(() => {
    onPlaceAnimalRef.current = onPlaceAnimal
    onFactoryClickRef.current = onFactoryClick
    onProducerClickRef.current = onProducerClick
    onRsClickRef.current = onRsClick
  })

  const clickHandlers = useMemo(() => {
    const map = new Map<string, () => void>()
    board.forEach((row, rowIdx) => { // eslint-disable-line react-hooks/refs
      row.forEach((cell, colIdx) => {
        const k = `${rowIdx}-${colIdx}`
        if (placingAnimalId && cell.type === 'FA' && factoriesByPos.get(k)?.built) map.set(k, () => onPlaceAnimalRef.current(rowIdx, colIdx))
        else if (!placingAnimalId && cell.type === 'FA') map.set(k, () => onFactoryClickRef.current?.(rowIdx, colIdx))
        else if (!placingAnimalId && cell.type === 'PR') map.set(k, () => onProducerClickRef.current?.(rowIdx, colIdx, prStatesRef))
        else if (!placingAnimalId && cell.type === 'RS') map.set(k, () => onRsClickRef.current?.(rowIdx, colIdx, `rs-${rowIdx}-${colIdx}`, rsQueuesRef))
      })
    })
    return map
  }, [board, placingAnimalId, factoriesByPos]) // eslint-disable-line react-hooks/exhaustive-deps

  const firstFAPos = useMemo(() => {
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c].type === 'FA') return { row: r, col: c }
      }
    }
    return null
  }, [board])

  if (cellSize === 0) return null

  return (
    <div className={styles.board}>
      <div className={styles.grid} style={{ position: 'relative', backgroundImage: `url(${bgSandWater})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className={styles.row}>
            {row.map((cell, colIdx) => (
              <Cell
                key={`${rowIdx}-${colIdx}`}
                cell={cell}
                size={cellSize}
                factory={cell.type === 'FA' ? factoriesByPos.get(`${rowIdx}-${colIdx}`) : undefined}
                producer={cell.type === 'PR' ? producersByPos.get(`${rowIdx}-${colIdx}`) : undefined}
                progress={progresses[`${rowIdx}-${colIdx}`]}
                bufferInfo={bufferCounts[`${rowIdx}-${colIdx}`]}
                placing={!!placingAnimalId && cell.type === 'FA' && !!factoriesByPos.get(`${rowIdx}-${colIdx}`)?.built}
                tutorialHighlight={
                  (tutorialHighlight === 'fa' && cell.type === 'FA' && firstFAPos?.row === rowIdx && firstFAPos?.col === colIdx) ||
                  (tutorialHighlight === 'rs' && cell.type === 'PR')
                }
                onClick={clickHandlers.get(`${rowIdx}-${colIdx}`)}
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
      <div
        className={styles.addButtonWrap}
        style={{ width: cellSize * 7, backgroundImage: `url(${addLineBg})`, backgroundSize: '100% 100%' }}
      >
        <button
          onClick={onAddBundle}
          className={styles.addButton}
          disabled={!canAddBundle}
        >
          <span className={styles.addButtonLabel}>라인 추가</span>
          <span className={styles.addButtonCost}>
            <img src={coinIcon} className={styles.addButtonCostIcon} alt="gold" />
            {formatGold(bundleCost)}
          </span>
        </button>
      </div>
    </div>
  )
})
