import type { JSX } from 'react'

export type AnimalSpecies = 'hamster' | 'cat' | 'dog' | 'robot'

const SW = 3.5
const SC = '#1a1a1a'

const BLINK_STYLE = `
  @keyframes an-blink {
    0%, 88%, 100% { transform: scaleY(1); }
    93%           { transform: scaleY(0.07); }
  }
  @keyframes an-bob {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-2.5px); }
  }
  .an-eye   { transform-box: fill-box; transform-origin: center; animation: an-blink 4.5s ease-in-out infinite; }
  .an-eye-r { animation-delay: 0.05s; }
  .an-bob   { animation: an-bob 2.4s ease-in-out infinite; }
`

function Hamster({ s }: { s: number }) {
  return (
    <svg width={s} height={Math.round(s * 100 / 120)} viewBox="0 0 120 100" strokeLinecap="round" strokeLinejoin="round">
      <style>{BLINK_STYLE}</style>
      <g className="an-bob">
        {/* 귀 */}
        <circle cx="20" cy="20" r="12" fill="#fde9b8" stroke={SC} strokeWidth={SW}/>
        <ellipse cx="20" cy="22" rx="6.5" ry="7.5" fill="#ffb8c0"/>
        <circle cx="100" cy="20" r="12" fill="#fde9b8" stroke={SC} strokeWidth={SW}/>
        <ellipse cx="100" cy="22" rx="6.5" ry="7.5" fill="#ffb8c0"/>
        {/* 몸통 */}
        <ellipse cx="60" cy="55" rx="52" ry="41" fill="#fde9b8" stroke={SC} strokeWidth={SW}/>
        {/* 눈 왼쪽 */}
        <g className="an-eye">
          <circle cx="40" cy="44" r="11" fill={SC}/>
          <circle cx="36" cy="40" r="3.5" fill="#fff"/>
        </g>
        {/* 눈 오른쪽 */}
        <g className="an-eye an-eye-r">
          <circle cx="80" cy="44" r="11" fill={SC}/>
          <circle cx="76" cy="40" r="3.5" fill="#fff"/>
        </g>
        {/* 코 */}
        <ellipse cx="60" cy="56" rx="4.5" ry="3.5" fill={SC}/>
        {/* 입 */}
        <path d="M60 59 Q53 64 47 62" fill="none" stroke={SC} strokeWidth="3"/>
        <path d="M60 59 Q67 64 73 62" fill="none" stroke={SC} strokeWidth="3"/>
        {/* 왼팔 */}
        <path d="M16 68 Q24 76 33 73" fill="none" stroke={SC} strokeWidth={SW}/>
        <path d="M31 75 Q32 83 26 87" fill="none" stroke={SC} strokeWidth="2.5"/>
        <path d="M34 74 Q36 82 31 87" fill="none" stroke={SC} strokeWidth="2.5"/>
        {/* 오른팔 */}
        <path d="M104 68 Q96 76 87 73" fill="none" stroke={SC} strokeWidth={SW}/>
        <path d="M89 75 Q88 83 94 87" fill="none" stroke={SC} strokeWidth="2.5"/>
        <path d="M86 74 Q84 82 89 87" fill="none" stroke={SC} strokeWidth="2.5"/>
        {/* 발 */}
        <ellipse cx="40" cy="93" rx="13" ry="6.5" fill="#fde9b8" stroke={SC} strokeWidth={SW}/>
        <ellipse cx="80" cy="93" rx="13" ry="6.5" fill="#fde9b8" stroke={SC} strokeWidth={SW}/>
      </g>
    </svg>
  )
}

