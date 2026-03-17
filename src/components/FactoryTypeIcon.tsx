import type { Factory } from '../types/factory'

function WaIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 수도꼭지 */}
      <rect x="12" y="4" width="8" height="5" rx="2" fill="#1d4ed8"/>
      <rect x="10" y="8" width="12" height="4" rx="2" fill="#2563eb"/>
      {/* 파이프 */}
      <rect x="14" y="12" width="4" height="6" fill="#3b82f6"/>
      {/* 손잡이 */}
      <rect x="6" y="6" width="7" height="3" rx="1.5" fill="#1d4ed8"/>
      <rect x="19" y="6" width="7" height="3" rx="1.5" fill="#1d4ed8"/>
      {/* 물방울들 */}
      <path d="M16 19 Q18 22 16 25 Q14 22 16 19Z" fill="#60a5fa"/>
      <path d="M11 20 Q12.5 22.5 11 24.5 Q9.5 22.5 11 20Z" fill="#93c5fd" opacity="0.8"/>
      <path d="M21 21 Q22.5 23 21 25 Q19.5 23 21 21Z" fill="#93c5fd" opacity="0.8"/>
      {/* 물 튀김 */}
      <ellipse cx="16" cy="28" rx="6" ry="2" fill="#bfdbfe" opacity="0.6"/>
      <circle cx="10" cy="27" r="1.5" fill="#60a5fa" opacity="0.6"/>
      <circle cx="22" cy="27" r="1.5" fill="#60a5fa" opacity="0.6"/>
    </svg>
  )
}

function PaIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 프라이팬 */}
      <ellipse cx="15" cy="22" rx="11" ry="7" fill="#374151"/>
      <ellipse cx="15" cy="20" rx="11" ry="7" fill="#4b5563"/>
      {/* 내면 */}
      <ellipse cx="15" cy="19" rx="8" ry="5" fill="#6b7280"/>
      {/* 손잡이 */}
      <rect x="26" y="18" width="5" height="3" rx="1.5" fill="#374151"/>
      {/* 재료 (익히는 중) */}
      <ellipse cx="12" cy="18" rx="3.5" ry="2.5" fill="#ef4444" opacity="0.9"/>
      <ellipse cx="19" cy="19" rx="3" ry="2" fill="#22c55e" opacity="0.9"/>
      {/* 증기 */}
      <path d="M10 13 Q9 9 10 5" stroke="#e2e8f0" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M16 12 Q15 8 16 4" stroke="#e2e8f0" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M21 13 Q22 9 21 5" stroke="#e2e8f0" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function PkIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 박스 몸통 */}
      <rect x="5" y="14" width="22" height="16" rx="2" fill="#fbbf24"/>
      {/* 박스 윗면 */}
      <rect x="5" y="14" width="22" height="7" rx="2" fill="#f59e0b"/>
      {/* 접힌 선 */}
      <line x1="16" y1="14" x2="16" y2="30" stroke="#d97706" strokeWidth="1.5"/>
      <line x1="5" y1="21" x2="27" y2="21" stroke="#d97706" strokeWidth="1"/>
      {/* 테이프 */}
      <rect x="3" y="19" width="26" height="4" rx="1" fill="#7dd3fc" opacity="0.85"/>
      {/* 테이프롤 (오른쪽 위) */}
      <circle cx="25" cy="8" r="5" fill="#93c5fd"/>
      <circle cx="25" cy="8" r="3.5" fill="#bfdbfe"/>
      <circle cx="25" cy="8" r="1.5" fill="#60a5fa"/>
      {/* 테이프 줄 */}
      <line x1="25" y1="13" x2="25" y2="19" stroke="#7dd3fc" strokeWidth="2"/>
      {/* 별 (완성 표시) */}
      <path d="M8 6 L9 9 L12 9 L10 11 L11 14 L8 12 L5 14 L6 11 L4 9 L7 9Z" fill="#fbbf24"/>
    </svg>
  )
}

const ICONS: Record<Factory['type'], (s: number) => JSX.Element> = {
  WA: s => <WaIcon s={s}/>,
  PA: s => <PaIcon s={s}/>,
  PK: s => <PkIcon s={s}/>,
}

export function FactoryTypeIcon({ type, size }: { type: Factory['type']; size: number }) {
  return ICONS[type]?.(size) ?? <WaIcon s={size}/>
}
