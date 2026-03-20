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
  grabState: 'IDLE' | 'GRABBING' | 'WAITING'
  processState: 'IDLE' | 'PROCESSING' | 'WAITING'
  outputState: 'IDLE' | 'PLACING' | 'WAITING'
  inputBuffer: number
  inputCapacity: number
  inputItems: { grade: number; quantity: number }[]
  processingItems: { grade: number; quantity: number }[]
  procCapacity: number
  outputItem: Item | null
  outputCount: number
  outputCapacity: number
  processingItem: Item | null
  processProgress: number
}
export type FALiveStates = Record<string, FALiveState>

export interface FAState {
  grabState: 'IDLE' | 'GRABBING' | 'WAITING'
  grabTimer: number
  grabbed: Item | null

  processState: 'IDLE' | 'PROCESSING' | 'WAITING'
  processTimer: number
  inputBuffer: Item[]          // WA/PK: was pendingQueue
  processBuffer: Item | null   // WA/PK: was processing / PA: was snappedOutputItem

  outputState: 'IDLE' | 'PLACING' | 'WAITING'
  outputTimer: number
  outputBuffer: Item[]         // was Item | null

  buffer: { grade: number; count: number; waBonus: number }[]           // PA: 수집 저장소
  processingBuffer: { grade: number; count: number; waBonus: number }[]  // PA: 처리 저장소
}

const DEFAULT_FA_STATE: FAState = {
  grabState: 'IDLE', grabTimer: 0, grabbed: null,
  processState: 'IDLE', processTimer: 0, inputBuffer: [], processBuffer: null,
  outputState: 'IDLE', outputTimer: 0, outputBuffer: [],
  buffer: [], processingBuffer: [],
}

