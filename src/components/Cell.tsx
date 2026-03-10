import type { Cell as CellType } from '../types/board'

interface Props {
  cell: CellType
  size: number
}

const CELL_COLORS: Record<string, string> = {
  EM: 'bg-gray-800',
  PR: 'bg-green-700',
  RS: 'bg-blue-600',
  RE: 'bg-red-600',
  RL: 'bg-blue-400',
  RR: 'bg-blue-400',
  RU: 'bg-blue-400',
  RD: 'bg-blue-400',
  FA: 'bg-yellow-600',
  CR: 'bg-purple-600',
}

const CELL_LABELS: Record<string, string> = {
  EM: '',
  PR: 'PR',
  RS: 'RS',
  RE: 'RE',
  RL: 'RL',
  RR: 'RR',
  RU: 'RU',
  RD: 'RD',
  FA: 'FA',
  CR: 'CR',
}

export default function Cell({ cell, size }: Props) {
  const color = CELL_COLORS[cell.type] ?? 'bg-gray-700'
  const label = CELL_LABELS[cell.type] ?? ''

  return (
    <div
      className={`${color} border border-gray-600 flex items-center justify-center text-xs font-bold text-white`}
      style={{ width: size, height: size }}
    >
      {label}
    </div>
  )
}
