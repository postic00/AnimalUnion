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
} from '../utils/boardUtils'

let nextId = 0

export type FAPhase = 'IDLE' | 'GRABBING' | 'PROCESSING' | 'PLACING' | 'WAITING'
export type FAPhases = Record<string, FAPhase>

interface FAState {
  state: FAPhase
  timer: number
  grabbed: Item | null                        // WA: 처리 중인 아이템
  buffer: { grade: number; count: number }[]  // PA/PK: 수집된 재료
  outputItem: Item | null                     // 출력 대기 아이템
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
) {
  const [items, setItems] = useState<Item[]>([])
  const [progresses, setProgresses] = useState<Progresses>({})
  const [faPhases, setFaPhases] = useState<FAPhases>({})
  const itemsRef = useRef<Item[]>([])
  const lastTimeRef = useRef<number>(0)
  const produceTimersRef = useRef<Record<string, number>>({})
  const rsQueuesRef = useRef<Record<string, Item[]>>({})  // RS 버퍼 큐
  const onGoldEarnedRef = useRef(onGoldEarned)
  onGoldEarnedRef.current = onGoldEarned
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
    itemsRef.current = []
    setItems([])
    faStatesRef.current = {}
    produceTimersRef.current = {}
    rsQueuesRef.current = {}
    pendingClickerSpawnsRef.current = 0

    const itemSize = cellSize * CONFIG.ITEM_SIZE_RATIO
    const pixelsPerMs = cellSize / CONFIG.MOVE_SPEED
    const pickTime = getFactoryPickTime()

    let animId: number

    const tick = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time
      const delta = Math.min(time - lastTimeRef.current, 50)
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
              id: `item-${nextId++}`,
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
      items = items.map(item => {
        if (isBlocked(item, items, itemSize)) return item

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
        if (!faStatesRef.current[key]) {
          faStatesRef.current[key] = { state: 'IDLE', timer: 0, grabbed: null, buffer: [], outputItem: null }
        }
        const fas = faStatesRef.current[key]

        const inputRow = factory.dir === 'UP_TO_DOWN' ? factory.row - 1 : factory.row + 1
        const inputCol = factory.col
        const outputRow = factory.dir === 'UP_TO_DOWN' ? factory.row + 1 : factory.row - 1
        const outputCol = factory.col

        if (!getCell(board, inputRow, inputCol) || !getCell(board, outputRow, outputCol)) return

        const inputCenter = getCellCenter(inputRow, inputCol, cellSize)
        const outputCenter = getCellCenter(outputRow, outputCol, cellSize)

        const isOutputOccupied = () =>
          items.some(it => Math.sqrt((it.x - outputCenter.x) ** 2 + (it.y - outputCenter.y) ** 2) <= cellSize * 0.3)

        if (factory.type === 'WA') {
          // WA: 아이템 통과 + 가치 증가
          if (fas.state === 'IDLE') {
            const idx = items.findIndex(it => {
              if (it.grade !== factory.grade) return false
              if (it.waGrades.includes(factory.grade)) return false
              if (it.pkGrades.length > 0) return false
              const dist = Math.sqrt((it.x - inputCenter.x) ** 2 + (it.y - inputCenter.y) ** 2)
              return dist <= cellSize * 0.3
            })
            if (idx !== -1) {
              const grabbed = items[idx]
              items = items.filter((_, i) => i !== idx)
              faStatesRef.current[key] = { ...fas, state: 'GRABBING', timer: 0, grabbed }
            }
          } else if (fas.state === 'GRABBING') {
            const newTimer = fas.timer + delta
            if (newTimer >= pickTime) {
              const processed = applyWaBonus(fas.grabbed!, factory, animalsRef.current)
              faStatesRef.current[key] = { ...fas, state: 'PROCESSING', timer: 0, grabbed: processed, outputItem: null }
            } else {
              faStatesRef.current[key] = { ...fas, timer: newTimer }
            }
          } else if (fas.state === 'PROCESSING') {
            const newTimer = fas.timer + delta
            const processTime = getFactoryProcessTime(factory.level, fas.grabbed!.quantity)
            if (newTimer >= processTime) {
              faStatesRef.current[key] = { ...fas, state: 'PLACING', timer: 0, outputItem: fas.grabbed, grabbed: null }
            } else {
              faStatesRef.current[key] = { ...fas, timer: newTimer }
            }
          } else if (fas.state === 'PLACING') {
            const newTimer = fas.timer + delta
            if (newTimer >= pickTime) {
              if (!isOutputOccupied()) {
                items = [...items, placeOnBelt(fas.outputItem!, outputCenter, board, cellSize)]
                faStatesRef.current[key] = { state: 'IDLE', timer: 0, grabbed: null, buffer: [], outputItem: null }
              } else {
                faStatesRef.current[key] = { ...fas, state: 'WAITING', timer: 0 }
              }
            } else {
              faStatesRef.current[key] = { ...fas, timer: newTimer }
            }
          } else if (fas.state === 'WAITING') {
            if (!isOutputOccupied()) {
              items = [...items, placeOnBelt(fas.outputItem!, outputCenter, board, cellSize)]
              faStatesRef.current[key] = { state: 'IDLE', timer: 0, grabbed: null, buffer: [], outputItem: null }
            }
          }
        } else if (factory.type === 'PK') {
          // PK: 등급+포장이력 기준 단일 아이템 grab → 포장 보너스 → 출력
          if (fas.state === 'IDLE') {
            const idx = items.findIndex(it => {
              if (it.grade !== factory.grade) return false
              if (it.pkGrades.includes(factory.grade)) return false
              const dist = Math.sqrt((it.x - inputCenter.x) ** 2 + (it.y - inputCenter.y) ** 2)
              return dist <= cellSize * 0.3
            })
            if (idx !== -1) {
              const grabbed = items[idx]
              items = items.filter((_, i) => i !== idx)
              faStatesRef.current[key] = { ...fas, state: 'GRABBING', timer: 0, grabbed }
            }
          } else if (fas.state === 'GRABBING') {
            const newTimer = fas.timer + delta
            if (newTimer >= pickTime) {
              const processed = applyPkBonus(fas.grabbed!, factory, animalsRef.current)
              faStatesRef.current[key] = { ...fas, state: 'PROCESSING', timer: 0, grabbed: processed, outputItem: null }
            } else {
              faStatesRef.current[key] = { ...fas, timer: newTimer }
            }
          } else if (fas.state === 'PROCESSING') {
            const newTimer = fas.timer + delta
            const processTime = getFactoryProcessTime(factory.level, fas.grabbed!.quantity)
            if (newTimer >= processTime) {
              faStatesRef.current[key] = { ...fas, state: 'PLACING', timer: 0, outputItem: fas.grabbed, grabbed: null }
            } else {
              faStatesRef.current[key] = { ...fas, timer: newTimer }
            }
          } else if (fas.state === 'PLACING') {
            const newTimer = fas.timer + delta
            if (newTimer >= pickTime) {
              if (!isOutputOccupied()) {
                items = [...items, placeOnBelt(fas.outputItem!, outputCenter, board, cellSize)]
                faStatesRef.current[key] = { state: 'IDLE', timer: 0, grabbed: null, buffer: [], outputItem: null }
              } else {
                faStatesRef.current[key] = { ...fas, state: 'WAITING', timer: 0 }
              }
            } else {
              faStatesRef.current[key] = { ...fas, timer: newTimer }
            }
          } else if (fas.state === 'WAITING') {
            if (!isOutputOccupied()) {
              items = [...items, placeOnBelt(fas.outputItem!, outputCenter, board, cellSize)]
              faStatesRef.current[key] = { state: 'IDLE', timer: 0, grabbed: null, buffer: [], outputItem: null }
            }
          }
        } else {
          // PA: 레시피 기반 조합
          const recipe = RECIPES[factory.grade]
          if (!recipe) return

          const outputQuantity = getMaterialQuantity(materialQuantityLevelsRef.current[factory.grade - 1] ?? 1)
          const bufferCapacity = getFaBufferCapacity(faBufferLevelRef.current)

          const isRecipeComplete = () =>
            recipe.every(req => {
              const have = fas.buffer.find(b => b.grade === req.grade)?.count ?? 0
              return have >= req.count * outputQuantity
            })

          const getNeededGrade = (): number | null => {
            for (const req of recipe) {
              const have = fas.buffer.find(b => b.grade === req.grade)?.count ?? 0
              if (have < req.count * outputQuantity) return req.grade
            }
            return null
          }

          const totalInBuffer = fas.buffer.reduce((s, b) => s + b.count, 0)

          if (fas.state === 'IDLE') {
            if (isRecipeComplete()) {
              faStatesRef.current[key] = { ...fas, state: 'PROCESSING', timer: 0 }
              return
            }
            if (totalInBuffer >= bufferCapacity) return

            const neededGrade = getNeededGrade()
            if (neededGrade === null) return

            const idx = items.findIndex(it => {
              if (it.grade !== neededGrade) return false
              if (it.pkGrades.length > 0) return false
              const dist = Math.sqrt((it.x - inputCenter.x) ** 2 + (it.y - inputCenter.y) ** 2)
              return dist <= cellSize * 0.3
            })
            if (idx !== -1) {
              const grabbed = items[idx]
              items = items.filter((_, i) => i !== idx)
              faStatesRef.current[key] = { ...fas, state: 'GRABBING', timer: 0, grabbed }
            }
          } else if (fas.state === 'GRABBING') {
            const newTimer = fas.timer + delta
            if (newTimer >= pickTime) {
              const grade = fas.grabbed!.grade
              const newBuffer = [...fas.buffer]
              const existing = newBuffer.find(b => b.grade === grade)
              if (existing) existing.count++
              else newBuffer.push({ grade, count: 1 })
              faStatesRef.current[key] = { ...fas, state: 'IDLE', timer: 0, grabbed: null, buffer: newBuffer }
            } else {
              faStatesRef.current[key] = { ...fas, timer: newTimer }
            }
          } else if (fas.state === 'PROCESSING') {
            const processTime = getFactoryProcessTime(factory.level, outputQuantity)
            const newTimer = fas.timer + delta
            if (newTimer >= processTime) {
              const base = createRecipeOutput(
                factory.grade,
                factory,
                animalsRef.current,
                itemValueLevelsRef.current[factory.grade - 1] ?? 1,
                materialQuantityLevelsRef.current[factory.grade - 1] ?? 1,
              )
              const outputItem = { ...base, id: `item-${nextId++}` }
              faStatesRef.current[key] = { ...fas, state: 'PLACING', timer: 0, buffer: [], outputItem }
            } else {
              faStatesRef.current[key] = { ...fas, timer: newTimer }
            }
          } else if (fas.state === 'PLACING') {
            const newTimer = fas.timer + delta
            if (newTimer >= pickTime) {
              if (!isOutputOccupied()) {
                items = [...items, placeOnBelt(fas.outputItem!, outputCenter, board, cellSize)]
                faStatesRef.current[key] = { state: 'IDLE', timer: 0, grabbed: null, buffer: [], outputItem: null }
              } else {
                faStatesRef.current[key] = { ...fas, state: 'WAITING', timer: 0 }
              }
            } else {
              faStatesRef.current[key] = { ...fas, timer: newTimer }
            }
          } else if (fas.state === 'WAITING') {
            if (!isOutputOccupied()) {
              items = [...items, placeOnBelt(fas.outputItem!, outputCenter, board, cellSize)]
              faStatesRef.current[key] = { state: 'IDLE', timer: 0, grabbed: null, buffer: [], outputItem: null }
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
          id: `item-${nextId++}`,
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
      setItems([...items])
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)

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
        fp[cellKey] = fas.state
        if (fas.state === 'PROCESSING') {
          const qty = fas.grabbed?.quantity ?? getMaterialQuantity(1)
          const processTime = getFactoryProcessTime(factory.level, qty)
          p[cellKey] = Math.min(fas.timer / processTime, 1)
        } else if (fas.state === 'WAITING') {
          p[cellKey] = 1
        }
      })
      setProgresses(p)
      setFaPhases(fp)
    }, 100)

    return () => {
      cancelAnimationFrame(animId)
      clearInterval(progressInterval)
    }
  }, [board, cellSize])

  const spawnClickerItem = useCallback((grade: number) => {
    pendingClickerGradeRef.current = grade
    pendingClickerSpawnsRef.current += 1
  }, [])

  return { items, progresses, faPhases, spawnClickerItem }
}