export interface PRState {
  outputBuffer: Item[]
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
  initialItems?: Item[],
  initialFaStates?: Record<string, FAState>,
  initialRsQueues?: Record<string, Item[]>,
  initialProduceTimers?: Record<string, number>,
  initialPrStates?: Record<string, PRState>,
  onFaLiveStateChange?: (states: FALiveStates) => void,
  onProducerProgressChange?: (progresses: Record<string, number>) => void,
) {
  const [renderItems, setRenderItems] = useState<Item[]>(initialItems ?? [])
  const [progresses, setProgresses] = useState<Progresses>({})
  const [faPhases, setFaPhases] = useState<FAPhases>({})
  const [bufferCounts, setBufferCounts] = useState<Record<string, { count: number; capacity: number }>>({})
  const [hasDerailed, setHasDerailed] = useState(false)
  const hasDerailedRef = useRef(false)
  const itemsRef = useRef<Item[]>(initialItems ?? [])
  const lastTimeRef = useRef<number>(0)
  const produceTimersRef = useRef<Record<string, number>>({})
  const rsQueuesRef = useRef<Record<string, Item[]>>({})  // RS 버퍼 큐
  const prStatesRef = useRef<Record<string, PRState>>({})  // PR 출고 버퍼
  const prRoundRobinRef = useRef<Record<string, number>>({})  // RS별 round-robin 인덱스
  const onGoldEarnedRef = useRef(onGoldEarned)
  onGoldEarnedRef.current = onGoldEarned
  const onFactoryProcessRef = useRef(onFactoryProcess)
  onFactoryProcessRef.current = onFactoryProcess
  const speedMultiplierRef = useRef(speedMultiplier ?? 1)
  speedMultiplierRef.current = speedMultiplier ?? 1
  const producersRef = useRef(producers)
  const producersByPosRef = useRef(new Map(producers.map(p => [`${p.row}-${p.col}`, p])))
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
  const onProducerProgressChangeRef = useRef(onProducerProgressChange)
  onProducerProgressChangeRef.current = onProducerProgressChange
  const lastGoldTimeRef = useRef(Date.now())
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
      rsQueuesRef.current = (initialRsQueues as Record<string, Item[]>) ?? {}
      produceTimersRef.current = initialProduceTimers ?? {}
      prStatesRef.current = (initialPrStates as Record<string, PRState>) ?? {}
      pendingClickerSpawnsRef.current = 0
    }
    lastTimeRef.current = 0

    const itemSize = cellSize * CONFIG.CM_GAP_RATIO
    const pickTime = getFactoryPickTime()

    // RS별 연결된 PR 목록 매핑 (board 변경 시 재계산)
    const rsToPrs = new Map<string, { row: number; col: number }[]>()
    board.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell.type !== 'PR') return
        let rsRow = -1, rsCol = -1
        for (let r = rowIdx + 1; r < board.length; r++) {
          for (let c = 0; c < board[r].length; c++) {
            if (board[r][c].type === 'RS') { rsRow = r; rsCol = c; break }
          }
          if (rsRow !== -1) break
        }
        if (rsRow === -1) return
        const rsKey = `rs-${rsRow}-${rsCol}`
        if (!rsToPrs.has(rsKey)) rsToPrs.set(rsKey, [])
        rsToPrs.get(rsKey)!.push({ row: rowIdx, col: colIdx })
      })
    })

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
            if (!prStatesRef.current[key]) prStatesRef.current[key] = { outputBuffer: [] }
            const prBuf = prStatesRef.current[key].outputBuffer
            const capacity = getRsBufferCapacity(rsBufferLevelRef.current)
            if (prBuf.length >= capacity) return

            produceTimersRef.current[key] = 0

            const newItem: Item = {
              id: crypto.randomUUID(),
              x: 0, y: 0,
              dx: 0, dy: 0,
              targetX: 0, targetY: 0,
              grade,
              value: getProducerValue(grade, itemValueLevelsRef.current[grade - 1] ?? 1),
              quantity,
              waBonus: 0, paBonus: 0, pkBonus: 0,
              waGrades: [], paGrades: [], pkGrades: [],
            }
            prBuf.push(newItem)
          }
        })
      })

      // PR 출고 버퍼 → RS 큐 (round-robin)
      board.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          if (cell.type !== 'RS') return
          const rsKey = `rs-${rowIdx}-${colIdx}`
          if (!rsQueuesRef.current[rsKey]) rsQueuesRef.current[rsKey] = []
          const capacity = getRsBufferCapacity(rsBufferLevelRef.current)
          if (rsQueuesRef.current[rsKey].length >= capacity) return

          const prs = rsToPrs.get(rsKey)
          if (!prs || prs.length === 0) return

          const rrIdx = prRoundRobinRef.current[rsKey] ?? 0
          for (let attempt = 0; attempt < prs.length; attempt++) {
            const prIdx = (rrIdx + attempt) % prs.length
            const pr = prs[prIdx]
            const prKey = `${pr.row}-${pr.col}`
            const prState = prStatesRef.current[prKey]
            if (prState?.outputBuffer.length > 0) {
              const center = getCellCenter(rowIdx, colIdx, cellSize)
              const dir = getCellDirection('RS')
              const next = getNextTarget(board, cellSize, center.x, center.y)
              if (!next) continue
              const proto = prState.outputBuffer.shift()!
              const item: Item = {
                ...proto,
                x: center.x, y: center.y,
                dx: dir.dx, dy: dir.dy,
                targetX: next.targetX, targetY: next.targetY,
              }
              rsQueuesRef.current[rsKey].push(item)
              prRoundRobinRef.current[rsKey] = (prIdx + 1) % prs.length
              break
            }
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
      for (let i = items.length - 1; i >= 0; i--) {
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
          } else {
            // 다음 목적지 없음 → RE가 아니면 즉시 제거 (탈선 복구)
            const fcol = Math.round(item.targetX / cellSize - 0.5)
            const frow = Math.round(item.targetY / cellSize - 0.5)
            const fcell = getCell(board, frow, fcol)
            if (fcell?.type !== 'RE' && fcell?.type !== 'FA') {
              items.splice(i, 1)
              hasDerailedRef.current = true
            }
          }
        } else {
          const ratio = step / distToTarget
          item.x += dx * ratio
          item.y += dy * ratio
        }
      }

      tickCount++
      // 탈선 방어: 매 틱마다 유효하지 않은 셀에 있는 아이템 제거
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i]
        if (!isFinite(item.x) || !isFinite(item.y)) { items.splice(i, 1); hasDerailedRef.current = true; continue }
        const col = Math.round(item.x / cellSize - 0.5)
        const row = Math.round(item.y / cellSize - 0.5)
        const cell = getCell(board, row, col)
        if (!cell) { items.splice(i, 1); hasDerailedRef.current = true; continue }
        const type = cell.type
        if (!(type === 'RLN' || type === 'RRN' || type === 'RUN' || type === 'RDN'
          || type === 'RS' || type === 'RE' || type === 'FA'
          || type === 'RDR' || type === 'RLR' || type === 'RDL' || type === 'RRL')) {
          items.splice(i, 1)
          hasDerailedRef.current = true
        }
      }

      // FA 처리
      factoriesRef.current.forEach(factory => {
        if (!factory.built || factory.level < 1) return

        const key = `fa-${factory.row}-${factory.col}`
        if (!faStatesRef.current[key] || !('outputState' in faStatesRef.current[key])) {
          faStatesRef.current[key] = { ...DEFAULT_FA_STATE }
        } else if (!Array.isArray(faStatesRef.current[key].outputBuffer)) {
          const old = faStatesRef.current[key].outputBuffer as unknown as Item | null
          faStatesRef.current[key] = { ...faStatesRef.current[key], outputBuffer: old ? [old] : [] }
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
          const fas = faStatesRef.current[key]
          if (!Array.isArray(fas.outputBuffer) || fas.outputBuffer.length === 0 || !fas.outputBuffer[0]) return
          const capacity = getFaBufferCapacity(faBufferLevelRef.current)
          const newOutputBuffer = fas.outputBuffer.slice(1)
          items.push(placeOnBelt(fas.outputBuffer[0], outputCenter, board, cellSize))
          let nextOutputBuffer = newOutputBuffer
          let nextOutputState: FAState['outputState'] = newOutputBuffer.length > 0 ? 'PLACING' : 'IDLE'
          let nextOutputTimer = 0
          let nextProcessState = fas.processState
          let nextProcessBuffer = fas.processBuffer
          if (fas.processState === 'WAITING' && fas.processBuffer !== null && newOutputBuffer.length < capacity) {
            nextOutputBuffer = [...newOutputBuffer, fas.processBuffer]
            if (nextOutputState === 'IDLE') nextOutputState = 'PLACING'
            nextOutputTimer = 0
            nextProcessState = 'IDLE'
            nextProcessBuffer = null
          }
          faStatesRef.current[key] = { ...fas, outputState: nextOutputState, outputTimer: nextOutputTimer, outputBuffer: nextOutputBuffer, processState: nextProcessState, processBuffer: nextProcessBuffer }
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

          // GRAB 채널
          {
            const fas = faStatesRef.current[key]
            const inputQty = (fas.inputBuffer ?? []).reduce((s, it) => s + it.quantity, 0)
            if (fas.grabState === 'IDLE') {
              if (inputQty < bufferCapacity) {
                const idx = items.findIndex(isTargetItem)
                if (idx !== -1) {
                  const grabbed = items[idx]
                  items[idx] = items[items.length - 1]; items.pop()
                  faStatesRef.current[key] = { ...fas, grabState: 'GRABBING', grabTimer: 0, grabbed }
                }
              } else {
                faStatesRef.current[key] = { ...fas, grabState: 'WAITING' }
              }
            } else if (fas.grabState === 'WAITING') {
              if (inputQty < bufferCapacity) faStatesRef.current[key] = { ...fas, grabState: 'IDLE' }
            } else if (fas.grabState === 'GRABBING') {
              const newTimer = fas.grabTimer + delta
              if (newTimer >= pickTime) {
                const pending = applyBonus(fas.grabbed!)
                faStatesRef.current[key] = { ...fas, grabState: 'IDLE', grabTimer: 0, grabbed: null, inputBuffer: [...(fas.inputBuffer ?? []), pending] }
              } else {
                faStatesRef.current[key] = { ...fas, grabTimer: newTimer }
              }
            }
          }

          // PROCESS 채널
          {
            const fas = faStatesRef.current[key]
            const queue = fas.inputBuffer ?? []
            if (fas.processState === 'IDLE') {
              if (queue.length > 0) {
                const [next, ...rest] = queue
                faStatesRef.current[key] = { ...fas, processState: 'PROCESSING', processTimer: 0, processBuffer: next, inputBuffer: rest }
              }
            } else if (fas.processState === 'PROCESSING') {
              const outputQty = getMaterialQuantity(materialQuantityLevelsRef.current[factory.grade - 1] ?? 1)
              const processTime = getFactoryProcessTime(factory.level, outputQty)
              const newTimer = fas.processTimer + delta
              if (newTimer >= processTime) {
                onFactoryProcessRef.current?.(factory.animalId ?? null)
                const safeOutBuf = Array.isArray(fas.outputBuffer) ? fas.outputBuffer : []
                if (safeOutBuf.length < bufferCapacity) {
                  const newOutputBuffer = [...safeOutBuf, fas.processBuffer!]
                  const newOutputState = fas.outputState === 'IDLE' ? 'PLACING' : fas.outputState
                  faStatesRef.current[key] = { ...fas, processState: 'IDLE', processTimer: 0, outputState: newOutputState, outputTimer: fas.outputState === 'IDLE' ? 0 : fas.outputTimer, outputBuffer: newOutputBuffer, processBuffer: null }
                } else {
                  faStatesRef.current[key] = { ...fas, processState: 'WAITING', processTimer: 0 }
                }
              } else {
                faStatesRef.current[key] = { ...fas, processTimer: newTimer }
              }
            }
            // WAITING → placeOutput에서 처리
          }

          // OUTPUT 채널
          {
            const fas = faStatesRef.current[key]
            if (fas.outputState === 'PLACING') {
              const newTimer = fas.outputTimer + delta
              if (newTimer >= pickTime) {
                if (!isOutputOccupied()) placeOutput()
                else faStatesRef.current[key] = { ...fas, outputState: 'WAITING', outputTimer: 0 }
              } else {
                faStatesRef.current[key] = { ...fas, outputTimer: newTimer }
              }
            } else if (fas.outputState === 'WAITING') {
              if (!isOutputOccupied()) placeOutput()
            }
          }

        } else {
          // PA: 레시피 기반 조합
          const recipe = RECIPES[factory.grade]
          if (!recipe) return

          const outputQuantity = getMaterialQuantity(materialQuantityLevelsRef.current[factory.grade - 1] ?? 1)
          const bufferCapacity = getFaBufferCapacity(faBufferLevelRef.current)

          // 재료별 독립 용량: 각 grade마다 bufferCapacity개씩
          const getNeededGrade = (buf: { grade: number; count: number }[]): number | null => {
            for (const req of recipe) {
              const have = buf.find(b => b.grade === req.grade)?.count ?? 0
              if (have < bufferCapacity) return req.grade
            }
            return null
          }

          // GRAB 채널
          {
            const fas = faStatesRef.current[key]
            if (fas.grabState === 'IDLE') {
              const recipeGrades = new Set(recipe.map(r => r.grade))
              const ejectFromBuffer = fas.buffer.find(b => !recipeGrades.has(b.grade))
              const ejectFromProc = (fas.processingBuffer ?? []).find(b => !recipeGrades.has(b.grade))
              const ejectEntry = ejectFromBuffer ?? ejectFromProc
              if (ejectEntry && !isOutputOccupied()) {
                const ejectItem: Item = {
                  id: crypto.randomUUID(), grade: ejectEntry.grade, quantity: ejectEntry.count, value: 0,
                  x: outputCenter.x, y: outputCenter.y,
                  waBonus: ejectEntry.waBonus ?? 0, paBonus: 0, pkBonus: 0,
                  waGrades: [], paGrades: [], pkGrades: [],
                  dx: 0, dy: 0, targetX: outputCenter.x, targetY: outputCenter.y,
                }
                items.push(placeOnBelt(ejectItem, outputCenter, board, cellSize))
                if (ejectFromBuffer) {
                  faStatesRef.current[key] = { ...fas, buffer: fas.buffer.filter(b => b.grade !== ejectEntry.grade) }
                } else {
                  faStatesRef.current[key] = { ...fas, processingBuffer: (fas.processingBuffer ?? []).filter(b => b.grade !== ejectEntry.grade) }
                }
              } else {
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
                    faStatesRef.current[key] = { ...fas, grabState: 'GRABBING', grabTimer: 0, grabbed }
                  }
                } else {
                  faStatesRef.current[key] = { ...fas, grabState: 'WAITING' }
                }
              }
            } else if (fas.grabState === 'WAITING') {
              const neededGrade = getNeededGrade(fas.buffer)
              if (neededGrade !== null) faStatesRef.current[key] = { ...fas, grabState: 'IDLE' }
            } else if (fas.grabState === 'GRABBING') {
              const newTimer = fas.grabTimer + delta
              if (newTimer >= pickTime) {
                const grade = fas.grabbed!.grade
                const qty = fas.grabbed!.quantity
                const grabbedWaBonus = fas.grabbed!.waBonus
                const existingEntry = fas.buffer.find(b => b.grade === grade)
                const newBuffer = existingEntry
                  ? fas.buffer.map(b => b.grade === grade
                      ? { ...b, count: b.count + qty, waBonus: (b.waBonus * b.count + grabbedWaBonus * qty) / (b.count + qty) }
                      : b)
                  : [...fas.buffer, { grade, count: qty, waBonus: grabbedWaBonus }]
                faStatesRef.current[key] = { ...fas, grabState: 'IDLE', grabTimer: 0, grabbed: null, buffer: newBuffer }
              } else {
                faStatesRef.current[key] = { ...fas, grabTimer: newTimer }
              }
            }
          }

          // PROCESS 채널 (PA)
          {
            const fas = faStatesRef.current[key]
            if (fas.processState === 'IDLE') {
              const procBuf = fas.processingBuffer ?? []
              let newBuffer = [...fas.buffer]
              const newProcBuf = [...procBuf]
              let transferred = false
              for (const req of recipe) {
                const need = req.count * outputQuantity
                const have = newProcBuf.find(b => b.grade === req.grade)?.count ?? 0
                const remaining = need - have
                if (remaining <= 0) continue
                const bufEntry = newBuffer.find(b => b.grade === req.grade)
                const inBuffer = bufEntry?.count ?? 0
                if (inBuffer <= 0) continue
                const movedWaBonus = bufEntry?.waBonus ?? 0
                const move = Math.min(inBuffer, remaining)
                newBuffer = newBuffer.map(b => b.grade === req.grade ? { ...b, count: b.count - move } : b).filter(b => b.count > 0)
                const exists = newProcBuf.some(b => b.grade === req.grade)
                if (exists) {
                  newProcBuf.forEach(b => {
                    if (b.grade === req.grade) {
                      const totalCount = b.count + move
                      b.waBonus = (b.waBonus * b.count + movedWaBonus * move) / totalCount
                      b.count = totalCount
                    }
                  })
                } else {
                  newProcBuf.push({ grade: req.grade, count: move, waBonus: movedWaBonus })
                }
                transferred = true
              }
              const isReady = recipe.every(req =>
                (newProcBuf.find(b => b.grade === req.grade)?.count ?? 0) >= req.count * outputQuantity
              )
              if (isReady) {
                const totalProcCount = newProcBuf.reduce((s, b) => s + b.count, 0)
                const avgWaBonus = totalProcCount > 0
                  ? newProcBuf.reduce((s, b) => s + b.waBonus * b.count, 0) / totalProcCount
                  : 0
                const base = createRecipeOutput(
                  factory.grade, factory, animalsRef.current,
                  itemValueLevelsRef.current[factory.grade - 1] ?? 1,
                  materialQuantityLevelsRef.current[factory.grade - 1] ?? 1,
                )
                const processBuffer = { ...base, id: crypto.randomUUID(), waBonus: avgWaBonus }
                faStatesRef.current[key] = { ...fas, processState: 'PROCESSING', processTimer: 0, processBuffer, buffer: newBuffer, processingBuffer: [] }
              } else if (transferred) {
                faStatesRef.current[key] = { ...fas, buffer: newBuffer, processingBuffer: newProcBuf }
              }
            } else if (fas.processState === 'PROCESSING') {
              const processTime = getFactoryProcessTime(factory.level, outputQuantity)
              const newTimer = fas.processTimer + delta
              if (newTimer >= processTime) {
                onFactoryProcessRef.current?.(factory.animalId ?? null)
                const safeOutBuf = Array.isArray(fas.outputBuffer) ? fas.outputBuffer : []
                if (safeOutBuf.length < bufferCapacity) {
                  const newOutputBuffer = [...safeOutBuf, fas.processBuffer!]
                  const newOutputState = fas.outputState === 'IDLE' ? 'PLACING' : fas.outputState
                  faStatesRef.current[key] = { ...fas, processState: 'IDLE', processTimer: 0, outputState: newOutputState, outputTimer: fas.outputState === 'IDLE' ? 0 : fas.outputTimer, outputBuffer: newOutputBuffer, processBuffer: null }
                } else {
                  faStatesRef.current[key] = { ...fas, processState: 'WAITING', processTimer: 0 }
                }
              } else {
                faStatesRef.current[key] = { ...fas, processTimer: newTimer }
              }
            }
            // WAITING → placeOutput에서 처리
          }

          // OUTPUT 채널 (PA)
          {
            const fas = faStatesRef.current[key]
            if (fas.outputState === 'PLACING') {
              const newTimer = fas.outputTimer + delta
              if (newTimer >= pickTime) {
                if (!isOutputOccupied()) placeOutput()
                else faStatesRef.current[key] = { ...fas, outputState: 'WAITING', outputTimer: 0 }
              } else {
                faStatesRef.current[key] = { ...fas, outputTimer: newTimer }
              }
            } else if (fas.outputState === 'WAITING') {
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
        onGoldEarnedRef.current(getFinalGold(item), center.x, center.y)
        lastGoldTimeRef.current = Date.now()
        items.splice(i, 1)
      }

      itemsRef.current = items
    }

    let tickId: ReturnType<typeof setInterval> | null = null
    let renderInterval: ReturnType<typeof setInterval> | null = null
    let progressIntervalId: ReturnType<typeof setInterval> | null = null

    const startIntervals = () => {
      lastTimeRef.current = 0
      lastGoldTimeRef.current = Date.now()
      tickId = setInterval(tick, 33)
      renderInterval = setInterval(() => {
        setRenderItems([...itemsRef.current])
        // 잼 감지: 활성 생산자가 있고, 벨트에 아이템이 있는데 일정 시간 이상 골드가 안 들어오면
        const activePrs = producersRef.current.filter(p => p.built && p.level > 0)
        if (activePrs.length > 0 && itemsRef.current.length > 0) {
          const maxPrInterval = activePrs.reduce((max, p) => {
            const qty = getMaterialQuantity(materialQuantityLevelsRef.current[p.grade - 1] ?? 1)
            return Math.max(max, getProducerInterval(p.level) * qty)
          }, 0)
          const threshold = Math.max(60000, maxPrInterval * 2)
          if (Date.now() - lastGoldTimeRef.current > threshold) {
            hasDerailedRef.current = true
          }
        }
        if (hasDerailedRef.current) setHasDerailed(true)
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
        fp[cellKey] = fas.outputState !== 'IDLE' ? fas.outputState
                    : fas.processState !== 'IDLE' ? fas.processState
                    : fas.grabState
        if (fas.processState === 'PROCESSING') {
          const qty = getMaterialQuantity(materialQuantityLevelsRef.current[factory.grade - 1] ?? 1)
          const processTime = getFactoryProcessTime(factory.level, qty)
          p[cellKey] = Math.min(fas.processTimer / processTime, 1)
        } else if (fas.outputState !== 'IDLE' || fas.processState === 'WAITING') {
          p[cellKey] = 1
        }
      })
      const bc: Record<string, { count: number; capacity: number; procCount?: number; procCapacity?: number; bufferItems?: { grade: number; count: number }[]; procItems?: { grade: number; count: number }[]; outputGrade?: number }> = {}
      const rsCapacity = getRsBufferCapacity(rsBufferLevelRef.current)
      board.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          if (cell.type !== 'RS') return
          const rsKey = `rs-${rowIdx}-${colIdx}`
          const count = rsQueuesRef.current[rsKey]?.length ?? 0
          bc[`${rowIdx}-${colIdx}`] = { count, capacity: rsCapacity }
        })
      })
      board.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          if (cell.type !== 'PR') return
          const key = `${rowIdx}-${colIdx}`
          const producer = producersByPosRef.current.get(key)
          if (!producer?.built) return
          const prState = prStatesRef.current[key]
          const count = prState?.outputBuffer.length ?? 0
          bc[key] = { count, capacity: rsCapacity }
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
          const count = (fas.inputBuffer ?? []).reduce((s, it) => s + it.quantity, 0)
          bc[cellKey] = { count, capacity: faCapacity }
        }
      })
      setBufferCounts(bc)
      setProgresses(p)
      setFaPhases(fp)
      onProducerProgressChangeRef.current?.(p)

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
            : (fas.inputBuffer ?? []).reduce((s, it) => s + it.quantity, 0)
          const inputItems: { grade: number; quantity: number }[] = factory.type === 'PA'
            ? fas.buffer.map(b => ({ grade: b.grade, quantity: b.count }))
            : Object.values(
                (fas.inputBuffer ?? []).reduce<Record<number, { grade: number; quantity: number }>>((acc, it) => {
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
          const procItems: { grade: number; quantity: number }[] = factory.type === 'PA'
            ? (fas.processingBuffer ?? []).map(b => ({ grade: b.grade, quantity: b.count }))
            : fas.processBuffer ? [{ grade: fas.processBuffer.grade, quantity: fas.processBuffer.quantity }] : []
          const recipe3 = factory.type === 'PA' ? RECIPES[factory.grade] : null
          const procCap = recipe3 ? recipe3.reduce((s, r) => s + r.count * qty, 0) : 0
          live[cellKey] = {
            grabState: fas.grabState,
            processState: fas.processState,
            outputState: fas.outputState,
            inputBuffer,
            inputCapacity: capacity,
            inputItems,
            processingItems: procItems,
            procCapacity: procCap,
            outputItem: fas.outputBuffer[0] ?? fas.processBuffer ?? previewOutput,
            outputCount: fas.outputBuffer.length,
            outputCapacity: capacity,
            processingItem: factory.type !== 'PA' ? (fas.processBuffer ?? null) : null,
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

  useEffect(() => {
    lastGoldTimeRef.current = Date.now()
  }, [producers])

  const spawnClickerItem = useCallback((grade: number) => {
    pendingClickerGradeRef.current = grade
    pendingClickerSpawnsRef.current += 1
  }, [])

  const clearItems = useCallback(() => {
    itemsRef.current = []
    setRenderItems([])
    hasDerailedRef.current = false
    setHasDerailed(false)
    lastGoldTimeRef.current = Date.now()
  }, [])

  const dismissDerail = useCallback(() => {
    hasDerailedRef.current = false
    setHasDerailed(false)
    lastGoldTimeRef.current = Date.now()
  }, [])

  return { items: renderItems, progresses, faPhases, bufferCounts, spawnClickerItem, faStatesRef, itemsRef, rsQueuesRef, produceTimersRef, prStatesRef, hasDerailed, clearItems, dismissDerail }
}