function Cat({ s }: { s: number }) {
  return (
    <svg width={s} height={Math.round(s * 100 / 120)} viewBox="0 0 120 100" strokeLinecap="round" strokeLinejoin="round">
      <style>{BLINK_STYLE}</style>
      <g className="an-bob">
        {/* 귀 */}
        <path d="M17 42 L10 18 L34 30 Z" fill="#f0f0f0" stroke={SC} strokeWidth={SW}/>
        <path d="M103 42 L110 18 L86 30 Z" fill="#f0f0f0" stroke={SC} strokeWidth={SW}/>
        <path d="M19 40 L13 22 L32 31 Z" fill="#ffb8c0"/>
        <path d="M101 40 L107 22 L88 31 Z" fill="#ffb8c0"/>
        {/* 몸통 */}
        <ellipse cx="60" cy="57" rx="52" ry="41" fill="#f8f8f8" stroke={SC} strokeWidth={SW}/>
        {/* 볼 */}
        <ellipse cx="30" cy="62" rx="9" ry="6" fill="#ffb8c0" opacity="0.7"/>
        <ellipse cx="90" cy="62" rx="9" ry="6" fill="#ffb8c0" opacity="0.7"/>
        {/* 수염 */}
        <line x1="4"   y1="54" x2="28" y2="58" stroke={SC} strokeWidth="2.8"/>
        <line x1="4"   y1="61" x2="28" y2="61" stroke={SC} strokeWidth="2.8"/>
        <line x1="4"   y1="68" x2="28" y2="65" stroke={SC} strokeWidth="2.8"/>
        <line x1="116" y1="54" x2="92" y2="58" stroke={SC} strokeWidth="2.8"/>
        <line x1="116" y1="61" x2="92" y2="61" stroke={SC} strokeWidth="2.8"/>
        <line x1="116" y1="68" x2="92" y2="65" stroke={SC} strokeWidth="2.8"/>
        {/* 눈 왼쪽 */}
        <g className="an-eye">
          <circle cx="40" cy="48" r="11" fill={SC}/>
          <circle cx="36" cy="44" r="3.5" fill="#fff"/>
        </g>
        {/* 눈 오른쪽 */}
        <g className="an-eye an-eye-r">
          <circle cx="80" cy="48" r="11" fill={SC}/>
          <circle cx="76" cy="44" r="3.5" fill="#fff"/>
        </g>
        {/* 코 */}
        <path d="M56 59 L60 56 L64 59 Q60 62 56 59Z" fill={SC}/>
        {/* 입 */}
        <path d="M60 62 Q53 67 49 65" fill="none" stroke={SC} strokeWidth="3"/>
        <path d="M60 62 Q67 67 71 65" fill="none" stroke={SC} strokeWidth="3"/>
        {/* 왼팔 */}
        <path d="M15 72 Q23 80 33 77" fill="none" stroke={SC} strokeWidth={SW}/>
        <path d="M31 79 Q32 87 26 91" fill="none" stroke={SC} strokeWidth="2.5"/>
        <path d="M34 78 Q36 86 31 91" fill="none" stroke={SC} strokeWidth="2.5"/>
        {/* 오른팔 */}
        <path d="M105 72 Q97 80 87 77" fill="none" stroke={SC} strokeWidth={SW}/>
        <path d="M89 79 Q88 87 94 91" fill="none" stroke={SC} strokeWidth="2.5"/>
        <path d="M86 78 Q84 86 89 91" fill="none" stroke={SC} strokeWidth="2.5"/>
        {/* 발 */}
        <ellipse cx="40" cy="94" rx="13" ry="6" fill="#f8f8f8" stroke={SC} strokeWidth={SW}/>
        <ellipse cx="80" cy="94" rx="13" ry="6" fill="#f8f8f8" stroke={SC} strokeWidth={SW}/>
      </g>
    </svg>
  )
}

function Dog({ s }: { s: number }) {
  return (
    <svg width={s} height={Math.round(s * 100 / 120)} viewBox="0 0 120 100" strokeLinecap="round" strokeLinejoin="round">
      <style>{BLINK_STYLE}</style>
      <g className="an-bob">
        {/* 귀 */}
        <path d="M10 38 Q8 16 22 20 Q32 22 30 40 Z" fill="#c0c0c0" stroke={SC} strokeWidth={SW}/>
        <path d="M110 38 Q112 16 98 20 Q88 22 90 40 Z" fill="#c0c0c0" stroke={SC} strokeWidth={SW}/>
        <line x1="14" y1="24" x2="22" y2="36" stroke={SC} strokeWidth="2.5"/>
        <line x1="106" y1="24" x2="98" y2="36" stroke={SC} strokeWidth="2.5"/>
        {/* 몸통 */}
        <ellipse cx="60" cy="56" rx="52" ry="41" fill="#cccccc" stroke={SC} strokeWidth={SW}/>
        {/* 왼팔 (튀어나온) */}
        <path d="M4 58 Q3 72 13 78 Q22 82 26 74 Q18 68 16 58 Z" fill="#cccccc" stroke={SC} strokeWidth={SW}/>
        <path d="M8 76 Q10 84 6 88" fill="none" stroke={SC} strokeWidth="2.5"/>
        <path d="M13 78 Q16 86 12 90" fill="none" stroke={SC} strokeWidth="2.5"/>
        {/* 오른팔 (튀어나온) */}
        <path d="M116 58 Q117 72 107 78 Q98 82 94 74 Q102 68 104 58 Z" fill="#cccccc" stroke={SC} strokeWidth={SW}/>
        <path d="M112 76 Q110 84 114 88" fill="none" stroke={SC} strokeWidth="2.5"/>
        <path d="M107 78 Q104 86 108 90" fill="none" stroke={SC} strokeWidth="2.5"/>
        {/* 눈 왼쪽 */}
        <g className="an-eye">
          <circle cx="40" cy="46" r="11" fill={SC}/>
          <circle cx="36" cy="42" r="3.5" fill="#fff"/>
        </g>
        {/* 눈 오른쪽 */}
        <g className="an-eye an-eye-r">
          <circle cx="80" cy="46" r="11" fill={SC}/>
          <circle cx="76" cy="42" r="3.5" fill="#fff"/>
        </g>
        {/* 코 */}
        <path d="M54 58 Q57 55 60 55 Q63 55 66 58 Q63 61 60 61 Q57 61 54 58Z" fill={SC}/>
        {/* 입 */}
        <path d="M60 61 Q53 66 49 64" fill="none" stroke={SC} strokeWidth="3"/>
        <path d="M60 61 Q67 66 71 64" fill="none" stroke={SC} strokeWidth="3"/>
        {/* 발 (3개) */}
        <ellipse cx="37" cy="94" rx="12" ry="6" fill="#cccccc" stroke={SC} strokeWidth={SW}/>
        <ellipse cx="60" cy="96" rx="12" ry="6" fill="#cccccc" stroke={SC} strokeWidth={SW}/>
        <ellipse cx="83" cy="94" rx="12" ry="6" fill="#cccccc" stroke={SC} strokeWidth={SW}/>
      </g>
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
  if (animalId.startsWith('dog')) return 'dog'
  return 'robot'
}
