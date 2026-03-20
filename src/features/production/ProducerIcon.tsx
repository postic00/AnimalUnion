import type { JSX } from 'react'
import styles from './ProducerIcon.module.css'

function PandaFace({ cx, cy, r = 7.5 }: { cx: number; cy: number; r?: number }) {
  const er  = r * 0.44   // 귀 반지름
  const ep  = r * 0.40   // 눈패치 rx
  const eye = r * 0.30   // 눈 반지름
  return (
    <>
      {/* 귀 — 외곽 밝은 회색, 내부 어두운 회색 */}
      <circle cx={cx - r * 0.82} cy={cy - r * 0.82} r={er}        fill="#888"/>
      <circle cx={cx + r * 0.82} cy={cy - r * 0.82} r={er}        fill="#888"/>
      <circle cx={cx - r * 0.82} cy={cy - r * 0.82} r={er * 0.6}  fill="#444"/>
      <circle cx={cx + r * 0.82} cy={cy - r * 0.82} r={er * 0.6}  fill="#444"/>
      {/* 얼굴 */}
      <circle cx={cx} cy={cy} r={r} fill="#f8fafc" stroke="#1a1a1a" strokeWidth={r * 0.08}/>
      {/* 눈패치 — 타원 회색 */}
      <ellipse cx={cx - r * 0.34} cy={cy - r * 0.12} rx={ep} ry={ep * 0.82} fill="#7a7a7a"/>
      <ellipse cx={cx + r * 0.34} cy={cy - r * 0.12} rx={ep} ry={ep * 0.82} fill="#7a7a7a"/>
      {/* 눈 흰자 */}
      <circle cx={cx - r * 0.34} cy={cy - r * 0.10} r={eye * 0.9} fill="#e8e8e8"/>
      <circle cx={cx + r * 0.34} cy={cy - r * 0.10} r={eye * 0.9} fill="#e8e8e8"/>
      {/* 눈동자 */}
      <circle cx={cx - r * 0.34} cy={cy - r * 0.08} r={eye * 0.65} fill="#1a1a1a"/>
      <circle cx={cx + r * 0.34} cy={cy - r * 0.08} r={eye * 0.65} fill="#1a1a1a"/>
      {/* 파란빛 하이라이트 */}
      <circle cx={cx - r * 0.42} cy={cy - r * 0.18} r={eye * 0.35} fill="#60a5fa" opacity="0.5"/>
      <circle cx={cx + r * 0.26} cy={cy - r * 0.18} r={eye * 0.35} fill="#60a5fa" opacity="0.5"/>
      {/* 흰 반짝이 */}
      <circle cx={cx - r * 0.44} cy={cy - r * 0.22} r={eye * 0.20} fill="#fff" opacity="0.9"/>
      <circle cx={cx + r * 0.24} cy={cy - r * 0.22} r={eye * 0.20} fill="#fff" opacity="0.9"/>
      {/* 코 */}
      <ellipse cx={cx} cy={cy + r * 0.28} rx={r * 0.20} ry={r * 0.14} fill="#444"/>
      {/* 입 */}
      <path d={`M${cx - r*0.18} ${cy + r*0.38} Q${cx} ${cy + r*0.52} ${cx + r*0.18} ${cy + r*0.38}`}
        fill="none" stroke="#888" strokeWidth={r * 0.12} strokeLinecap="round"/>
      {/* 볼터치 */}
      <circle cx={cx - r * 0.65} cy={cy + r * 0.30} r={r * 0.22} fill="#fda4af" opacity="0.5"/>
      <circle cx={cx + r * 0.65} cy={cy + r * 0.30} r={r * 0.22} fill="#fda4af" opacity="0.5"/>
    </>
  )
}

