import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Board } from '../types/board'
import type { Producer } from '../types/producer'
import type { Factory } from '../types/factory'
import type { Animal } from '../types/animal'
import { GameEngine } from '../engine/GameEngine'
import type { FAState, PRState, FALiveStates, Progresses, FAPhases } from '../engine/types'

// ── 상수 ───────────────────────────────────────────────────────────────────
const ITEM_RENDER_INTERVAL_MS = 33  // 아이템 위치 갱신 주기 (~30fps)
const RENDER_INTERVAL_MS = 100      // 스냅샷(진행도·버퍼 등) 갱신 주기

// ── re-export (하위 호환) ───────────────────────────────────────────────────
export type { FAState, PRState, FALiveStates, FAPhases, Progresses }
export type { FAPhase, FALiveState, GameEngineSnapshot } from '../engine/types'

export type FAPhases2 = FAPhases  // alias, 사용처 없으면 삭제 가능

export function useGameLoop(
  board: Board,
  cellSize: number,
  onGoldEarned: (amount: number, x: number, y: number) => void,
  producers: Producer[],
  factories: Factory[],
  animals: Animal[],
  materialQuantityLevels: number[],
  itemValueLevels: number[],
  faBufferLevel: number,
  rsBufferLevel: number,
  railSpeedLevel: number,
  onFactoryProcess?: (animalId: string | null) => void,
  speedMultiplier?: number,
  initialItems?: unknown[],
  initialFaStates?: Record<string, unknown>,
  initialRsQueues?: Record<string, unknown[]>,
  initialProduceTimers?: Record<string, number>,
  initialPrStates?: Record<string, unknown>,
  onFaLiveStateChange?: (states: FALiveStates) => void,
  onProducerProgressChange?: (progresses: Record<string, number>) => void,
  onSecondTick?: () => void,
) {
  const [itemTick, setItemTick] = useState(0)
  const [progresses, setProgresses] = useState<Progresses>({})
  const [faPhases, setFaPhases] = useState<FAPhases>({})
  const [bufferCounts, setBufferCounts] = useState<Record<string, { count: number; capacity: number }>>({})
  const [hasDerailed, setHasDerailed] = useState(false)

  const engineRef = useRef<GameEngine | null>(null)
  const mountedRef = useRef(false)

  // Board.tsx에서 저장 시 엔진 상태를 읽을 수 있도록 ref 노출
  const faStatesRef = useRef<Record<string, FAState>>({})
  const itemsRef = useRef<import('../types/item').Item[]>([])
  const rsQueuesRef = useRef<Record<string, import('../types/item').Item[]>>({})
  const produceTimersRef = useRef<Record<string, number>>({})
  const prStatesRef = useRef<Record<string, PRState>>({})

  // 최신 콜백을 항상 참조하도록 ref로 래핑
  const onGoldEarnedRef = useRef(onGoldEarned)
  const onFactoryProcessRef = useRef(onFactoryProcess)
  const onFaLiveStateChangeRef = useRef(onFaLiveStateChange)
  const onProducerProgressChangeRef = useRef(onProducerProgressChange)
  const onSecondTickRef = useRef(onSecondTick)
  const speedMultiplierRef = useRef(speedMultiplier ?? 1)
  useLayoutEffect(() => {
    onGoldEarnedRef.current = onGoldEarned
    onFactoryProcessRef.current = onFactoryProcess
    onFaLiveStateChangeRef.current = onFaLiveStateChange
    onProducerProgressChangeRef.current = onProducerProgressChange
    onSecondTickRef.current = onSecondTick
    speedMultiplierRef.current = speedMultiplier ?? 1
  })

  // 엔진 생성 (board/cellSize 변경 시 재구성)
  useEffect(() => {
    if (cellSize === 0) return

    const isFirstMount = !mountedRef.current
    mountedRef.current = true

    const prevState = engineRef.current?.exportState()

    const engine = new GameEngine({
      board,
      cellSize,
      producers,
      factories,
      animals,
      materialQuantityLevels,
      itemValueLevels,
      faBufferLevel,
      rsBufferLevel,
      railSpeedLevel,
      speedMultiplier: speedMultiplierRef.current,
      onGoldEarned: (...args) => onGoldEarnedRef.current(...args),
      onFactoryProcess: (...args) => onFactoryProcessRef.current?.(...args),
    })

    // 최초 마운트: 저장된 데이터로 복원, 이후(board 변경): 이전 엔진 상태 이전
    if (isFirstMount) {
      engine.restore({
        items: (initialItems ?? []) as import('../types/item').Item[],
        faStates: (initialFaStates ?? {}) as Record<string, FAState>,
        rsQueues: (initialRsQueues ?? {}) as Record<string, import('../types/item').Item[]>,
        produceTimers: initialProduceTimers ?? {},
        prStates: (initialPrStates ?? {}) as Record<string, PRState>,
      })
    } else if (prevState) {
      engine.restore(prevState)
    }

    engineRef.current = engine
    itemsRef.current = engine.items  // 엔진 배열 직접 연결 (복사 없음)

    let rafId: number | null = null
    let lastItemRenderTime = 0
    let lastRenderTime = 0
    let lastSecondTick = 0

    const loop = (now: number) => {
      engine.updateConfig({ speedMultiplier: speedMultiplierRef.current })
      engine.tick()
      if (now - lastItemRenderTime >= ITEM_RENDER_INTERVAL_MS) {
        lastItemRenderTime = now
        setItemTick(t => t + 1)
      }
      if (now - lastRenderTime >= RENDER_INTERVAL_MS) {
        lastRenderTime = now
        const snap = engine.computeSnapshot(true)
        if (snap.hasDerailed) setHasDerailed(true)
        setProgresses(snap.progresses)
        setFaPhases(snap.faPhases)
        setBufferCounts(snap.bufferCounts)
        onFaLiveStateChangeRef.current?.(snap.faLiveStates)
        onProducerProgressChangeRef.current?.(snap.producerProgresses)
        faStatesRef.current = engine.faStates
        itemsRef.current = engine.items
        rsQueuesRef.current = engine.rsQueues
        produceTimersRef.current = engine.produceTimers
        prStatesRef.current = engine.prStates
      }
      if (now - lastSecondTick >= 1000) {
        lastSecondTick = now
        onSecondTickRef.current?.()
      }
      rafId = requestAnimationFrame(loop)
    }

    const start = () => {
      engine.resetLastTime()
      lastItemRenderTime = performance.now()
      lastRenderTime = performance.now()
      lastSecondTick = performance.now()
      rafId = requestAnimationFrame(loop)
    }

    const stop = () => {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    start()

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [board, cellSize]) // eslint-disable-line react-hooks/exhaustive-deps

  // config 변경을 엔진에 전파 (board 재생성 없이)
  useEffect(() => {
    engineRef.current?.updateConfig({ producers, factories })
  }, [producers, factories])

  useEffect(() => {
    engineRef.current?.updateConfig({ animals })
  }, [animals])

  useEffect(() => {
    engineRef.current?.updateConfig({ materialQuantityLevels, itemValueLevels })
  }, [materialQuantityLevels, itemValueLevels])

  useEffect(() => {
    engineRef.current?.updateConfig({ faBufferLevel, rsBufferLevel, railSpeedLevel })
  }, [faBufferLevel, rsBufferLevel, railSpeedLevel])

  useEffect(() => {
    if (producers.length > 0) engineRef.current?.resetLastTime()
  }, [producers])

  const spawnClickerItem = useCallback((grade: number) => {
    engineRef.current?.spawnClickerItem(grade)
  }, [])

  const clearItems = useCallback(() => {
    engineRef.current?.clearItems()
    if (engineRef.current) itemsRef.current = engineRef.current.items
    setItemTick(t => t + 1)
    setHasDerailed(false)
  }, [])

  const clearAll = useCallback(() => {
    engineRef.current?.clearAll()
    if (engineRef.current) itemsRef.current = engineRef.current.items
    setItemTick(t => t + 1)
    setHasDerailed(false)
  }, [])

  const dismissDerail = useCallback(() => {
    engineRef.current?.dismissDerail()
    setHasDerailed(false)
  }, [])


  return {
    itemTick,
    progresses,
    faPhases,
    bufferCounts,
    spawnClickerItem,
    faStatesRef,
    itemsRef,
    rsQueuesRef,
    produceTimersRef,
    prStatesRef,
    hasDerailed,
    clearItems,
    clearAll,
    dismissDerail,
  }
}
