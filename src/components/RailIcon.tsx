/** 레일 셀 SVG: 흐르는 물 + 사탕 가드레일 / RS=물레방아 / RE=철가방 */

/** 수평 사탕 가드레일 */
function HCandy({ y, h = 4 }: { y: number; h?: number }) {
  return <>
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} x={i * 4 - 2} y={y} width={4} height={h}
        fill={i % 2 === 0 ? '#ef4444' : '#fff7f7'} opacity={0.9}/>
    ))}
  </>
}

/** 수직 사탕 가드레일 */
function VCandy({ x, w = 4 }: { x: number; w?: number }) {
  return <>
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} x={x} y={i * 4 - 2} width={w} height={4}
        fill={i % 2 === 0 ? '#ef4444' : '#fff7f7'} opacity={0.9}/>
    ))}
  </>
}

/** 수평 물결 */
function HWaves() {
  return <>
    <path d="M2 12 Q6 9 10 12 Q14 15 18 12 Q22 9 26 12 Q29 14 30 12"
      stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M2 19 Q6 16 10 19 Q14 22 18 19 Q22 16 26 19 Q29 21 30 19"
      stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </>
}

/** 수직 물결 */
function VWaves() {
  return <>
    <path d="M12 2 Q9 6 12 10 Q15 14 12 18 Q9 22 12 26 Q14 29 12 30"
      stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M19 2 Q16 6 19 10 Q22 14 19 18 Q16 22 19 26 Q21 29 19 30"
      stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </>
}

/** 수평 레일 (RR=오른쪽, RL=왼쪽) */
function HRailIcon({ s, dir }: { s: number; dir: 'R' | 'L' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 물 배경 */}
      <rect width={32} height={32} fill="#bfdbfe"/>
      <HWaves/>
      {/* 사탕 가드레일 */}
      <HCandy y={0}/>
      <HCandy y={28}/>
      {/* 방향 화살표 */}
      {dir === 'R'
        ? <path d="M10 16 L20 16 M16 11 L22 16 L16 21" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        : <path d="M22 16 L12 16 M16 11 L10 16 L16 21" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      }
    </svg>
  )
}

/** 수직 레일 (RD=아래, RU=위) */
function VRailIcon({ s, dir }: { s: number; dir: 'D' | 'U' }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 물 배경 */}
      <rect width={32} height={32} fill="#bfdbfe"/>
      <VWaves/>
      {/* 사탕 가드레일 */}
      <VCandy x={0}/>
      <VCandy x={28}/>
      {/* 방향 화살표 */}
      {dir === 'D'
        ? <path d="M16 10 L16 20 M11 16 L16 22 L21 16" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        : <path d="M16 22 L16 12 M11 16 L16 10 L21 16" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      }
    </svg>
  )
}

/** RS: 물레방아 */
function RSIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 물 배경 */}
      <rect width={32} height={32} fill="#bfdbfe"/>
      {/* 물결 */}
      <path d="M2 24 Q6 21 10 24 Q14 27 18 24 Q22 21 26 24 Q29 26 30 24"
        stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* 물레방아 프레임 */}
      <rect x="4" y="14" width="4" height="14" rx="1.5" fill="#92400e"/>
      <rect x="24" y="14" width="4" height="14" rx="1.5" fill="#92400e"/>
      <rect x="4" y="26" width="24" height="4" rx="1.5" fill="#78350f"/>
      {/* 바퀴 */}
      <circle cx="16" cy="17" r="10" fill="none" stroke="#92400e" strokeWidth="2.5"/>
      <circle cx="16" cy="17" r="3" fill="#a16207"/>
      {/* 바퀴 날개 6개 */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const ix = 16 + 3.5 * Math.cos(rad)
        const iy = 17 + 3.5 * Math.sin(rad)
        const ox = 16 + 9 * Math.cos(rad)
        const oy = 17 + 9 * Math.sin(rad)
        const px = 16 + 9.5 * Math.cos(rad + 0.4)
        const py = 17 + 9.5 * Math.sin(rad + 0.4)
        const qx = 16 + 9.5 * Math.cos(rad - 0.4)
        const qy = 17 + 9.5 * Math.sin(rad - 0.4)
        return (
          <g key={i}>
            <line x1={ix} y1={iy} x2={ox} y2={oy} stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
            <path d={`M${px} ${py} L${ox} ${oy} L${qx} ${qy}`} fill="#a16207" stroke="#92400e" strokeWidth="1"/>
          </g>
        )
      })}
      {/* 물 튀김 */}
      <circle cx="8" cy="26" r="1.2" fill="#93c5fd" opacity="0.8"/>
      <circle cx="23" cy="25" r="1" fill="#93c5fd" opacity="0.8"/>
      <circle cx="16" cy="28" r="1.5" fill="#93c5fd" opacity="0.7"/>
    </svg>
  )
}

