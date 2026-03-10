import { useCallback, useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import type { Board } from '../types/board'
import type { Item } from '../types/item'
import type { Producer } from '../types/producer'
import type { Factory } from '../types/factory'
import { getProducerValue, getProducerInterval, getFinalGold, getFactoryBonus, getFactoryPickTime } from '../balance'
import {
  getCellCenter,
  getCellDirection,
  getCell,
  isBlocked,
} from '../utils/boardUtils'

let nextId = 0

type FAPhase = 'IDLE' | 'PICKING' | 'WAITING'
interface FAState {
  state: FAPhase
  timer: number
  heldItem: Item | null
}

function applyFactoryBonus(item: Item, factory: Factory): Item {
  const { type, grade } = factory
  if (grade === 0) return item
  const bonus = getFactoryBonus(type, grade)
  if (type === 'WA') {
    if (item.waGrades.includes(grade)) return item
    return { ...item, waBonus: item.waBonus + bonus, waGrades: [...item.waGrades, grade] }
  } else if (type === 'PA') {
    if (item.paGrades.includes(grade)) return item
    return { ...item, paBonus: item.paBonus + bonus, paGrades: [...item.paGrades, grade] }
  } else {
    if (item.pkGrades.includes(grade)) return item
    return { ...item, pkBonus: item.pkBonus + bonus, pkGrades: [...item.pkGrades, grade] }
  }
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

export function useGameLoop(
  board: Board,
  cellSize: number,
  onGoldEarned: (amount: number) => void,
  producers: Producer[],
  factories: Factory[],
) {
  const [items, setItems] = useState<Item[]>([])
  const itemsRef = useRef<Item[]>([])
  const lastTimeRef = useRef<number>(0)
  const produceTimersRef = useRef<Record<string, number>>({})
  const onGoldEarnedRef = useRef(onGoldEarned)
  onGoldEarnedRef.current = onGoldEarned
  const producersRef = useRef(producers)
  producersRef.current = producers
  const factoriesRef = useRef(factories)
  factoriesRef.current = factories
  const faStatesRef = useRef<Record<string, FAState>>({})
  const pendingClickerSpawnsRef = useRef(0)

  useEffect(() => {
    if (cellSize === 0) return

    const itemSize = cellSize * CONFIG.ITEM_SIZE_RATIO
    const pixelsPerMs = cellSize / CONFIG.MOVE_SPEED

    let animId: number

    const tick = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time
      const delta = Math.min(time - lastTimeRef.current, 50)
      lastTimeRef.current = time

      let items = itemsRef.current

      // PR 생산 → RS 위치에서 스폰
      board.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          if (cell.type !== 'PR') return
          const key = `${rowIdx}-${colIdx}`
          if (produceTimersRef.current[key] === undefined) {
            produceTimersRef.current[key] = 0
          }
          produceTimersRef.current[key] += delta

          const producer = producersRef.current.find(p => p.row === rowIdx && p.col === colIdx)
          if (!producer || !producer.built || producer.level === 0) {
            produceTimersRef.current[key] = 0
            return
          }

          if (produceTimersRef.current[key] >= getProducerInterval(producer.level)) {
            produceTimersRef.current[key] = 0

            let rsRow = -1, rsCol = -1
            for (let r = rowIdx + 1; r < board.length; r++) {
              for (let c = 0; c < board[r].length; c++) {
                if (board[r][c].type === 'RS') { rsRow = r; rsCol = c; break }
              }
              if (rsRow !== -1) break
            }
            if (rsRow === -1) return

            const center = getCellCenter(rsRow, rsCol, cellSize)

            const rsOccupied = items.some(it =>
              Math.sqrt((it.x - center.x) ** 2 + (it.y - center.y) ** 2) < itemSize
            )
            if (rsOccupied) return

            const dir = getCellDirection('RS')
            const next = getNextTarget(board, cellSize, center.x, center.y)
            if (!next) return

            const newItem: Item = {
              id: `item-${nextId++}`,
              x: center.x,
              y: center.y,
              dx: dir.dx,
              dy: dir.dy,
              targetX: next.targetX,
              targetY: next.targetY,
              value: getProducerValue(),
              waBonus: 0,
              paBonus: 0,
              pkBonus: 0,
              waGrades: [],
              paGrades: [],
              pkGrades: [],
            }
            items = [...items, newItem]
          }
        })
      })

      // 아이템 이동 (waypoint 기반)
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
            x: item.targetX,
            y: item.targetY,
            dx: next.dx,
            dy: next.dy,
            targetX: next.targetX,
            targetY: next.targetY,
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
          faStatesRef.current[key] = { state: 'IDLE', timer: 0, heldItem: null }
        }
        const fas = faStatesRef.current[key]

        const inputRow = factory.dir === 'UP_TO_DOWN' ? factory.row - 1 : factory.row + 1
        const inputCol = factory.col
        const outputRow = factory.dir === 'UP_TO_DOWN' ? factory.row + 1 : factory.row - 1
        const outputCol = factory.col

        if (!getCell(board, inputRow, inputCol) || !getCell(board, outputRow, outputCol)) return

        const inputCenter = getCellCenter(inputRow, inputCol, cellSize)
        const outputCenter = getCellCenter(outputRow, outputCol, cellSize)

        if (fas.state === 'IDLE') {
          const idx = items.findIndex(it => {
            if (it.pkGrades.length > 0) return false
            const dist = Math.sqrt((it.x - inputCenter.x) ** 2 + (it.y - inputCenter.y) ** 2)
            return dist <= cellSize * 0.3
          })
          if (idx !== -1) {
            const picked = items[idx]
            items = items.filter((_, i) => i !== idx)
            faStatesRef.current[key] = { state: 'PICKING', timer: 0, heldItem: picked }
          }
        } else if (fas.state === 'PICKING') {
          const newTimer = fas.timer + delta
          if (newTimer >= getFactoryPickTime(factory.level)) {
            const processed = applyFactoryBonus(fas.heldItem!, factory)
            const occupied = items.some(it => {
              const dist = Math.sqrt((it.x - outputCenter.x) ** 2 + (it.y - outputCenter.y) ** 2)
              return dist <= cellSize * 0.3
            })
            if (!occupied) {
              const next = getNextTarget(board, cellSize, outputCenter.x, outputCenter.y)
              const placed = next
                ? { ...processed, x: outputCenter.x, y: outputCenter.y, dx: next.dx, dy: next.dy, targetX: next.targetX, targetY: next.targetY }
                : { ...processed, x: outputCenter.x, y: outputCenter.y }
              items = [...items, placed]
              faStatesRef.current[key] = { state: 'IDLE', timer: 0, heldItem: null }
            } else {
              faStatesRef.current[key] = { state: 'WAITING', timer: 0, heldItem: processed }
            }
          } else {
            faStatesRef.current[key] = { ...fas, timer: newTimer }
          }
        } else if (fas.state === 'WAITING') {
          const occupied = items.some(it => {
            const dist = Math.sqrt((it.x - outputCenter.x) ** 2 + (it.y - outputCenter.y) ** 2)
            return dist <= cellSize * 0.3
          })
          if (!occupied) {
            const next = getNextTarget(board, cellSize, outputCenter.x, outputCenter.y)
            const placed = next
              ? { ...fas.heldItem!, x: outputCenter.x, y: outputCenter.y, dx: next.dx, dy: next.dy, targetX: next.targetX, targetY: next.targetY }
              : { ...fas.heldItem!, x: outputCenter.x, y: outputCenter.y }
            items = [...items, placed]
            faStatesRef.current[key] = { state: 'IDLE', timer: 0, heldItem: null }
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
        items = [...items, {
          id: `item-${nextId++}`,
          x: center.x, y: center.y,
          dx: dir.dx, dy: dir.dy,
          targetX: next.targetX, targetY: next.targetY,
          value: 1,
          waBonus: 0, paBonus: 0, pkBonus: 0,
          waGrades: [], paGrades: [], pkGrades: [],
        }]
      }

      // RE 도달 아이템 제거 + 골드 획득
      items = items.filter(item => {
        const col = Math.round(item.x / cellSize - 0.5)
        const row = Math.round(item.y / cellSize - 0.5)
        const cell = getCell(board, row, col)
        if (cell?.type !== 'RE') return true
        const center = getCellCenter(row, col, cellSize)
        const dist = Math.sqrt((item.x - center.x) ** 2 + (item.y - center.y) ** 2)
        if (dist > cellSize * 0.3) return true
        onGoldEarnedRef.current(getFinalGold(item.value, item.waBonus, item.paBonus, item.pkBonus))
        return false
      })

      itemsRef.current = items
      setItems([...items])
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [board, cellSize])

  const spawnClickerItem = useCallback(() => {
    pendingClickerSpawnsRef.current += 1
  }, [])

  return { items, spawnClickerItem }
}
