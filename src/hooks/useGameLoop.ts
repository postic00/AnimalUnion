import { useCallback, useEffect, useRef, useState } from 'react'
import type { Board } from '../types/board'
import type { Producer } from '../types/producer'
import type { Factory } from '../types/factory'
import type { Animal } from '../types/animal'
import { GameEngine } from '../engine/GameEngine'
import type { FAState, PRState, FALiveStates, Progresses, FAPhases } from '../engine/types'

// ── 상수 ───────────────────────────────────────────────────────────────────
const TICK_INTERVAL_MS = 33        // 게임 루프 틱 주기 (~30fps)
const RENDER_INTERVAL_MS = 100     // 렌더/진행도 갱신 주기

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
) {
  const [renderItems, setRenderItems] = useState(() => (initialItems ?? []) as import('../types/item').Item[])
  const [progresses, setProgresses] = useState<Progresses>({})
  const [faPhases, setFaPhases] = useState<FAPhases>({})
  const [bufferCounts, setBufferCounts] = useState<Record<string, { count: number; capacity: number }>>({})
  const [hasDerailed, setHasDerailed] = useState(false)

  const engineRef = useRef<GameEngine | null>(null)
  const mountedRef = useRef(false)

  // 최신 콜백을 항상 참조하도록 ref로 래핑
  const onGoldEarnedRef = useRef(onGoldEarned)
  onGoldEarnedRef.current = onGoldEarned
  const onFactoryProcessRef = useRef(onFactoryProcess)
  onFactoryProcessRef.current = onFactoryProcess
  const onFaLiveStateChangeRef = useRef(onFaLiveStateChange)
  onFaLiveStateChangeRef.current = onFaLiveStateChange
  const onProducerProgressChangeRef = useRef(onProducerProgressChange)
  onProducerProgressChangeRef.current = onProducerProgressChange
  const speedMultiplierRef = useRef(speedMultiplier ?? 1)
  speedMultiplierRef.current = speedMultiplier ?? 1

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

    let tickId: ReturnType<typeof setInterval> | null = null
    let renderIntervalId: ReturnType<typeof setInterval> | null = null
    let progressIntervalId: ReturnType<typeof setInterval> | null = null

    const startIntervals = () => {
      engine.resetLastTime()

      tickId = setInterval(() => {
        engine.updateConfig({ speedMultiplier: speedMultiplierRef.current })
        engine.tick()
      }, TICK_INTERVAL_MS)

      renderIntervalId = setInterval(() => {
        setRenderItems(engine.getRenderItems())
        const snap = engine.computeSnapshot(true)
        if (snap.hasDerailed) setHasDerailed(true)
      }, RENDER_INTERVAL_MS)

      progressIntervalId = setInterval(() => {
        const snap = engine.computeSnapshot()
        setProgresses(snap.progresses)
        setFaPhases(snap.faPhases)
        setBufferCounts(snap.bufferCounts)
        onFaLiveStateChangeRef.current?.(snap.faLiveStates)
        onProducerProgressChangeRef.current?.(snap.producerProgresses)
      }, RENDER_INTERVAL_MS)
    }

    const stopIntervals = () => {
      if (tickId) { clearInterval(tickId); tickId = null }
      if (renderIntervalId) { clearInterval(renderIntervalId); renderIntervalId = null }
      if (progressIntervalId) { clearInterval(progressIntervalId); progressIntervalId = null }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) stopIntervals()
      else startIntervals()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    startIntervals()

    return () => {
      stopIntervals()
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
    setRenderItems([])
    setHasDerailed(false)
  }, [])

  const dismissDerail = useCallback(() => {
    engineRef.current?.dismissDerail()
    setHasDerailed(false)
  }, [])

  // Board.tsx에서 저장 시 엔진 상태를 읽을 수 있도록 ref 노출
  const faStatesRef = useRef<Record<string, FAState>>({})
  const itemsRef = useRef<import('../types/item').Item[]>([])
  const rsQueuesRef = useRef<Record<string, import('../types/item').Item[]>>({})
  const produceTimersRef = useRef<Record<string, number>>({})
  const prStatesRef = useRef<Record<string, PRState>>({})

  // 렌더 주기마다 저장용 refs를 엔진 내부 상태와 동기화
  useEffect(() => {
    const id = setInterval(() => {
      const e = engineRef.current
      if (!e) return
      faStatesRef.current = e.faStates
      itemsRef.current = e.items
      rsQueuesRef.current = e.rsQueues
      produceTimersRef.current = e.produceTimers
      prStatesRef.current = e.prStates
    }, RENDER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return {
    items: renderItems,
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
    dismissDerail,
  }
}