/** 코너 레일: top+right 가드레일 (RDR, RLR) */
function CornerTRIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <rect width={32} height={32} fill="#bfdbfe"/>
      {/* 물 곡선 흐름 */}
      <path d="M0 20 Q12 20 20 28 L20 32 L0 32 Z" fill="#93c5fd" opacity="0.5"/>
      <path d="M4 18 Q14 18 22 28" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M4 24 Q10 24 16 30" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* top 가드레일 */}
      <HCandy y={0}/>
      {/* right 가드레일 */}
      <VCandy x={28}/>
    </svg>
  )
}

/** 코너 레일: top+left 가드레일 (RDL) */
function CornerTLIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <rect width={32} height={32} fill="#bfdbfe"/>
      {/* 물 곡선 흐름 */}
      <path d="M32 20 Q20 20 12 28 L12 32 L32 32 Z" fill="#93c5fd" opacity="0.5"/>
      <path d="M28 18 Q18 18 10 28" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M28 24 Q22 24 16 30" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* top 가드레일 */}
      <HCandy y={0}/>
      {/* left 가드레일 */}
      <VCandy x={0}/>
    </svg>
  )
}

/** 코너 레일: bottom+left 가드레일 (RRL) */
function CornerBLIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <rect width={32} height={32} fill="#bfdbfe"/>
      {/* 물 곡선 흐름 */}
      <path d="M32 12 Q20 12 12 4 L12 0 L32 0 Z" fill="#93c5fd" opacity="0.5"/>
      <path d="M28 14 Q18 14 10 4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M28 8 Q22 8 16 2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* bottom 가드레일 */}
      <HCandy y={28}/>
      {/* left 가드레일 */}
      <VCandy x={0}/>
    </svg>
  )
}

/** 코너 레일: bottom+right 가드레일 (RLR) */
function CornerBRIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <rect width={32} height={32} fill="#bfdbfe"/>
      {/* 물 곡선 흐름 */}
      <path d="M0 12 Q12 12 20 4 L20 0 L0 0 Z" fill="#93c5fd" opacity="0.5"/>
      <path d="M4 14 Q14 14 22 4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M4 8 Q10 8 16 2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* bottom 가드레일 */}
      <HCandy y={28}/>
      {/* right 가드레일 */}
      <VCandy x={28}/>
    </svg>
  )
}

/** RE: 철가방 */
function REIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 가방 본체 */}
      <rect x="3" y="11" width="26" height="18" rx="3" fill="#374151"/>
      {/* 금속 광택 */}
      <rect x="3" y="11" width="26" height="7" rx="3" fill="#4b5563"/>
      <rect x="3" y="15" width="26" height="3" fill="#4b5563"/>
      {/* 경계선 */}
      <rect x="3" y="19" width="26" height="1.5" fill="#6b7280"/>
      {/* 손잡이 */}
      <path d="M11 11 Q11 5 16 5 Q21 5 21 11" fill="none" stroke="#6b7280" strokeWidth="3" strokeLinecap="round"/>
      <path d="M11 11 Q11 6.5 16 6.5 Q21 6.5 21 11" fill="none" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round"/>
      {/* 잠금장치 */}
      <rect x="13" y="18" width="6" height="5" rx="1.5" fill="#d1d5db"/>
      <rect x="14.5" y="20" width="3" height="2" rx="0.5" fill="#9ca3af"/>
      {/* 리벳 */}
      <circle cx="6" cy="14" r="1.2" fill="#9ca3af"/>
      <circle cx="26" cy="14" r="1.2" fill="#9ca3af"/>
      <circle cx="6" cy="25" r="1.2" fill="#9ca3af"/>
      <circle cx="26" cy="25" r="1.2" fill="#9ca3af"/>
      {/* 광택 하이라이트 */}
      <rect x="5" y="12" width="8" height="2" rx="1" fill="#6b7280" opacity="0.5"/>
    </svg>
  )
}

export function RailIcon({ type, size }: { type: string; size: number }) {
  switch (type) {
    case 'RRN':  return <HRailIcon s={size} dir="R"/>
    case 'RLN':  return <HRailIcon s={size} dir="L"/>
    case 'RDN':  return <VRailIcon s={size} dir="D"/>
    case 'RUN':  return <VRailIcon s={size} dir="U"/>
    case 'RS':  return <RSIcon s={size}/>
    case 'RE':  return <REIcon s={size}/>
    case 'RDR': return <CornerTRIcon s={size}/>
    case 'RLR': return <CornerBRIcon s={size}/>
    case 'RDL': return <CornerTLIcon s={size}/>
    case 'RRL': return <CornerBLIcon s={size}/>
    default:    return null
  }
}
