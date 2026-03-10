import type { Board, CellType } from '../types/board'
import type { Item } from '../types/item'

export function getCellCenter(row: number, col: number, cellSize: number) {
  return {
    x: col * cellSize + cellSize / 2,
    y: row * cellSize + cellSize / 2,
  }
}

export function getItemCell(item: Item, cellSize: number) {
  return {
    row: Math.floor(item.y / cellSize),
    col: Math.floor(item.x / cellSize),
  }
}

export function getCellDirection(type: CellType): { dx: number; dy: number } {
  switch (type) {
    case 'RS': return { dx: 1, dy: 0 }
    case 'RR': return { dx: 1, dy: 0 }
    case 'RL': return { dx: -1, dy: 0 }
    case 'RU': return { dx: 0, dy: -1 }
    case 'RD': return { dx: 0, dy: 1 }
    case 'PR': return { dx: 0, dy: 1 }
    default:   return { dx: 0, dy: 0 }
  }
}

export function isRailCell(type: CellType): boolean {
  return ['RS', 'RE', 'RL', 'RR', 'RU', 'RD'].includes(type)
}

export function getCell(board: Board, row: number, col: number) {
  return board[row]?.[col] ?? null
}

// 아이템이 앞 아이템과 너무 가까운지 체크
export function isBlocked(item: Item, allItems: Item[], itemSize: number): boolean {
  const tdx = item.targetX - item.x
  const tdy = item.targetY - item.y
  const tlen = Math.sqrt(tdx * tdx + tdy * tdy)
  if (tlen === 0) return false

  return allItems.some(other => {
    if (other.id === item.id) return false
    const dist = Math.sqrt((other.x - item.x) ** 2 + (other.y - item.y) ** 2)
    if (dist >= itemSize) return false
    // 현재→타겟 방향 기준으로 앞에 있는지 확인
    const dot = (other.x - item.x) * (tdx / tlen) + (other.y - item.y) * (tdy / tlen)
    return dot > 0
  })
}
