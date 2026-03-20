import type { JSX } from 'react'

export type AnimalSpecies = 'hamster' | 'cat' | 'dog' | 'robot'

const SW = 3.5
const SC = '#1a1a1a'

function Hamster({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" strokeLinecap="round" strokeLinejoin="round">
      {/* 귀 */}
      <circle cx="23" cy="22" r="12" fill="#fde9b8" stroke={SC} strokeWidth={SW}/>
      <ellipse cx="23" cy="24" rx="6.5" ry="7.5" fill="#ffb8c0"/>
      <circle cx="77" cy="22" r="12" fill="#fde9b8" stroke={SC} strokeWidth={SW}/>
      <ellipse cx="77" cy="24" rx="6.5" ry="7.5" fill="#ffb8c0"/>
      {/* 몸통 */}
      <circle cx="50" cy="55" r="41" fill="#fde9b8" stroke={SC} strokeWidth={SW}/>
      {/* 눈 */}
      <circle cx="35" cy="44" r="9" fill={SC}/>
      <circle cx="65" cy="44" r="9" fill={SC}/>
      <circle cx="31" cy="40" r="3" fill="#fff"/>
      <circle cx="61" cy="40" r="3" fill="#fff"/>
      {/* 코 */}
      <ellipse cx="50" cy="56" rx="4.5" ry="3.5" fill={SC}/>
      {/* 입 */}
      <path d="M50 59 Q44 64 39 62" fill="none" stroke={SC} strokeWidth="3"/>
      <path d="M50 59 Q56 64 61 62" fill="none" stroke={SC} strokeWidth="3"/>
      {/* 왼팔 */}
      <path d="M19 68 Q26 76 35 73" fill="none" stroke={SC} strokeWidth={SW}/>
      <path d="M33 75 Q34 83 28 87" fill="none" stroke={SC} strokeWidth="2.5"/>
      <path d="M36 74 Q38 82 33 87" fill="none" stroke={SC} strokeWidth="2.5"/>
      {/* 오른팔 */}
      <path d="M81 68 Q74 76 65 73" fill="none" stroke={SC} strokeWidth={SW}/>
      <path d="M67 75 Q66 83 72 87" fill="none" stroke={SC} strokeWidth="2.5"/>
      <path d="M64 74 Q62 82 67 87" fill="none" stroke={SC} strokeWidth="2.5"/>
      {/* 발 */}
      <ellipse cx="33" cy="93" rx="13" ry="6.5" fill="#fde9b8" stroke={SC} strokeWidth={SW}/>
      <ellipse cx="67" cy="93" rx="13" ry="6.5" fill="#fde9b8" stroke={SC} strokeWidth={SW}/>
    </svg>
  )
}

