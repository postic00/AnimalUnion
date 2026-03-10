import { useCallback, useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import type { Board } from '../types/board'
import type { Item } from '../types/item'
import type { Producer } from '../types/producer'
import { getProducerValue, getProducerInterval } from '../balance'
import {
  getCellCenter,
  getCellDirection,
  getCell,
  isBlocked,
} from '../utils/boardUtils'

let nextId = 0

function getNextTarget(
  board: Board,
  cellSize: number,
  currentX: number,
  currentY: number,
): { targetX: number; targetY: number; dx: number; dy: number } | null {
  const col = Math.round(currentX / cellSize - 0.5)
  const row = Math.round(currentY / cellSize - 0.5)

  // 현재 셀의 방향으로 다음 셀 결정
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
  producers: Producer[]
) {
  const [items, setItems] = useState<Item[]>([])
  const itemsRef = useRef<Item[]>([])
  const lastTimeRef = useRef<number>(0)
  const produceTimersRef = useRef<Record<string, number>>({})
  const onGoldEarnedRef = useRef(onGoldEarned)
  onGoldEarnedRef.current = onGoldEarned
  const producersRef = useRef(producers)
  producersRef.current = producers
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

          // PR 레벨 확인 (level 0 = 비활성, 타이머 리셋)
          const producer = producersRef.current.find(p => p.row === rowIdx && p.col === colIdx)
          if (!producer || producer.level === 0) {
            produceTimersRef.current[key] = 0
            return
          }

          if (produceTimersRef.current[key] >= getProducerInterval(producer.level)) {
            produceTimersRef.current[key] = 0

            // PR 아래에서 RS 찾기
            let rsRow = -1, rsCol = -1
            for (let r = rowIdx + 1; r < board.length; r++) {
              for (let c = 0; c < board[r].length; c++) {
                if (board[r][c].type === 'RS') { rsRow = r; rsCol = c; break }
              }
              if (rsRow !== -1) break
            }
            if (rsRow === -1) return

            const center = getCellCenter(rsRow, rsCol, cellSize)

            // RS에 이미 아이템이 있으면 스킵
            const rsOccupied = items.some(it =>
              Math.sqrt((it.x - center.x) ** 2 + (it.y - center.y) ** 2) < itemSize
            )
            if (rsOccupied) return

            const dir = getCellDirection('RS')

            // 다음 waypoint 계산
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
          // waypoint 도달 → 다음 waypoint 계산
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

        // waypoint 방향으로 이동
        const ratio = step / distToTarget
        return {
          ...item,
          x: item.x + (item.targetX - item.x) * ratio,
          y: item.y + (item.targetY - item.y) * ratio,
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
        onGoldEarnedRef.current(item.value)
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
