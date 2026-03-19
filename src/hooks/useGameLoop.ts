import { useCallback, useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import type { Board } from '../types/board'
import type { Item } from '../types/item'
import type { Producer } from '../types/producer'
import type { Factory } from '../types/factory'
import type { Animal } from '../types/animal'
import {
  getProducerValue,
  getProducerInterval,
  getFinalGold,
  getFactoryPickTime,
  getFactoryProcessTime,
  getMaterialQuantity,
  applyWaBonus,
  applyPkBonus,
  createRecipeOutput,
  getRsBufferCapacity,
  getFaBufferCapacity,
  getRailMoveSpeed,
  RECIPES,
} from '../balance'

export type Progresses = Record<string, number>
import {
  getCellCenter,
  getCellDirection,
  getCell,
  isBlocked,
  buildSpatialHash,
} from '../utils/boardUtils'

export type FAPhase = 'IDLE' | 'GRABBING' | 'PROCESSING' | 'PLACING' | 'WAITING'
export type FAPhases = Record<string, FAPhase>

export interface FALiveState {
  grabState: 'IDLE' | 'GRABBING'
  processState: 'IDLE' | 'PROCESSING' | 'PLACING' | 'WAITING'
  inputBuffer: number
  inputCapacity: number
  inputItems: { grade: number; quantity: number }[]
  hasOutputItem: boolean
  outputItem: Item | null
  processingItem: Item | null  // WA/PK: 현재 처리 중인 아이템 (보너스 적용 후)
  processProgress: number
}
export type FALiveStates = Record<string, FALiveState>

export interface FAState {
  grabState: 'IDLE' | 'GRABBING'
  grabTimer: number
  grabbed: Item | null            // grab 채널: 집는 중인 아이템

  processState: 'IDLE' | 'PROCESSING' | 'PLACING' | 'WAITING'
  processTimer: number
  pendingQueue: Item[]            // grab 완료 → process 픽업 대기 (WA/PK 다중 버퍼)
  processing: Item | null         // process 채널: 처리 중인 아이템 (WA/PK)
  outputItem: Item | null         // 출력 대기 아이템
  snappedOutputItem: Item | null  // PA: 처리 시작 시점에 확정된 출력 아이템

  buffer: { grade: number; count: number }[]  // PA: 수집된 재료
}

const DEFAULT_FA_STATE: FAState = {
  grabState: 'IDLE', grabTimer: 0, grabbed: null,
  processState: 'IDLE', processTimer: 0, pendingQueue: [], processing: null, outputItem: null, snappedOutputItem: null,
  buffer: [],
}

function getNextTarget(
  board: Board,
  cellSize: number,
  currentX: number,
  currentY: number,
): { targetX: number; targetY: number; dx: number; dy: number } | null {
  const col = Math.round(currentX / cellSize - 0.5)
  const row = Math.round(currentY / cellSize - 0.5)

  const cell = getCell(board, row, col)
  if (!cell) return null

  const dir = getCellDirection(cell.type)
  if (dir.dx === 0 && dir.dy === 0) return null

  const nextCol = col + dir.dx
  const nextRow = row + dir.dy
  const nextCell = getCell(board, nextRow, nextCol)
  if (!nextCell) return null

  const center = getCellCenter(nextRow, nextCol, cellSize)
  return { targetX: center.x, targetY: center.y, dx: dir.dx, dy: dir.dy }
}

function placeOnBelt(
  item: Item,
  outputCenter: { x: number; y: number },
  board: Board,
  cellSize: number,
): Item {
  const next = getNextTarget(board, cellSize, outputCenter.x, outputCenter.y)
  return next
    ? { ...item, x: outputCenter.x, y: outputCenter.y, dx: next.dx, dy: next.dy, targetX: next.targetX, targetY: next.targetY }
    : { ...item, x: outputCenter.x, y: outputCenter.y }
}

export function useGameLoop(
  board: Board,
  cellSize: number,
  onGoldEarned: (amount: number) => void,
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
  initialItems?: Item[],
  initialFaStates?: Record<string, FAState>,
  onFaLiveStateChange?: (states: FALiveStates) => void,
) {
  const [renderItems, setRenderItems] = useState<Item[]>(initialItems ?? [])
  const [progresses, setProgresses] = useState<Progresses>({})
  const [faPhases, setFaPhases] = useState<FAPhases>({})
  const [bufferCounts, setBufferCounts] = useState<Record<string, { count: number; capacity: number }>>({})
  const itemsRef = useRef<Item[]>(initialItems ?? [])
  const lastTimeRef = useRef<number>(0)
  const produceTimersRef = useRef<Record<string, number>>({})
  const rsQueuesRef = useRef<Record<string, Item[]>>({})  // RS 버퍼 큐
  const onGoldEarnedRef = useRef(onGoldEarned)
  onGoldEarnedRef.current = onGoldEarned
  const onFactoryProcessRef = useRef(onFactoryProcess)
  onFactoryProcessRef.current = onFactoryProcess
  const speedMultiplierRef = useRef(speedMultiplier ?? 1)
  speedMultiplierRef.current = speedMultiplier ?? 1
  const producersRef = useRef(producers)
  const producersByPosRef = useRef(new Map<string, typeof producers[0]>())
  if (producersRef.current !== producers) {
    producersRef.current = producers
    const m = producersByPosRef.current
    m.clear()
    for (const p of producers) m.set(`${p.row}-${p.col}`, p)
  }
  const factoriesRef = useRef(factories)
  factoriesRef.current = factories
  const animalsRef = useRef(animals)
  animalsRef.current = animals
  const faStatesRef = useRef<Record<string, FAState>>({})
  const pendingClickerSpawnsRef = useRef(0)
  const pendingClickerGradeRef = useRef<number>(1)
  const mountedRef = useRef(false)
  const spatialHashRef = useRef<Map<string, Item[]>>(new Map())
  const materialQuantityLevelsRef = useRef(materialQuantityLevels)
  materialQuantityLevelsRef.current = materialQuantityLevels
  const itemValueLevelsRef = useRef(itemValueLevels)
  itemValueLevelsRef.current = itemValueLevels
  const faBufferLevelRef = useRef(faBufferLevel)
  faBufferLevelRef.current = faBufferLevel
  const onFaLiveStateChangeRef = useRef(onFaLiveStateChange)
  onFaLiveStateChangeRef.current = onFaLiveStateChange
  const rsBufferLevelRef = useRef(rsBufferLevel)
  rsBufferLevelRef.current = rsBufferLevel
  const railSpeedLevelRef = useRef(railSpeedLevel)
  railSpeedLevelRef.current = railSpeedLevel

  useEffect(() => {
    if (cellSize === 0) return

    if (!mountedRef.current) {
      // 최초 마운트: 저장된 상태로 초기화
      mountedRef.current = true
      itemsRef.current = initialItems ?? []
      setRenderItems(initialItems ?? [])
      faStatesRef.current = (initialFaStates as Record<string, FAState>) ?? {}
      produceTimersRef.current = {}
      rsQueuesRef.current = {}
      pendingClickerSpawnsRef.current = 0
    }
    lastTimeRef.current = 0

    const itemSize = cellSize * CONFIG.ITEM_GAP_RATIO
    const pickTime = getFactoryPickTime()

    let tickCount = 0

    const tick = () => {
      const time = performance.now()
      if (lastTimeRef.current === 0) lastTimeRef.current = time
      const rawDelta = Math.min(time - lastTimeRef.current, 50)
      const delta = rawDelta * (speedMultiplierRef.current ?? 1)
      lastTimeRef.current = time

      let items = itemsRef.current

      // PR 생산 → RS 큐에 추가
      board.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          if (cell.type !== 'PR') return
          const key = `${rowIdx}-${colIdx}`
          if (produceTimersRef.current[key] === undefined) produceTimersRef.current[key] = 0
          produceTimersRef.current[key] += delta

          const producer = producersByPosRef.current.get(key)
          if (!producer || !producer.built || producer.level === 0) {
            produceTimersRef.current[key] = 0
            return
          }

          const grade = producer.grade
          const quantity = getMaterialQuantity(materialQuantityLevelsRef.current[grade - 1] ?? 1)
          const fullInterval = getProducerInterval(producer.level) * quantity

          if (produceTimersRef.current[key] >= fullInterval) {
            produceTimersRef.current[key] = 0

            // RS 위치 탐색
            let rsRow = -1, rsCol = -1
            for (let r = rowIdx + 1; r < board.length; r++) {
              for (let c = 0; c < board[r].length; c++) {
                if (board[r][c].type === 'RS') { rsRow = r; rsCol = c; break }
              }
              if (rsRow !== -1) break
            }
            if (rsRow === -1) return

            const rsKey = `rs-${rsRow}-${rsCol}`
            if (!rsQueuesRef.current[rsKey]) rsQueuesRef.current[rsKey] = []

            const capacity = getRsBufferCapacity(rsBufferLevelRef.current)
            if (rsQueuesRef.current[rsKey].length >= capacity) return

            const center = getCellCenter(rsRow, rsCol, cellSize)
            const dir = getCellDirection('RS')
            const next = getNextTarget(board, cellSize, center.x, center.y)
            if (!next) return

            const newItem: Item = {
              id: crypto.randomUUID(),
              x: center.x, y: center.y,
              dx: dir.dx, dy: dir.dy,
              targetX: next.targetX, targetY: next.targetY,
              grade,
              value: getProducerValue(grade, itemValueLevelsRef.current[grade - 1] ?? 1),
              quantity,
              waBonus: 0, paBonus: 0, pkBonus: 0,
              waGrades: [], paGrades: [], pkGrades: [],
            }
            rsQueuesRef.current[rsKey].push(newItem)
          }
        })
      })

      // RS 큐 → 벨트 투입
      board.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          if (cell.type !== 'RS') return
          const rsKey = `rs-${rowIdx}-${colIdx}`
          const queue = rsQueuesRef.current[rsKey]
          if (!queue || queue.length === 0) return

          const center = getCellCenter(rowIdx, colIdx, cellSize)
          const rsOccupied = items.some(it =>
            Math.sqrt((it.x - center.x) ** 2 + (it.y - center.y) ** 2) < itemSize
          )
          if (rsOccupied) return

          const item = queue.shift()!
          items.push(item)
        })
      })

      // 아이템 이동
      const spatialHash = buildSpatialHash(items, itemSize, spatialHashRef.current)
      const step = (cellSize / getRailMoveSpeed(railSpeedLevelRef.current)) * delta
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (isBlocked(item, spatialHash, itemSize)) continue

        const dx = item.targetX - item.x
        const dy = item.targetY - item.y
        const distToTarget = Math.sqrt(dx * dx + dy * dy)

        if (step >= distToTarget) {
          item.x = item.targetX
          item.y = item.targetY
          const next = getNextTarget(board, cellSize, item.targetX, item.targetY)
          if (next) {
            item.dx = next.dx
            item.dy = next.dy
            item.targetX = next.targetX
            item.targetY = next.targetY
          }
        } else {
          const ratio = step / distToTarget
          item.x += dx * ratio
          item.y += dy * ratio
        }
      }

      // 탈선 방어: 30틱(~1초)마다 유효하지 않은 셀에 있는 아이템 제거
      tickCount++
      if (tickCount % 30 === 0) {
        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i]
          if (!isFinite(item.x) || !isFinite(item.y)) { items.splice(i, 1); continue }
          const col = Math.floor(item.x / cellSize)
          const row = Math.floor(item.y / cellSize)
          const cell = getCell(board, row, col)
          if (!cell) { items.splice(i, 1); continue }
          const type = cell.type
          if (!(type === 'RLN' || type === 'RRN' || type === 'RUN' || type === 'RDN'
            || type === 'RS' || type === 'RE' || type === 'FA' || type === 'PR'
            || type === 'RDR' || type === 'RLR' || type === 'RDL' || type === 'RRL')) {
            items.splice(i, 1)
          }
        }
      }

      // FA 처리
      factoriesRef.current.forEach(factory => {
        if (!factory.built || factory.level < 1) return

        const key = `fa-${factory.row}-${factory.col}`
        if (!faStatesRef.current[key] || !('grabState' in faStatesRef.current[key])) {
          faStatesRef.current[key] = { ...DEFAULT_FA_STATE }
        }

        const inputRow = factory.dir === 'UP_TO_DOWN' ? factory.row - 1 : factory.row + 1
        const inputCol = factory.col
        const outputRow = factory.dir === 'UP_TO_DOWN' ? factory.row + 1 : factory.row - 1
        const outputCol = factory.col

        if (!getCell(board, inputRow, inputCol) || !getCell(board, outputRow, outputCol)) return

        const inputCenter = getCellCenter(inputRow, inputCol, cellSize)
        const outputCenter = getCellCenter(outputRow, outputCol, cellSize)

        const isOutputOccupied = () =>
          items.some(it => Math.sqrt((it.x - outputCenter.x) ** 2 + (it.y - outputCenter.y) ** 2) <= cellSize * 0.3)

        const placeOutput = () => {
          items.push(placeOnBelt(faStatesRef.current[key].outputItem!, outputCenter, board, cellSize))
          faStatesRef.current[key] = { ...faStatesRef.current[key], processState: 'IDLE', processTimer: 0, outputItem: null }
        }

        if (factory.type === 'WA' || factory.type === 'PK') {
          const isTargetItem = (it: Item): boolean => {
            if (it.grade !== factory.grade) return false
            if (factory.type === 'WA') {
              if (it.waGrades.includes(factory.grade)) return false
              if (it.pkGrades.length > 0) return false
            } else {
              if (it.pkGrades.includes(factory.grade)) return false
            }
            return Math.sqrt((it.x - inputCenter.x) ** 2 + (it.y - inputCenter.y) ** 2) <= cellSize * 0.3
          }
          const applyBonus = (item: Item) => factory.type === 'WA'
            ? applyWaBonus(item, factory, animalsRef.current)
            : applyPkBonus(item, factory, animalsRef.current)

          const bufferCapacity = getFaBufferCapacity(faBufferLevelRef.current)
          const pendingQueue = faStatesRef.current[key].pendingQueue ?? []

          // GRAB 채널
          {
            const fas = faStatesRef.current[key]
            const pendingQty = (fas.pendingQueue ?? []).reduce((s, it) => s + it.quantity, 0)
            if (fas.grabState === 'IDLE' && pendingQty < bufferCapacity) {
              const idx = items.findIndex(isTargetItem)
              if (idx !== -1) {
                const grabbed = items[idx]
                items[idx] = items[items.length - 1]; items.pop()
                faStatesRef.current[key] = { ...faStatesRef.current[key], grabState: 'GRABBING', grabTimer: 0, grabbed }
              }
            } else if (fas.grabState === 'GRABBING') {
              const newTimer = fas.grabTimer + delta
              if (newTimer >= pickTime) {
                const pending = applyBonus(fas.grabbed!)
                faStatesRef.current[key] = { ...faStatesRef.current[key], grabState: 'IDLE', grabTimer: 0, grabbed: null, pendingQueue: [...pendingQueue, pending] }
              } else {
                faStatesRef.current[key] = { ...faStatesRef.current[key], grabTimer: newTimer }
              }
            }
          }

          // PROCESS 채널
          {
            const fas = faStatesRef.current[key]
            const queue = fas.pendingQueue ?? []
            if (fas.processState === 'IDLE') {
              if (queue.length > 0) {
                const [next, ...rest] = queue
                faStatesRef.current[key] = { ...faStatesRef.current[key], processState: 'PROCESSING', processTimer: 0, processing: next, pendingQueue: rest }
              }
            } else if (fas.processState === 'PROCESSING') {
              const outputQty = getMaterialQuantity(materialQuantityLevelsRef.current[factory.grade - 1] ?? 1)
              const processTime = getFactoryProcessTime(factory.level, outputQty)
              const newTimer = fas.processTimer + delta
              if (newTimer >= processTime) {
                onFactoryProcessRef.current?.(factory.animalId ?? null)
                faStatesRef.current[key] = { ...faStatesRef.current[key], processState: 'PLACING', processTimer: 0, outputItem: fas.processing, processing: null }
              } else {
                faStatesRef.current[key] = { ...faStatesRef.current[key], processTimer: newTimer }
              }
            } else if (fas.processState === 'PLACING') {
              const newTimer = fas.processTimer + delta
              if (newTimer >= pickTime) {
                if (!isOutputOccupied()) placeOutput()
                else faStatesRef.current[key] = { ...faStatesRef.current[key], processState: 'WAITING', processTimer: 0 }
              } else {
                faStatesRef.current[key] = { ...faStatesRef.current[key], processTimer: newTimer }
              }
            } else if (fas.processState === 'WAITING') {
              if (!isOutputOccupied()) placeOutput()
            }
          }

        } else {
          // PA: 레시피 기반 조합
          const recipe = RECIPES[factory.grade]
          if (!recipe) return

          const outputQuantity = getMaterialQuantity(materialQuantityLevelsRef.current[factory.grade - 1] ?? 1)
          const bufferCapacity = getFaBufferCapacity(faBufferLevelRef.current)

          const getNeededGrade = (buf: { grade: number; count: number }[]): number | null => {
            for (const req of recipe) {
              const have = buf.find(b => b.grade === req.grade)?.count ?? 0
              if (have < req.count * outputQuantity) return req.grade
            }
            return null
          }
          const isRecipeComplete = (buf: { grade: number; count: number }[]): boolean =>
            recipe.every(req => (buf.find(b => b.grade === req.grade)?.count ?? 0) >= req.count * outputQuantity)

          // GRAB 채널
          {
            const fas = faStatesRef.current[key]
            const totalInBuffer = fas.buffer.reduce((s, b) => s + b.count, 0)
            if (fas.grabState === 'IDLE' && totalInBuffer < bufferCapacity) {
              const neededGrade = getNeededGrade(fas.buffer)
              if (neededGrade !== null) {
                const idx = items.findIndex(it => {
                  if (it.grade !== neededGrade) return false
                  if (it.pkGrades.length > 0) return false
                  return Math.sqrt((it.x - inputCenter.x) ** 2 + (it.y - inputCenter.y) ** 2) <= cellSize * 0.3
                })
                if (idx !== -1) {
                  const grabbed = items[idx]
                  items[idx] = items[items.length - 1]; items.pop()
                  faStatesRef.current[key] = { ...faStatesRef.current[key], grabState: 'GRABBING', grabTimer: 0, grabbed }
                }
              }
            } else if (fas.grabState === 'GRABBING') {
              const newTimer = fas.grabTimer + delta
              if (newTimer >= pickTime) {
                const grade = fas.grabbed!.grade
                const qty = fas.grabbed!.quantity
                const found = fas.buffer.some(b => b.grade === grade)
                const newBuffer = found
                  ? fas.buffer.map(b => b.grade === grade ? { ...b, count: b.count + qty } : b)
                  : [...fas.buffer, { grade, count: qty }]
                faStatesRef.current[key] = { ...faStatesRef.current[key], grabState: 'IDLE', grabTimer: 0, grabbed: null, buffer: newBuffer }
              } else {
                faStatesRef.current[key] = { ...faStatesRef.current[key], grabTimer: newTimer }
              }
            }
          }

          // PROCESS 채널
          {
            const fas = faStatesRef.current[key]
            if (fas.processState === 'IDLE') {
              if (isRecipeComplete(fas.buffer)) {
                const newBuffer = fas.buffer.map(b => {
                  const req = recipe.find(r => r.grade === b.grade)
                  return req ? { ...b, count: b.count - req.count * outputQuantity } : b
                }).filter(b => b.count > 0)
                // 출력 아이템은 처리 시작 시점의 팩토리/동물 스탯으로 확정
                const base = createRecipeOutput(
                  factory.grade, factory, animalsRef.current,
                  itemValueLevelsRef.current[factory.grade - 1] ?? 1,
                  materialQuantityLevelsRef.current[factory.grade - 1] ?? 1,
                )
                const snappedOutputItem = { ...base, id: crypto.randomUUID() }
                faStatesRef.current[key] = { ...faStatesRef.current[key], processState: 'PROCESSING', processTimer: 0, snappedOutputItem, buffer: newBuffer }
              }
            } else if (fas.processState === 'PROCESSING') {
              const processTime = getFactoryProcessTime(factory.level, outputQuantity)
              const newTimer = fas.processTimer + delta
              if (newTimer >= processTime) {
                onFactoryProcessRef.current?.(factory.animalId ?? null)
                faStatesRef.current[key] = { ...faStatesRef.current[key], processState: 'PLACING', processTimer: 0, outputItem: fas.snappedOutputItem, snappedOutputItem: null }
              } else {
                faStatesRef.current[key] = { ...faStatesRef.current[key], processTimer: newTimer }
              }
            } else if (fas.processState === 'PLACING') {
              const newTimer = fas.processTimer + delta
              if (newTimer >= pickTime) {
                if (!isOutputOccupied()) placeOutput()
                else faStatesRef.current[key] = { ...faStatesRef.current[key], processState: 'WAITING', processTimer: 0 }
              } else {
                faStatesRef.current[key] = { ...faStatesRef.current[key], processTimer: newTimer }
              }
            } else if (fas.processState === 'WAITING') {
              if (!isOutputOccupied()) placeOutput()
            }
          }
        }
      })

      // 클릭커 스폰 → RS 버퍼 큐에 추가
      while (pendingClickerSpawnsRef.current > 0) {
        pendingClickerSpawnsRef.current -= 1
        let rsRow = -1, rsCol = -1
        for (let r = 0; r < board.length; r++) {
          for (let c = 0; c < board[r].length; c++) {
            if (board[r][c].type === 'RS') { rsRow = r; rsCol = c; break }
          }
          if (rsRow !== -1) break
        }
        if (rsRow === -1) break

        const rsKey = `rs-${rsRow}-${rsCol}`
        if (!rsQueuesRef.current[rsKey]) rsQueuesRef.current[rsKey] = []
        const capacity = getRsBufferCapacity(rsBufferLevelRef.current)
        if (rsQueuesRef.current[rsKey].length >= capacity) break

        const center = getCellCenter(rsRow, rsCol, cellSize)
        const dir = getCellDirection('RS')
        const next = getNextTarget(board, cellSize, center.x, center.y)
        if (!next) break

        const grade = pendingClickerGradeRef.current
        rsQueuesRef.current[rsKey].push({
          id: crypto.randomUUID(),
          x: center.x, y: center.y,
          dx: dir.dx, dy: dir.dy,
          targetX: next.targetX, targetY: next.targetY,
          grade,
          value: getProducerValue(grade, itemValueLevelsRef.current[grade - 1] ?? 1),
          quantity: getMaterialQuantity(materialQuantityLevelsRef.current[grade - 1] ?? 1),
          waBonus: 0, paBonus: 0, pkBonus: 0,
          waGrades: [], paGrades: [], pkGrades: [],
        })
      }

      // RE 도달 → 골드 획득
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i]
        const col = Math.round(item.x / cellSize - 0.5)
        const row = Math.round(item.y / cellSize - 0.5)
        const cell = getCell(board, row, col)
        if (cell?.type !== 'RE') continue
        const center = getCellCenter(row, col, cellSize)
        const dist = Math.sqrt((item.x - center.x) ** 2 + (item.y - center.y) ** 2)
        if (dist > cellSize * 0.3) continue
        onGoldEarnedRef.current(getFinalGold(item))
        items.splice(i, 1)
      }

      itemsRef.current = items
    }

    let tickId: ReturnType<typeof setInterval> | null = null
    let renderInterval: ReturnType<typeof setInterval> | null = null
    let progressIntervalId: ReturnType<typeof setInterval> | null = null

    const startIntervals = () => {
      lastTimeRef.current = 0
      tickId = setInterval(tick, 33)
      renderInterval = setInterval(() => {
        setRenderItems([...itemsRef.current])
      }, 100)
      progressIntervalId = setInterval(runProgress, 100)
    }

    const stopIntervals = () => {
      if (tickId) { clearInterval(tickId); tickId = null }
      if (renderInterval) { clearInterval(renderInterval); renderInterval = null }
      if (progressIntervalId) { clearInterval(progressIntervalId); progressIntervalId = null }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) stopIntervals()
      else startIntervals()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const runProgress = () => {
      const p: Progresses = {}
      const fp: FAPhases = {}
      board.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          if (cell.type !== 'PR') return
          const key = `${rowIdx}-${colIdx}`
          const producer = producersByPosRef.current.get(key)
          if (!producer?.built || producer.level === 0) return
          const timer = produceTimersRef.current[key] ?? 0
          const qty = getMaterialQuantity(materialQuantityLevelsRef.current[producer.grade - 1] ?? 1)
          p[key] = Math.min(timer / (getProducerInterval(producer.level) * qty), 1)
        })
      })
      factoriesRef.current.forEach(factory => {
        if (!factory.built) return
        const key = `fa-${factory.row}-${factory.col}`
        const fas = faStatesRef.current[key]
        if (!fas) return
        const cellKey = `${factory.row}-${factory.col}`
        fp[cellKey] = fas.processState !== 'IDLE' ? fas.processState : fas.grabState
        if (fas.processState === 'PROCESSING') {
          const qty = getMaterialQuantity(materialQuantityLevelsRef.current[factory.grade - 1] ?? 1)
          const processTime = getFactoryProcessTime(factory.level, qty)
          p[cellKey] = Math.min(fas.processTimer / processTime, 1)
        } else if (fas.processState === 'WAITING') {
          p[cellKey] = 1
        }
      })
      const bc: Record<string, { count: number; capacity: number }> = {}
      const rsCapacity = getRsBufferCapacity(rsBufferLevelRef.current)
      board.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          if (cell.type !== 'RS') return
          const rsKey = `rs-${rowIdx}-${colIdx}`
          const count = rsQueuesRef.current[rsKey]?.length ?? 0
          bc[`${rowIdx}-${colIdx}`] = { count, capacity: rsCapacity }
        })
      })
      const faCapacity = getFaBufferCapacity(faBufferLevelRef.current)
      factoriesRef.current.forEach(factory => {
        if (!factory.built) return
        const fas = faStatesRef.current[`fa-${factory.row}-${factory.col}`]
        if (!fas) return
        const cellKey = `${factory.row}-${factory.col}`
        if (factory.type === 'PA') {
          const count = fas.buffer.reduce((s, b) => s + b.count, 0)
          bc[cellKey] = { count, capacity: faCapacity }
        } else {
          const count = (fas.pendingQueue ?? []).reduce((s, it) => s + it.quantity, 0)
          bc[cellKey] = { count, capacity: faCapacity }
        }
      })
      setBufferCounts(bc)
      setProgresses(p)
      setFaPhases(fp)

      if (onFaLiveStateChangeRef.current) {
        const live: FALiveStates = {}
        factoriesRef.current.forEach(factory => {
          if (!factory.built) return
          const fas = faStatesRef.current[`fa-${factory.row}-${factory.col}`]
          if (!fas) return
          const cellKey = `${factory.row}-${factory.col}`
          const capacity = getFaBufferCapacity(faBufferLevelRef.current)
          const inputBuffer = factory.type === 'PA'
            ? fas.buffer.reduce((s, b) => s + b.count, 0)
            : (fas.pendingQueue ?? []).reduce((s, it) => s + it.quantity, 0)
          const inputItems: { grade: number; quantity: number }[] = factory.type === 'PA'
            ? fas.buffer.map(b => ({ grade: b.grade, quantity: b.count }))
            : Object.values(
                (fas.pendingQueue ?? []).reduce<Record<number, { grade: number; quantity: number }>>((acc, it) => {
                  if (acc[it.grade]) acc[it.grade].quantity += it.quantity
                  else acc[it.grade] = { grade: it.grade, quantity: it.quantity }
                  return acc
                }, {})
              )
          const qty = getMaterialQuantity(materialQuantityLevelsRef.current[factory.grade - 1] ?? 1)
          const processTime = getFactoryProcessTime(factory.level, qty)
          // PA: 처리 완료 시 생성될 예상 출력 미리보기
          const previewOutput = factory.type === 'PA'
            ? createRecipeOutput(
                factory.grade, factory, animalsRef.current,
                itemValueLevelsRef.current[factory.grade - 1] ?? 1,
                materialQuantityLevelsRef.current[factory.grade - 1] ?? 1,
              )
            : null
          live[cellKey] = {
            grabState: fas.grabState,
            processState: fas.processState,
            inputBuffer,
            inputCapacity: capacity,
            inputItems,
            hasOutputItem: fas.outputItem !== null,
            outputItem: fas.outputItem ?? fas.snappedOutputItem ?? previewOutput,
            processingItem: factory.type !== 'PA' ? (fas.processing ?? null) : null,
            processProgress: fas.processState === 'PROCESSING' ? Math.min(fas.processTimer / processTime, 1) : 0,
          }
        })
        onFaLiveStateChangeRef.current(live)
      }
    }

    startIntervals()

    return () => {
      stopIntervals()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [board, cellSize])

  const spawnClickerItem = useCallback((grade: number) => {
    pendingClickerGradeRef.current = grade
    pendingClickerSpawnsRef.current += 1
  }, [])

  return { items: renderItems, progresses, faPhases, bufferCounts, spawnClickerItem, faStatesRef, itemsRef }
}
