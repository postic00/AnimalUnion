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
    case 'RS':  return { dx: 1,  dy: 0  }
    case 'RRN':  return { dx: 1,  dy: 0  }
    case 'RLN':  return { dx: -1, dy: 0  }
    case 'RUN':  return { dx: 0,  dy: -1 }
    case 'RDN':  return { dx: 0,  dy: 1  }
    case 'PR':  return { dx: 0,  dy: 1  }
    case 'RDR': return { dx: 0,  dy: 1  }  // 오른쪽→아래
    case 'RLR': return { dx: -1, dy: 0  }  // 아래→왼쪽
    case 'RDL': return { dx: 0,  dy: 1  }  // 왼쪽→아래
    case 'RRL': return { dx: 1,  dy: 0  }  // 아래→오른쪽
    default:    return { dx: 0,  dy: 0  }
  }
}

export function isRailCell(type: CellType): boolean {
  return ['RS', 'RE', 'RLN', 'RRN', 'RUN', 'RDN', 'RDR', 'RLR', 'RDL', 'RRL'].includes(type)
}

export function getCell(board: Board, row: number, col: number) {
  return board[row]?.[col] ?? null
}

// 셀 기반 공간 해시 생성 (이동 루프 전 1회 호출)
export function buildSpatialHash(items: Item[], bucketSize: number): Map<string, Item[]> {
  const map = new Map<string, Item[]>()
  if (bucketSize <= 0) return map
  for (const item of items) {
    if (!isFinite(item.x) || !isFinite(item.y)) continue
    const key = `${Math.floor(item.x / bucketSize)}-${Math.floor(item.y / bucketSize)}`
    const bucket = map.get(key)
    if (bucket) bucket.push(item)
    else map.set(key, [item])
  }
  return map
}

// 아이템이 앞 아이템과 너무 가까운지 체크 (공간 해시로 O(1) 룩업)
export function isBlocked(item: Item, spatialHash: Map<string, Item[]>, itemSize: number): boolean {
  const tdx = item.targetX - item.x
  const tdy = item.targetY - item.y
  const tlen = Math.sqrt(tdx * tdx + tdy * tdy)
  if (tlen === 0) return false

  const cx = Math.floor(item.x / itemSize)
  const cy = Math.floor(item.y / itemSize)

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const bucket = spatialHash.get(`${cx + dx}-${cy + dy}`)
      if (!bucket) continue
      for (const other of bucket) {
        if (other.id === item.id) continue
        const ox = other.x - item.x
        const oy = other.y - item.y
        const dist = Math.sqrt(ox * ox + oy * oy)
        if (dist >= itemSize) continue
        const dot = ox * (tdx / tlen) + oy * (tdy / tlen)
        if (dot > 0) return true
      }
    }
  }
  return false
}
