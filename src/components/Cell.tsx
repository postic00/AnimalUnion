import { memo } from 'react'
import type { CSSProperties } from 'react'
import type { Cell as CellType } from '../types/board'
import type { Factory } from '../types/factory'
import type { Producer } from '../types/producer'
import type { AnimalId } from '../types/animal'

import { ProcessAnimation } from './ProcessAnimation'
import { FactoryTypeIcon } from './FactoryTypeIcon'
import styles from './Cell.module.css'

export type AnimalSpecies = 'hamster' | 'cat' | 'dog' | 'robot'

export function getSpecies(animalId: AnimalId | null): AnimalSpecies {
  if (!animalId) return 'robot'
  if (animalId.startsWith('hamster')) return 'hamster'
  if (animalId.startsWith('cat')) return 'cat'
  return 'dog'
}

export function HandSvg({ species, w, h }: { species: AnimalSpecies; w: number; h: number }) {
  if (species === 'hamster') return (
    <svg width={w} height={h} viewBox="0 0 42 48" preserveAspectRatio="xMidYMid meet">
      <rect x="16" y="14" width="10" height="32" rx="5" fill="#f9a8b4"/>
      <ellipse cx="21" cy="14" rx="18" ry="9" fill="#f9a8b4"/>
      <ellipse cx="7"  cy="7" rx="6" ry="5.5" fill="#fbc4cd"/>
      <ellipse cx="21" cy="4" rx="6" ry="5.5" fill="#fbc4cd"/>
      <ellipse cx="35" cy="7" rx="6" ry="5.5" fill="#fbc4cd"/>
      <ellipse cx="21" cy="16" rx="7" ry="5" fill="#f472a0" opacity="0.5"/>
    </svg>
  )
  if (species === 'cat') return (
    <svg width={w} height={h} viewBox="0 0 46 52" preserveAspectRatio="xMidYMid meet">
      <rect x="17" y="16" width="12" height="34" rx="6" fill="#d4a96a"/>
      <ellipse cx="23" cy="16" rx="20" ry="10" fill="#d4a96a"/>
      <path d="M6 10 Q4 1 8 0 Q12 1 10 10" fill="#fff" stroke="#bbb" strokeWidth="0.5"/>
      <path d="M19 6 Q18 -2 23 -3 Q28 -2 27 6" fill="#fff" stroke="#bbb" strokeWidth="0.5"/>
      <path d="M36 10 Q34 1 38 0 Q42 1 40 10" fill="#fff" stroke="#bbb" strokeWidth="0.5"/>
      <ellipse cx="23" cy="18" rx="7" ry="5" fill="#c084a0" opacity="0.6"/>
      <ellipse cx="12" cy="14" rx="3" ry="2.5" fill="#c084a0" opacity="0.5"/>
      <ellipse cx="34" cy="14" rx="3" ry="2.5" fill="#c084a0" opacity="0.5"/>
    </svg>
  )
  if (species === 'dog') return (
    <svg width={w} height={h} viewBox="0 0 50 52" preserveAspectRatio="xMidYMid meet">
      <rect x="18" y="18" width="14" height="34" rx="7" fill="#c8a882"/>
      <ellipse cx="25" cy="18" rx="22" ry="11" fill="#c8a882"/>
      <ellipse cx="5"  cy="10" rx="5.5" ry="6.5" fill="#b8956e"/>
      <ellipse cx="16" cy="5"  rx="5.5" ry="6.5" fill="#b8956e"/>
      <ellipse cx="34" cy="5"  rx="5.5" ry="6.5" fill="#b8956e"/>
      <ellipse cx="45" cy="10" rx="5.5" ry="6.5" fill="#b8956e"/>
      <ellipse cx="25" cy="20" rx="9"   ry="7"   fill="#a0785a" opacity="0.7"/>
      <ellipse cx="11" cy="15" rx="3.5" ry="3"   fill="#a0785a" opacity="0.6"/>
      <ellipse cx="39" cy="15" rx="3.5" ry="3"   fill="#a0785a" opacity="0.6"/>
    </svg>
  )
  return (
    <svg width={w} height={h} viewBox="0 0 44 52" preserveAspectRatio="xMidYMid meet">
      <rect x="17" y="16" width="10" height="34" rx="3" fill="#94a3b8"/>
      <rect x="14" y="20" width="16" height="6" rx="2" fill="#64748b"/>
      <rect x="14" y="30" width="16" height="6" rx="2" fill="#64748b"/>
      <rect x="10" y="10" width="24" height="10" rx="3" fill="#94a3b8"/>
      <path d="M8 10 Q2 6 4 0 Q8 -1 10 4 L10 10Z" fill="#475569"/>
      <path d="M36 10 Q42 6 40 0 Q36 -1 34 4 L34 10Z" fill="#475569"/>
      <circle cx="22" cy="14" r="3" fill="#334155"/>
      <circle cx="22" cy="14" r="1.2" fill="#94a3b8"/>
      <rect x="17" y="22" width="10" height="3" rx="1" fill="#fbbf24" opacity="0.8"/>
      <rect x="17" y="29" width="10" height="3" rx="1" fill="#fbbf24" opacity="0.8"/>
    </svg>
  )
}

