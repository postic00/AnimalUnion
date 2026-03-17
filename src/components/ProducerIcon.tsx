import { useEffect, useState } from 'react'

const FRAME_MS = 220

function PandaFace({ cx, cy, r = 7.5 }: { cx: number; cy: number; r?: number }) {
  const er = r * 0.42
  const ep = r * 0.36
  return (
    <>
      <circle cx={cx - r * 0.85} cy={cy - r * 0.85} r={er} fill="#1c1917"/>
      <circle cx={cx + r * 0.85} cy={cy - r * 0.85} r={er} fill="#1c1917"/>
      <circle cx={cx} cy={cy} r={r} fill="#f8fafc"/>
      <ellipse cx={cx - r * 0.35} cy={cy - r * 0.15} rx={ep} ry={ep * 0.85} fill="#1c1917"/>
      <ellipse cx={cx + r * 0.35} cy={cy - r * 0.15} rx={ep} ry={ep * 0.85} fill="#1c1917"/>
      <circle cx={cx - r * 0.35} cy={cy - r * 0.15} r={ep * 0.5} fill="#f8fafc"/>
      <circle cx={cx + r * 0.35} cy={cy - r * 0.15} r={ep * 0.5} fill="#f8fafc"/>
      <circle cx={cx - r * 0.28} cy={cy - r * 0.12} r={ep * 0.25} fill="#1c1917"/>
      <circle cx={cx + r * 0.28} cy={cy - r * 0.12} r={ep * 0.25} fill="#1c1917"/>
      <ellipse cx={cx} cy={cy + r * 0.3} rx={r * 0.22} ry={r * 0.15} fill="#374151"/>
      <circle cx={cx - r * 0.65} cy={cy + r * 0.25} r={r * 0.25} fill="#fda4af" opacity="0.45"/>
      <circle cx={cx + r * 0.65} cy={cy + r * 0.25} r={r * 0.25} fill="#fda4af" opacity="0.45"/>
    </>
  )
}

// Grade 1: 삽질
const SHOVEL_ROTS = [-50, -25, 5, 10, -35]
function ShovelPanda(s: number, frame: number): JSX.Element {
  const rot = SHOVEL_ROTS[frame]
  const showDirt = frame === 3
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {showDirt && <>
        <circle cx="24" cy="29" r="1.5" fill="#92400e" opacity="0.75"/>
        <circle cx="27" cy="27" r="1" fill="#92400e" opacity="0.6"/>
        <circle cx="21" cy="30" r="1" fill="#92400e" opacity="0.55"/>
      </>}
      <ellipse cx="21" cy="31" rx="6" ry="1.5" fill="#a16207" opacity="0.35"/>
      <g transform={`rotate(${rot}, 21, 17)`}>
        <rect x="19.5" y="7" width="2.5" height="14" rx="1.2" fill="#92400e"/>
        <path d="M18 20 L23 20 L22.5 27 Q21 29 19.5 27 Z" fill="#9ca3af"/>
        <rect x="17.5" y="19" width="6" height="2" rx="0.5" fill="#6b7280"/>
      </g>
      <ellipse cx="13" cy="25" rx="9" ry="6" fill="#f8fafc"/>
      <ellipse cx="20" cy="19" rx="4.5" ry="2.5" fill="#f8fafc" transform="rotate(-35 20 19)"/>
      <PandaFace cx={13} cy={14} r={8}/>
    </svg>
  )
}

// Grade 2: 풀베기
const SCYTHE_ROTS = [25, 8, -12, -22, 12]
function ScythePanda(s: number, frame: number): JSX.Element {
  const rot = SCYTHE_ROTS[frame]
  const cutting = frame === 3
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <path d="M1 30 Q2 24 3 30" stroke="#4ade80" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {cutting
        ? <line x1="5" y1="30" x2="10" y2="30" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
        : <path d="M5 30 Q7 22 9 30" stroke="#22c55e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      }
      {cutting && <circle cx="6" cy="28" r="1" fill="#4ade80" opacity="0.7"/>}
      {cutting && <circle cx="9" cy="27" r="0.8" fill="#22c55e" opacity="0.7"/>}
      <path d="M11 30 Q12 25 13 30" stroke="#4ade80" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <g transform={`rotate(${rot}, 20, 20)`}>
        <rect x="18.5" y="8" width="2.5" height="13" rx="1.2" fill="#92400e"/>
        <path d="M15 20 Q24 17 27 8" stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </g>
      <ellipse cx="13" cy="25" rx="9" ry="6" fill="#f8fafc"/>
      <ellipse cx="20" cy="20" rx="4.5" ry="2.5" fill="#f8fafc" transform="rotate(-20 20 20)"/>
      <PandaFace cx={13} cy={14} r={8}/>
    </svg>
  )
}

// Grade 3: 나무흔들기
const TREE_ROTS = [0, -9, 9, -13, 5]
function TreePanda(s: number, frame: number): JSX.Element {
  const treeRot = TREE_ROTS[frame]
  const fallingBerry = frame >= 3
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {fallingBerry && (
        <ellipse cx={frame === 3 ? 21 : 24} cy={frame === 3 ? 15 : 20} rx="1.8" ry="2.2" fill="#ef4444" opacity="0.9"/>
      )}
      <g transform={`rotate(${treeRot}, 17, 32)`}>
        <rect x="15" y="12" width="4" height="20" rx="2" fill="#92400e"/>
        <ellipse cx="17" cy="7" rx="10" ry="7" fill="#4ade80"/>
        <ellipse cx="10" cy="9" rx="6" ry="4" fill="#22c55e"/>
        <ellipse cx="24" cy="9" rx="6" ry="4" fill="#22c55e"/>
        <ellipse cx="13" cy="5" rx="2" ry="2.5" fill="#ef4444"/>
        <ellipse cx="20" cy="6" rx="1.8" ry="2.2" fill="#ef4444"/>
        <ellipse cx="17" cy="2.5" rx="1.6" ry="2" fill="#dc2626"/>
      </g>
      <ellipse cx="17" cy="28" rx="8" ry="5" fill="#f8fafc"/>
      <ellipse cx="9.5" cy="22" rx="5" ry="2.8" fill="#f8fafc" transform="rotate(-20 9.5 22)"/>
      <ellipse cx="24.5" cy="22" rx="5" ry="2.8" fill="#f8fafc" transform="rotate(20 24.5 22)"/>
      <PandaFace cx={17} cy={21} r={7}/>
    </svg>
  )
}

type FrameFn = (s: number, frame: number) => JSX.Element
const GRADE_FRAMES: Record<number, FrameFn> = {
  1: ShovelPanda,
  2: ScythePanda,
  3: TreePanda,
}

export function ProducerAnimation({ grade, size }: { grade: number; size: number }) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    setFrame(0)
    const id = setInterval(() => setFrame(f => (f + 1) % 5), FRAME_MS)
    return () => clearInterval(id)
  }, [grade])

  const render = GRADE_FRAMES[grade] ?? GRADE_FRAMES[1]
  return render(size, frame)
}
