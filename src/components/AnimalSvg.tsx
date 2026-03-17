export type AnimalSpecies = 'hamster' | 'cat' | 'dog' | 'robot'

function Hamster({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 귀 */}
      <ellipse cx="8"  cy="10" rx="5.5" ry="5" fill="#f9a8d4"/>
      <ellipse cx="24" cy="10" rx="5.5" ry="5" fill="#f9a8d4"/>
      <ellipse cx="8"  cy="10" rx="3.5" ry="3" fill="#fce7f3"/>
      <ellipse cx="24" cy="10" rx="3.5" ry="3" fill="#fce7f3"/>
      {/* 얼굴 */}
      <ellipse cx="16" cy="18" rx="13" ry="12" fill="#fcd5b0"/>
      {/* 볼 */}
      <ellipse cx="7"  cy="21" rx="5" ry="4" fill="#fda4af" opacity="0.6"/>
      <ellipse cx="25" cy="21" rx="5" ry="4" fill="#fda4af" opacity="0.6"/>
      {/* 눈 */}
      <circle cx="11" cy="15" r="2.5" fill="#1c1917"/>
      <circle cx="21" cy="15" r="2.5" fill="#1c1917"/>
      <circle cx="12" cy="14" r="1"   fill="#fff"/>
      <circle cx="22" cy="14" r="1"   fill="#fff"/>
      {/* 코 */}
      <ellipse cx="16" cy="20" rx="2.5" ry="1.8" fill="#f43f5e"/>
      {/* 입 */}
      <path d="M13 22 Q16 25 19 22" fill="none" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function Cat({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 귀 (삼각형) */}
      <polygon points="6,14 3,3 13,9"  fill="#d4a96a"/>
      <polygon points="26,14 29,3 19,9" fill="#d4a96a"/>
      <polygon points="7,13 5,5 12,9"  fill="#fde68a"/>
      <polygon points="25,13 27,5 20,9" fill="#fde68a"/>
      {/* 얼굴 */}
      <ellipse cx="16" cy="19" rx="13" ry="12" fill="#d4a96a"/>
      {/* 눈 (슬쩍 찡그린) */}
      <ellipse cx="11" cy="16" rx="3" ry="2.5" fill="#1c1917"/>
      <ellipse cx="21" cy="16" rx="3" ry="2.5" fill="#1c1917"/>
      <circle cx="12.2" cy="15" r="1.1" fill="#fff"/>
      <circle cx="22.2" cy="15" r="1.1" fill="#fff"/>
      {/* 동공 (고양이 세로) */}
      <ellipse cx="11" cy="16" rx="1" ry="2" fill="#7c3aed" opacity="0.6"/>
      <ellipse cx="21" cy="16" rx="1" ry="2" fill="#7c3aed" opacity="0.6"/>
      {/* 코 */}
      <path d="M14 20 L16 22 L18 20 Q16 18 14 20Z" fill="#f43f5e"/>
      {/* 수염 */}
      <line x1="3"  y1="20" x2="12" y2="21" stroke="#92400e" strokeWidth="1" strokeLinecap="round"/>
      <line x1="3"  y1="22" x2="12" y2="22" stroke="#92400e" strokeWidth="1" strokeLinecap="round"/>
      <line x1="29" y1="20" x2="20" y2="21" stroke="#92400e" strokeWidth="1" strokeLinecap="round"/>
      <line x1="29" y1="22" x2="20" y2="22" stroke="#92400e" strokeWidth="1" strokeLinecap="round"/>
      {/* 입 */}
      <path d="M13.5 22.5 Q16 25 18.5 22.5" fill="none" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function Dog({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 귀 (처진 귀) */}
      <ellipse cx="6"  cy="16" rx="5" ry="8"  fill="#c8a882"/>
      <ellipse cx="26" cy="16" rx="5" ry="8"  fill="#c8a882"/>
      {/* 얼굴 */}
      <ellipse cx="16" cy="17" rx="13" ry="13" fill="#e8c99a"/>
      {/* 주둥이 */}
      <ellipse cx="16" cy="22" rx="7" ry="5" fill="#d4a96a"/>
      {/* 눈 */}
      <circle cx="11" cy="14" r="3" fill="#1c1917"/>
      <circle cx="21" cy="14" r="3" fill="#1c1917"/>
      <circle cx="12" cy="13" r="1.2" fill="#fff"/>
      <circle cx="22" cy="13" r="1.2" fill="#fff"/>
      {/* 코 */}
      <ellipse cx="16" cy="19" rx="3.5" ry="2.5" fill="#1c1917"/>
      <ellipse cx="15" cy="18.5" rx="1.2" ry="0.8" fill="#44403c" opacity="0.4"/>
      {/* 혀 */}
      <ellipse cx="16" cy="25" rx="3.5" ry="2.5" fill="#f43f5e"/>
      <line x1="16" y1="23" x2="16" y2="27" stroke="#e11d48" strokeWidth="1"/>
    </svg>
  )
}

function Robot({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 안테나 */}
      <rect x="15" y="1" width="2" height="5" rx="1" fill="#64748b"/>
      <circle cx="16" cy="1.5" r="2" fill="#ef4444"/>
      {/* 머리 */}
      <rect x="4" y="7" width="24" height="20" rx="4" fill="#94a3b8"/>
      {/* 눈 (LED) */}
      <rect x="7"  y="12" width="7" height="5" rx="2" fill="#0ea5e9"/>
      <rect x="18" y="12" width="7" height="5" rx="2" fill="#0ea5e9"/>
      <rect x="8.5" y="13.5" width="4" height="2" rx="1" fill="#bfdbfe" opacity="0.8"/>
      <rect x="19.5" y="13.5" width="4" height="2" rx="1" fill="#bfdbfe" opacity="0.8"/>
      {/* 입 (그리드) */}
      <rect x="9" y="20" width="14" height="4" rx="1.5" fill="#475569"/>
      <line x1="12" y1="20" x2="12" y2="24" stroke="#94a3b8" strokeWidth="1"/>
      <line x1="16" y1="20" x2="16" y2="24" stroke="#94a3b8" strokeWidth="1"/>
      <line x1="20" y1="20" x2="20" y2="24" stroke="#94a3b8" strokeWidth="1"/>
      {/* 측면 귀 (볼트) */}
      <circle cx="4"  cy="17" r="2.5" fill="#64748b"/>
      <circle cx="28" cy="17" r="2.5" fill="#64748b"/>
      <circle cx="4"  cy="17" r="1"   fill="#94a3b8"/>
      <circle cx="28" cy="17" r="1"   fill="#94a3b8"/>
    </svg>
  )
}

const SPECIES_COMPONENTS: Record<AnimalSpecies, (s: number) => JSX.Element> = {
  hamster: s => <Hamster s={s}/>,
  cat:     s => <Cat s={s}/>,
  dog:     s => <Dog s={s}/>,
  robot:   s => <Robot s={s}/>,
}

export function AnimalSvg({ species, size }: { species: AnimalSpecies; size: number }) {
  return SPECIES_COMPONENTS[species]?.(size) ?? <Robot s={size}/>
}

export function getSpeciesFromId(animalId: string | null): AnimalSpecies {
  if (!animalId) return 'robot'
  if (animalId.startsWith('hamster')) return 'hamster'
  if (animalId.startsWith('cat')) return 'cat'
  return 'dog'
}