interface Props {
  cell: CellType
  size: number
  factory?: Factory
  producer?: Producer
  progress?: number
  bufferInfo?: { count: number; capacity: number }
  placing?: boolean
  onClick?: () => void
}

import { GradeIcon } from './GradeIcon'
import { ProducerAnimation } from './ProducerIcon'
import { RailIcon } from './RailIcon'

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


function getLevelLabel(cell: CellType, factory?: Factory, producer?: Producer): string | null {
  if (cell.type === 'PR' && producer?.built) return `Lv.${producer.level}`
  if (cell.type === 'FA' && factory?.built) return `${factory.type} ${factory.level}`
  return null
}

function CellEmoji({ cell, factory, producer, progress, size }: Pick<Props, 'cell' | 'factory' | 'producer' | 'progress'> & { size: number }) {
  const p = progress ?? 0
  const iconSize = Math.round(size * 0.55)
  const svgStyle: CSSProperties = {
    transform: `scale(${0.5 + p * 0.5})`,
    opacity: 0.25 + p * 0.75,
    transition: 'transform 0.1s linear, opacity 0.1s linear',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  switch (cell.type) {
    case 'RLN':
    case 'RRN':
    case 'RUN':
    case 'RDN':
    case 'RS':
    case 'RE':
    case 'RDR':
    case 'RLR':
    case 'RDL':
    case 'RRL': return <RailIcon type={cell.type} size={size}/>
    case 'EM': return null
    case 'PR':
      if (!producer?.built) return <span style={{ fontSize: '28px', opacity: 0.35, position: 'relative', zIndex: 1 }}>🌱</span>
      return null
    case 'FA':
      if (!factory?.built) return <span style={{ fontSize: '28px', opacity: 0.45, position: 'relative', zIndex: 1 }}>🏗️</span>
      return <span style={{ ...svgStyle, position: 'relative', zIndex: 10 }}><GradeIcon size={iconSize} grade={factory.grade ?? 1}/></span>
    default:
      return <span style={{ fontSize: '10px' }}>{cell.type}</span>
  }
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

export default memo(function Cell({ cell, size, factory, producer, progress, bufferInfo, placing, onClick }: Props) {
  const dynamicStyle = getDynamicStyle(cell, factory, producer)
  const label = getLevelLabel(cell, factory, producer)
  const isActiveFA = cell.type === 'FA' && factory?.built && factory.level > 0
  const isActivePR = cell.type === 'PR' && producer?.built
  const iconSm = Math.round(size * 0.36)

  return (
    <div
      className={`${styles.cell} ${styles[cell.type]} ${placing ? styles.placing : ''}`}
      style={{ width: size, height: size, cursor: placing ? 'pointer' : undefined, position: 'relative', zIndex: isActiveFA ? 7 : undefined, ...dynamicStyle }}
      onClick={onClick}
    >
      {isActivePR ? (
        <>
          {/* 가운데: 판다 애니메이션 (progress에 따라 투명도 0.3~1.0) */}
          <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 + (progress ?? 0) * 0.7, transition: 'opacity 0.1s linear' }}>
            <ProducerAnimation grade={producer!.grade ?? 1} size={Math.round(size * 0.85)}/>
          </span>
          {/* 좌측 하단: 생산 아이템 등급 */}
          <span style={{ position: 'absolute', bottom: 2, left: 2, zIndex: 5, pointerEvents: 'none', lineHeight: 1 }}>
            <GradeIcon size={iconSm} grade={producer!.grade ?? 1}/>
          </span>
        </>
      ) : isActiveFA ? (
        <>
          {/* 가운데: 처리 애니메이션 (progress에 따라 투명도 0.3~1.0) */}
          <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 + (progress ?? 0) * 0.7, transition: 'opacity 0.1s linear' }}>
            <ProcessAnimation type={factory!.type} species={getSpecies(factory!.animalId ?? null)} size={Math.round(size * 0.7)}/>
          </span>
          {/* 좌측 하단: 아이템 등급 */}
          <span style={{ position: 'absolute', bottom: 2, left: 2, zIndex: 5, pointerEvents: 'none', lineHeight: 1 }}>
            <GradeIcon size={iconSm} grade={factory!.grade}/>
          </span>
          {/* 우측 하단: 공장 타입 */}
          <span style={{ position: 'absolute', bottom: 2, right: 2, zIndex: 5, pointerEvents: 'none', lineHeight: 1 }}>
            <FactoryTypeIcon type={factory!.type} size={iconSm}/>
          </span>
        </>
      ) : (
        <CellEmoji cell={cell} factory={factory} producer={producer} progress={progress} size={size} />
      )}

      {label && <span style={LABEL_STYLE}>{label}</span>}

      {/* 버퍼 표시 (count/capacity) */}
      {bufferInfo && (
        <span style={{
          position: 'absolute', bottom: 1, left: '50%', transform: 'translateX(-50%)',
          fontSize: '7px', fontWeight: 700,
          background: bufferInfo.count >= bufferInfo.capacity ? 'rgba(220,38,38,0.85)' : 'rgba(0,0,0,0.5)',
          color: '#fff', borderRadius: 3, padding: '1px 3px',
          whiteSpace: 'nowrap', zIndex: 6, pointerEvents: 'none',
        }}>
          {bufferInfo.count}/{bufferInfo.capacity}
        </span>
      )}
    </div>
  )
})