function Cat({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" strokeLinecap="round" strokeLinejoin="round">
      {/* 귀 */}
      <path d="M20 40 L13 16 L36 28 Z" fill="#f0f0f0" stroke={SC} strokeWidth={SW}/>
      <path d="M80 40 L87 16 L64 28 Z" fill="#f0f0f0" stroke={SC} strokeWidth={SW}/>
      <path d="M22 38 L16 20 L34 29 Z" fill="#ffb8c0"/>
      <path d="M78 38 L84 20 L66 29 Z" fill="#ffb8c0"/>
      {/* 몸통 */}
      <circle cx="50" cy="57" r="41" fill="#f8f8f8" stroke={SC} strokeWidth={SW}/>
      {/* 볼 */}
      <ellipse cx="28" cy="62" rx="9" ry="6" fill="#ffb8c0" opacity="0.7"/>
      <ellipse cx="72" cy="62" rx="9" ry="6" fill="#ffb8c0" opacity="0.7"/>
      {/* 수염 */}
      <line x1="4"  y1="54" x2="27" y2="58" stroke={SC} strokeWidth="2.8"/>
      <line x1="4"  y1="61" x2="27" y2="61" stroke={SC} strokeWidth="2.8"/>
      <line x1="4"  y1="68" x2="27" y2="65" stroke={SC} strokeWidth="2.8"/>
      <line x1="96" y1="54" x2="73" y2="58" stroke={SC} strokeWidth="2.8"/>
      <line x1="96" y1="61" x2="73" y2="61" stroke={SC} strokeWidth="2.8"/>
      <line x1="96" y1="68" x2="73" y2="65" stroke={SC} strokeWidth="2.8"/>
      {/* 눈 */}
      <circle cx="35" cy="48" r="9" fill={SC}/>
      <circle cx="65" cy="48" r="9" fill={SC}/>
      <circle cx="31" cy="44" r="3" fill="#fff"/>
      <circle cx="61" cy="44" r="3" fill="#fff"/>
      {/* 코 */}
      <path d="M46 59 L50 56 L54 59 Q50 62 46 59Z" fill={SC}/>
      {/* 입 */}
      <path d="M50 62 Q44 67 40 65" fill="none" stroke={SC} strokeWidth="3"/>
      <path d="M50 62 Q56 67 60 65" fill="none" stroke={SC} strokeWidth="3"/>
      {/* 왼팔 */}
      <path d="M17 72 Q25 80 34 77" fill="none" stroke={SC} strokeWidth={SW}/>
      <path d="M32 79 Q33 87 27 91" fill="none" stroke={SC} strokeWidth="2.5"/>
      <path d="M35 78 Q37 86 32 91" fill="none" stroke={SC} strokeWidth="2.5"/>
      {/* 오른팔 */}
      <path d="M83 72 Q75 80 66 77" fill="none" stroke={SC} strokeWidth={SW}/>
      <path d="M68 79 Q67 87 73 91" fill="none" stroke={SC} strokeWidth="2.5"/>
      <path d="M65 78 Q63 86 68 91" fill="none" stroke={SC} strokeWidth="2.5"/>
      {/* 발 */}
      <ellipse cx="33" cy="94" rx="13" ry="6" fill="#f8f8f8" stroke={SC} strokeWidth={SW}/>
      <ellipse cx="67" cy="94" rx="13" ry="6" fill="#f8f8f8" stroke={SC} strokeWidth={SW}/>
    </svg>
  )
}

function Dog({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" strokeLinecap="round" strokeLinejoin="round">
      {/* 귀 */}
      <path d="M16 36 Q14 16 28 20 Q36 22 34 38 Z" fill="#c0c0c0" stroke={SC} strokeWidth={SW}/>
      <path d="M84 36 Q86 16 72 20 Q64 22 66 38 Z" fill="#c0c0c0" stroke={SC} strokeWidth={SW}/>
      <line x1="20" y1="24" x2="26" y2="34" stroke={SC} strokeWidth="2.5"/>
      <line x1="80" y1="24" x2="74" y2="34" stroke={SC} strokeWidth="2.5"/>
      {/* 몸통 */}
      <circle cx="50" cy="56" r="41" fill="#cccccc" stroke={SC} strokeWidth={SW}/>
      {/* 왼팔 (튀어나온) */}
      <path d="M9 58 Q8 72 18 78 Q26 82 30 74 Q22 68 20 58 Z" fill="#cccccc" stroke={SC} strokeWidth={SW}/>
      <path d="M13 76 Q15 84 11 88" fill="none" stroke={SC} strokeWidth="2.5"/>
      <path d="M18 78 Q21 86 17 90" fill="none" stroke={SC} strokeWidth="2.5"/>
      {/* 오른팔 (튀어나온) */}
      <path d="M91 58 Q92 72 82 78 Q74 82 70 74 Q78 68 80 58 Z" fill="#cccccc" stroke={SC} strokeWidth={SW}/>
      <path d="M87 76 Q85 84 89 88" fill="none" stroke={SC} strokeWidth="2.5"/>
      <path d="M82 78 Q79 86 83 90" fill="none" stroke={SC} strokeWidth="2.5"/>
      {/* 눈 */}
      <circle cx="35" cy="46" r="9" fill={SC}/>
      <circle cx="65" cy="46" r="9" fill={SC}/>
      <circle cx="31" cy="42" r="3" fill="#fff"/>
      <circle cx="61" cy="42" r="3" fill="#fff"/>
      {/* 코 */}
      <path d="M44 58 Q47 55 50 55 Q53 55 56 58 Q53 61 50 61 Q47 61 44 58Z" fill={SC}/>
      {/* 입 */}
      <path d="M50 61 Q44 66 40 64" fill="none" stroke={SC} strokeWidth="3"/>
      <path d="M50 61 Q56 66 60 64" fill="none" stroke={SC} strokeWidth="3"/>
      {/* 발 (3개) */}
      <ellipse cx="28" cy="94" rx="12" ry="6" fill="#cccccc" stroke={SC} strokeWidth={SW}/>
      <ellipse cx="50" cy="96" rx="12" ry="6" fill="#cccccc" stroke={SC} strokeWidth={SW}/>
      <ellipse cx="72" cy="94" rx="12" ry="6" fill="#cccccc" stroke={SC} strokeWidth={SW}/>
    </svg>
  )
}

