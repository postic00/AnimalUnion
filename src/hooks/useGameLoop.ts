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

export interface FAState {
  grabState: 'IDLE' | 'GRABBING'
  grabTimer: number
  grabbed: Item | null            // grab 채널: 집는 중인 아이템

  processState: 'IDLE' | 'PROCESSING' | 'PLACING' | 'WAITING'
  processTimer: number
  pendingProcess: Item | null     // grab 완료 → process 픽업 대기 (WA/PK)
  processing: Item | null         // process 채널: 처리 중인 아이템 (WA/PK)
  outputItem: Item | null         // 출력 대기 아이템

  buffer: { grade: number; count: number }[]  // PA: 수집된 재료
}

const DEFAULT_FA_STATE: FAState = {
  grabState: 'IDLE', grabTimer: 0, grabbed: null,
  processState: 'IDLE', processTimer: 0, pendingProcess: null, processing: null, outputItem: null,
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
  onFactoryProcess?: (animalId: string | null) => void,
  speedMultiplier?: number,
  initialItems?: Item[],
  initialFaStates?: Record<string, FAState>,
) {
  const [renderItems, setRenderItems] = useState<Item[]>(initialItems ?? [])
  const [progresses, setProgresses] = useState<Progresses>({})
  const [faPhases, setFaPhases] = useState<FAPhases>({})
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
  producersRef.current = producers
  const factoriesRef = useRef(factories)
  factoriesRef.current = factories
  const animalsRef = useRef(animals)
  animalsRef.current = animals
  const faStatesRef = useRef<Record<string, FAState>>({})
  const pendingClickerSpawnsRef = useRef(0)
  const pendingClickerGradeRef = useRef<number>(1)
  const materialQuantityLevelsRef = useRef(materialQuantityLevels)
  materialQuantityLevelsRef.current = materialQuantityLevels
  const itemValueLevelsRef = useRef(itemValueLevels)
  itemValueLevelsRef.current = itemValueLevels
  const faBufferLevelRef = useRef(faBufferLevel)
  faBufferLevelRef.current = faBufferLevel
  const rsBufferLevelRef = useRef(rsBufferLevel)
  rsBufferLevelRef.current = rsBufferLevel

  useEffect(() => {
    if (cellSize === 0) return

    // 보드 변경 시 전체 리셋
    itemsRef.current = initialItems ?? []
    setRenderItems(initialItems ?? [])
    faStatesRef.current = (initialFaStates as Record<string, FAState>) ?? {}
    produceTimersRef.current = {}
    rsQueuesRef.current = {}
    pendingClickerSpawnsRef.current = 0
    lastTimeRef.current = 0

    const itemSize = cellSize * CONFIG.ITEM_GAP_RATIO
    const pixelsPerMs = cellSize / CONFIG.MOVE_SPEED
    const pickTime = getFactoryPickTime()

    let animId: number

    const tick = (time: number) => {
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

          const producer = producersRef.current.find(p => p.row === rowIdx && p.col === colIdx)
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
          items = [...items, item]
        })
      })

      // 아이템 이동
      const spatialHash = buildSpatialHash(items, itemSize)
      items = items.map(item => {
        if (isBlocked(item, spatialHash, itemSize)) return item

        const distToTarget = Math.sqrt(
          (item.targetX - item.x) ** 2 + (item.targetY - item.y) ** 2
        )
        const step = pixelsPerMs * delta

        if (step >= distToTarget) {
          const next = getNextTarget(board, cellSize, item.targetX, item.targetY)
          if (!next) return { ...item, x: item.targetX, y: item.targetY }
          return {
            ...item,
            x: item.targetX, y: item.targetY,
            dx: next.dx, dy: next.dy,
            targetX: next.targetX, targetY: next.targetY,
          }
        }

        const ratio = step / distToTarget
        return {
          ...item,
          x: item.x + (item.targetX - item.x) * ratio,
          y: item.y + (item.targetY - item.y) * ratio,
        }
      })

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
          items = [...items, placeOnBelt(faStatesRef.current[key].outputItem!, outputCenter, board, cellSize)]
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

          // GRAB 채널
          {
            const fas = faStatesRef.current[key]
            if (fas.grabState === 'IDLE' && fas.pendingProcess === null) {
              const idx = items.findIndex(isTargetItem)
              if (idx !== -1) {
                const grabbed = items[idx]
                items = items.filter((_, i) => i !== idx)
                faStatesRef.current[key] = { ...faStatesRef.current[key], grabState: 'GRABBING', grabTimer: 0, grabbed }
              }
            } else if (fas.grabState === 'GRABBING') {
              const newTimer = fas.grabTimer + delta
              if (newTimer >= pickTime) {
                const pending = applyBonus(fas.grabbed!)
                faStatesRef.current[key] = { ...faStatesRef.current[key], grabState: 'IDLE', grabTimer: 0, grabbed: null, pendingProcess: pending }
              } else {
                faStatesRef.current[key] = { ...faStatesRef.current[key], grabTimer: newTimer }
              }
            }
          }

          // PROCESS 채널
          {
            const fas = faStatesRef.current[key]
            if (fas.processState === 'IDLE') {
              if (fas.pendingProcess !== null) {
                faStatesRef.current[key] = { ...faStatesRef.current[key], processState: 'PROCESSING', processTimer: 0, processing: fas.pendingProcess, pendingProcess: null }
              }
            } else if (fas.processState === 'PROCESSING') {
              const processTime = getFactoryProcessTime(factory.level, fas.processing!.quantity)
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
                  items = items.filter((_, i) => i !== idx)
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
                // 레시피 소모 후 다음 배치 grab 병렬 진행 가능
                const newBuffer = fas.buffer.map(b => {
                  const req = recipe.find(r => r.grade === b.grade)
                  return req ? { ...b, count: b.count - req.count * outputQuantity } : b
                }).filter(b => b.count > 0)
                faStatesRef.current[key] = { ...faStatesRef.current[key], processState: 'PROCESSING', processTimer: 0, buffer: newBuffer }
              }
            } else if (fas.processState === 'PROCESSING') {
              const processTime = getFactoryProcessTime(factory.level, outputQuantity)
              const newTimer = fas.processTimer + delta
              if (newTimer >= processTime) {
                const base = createRecipeOutput(
                  factory.grade, factory, animalsRef.current,
                  itemValueLevelsRef.current[factory.grade - 1] ?? 1,
                  materialQuantityLevelsRef.current[factory.grade - 1] ?? 1,
                )
                const outputItem = { ...base, id: crypto.randomUUID() }
                onFactoryProcessRef.current?.(factory.animalId ?? null)
                faStatesRef.current[key] = { ...faStatesRef.current[key], processState: 'PLACING', processTimer: 0, outputItem }
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

      // 클릭커 스폰
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
        const center = getCellCenter(rsRow, rsCol, cellSize)
        const rsOccupied = items.some(it =>
          Math.sqrt((it.x - center.x) ** 2 + (it.y - center.y) ** 2) < itemSize
        )
        if (rsOccupied) break
        const dir = getCellDirection('RS')
        const next = getNextTarget(board, cellSize, center.x, center.y)
        if (!next) break
        const grade = pendingClickerGradeRef.current
        items = [...items, {
          id: crypto.randomUUID(),
          x: center.x, y: center.y,
          dx: dir.dx, dy: dir.dy,
          targetX: next.targetX, targetY: next.targetY,
          grade,
          value: getProducerValue(grade, itemValueLevelsRef.current[grade - 1] ?? 1),
          quantity: getMaterialQuantity(materialQuantityLevelsRef.current[grade - 1] ?? 1),
          waBonus: 0, paBonus: 0, pkBonus: 0,
          waGrades: [], paGrades: [], pkGrades: [],
        }]
      }

      // RE 도달 → 골드 획득
      items = items.filter(item => {
        const col = Math.round(item.x / cellSize - 0.5)
        const row = Math.round(item.y / cellSize - 0.5)
        const cell = getCell(board, row, col)
        if (cell?.type !== 'RE') return true
        const center = getCellCenter(row, col, cellSize)
        const dist = Math.sqrt((item.x - center.x) ** 2 + (item.y - center.y) ** 2)
        if (dist > cellSize * 0.3) return true
        onGoldEarnedRef.current(getFinalGold(item))
        return false
      })

      itemsRef.current = items
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)

    const renderInterval = setInterval(() => {
      setRenderItems([...itemsRef.current])
    }, 100)

    const progressInterval = setInterval(() => {
      const p: Progresses = {}
      const fp: FAPhases = {}
      board.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          if (cell.type !== 'PR') return
          const producer = producersRef.current.find(pr => pr.row === rowIdx && pr.col === colIdx)
          if (!producer?.built || producer.level === 0) return
          const key = `${rowIdx}-${colIdx}`
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
          const qty = factory.type === 'PA'
            ? getMaterialQuantity(materialQuantityLevelsRef.current[factory.grade - 1] ?? 1)
            : fas.processing?.quantity ?? getMaterialQuantity(1)
          const processTime = getFactoryProcessTime(factory.level, qty)
          p[cellKey] = Math.min(fas.processTimer / processTime, 1)
        } else if (fas.processState === 'WAITING') {
          p[cellKey] = 1
        }
      })
      setProgresses(p)
      setFaPhases(fp)
    }, 100)

    return () => {
      cancelAnimationFrame(animId)
      clearInterval(renderInterval)
      clearInterval(progressInterval)
    }
  }, [board, cellSize])

  const spawnClickerItem = useCallback((grade: number) => {
    pendingClickerGradeRef.current = grade
    pendingClickerSpawnsRef.current += 1
  }, [])

  return { items: renderItems, progresses, faPhases, spawnClickerItem, faStatesRef, itemsRef }
}
