import type { CSSProperties } from 'react'
import type { Cell as CellType } from '../types/board'
import type { Factory } from '../types/factory'
import type { Producer } from '../types/producer'
import styles from './Cell.module.css'

interface Props {
  cell: CellType
  size: number
  factory?: Factory
  producer?: Producer
  progress?: number
  placing?: boolean
  onClick?: () => void
}

const GRADE_EMOJIS = [
  '🌶️','🧅','🧄','🫙','🍓','🫒','🍢','🌰','🍇','🍯',
  '🧁','🍤','⭐','✨','🍲','🍡','🌊','🍡','🍲','🌈',
]

const FA_STYLE: Record<string, CSSProperties> = {
  WA: { background: 'transparent', border: 'none', color: '#1e40af' },
  PA: { background: 'transparent', border: 'none', color: '#5b21b6' },
  PK: { background: 'transparent', border: 'none', color: '#9a3412' },
}

const PR_STYLE: CSSProperties[] = [
  { background: 'transparent', border: 'none', color: '#991b1b' },
  { background: 'transparent', border: 'none', color: '#6b21a8' },
  { background: 'transparent', border: 'none', color: '#14532d' },
]

function getDynamicStyle(cell: CellType, factory?: Factory, producer?: Producer): CSSProperties {
  if (cell.type === 'FA') {
    if (!factory?.built) return { background: '#f9fafb', borderColor: '#d1d5db', borderStyle: 'dashed', color: '#9ca3af' }
    return FA_STYLE[factory.type] ?? {}
  }
  if (cell.type === 'PR') {
    if (!producer?.built) return { background: '#f9fafb', borderStyle: 'dashed', color: '#9ca3af' }
    return PR_STYLE[(producer.grade ?? 1) - 1] ?? PR_STYLE[0]
  }
  return {}
}

const PR_GRADE_COLORS: Record<number, { ring: string; bg: string }> = {
  1: { ring: '#dc2626', bg: '#fff1f1' },
  2: { ring: '#7c3aed', bg: '#f5f3ff' },
  3: { ring: '#16a34a', bg: '#f0fdf4' },
}

function getProgressColors(cell: CellType, factory?: Factory, producer?: Producer): { ring: string; bg: string } {
  if (cell.type === 'PR') return PR_GRADE_COLORS[producer?.grade ?? 1] ?? PR_GRADE_COLORS[1]
  if (cell.type === 'FA') {
    if (factory?.type === 'WA') return { ring: '#3b82f6', bg: '#dbeafe' }
    if (factory?.type === 'PA') return { ring: '#8b5cf6', bg: '#ede9fe' }
    if (factory?.type === 'PK') return { ring: '#f97316', bg: '#fff7ed' }
  }
  return { ring: '#6b7280', bg: '#f9fafb' }
}

function getLevelLabel(cell: CellType, factory?: Factory, producer?: Producer): string | null {
  if (cell.type === 'PR' && producer?.built) return `Lv.${producer.level}`
  if (cell.type === 'FA' && factory?.built) return `${factory.type} ${factory.level}`
  return null
}

function CellEmoji({ cell, factory, producer, progress }: Pick<Props, 'cell' | 'factory' | 'producer' | 'progress'>) {
  const p = progress ?? 0
  const emojiStyle: CSSProperties = {
    fontSize: '30px',
    lineHeight: 1,
    transform: `scale(${0.5 + p * 0.5})`,
    opacity: 0.25 + p * 0.75,
    transition: 'transform 0.1s linear, opacity 0.1s linear',
  }

  switch (cell.type) {
    case 'RL': return <span style={{ fontSize: '14px' }}>◀</span>
    case 'RR': return <span style={{ fontSize: '14px' }}>▶</span>
    case 'RU': return <span style={{ fontSize: '14px' }}>▲</span>
    case 'RD': return <span style={{ fontSize: '14px' }}>▼</span>
    case 'RS': return <span style={{ fontSize: '14px' }}>▶</span>
    case 'RE': return <span style={{ fontSize: '18px' }}>⭐</span>
    case 'EM': return null
    case 'PR':
      if (!producer?.built) return <span style={{ fontSize: '28px', opacity: 0.35, position: 'relative', zIndex: 1 }}>🌱</span>
      return <span style={{ ...emojiStyle, position: 'relative', zIndex: 1 }}>{GRADE_EMOJIS[(producer.grade ?? 1) - 1]}</span>
    case 'FA':
      if (!factory?.built) return <span style={{ fontSize: '28px', opacity: 0.45, position: 'relative', zIndex: 1 }}>🏗️</span>
      const icon = factory.type === 'WA' ? '💧' : factory.type === 'PA' ? '⚙️' : '📦'
      return <span style={{ ...emojiStyle, position: 'relative', zIndex: 1 }}>{icon}</span>
    default:
      return <span style={{ fontSize: '10px' }}>{cell.type}</span>
  }
}

function ProgressRing({ size, progress, color, bgColor }: { size: number; progress: number; color: string; bgColor: string }) {
  const pad = 4
  const r = size / 2 - pad
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - progress)
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width={size} height={size}>
      <circle cx={cx} cy={cy} r={r - 1} fill={bgColor} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={4} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dashoffset 0.1s linear' }}
      />
    </svg>
  )
}

const LABEL_STYLE: CSSProperties = {
  position: 'absolute',
  top: 1,
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '8px',
  fontWeight: 800,
  background: 'rgba(0,0,0,0.55)',
  color: '#fff',
  borderRadius: 4,
  padding: '1px 4px',
  whiteSpace: 'nowrap',
  zIndex: 2,
  pointerEvents: 'none',
}

export default function Cell({ cell, size, factory, producer, progress, placing, onClick }: Props) {
  const dynamicStyle = getDynamicStyle(cell, factory, producer)
  const showProgress = progress !== undefined && progress > 0 && (cell.type === 'PR' || cell.type === 'FA')
  const { ring, bg } = getProgressColors(cell, factory, producer)
  const label = getLevelLabel(cell, factory, producer)

  return (
    <div
      className={`${styles.cell} ${styles[cell.type]} ${placing ? styles.placing : ''}`}
      style={{ width: size, height: size, cursor: placing ? 'pointer' : undefined, position: 'relative', ...dynamicStyle }}
      onClick={onClick}
    >
      {showProgress && (
        <ProgressRing size={size} progress={progress!} color={ring} bgColor={bg} />
      )}
      <CellEmoji cell={cell} factory={factory} producer={producer} progress={progress} />
      {label && <span style={LABEL_STYLE}>{label}</span>}
    </div>
  )
}