function Robot({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 105" strokeLinecap="round" strokeLinejoin="round">
      {/* 귀 피스 (흰색, 머리 뒤) */}
      <rect x="2"  y="12" width="16" height="24" rx="6" fill="#e5e7eb" stroke={SC} strokeWidth={SW}/>
      <rect x="82" y="12" width="16" height="24" rx="6" fill="#e5e7eb" stroke={SC} strokeWidth={SW}/>
      {/* 머리 (돔) */}
      <rect x="14" y="6" width="72" height="56" rx="24" fill="#fef3c7" stroke={SC} strokeWidth={SW}/>
      {/* 바이저 (다크 스크린) */}
      <rect x="18" y="20" width="64" height="30" rx="13" fill="#4b5563" stroke={SC} strokeWidth={SW}/>
      {/* 볼 */}
      <ellipse cx="29" cy="38" rx="7" ry="5" fill="#ffb8c0" opacity="0.85"/>
      <ellipse cx="71" cy="38" rx="7" ry="5" fill="#ffb8c0" opacity="0.85"/>
      {/* 미소 */}
      <path d="M43 42 Q50 48 57 42" fill="none" stroke="#9ca3af" strokeWidth="2.5"/>
      {/* 눈 */}
      <rect x="28" y="24" width="8" height="10" rx="3" fill="#1a1a1a"/>
      <rect x="64" y="24" width="8" height="10" rx="3" fill="#1a1a1a"/>
      {/* 목 */}
      <rect x="41" y="62" width="18" height="9" rx="4" fill="#e5e7eb" stroke={SC} strokeWidth="2.5"/>
      {/* 팔 (보라) */}
      <rect x="2"  y="70" width="16" height="26" rx="7" fill="#a78bfa" stroke={SC} strokeWidth={SW}/>
      <rect x="82" y="70" width="16" height="26" rx="7" fill="#a78bfa" stroke={SC} strokeWidth={SW}/>
      {/* 몸통 */}
      <rect x="12" y="70" width="76" height="32" rx="16" fill="#fef3c7" stroke={SC} strokeWidth={SW}/>
      {/* 몸통 패널 */}
      <rect x="18" y="76" width="64" height="18" rx="8" fill="#374151" stroke={SC} strokeWidth="2.5"/>
      {/* 핑크 스트립 */}
      <rect x="22" y="80" width="56" height="9" rx="4.5" fill="#fb7185"/>
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

// eslint-disable-next-line react-refresh/only-export-components
export function getSpeciesFromId(animalId: string | null): AnimalSpecies {
  if (!animalId) return 'robot'
  if (animalId.startsWith('hamster')) return 'hamster'
  if (animalId.startsWith('cat')) return 'cat'
  return 'dog'
}