// Grade 1: 삽질 — CSS rotation, pivot (21, 17)
function ShovelPanda({ s }: { s: number }): JSX.Element {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 흙 튀김: frame 3 (60%–80%) */}
      <g className={styles.shovelDirt}>
        <circle cx="24" cy="29" r="1.5" fill="#92400e" opacity="0.75"/>
        <circle cx="27" cy="27" r="1"   fill="#92400e" opacity="0.6"/>
        <circle cx="21" cy="30" r="1"   fill="#92400e" opacity="0.55"/>
      </g>
      <ellipse cx="21" cy="31" rx="6" ry="1.5" fill="#a16207" opacity="0.35"/>
      {/* 삽 자루: CSS rotation */}
      <g className={styles.shovelArm}>
        <rect x="19.5" y="7" width="2.5" height="14" rx="1.2" fill="#92400e"/>
        <path d="M18 20 L23 20 L22.5 27 Q21 29 19.5 27 Z" fill="#9ca3af"/>
        <rect x="17.5" y="19" width="6" height="2" rx="0.5" fill="#6b7280"/>
      </g>
      <ellipse cx="13" cy="27" rx="9" ry="5" fill="#f8fafc"/>
      <ellipse cx="21" cy="20" rx="4.5" ry="2.5" fill="#f8fafc" transform="rotate(-35 21 20)"/>
      <PandaFace cx={13} cy={13} r={10}/>
    </svg>
  )
}

// Grade 2: 풀베기 — CSS rotation, pivot (20, 20)
function ScythePanda({ s }: { s: number }): JSX.Element {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <path d="M1 30 Q2 24 3 30" stroke="#4ade80" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* 풀 (frames 0,1,2,4) */}
      <path className={styles.scytheGrass} d="M5 30 Q7 22 9 30" stroke="#22c55e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* 베인 풀 + 파편 (frame 3) */}
      <g className={styles.scytheCut}>
        <line x1="5" y1="30" x2="10" y2="30" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="6" cy="28" r="1"   fill="#4ade80" opacity="0.7"/>
        <circle cx="9" cy="27" r="0.8" fill="#22c55e" opacity="0.7"/>
      </g>
      <path d="M11 30 Q12 25 13 30" stroke="#4ade80" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* 낫 자루: CSS rotation */}
      <g className={styles.scytheArm}>
        <rect x="18.5" y="8" width="2.5" height="13" rx="1.2" fill="#92400e"/>
        <path d="M15 20 Q24 17 27 8" stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </g>
      <ellipse cx="13" cy="27" rx="9" ry="5" fill="#f8fafc"/>
      <ellipse cx="21" cy="20" rx="4.5" ry="2.5" fill="#f8fafc" transform="rotate(-20 21 20)"/>
      <PandaFace cx={13} cy={13} r={10}/>
    </svg>
  )
}

// Grade 3: 나무흔들기 — CSS rotation, pivot (17, 32)
function TreePanda({ s }: { s: number }): JSX.Element {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 열매: frame 3 (21, 15) */}
      <ellipse className={styles.treeBerry3} cx="21" cy="15" rx="1.8" ry="2.2" fill="#ef4444" opacity="0.9"/>
      {/* 열매: frame 4 (24, 20) */}
      <ellipse className={styles.treeBerry4} cx="24" cy="20" rx="1.8" ry="2.2" fill="#ef4444" opacity="0.9"/>
      {/* 나무: CSS rotation */}
      <g className={styles.treeRotate}>
        <rect x="15" y="12" width="4" height="20" rx="2" fill="#92400e"/>
        <ellipse cx="17" cy="7"   rx="10" ry="7" fill="#4ade80"/>
        <ellipse cx="10" cy="9"   rx="6"  ry="4" fill="#22c55e"/>
        <ellipse cx="24" cy="9"   rx="6"  ry="4" fill="#22c55e"/>
        <ellipse cx="13" cy="5"   rx="2"  ry="2.5" fill="#ef4444"/>
        <ellipse cx="20" cy="6"   rx="1.8" ry="2.2" fill="#ef4444"/>
        <ellipse cx="17" cy="2.5" rx="1.6" ry="2"   fill="#dc2626"/>
      </g>
      <ellipse cx="17" cy="29"   rx="8" ry="4"   fill="#f8fafc"/>
      <ellipse cx="9"   cy="23"  rx="5" ry="2.8" fill="#f8fafc" transform="rotate(-20 9 23)"/>
      <ellipse cx="25"  cy="23"  rx="5" ry="2.8" fill="#f8fafc" transform="rotate(20 25 23)"/>
      <PandaFace cx={17} cy={20} r={9}/>
    </svg>
  )
}

export function ProducerAnimation({ grade, size }: { grade: number; size: number }) {
  if (grade === 2) return <ScythePanda s={size}/>
  if (grade === 3) return <TreePanda s={size}/>
  return <ShovelPanda s={size}/>
}
