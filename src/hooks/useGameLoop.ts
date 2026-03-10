import { useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import type { Board } from '../types/board'
import type { Item } from '../types/item'
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

export function useGameLoop(board: Board, cellSize: number) {
  const [items, setItems] = useState<Item[]>([])
  const itemsRef = useRef<Item[]>([])
  const lastTimeRef = useRef<number>(0)
  const produceTimersRef = useRef<Record<string, number>>({})

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

          if (produceTimersRef.current[key] >= CONFIG.PRODUCE_INTERVAL) {
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
            }
            if (!isBlocked(newItem, items, itemSize)) {
              items = [...items, newItem]
            }
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

      // RE 도달 아이템 제거 (셀 중앙 기준)
      items = items.filter(item => {
        const col = Math.round(item.x / cellSize - 0.5)
        const row = Math.round(item.y / cellSize - 0.5)
        const cell = getCell(board, row, col)
        if (cell?.type !== 'RE') return true
        const center = getCellCenter(row, col, cellSize)
        const dist = Math.sqrt((item.x - center.x) ** 2 + (item.y - center.y) ** 2)
        return dist > cellSize * 0.3
      })

      itemsRef.current = items
      setItems([...items])
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [board, cellSize])

  return items
}
