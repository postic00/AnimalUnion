import type { JSX } from 'react'
import type { Factory } from '../types/factory'
import type { AnimalSpecies } from './AnimalSvg'
import styles from './ProcessAnimation.module.css'

// ── 땀방울 ───────────────────────────────────────────────────────
function Sweat({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M0 0 Q1.5 -3 3 0 Q3 2.5 1.5 3 Q0 2.5 0 0Z" fill="#7dd3fc" opacity="0.9"/>
    </g>
  )
}

// ── 종별 머리 ────────────────────────────────────────────────────
// cx=24 cy=14 기준, 48×48 viewBox

function HamsterHead({ tired }: { tired?: boolean }) {
  return (
    <>
      {/* 귀 */}
      <ellipse cx="10" cy="7" rx="6" ry="5.5" fill="#f9a8d4"/>
      <ellipse cx="38" cy="7" rx="6" ry="5.5" fill="#f9a8d4"/>
      <ellipse cx="10" cy="7" rx="4"   ry="3.5" fill="#fce7f3"/>
      <ellipse cx="38" cy="7" rx="4"   ry="3.5" fill="#fce7f3"/>
      {/* 얼굴 */}
      <circle cx="24" cy="15" r="11" fill="#fcd5b0"/>
      {/* 볼 */}
      <ellipse cx="14" cy="18" rx="4.5" ry="3.5" fill="#fda4af" opacity="0.55"/>
      <ellipse cx="34" cy="18" rx="4.5" ry="3.5" fill="#fda4af" opacity="0.55"/>
      {/* 눈 */}
      {tired
        ? <>
            <path d="M20 13 Q22 15 24 13" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M24 13 Q26 15 28 13" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </>
        : <>
            <circle cx="21" cy="13" r="2" fill="#1c1917"/>
            <circle cx="27" cy="13" r="2" fill="#1c1917"/>
            <circle cx="22" cy="12" r="0.8" fill="#fff"/>
            <circle cx="28" cy="12" r="0.8" fill="#fff"/>
          </>
      }
      {/* 코 */}
      <ellipse cx="24" cy="18" rx="2.5" ry="1.8" fill="#f43f5e"/>
    </>
  )
}

function CatHead({ tired }: { tired?: boolean }) {
  return (
    <>
      {/* 귀 */}
      <polygon points="10,16 6,4 17,10"  fill="#d4a96a"/>
      <polygon points="38,16 42,4 31,10" fill="#d4a96a"/>
      <polygon points="11,15 8,6 16,11"  fill="#fde68a"/>
      <polygon points="37,15 40,6 32,11" fill="#fde68a"/>
      {/* 얼굴 */}
      <circle cx="24" cy="16" r="11" fill="#d4a96a"/>
      {/* 눈 */}
      {tired
        ? <>
            <path d="M19 14 Q21 16 23 14" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M25 14 Q27 16 29 14" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </>
        : <>
            <ellipse cx="21" cy="13" rx="3" ry="2.5" fill="#1c1917"/>
            <ellipse cx="27" cy="13" rx="3" ry="2.5" fill="#1c1917"/>
            <ellipse cx="21" cy="13" rx="1" ry="2"   fill="#7c3aed" opacity="0.5"/>
            <ellipse cx="27" cy="13" rx="1" ry="2"   fill="#7c3aed" opacity="0.5"/>
            <circle cx="22.2" cy="12" r="1" fill="#fff"/>
            <circle cx="28.2" cy="12" r="1" fill="#fff"/>
          </>
      }
      {/* 코 */}
      <path d="M22 18 L24 20 L26 18 Q24 16 22 18Z" fill="#f43f5e"/>
      {/* 수염 */}
      <line x1="5"  y1="18" x2="19" y2="19" stroke="#92400e" strokeWidth="1" strokeLinecap="round"/>
      <line x1="5"  y1="21" x2="19" y2="21" stroke="#92400e" strokeWidth="1" strokeLinecap="round"/>
      <line x1="43" y1="18" x2="29" y2="19" stroke="#92400e" strokeWidth="1" strokeLinecap="round"/>
      <line x1="43" y1="21" x2="29" y2="21" stroke="#92400e" strokeWidth="1" strokeLinecap="round"/>
    </>
  )
}

function DogHead({ tired }: { tired?: boolean }) {
  return (
    <>
      {/* 귀 (처진) */}
      <ellipse cx="10" cy="17" rx="6" ry="9" fill="#c8a882"/>
      <ellipse cx="38" cy="17" rx="6" ry="9" fill="#c8a882"/>
      {/* 얼굴 */}
      <circle cx="24" cy="15" r="11" fill="#e8c99a"/>
      {/* 주둥이 */}
      <ellipse cx="24" cy="21" rx="7" ry="5" fill="#d4a96a"/>
      {/* 눈 */}
      {tired
        ? <>
            <path d="M19 12 Q21 14 23 12" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M25 12 Q27 14 29 12" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </>
        : <>
            <circle cx="21" cy="12" r="2.5" fill="#1c1917"/>
            <circle cx="27" cy="12" r="2.5" fill="#1c1917"/>
            <circle cx="22" cy="11" r="1"   fill="#fff"/>
            <circle cx="28" cy="11" r="1"   fill="#fff"/>
          </>
      }
      {/* 코 */}
      <ellipse cx="24" cy="19" rx="3.5" ry="2.5" fill="#1c1917"/>
      <ellipse cx="23" cy="18.5" rx="1.2" ry="0.8" fill="#44403c" opacity="0.4"/>
      {/* 혀 */}
      <ellipse cx="24" cy="25" rx="3" ry="2" fill="#f43f5e"/>
    </>
  )
}

function RobotHead({ tired }: { tired?: boolean }) {
  return (
    <>
      {/* 안테나 */}
      <rect x="22" y="1" width="4" height="6" rx="2" fill="#64748b"/>
      <circle cx="24" cy="1.5" r="2.5" fill="#ef4444"/>
      {/* 머리 */}
      <rect x="13" y="8" width="22" height="18" rx="4" fill="#94a3b8"/>
      {/* 눈 */}
      {tired
        ? <>
            <rect x="15" y="13" width="7" height="4" rx="2" fill="#475569"/>
            <rect x="26" y="13" width="7" height="4" rx="2" fill="#475569"/>
            <rect x="16" y="14" width="5" height="2" rx="1" fill="#334155"/>
          </>
        : <>
            <rect x="15" y="12" width="7" height="5" rx="2" fill="#0ea5e9"/>
            <rect x="26" y="12" width="7" height="5" rx="2" fill="#0ea5e9"/>
            <rect x="16.5" y="13" width="4" height="2.5" rx="1" fill="#bfdbfe" opacity="0.8"/>
            <rect x="27.5" y="13" width="4" height="2.5" rx="1" fill="#bfdbfe" opacity="0.8"/>
          </>
      }
      {/* 입 */}
      <rect x="17" y="20" width="14" height="4" rx="2" fill="#475569"/>
      <line x1="21" y1="20" x2="21" y2="24" stroke="#94a3b8" strokeWidth="1"/>
      <line x1="24" y1="20" x2="24" y2="24" stroke="#94a3b8" strokeWidth="1"/>
      <line x1="27" y1="20" x2="27" y2="24" stroke="#94a3b8" strokeWidth="1"/>
      {/* 볼 볼트 */}
      <circle cx="13" cy="17" r="3" fill="#64748b"/>
      <circle cx="13" cy="17" r="1.2" fill="#94a3b8"/>
      <circle cx="35" cy="17" r="3" fill="#64748b"/>
      <circle cx="35" cy="17" r="1.2" fill="#94a3b8"/>
    </>
  )
}

function Head({ species, tired }: { species: AnimalSpecies; tired?: boolean }) {
  if (species === 'hamster') return <HamsterHead tired={tired}/>
  if (species === 'cat')     return <CatHead tired={tired}/>
  if (species === 'dog')     return <DogHead tired={tired}/>
  return <RobotHead tired={tired}/>
}

// 로봇 땀 대신 전기 스파크
function Spark({ x, y }: { x: number; y: number }) {
  return (
    <path d={`M${x} ${y} L${x+3} ${y-3} L${x+1} ${y-1} L${x+4} ${y-4}`}
      stroke="#fbbf24" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  )
}

function SweatOrSpark({ species, x, y, s = 1 }: { species: AnimalSpecies; x: number; y: number; s?: number }) {
  if (species === 'robot') return <Spark x={x} y={y}/>
  return <Sweat x={x} y={y} s={s}/>
}

// 몸통 (종별 색상)
const BODY_COLOR: Record<AnimalSpecies, string> = {
  hamster: '#fcd5b0',
  cat:     '#d4a96a',
  dog:     '#e8c99a',
  robot:   '#94a3b8',
}

// ── WA 세척 프레임 ────────────────────────────────────────────────
function makeWA(species: AnimalSpecies): JSX.Element[] {
  const bc = BODY_COLOR[species]
  return [
    // F0: 스폰지 들고 대기
    <>
      <ellipse cx="24" cy="32" rx="10" ry="11" fill={bc}/>
      <Head species={species}/>
      <path d="M14 31 Q8 29 7 26" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M34 31 Q40 29 41 26" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <rect x="38" y="22" width="8" height="6" rx="2" fill="#86efac"/>
      <rect x="39" y="23" width="6" height="4" rx="1" fill="#4ade80" opacity="0.5"/>
      <ellipse cx="24" cy="43" rx="9" ry="4" fill="#fef3c7"/>
    </>,

    // F1: 좌→우 닦기
    <>
      <ellipse cx="24" cy="32" rx="10" ry="11" fill={bc}/>
      <Head species={species}/>
      <path d="M14 31 Q10 26 13 21" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M34 31 Q42 26 44 21" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <rect x="41" y="17" width="8" height="6" rx="2" fill="#86efac"/>
      <rect x="42" y="18" width="6" height="4" rx="1" fill="#4ade80" opacity="0.5"/>
      <path d="M15 42 Q24 40 33 42" stroke="#7dd3fc" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8"/>
      <ellipse cx="24" cy="43" rx="9" ry="4" fill="#fef3c7"/>
      <SweatOrSpark species={species} x={35} y={26} s={0.9}/>
    </>,

    // F2: 우→좌 닦기
    <>
      <ellipse cx="24" cy="32" rx="10" ry="11" fill={bc}/>
      <Head species={species}/>
      <path d="M14 31 Q6 26 4 21" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M34 31 Q38 26 36 21" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <rect x="-1" y="17" width="8" height="6" rx="2" fill="#86efac"/>
      <rect x="0"  y="18" width="6" height="4" rx="1" fill="#4ade80" opacity="0.5"/>
      <path d="M33 42 Q24 40 15 42" stroke="#7dd3fc" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8"/>
      <ellipse cx="24" cy="43" rx="9" ry="4" fill="#fef3c7"/>
      <SweatOrSpark species={species} x={5} y={26} s={0.9}/>
    </>,

    // F3: 힘껏 문지르기 (아래)
    <>
      <ellipse cx="24" cy="33" rx="10" ry="11" fill={bc}/>
      <Head species={species} tired/>
      <path d="M14 32 Q9 37 11 42" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M34 32 Q39 37 37 42" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <rect x="14" y="42" width="20" height="6" rx="2" fill="#86efac"/>
      <rect x="15" y="43" width="18" height="4" rx="1" fill="#4ade80" opacity="0.5"/>
      <circle cx="8"  cy="45" r="2.5" fill="#7dd3fc" opacity="0.8"/>
      <circle cx="40" cy="45" r="2.5" fill="#7dd3fc" opacity="0.8"/>
      <SweatOrSpark species={species} x={5}  y={18} s={1.1}/>
      <SweatOrSpark species={species} x={38} y={16} s={1.1}/>
      <SweatOrSpark species={species} x={2}  y={28} s={0.8}/>
    </>,

    // F4: 이마 닦기 (지침)
    <>
      <ellipse cx="24" cy="32" rx="10" ry="11" fill={bc}/>
      <Head species={species} tired/>
      <path d="M14 31 Q9 22 14 10" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M34 31 Q40 26 42 30" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <rect x="11" y="7" width="14" height="5" rx="2.5" fill="#fde68a"/>
      <ellipse cx="24" cy="43" rx="9" ry="4" fill="#fef3c7"/>
      <SweatOrSpark species={species} x={28} y={4}  s={1.3}/>
      <SweatOrSpark species={species} x={36} y={9}  s={1.1}/>
      <SweatOrSpark species={species} x={40} y={19} s={0.9}/>
      <SweatOrSpark species={species} x={4}  y={22} s={1}/>
      <SweatOrSpark species={species} x={38} y={30} s={0.8}/>
    </>,
  ]
}

// ── PA 가공 프레임 ─────────────────────────────────────────────────
function makePA(species: AnimalSpecies): JSX.Element[] {
  const bc = BODY_COLOR[species]
  return [
    // F0: 팬 들고 대기
    <>
      <ellipse cx="24" cy="32" rx="10" ry="11" fill={bc}/>
      <Head species={species}/>
      <path d="M14 31 Q8 30 6 32" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M34 31 Q40 28 42 28" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="16" cy="43" rx="13" ry="5" fill="#374151"/>
      <ellipse cx="16" cy="41" rx="13" ry="5" fill="#4b5563"/>
      <ellipse cx="16" cy="40" rx="9"  ry="3.5" fill="#6b7280"/>
      <rect x="29" y="39" width="12" height="3" rx="1.5" fill="#374151"/>
      <ellipse cx="13" cy="39" rx="4" ry="3" fill="#ef4444" opacity="0.85"/>
      <ellipse cx="21" cy="40" rx="3" ry="2.5" fill="#22c55e" opacity="0.85"/>
    </>,

    // F1: 좌로 흔들 + 증기
    <>
      <ellipse cx="22" cy="32" rx="10" ry="11" fill={bc}/>
      <Head species={species}/>
      <path d="M12 31 Q6 30 4 32" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M32 31 Q38 26 40 26" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <g transform="rotate(-12 14 42)">
        <ellipse cx="14" cy="42" rx="13" ry="5" fill="#374151"/>
        <ellipse cx="14" cy="40" rx="13" ry="5" fill="#4b5563"/>
        <ellipse cx="14" cy="39" rx="9"  ry="3.5" fill="#6b7280"/>
        <rect x="27" y="38" width="12" height="3" rx="1.5" fill="#374151"/>
        <ellipse cx="11" cy="38" rx="4" ry="3" fill="#ef4444" opacity="0.9"/>
        <ellipse cx="19" cy="39" rx="3" ry="2.5" fill="#22c55e" opacity="0.9"/>
      </g>
      <path d="M8 30 Q6 24 8 18"   stroke="#e2e8f0" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M14 29 Q12 23 14 17" stroke="#e2e8f0" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8"/>
      <SweatOrSpark species={species} x={36} y={20} s={0.9}/>
    </>,

    // F2: 우로 흔들 + 증기
    <>
      <ellipse cx="26" cy="32" rx="10" ry="11" fill={bc}/>
      <Head species={species}/>
      <path d="M16 31 Q10 26 8 26" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M36 31 Q42 30 44 32" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <g transform="rotate(12 30 42)">
        <ellipse cx="30" cy="42" rx="13" ry="5" fill="#374151"/>
        <ellipse cx="30" cy="40" rx="13" ry="5" fill="#4b5563"/>
        <ellipse cx="30" cy="39" rx="9"  ry="3.5" fill="#6b7280"/>
        <rect x="43" y="38" width="12" height="3" rx="1.5" fill="#374151"/>
        <ellipse cx="27" cy="38" rx="4" ry="3" fill="#ef4444" opacity="0.9"/>
        <ellipse cx="35" cy="39" rx="3" ry="2.5" fill="#22c55e" opacity="0.9"/>
      </g>
      <path d="M34 29 Q36 23 34 17" stroke="#e2e8f0" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M40 28 Q42 22 40 16" stroke="#e2e8f0" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8"/>
      <SweatOrSpark species={species} x={8} y={20} s={0.9}/>
    </>,

    // F3: 뒤집기!
    <>
      <ellipse cx="24" cy="33" rx="10" ry="11" fill={bc}/>
      <Head species={species}/>
      <path d="M14 32 Q8 25 10 18" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M34 32 Q40 25 38 18" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <g transform="rotate(-5 24 43)">
        <ellipse cx="24" cy="43" rx="13" ry="5" fill="#374151"/>
        <ellipse cx="24" cy="41" rx="13" ry="5" fill="#4b5563"/>
        <rect x="37" y="39" width="12" height="3" rx="1.5" fill="#374151"/>
      </g>
      <ellipse cx="17" cy="24" rx="4" ry="3" fill="#ef4444" opacity="0.9" transform="rotate(-20 17 24)"/>
      <ellipse cx="29" cy="20" rx="3" ry="2.5" fill="#22c55e" opacity="0.9" transform="rotate(15 29 20)"/>
      <circle cx="9"  cy="22" r="2" fill="#ef4444" opacity="0.6"/>
      <circle cx="37" cy="18" r="2" fill="#22c55e" opacity="0.6"/>
      <SweatOrSpark species={species} x={38} y={10} s={1.2}/>
      <SweatOrSpark species={species} x={4}  y={12} s={1}/>
    </>,

    // F4: 지침
    <>
      <ellipse cx="24" cy="32" rx="10" ry="11" fill={bc}/>
      <Head species={species} tired/>
      <path d="M14 31 Q9 22 14 10" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M34 31 Q42 30 44 34" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <rect x="11" y="7" width="14" height="5" rx="2.5" fill="#fde68a"/>
      <ellipse cx="40" cy="40" rx="10" ry="4" fill="#374151"/>
      <ellipse cx="40" cy="38" rx="10" ry="4" fill="#4b5563"/>
      <circle cx="40" cy="36" r="3.5" fill="#f97316" opacity="0.9"/>
      <path d="M38 36 Q36 30 38 24" stroke="#e2e8f0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M42 36 Q44 30 42 24" stroke="#e2e8f0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      <SweatOrSpark species={species} x={28} y={3}  s={1.4}/>
      <SweatOrSpark species={species} x={36} y={8}  s={1.1}/>
      <SweatOrSpark species={species} x={42} y={16} s={0.9}/>
      <SweatOrSpark species={species} x={4}  y={18} s={1.1}/>
      <SweatOrSpark species={species} x={42} y={27} s={0.8}/>
    </>,
  ]
}

// ── PK 포장 프레임 ─────────────────────────────────────────────────
function makePK(species: AnimalSpecies): JSX.Element[] {
  const bc = BODY_COLOR[species]
  return [
    // F0: 박스 앞 대기
    <>
      <ellipse cx="24" cy="30" rx="10" ry="11" fill={bc}/>
      <Head species={species}/>
      <path d="M14 29 Q8 30 7 34" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M34 29 Q40 30 41 34" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <rect x="12" y="37" width="24" height="11" rx="2" fill="#fbbf24"/>
      <rect x="12" y="37" width="24" height="6"  rx="2" fill="#f59e0b"/>
      <line x1="24" y1="37" x2="24" y2="48" stroke="#d97706" strokeWidth="1.5"/>
    </>,

    // F1: 박스 힘껏 누르기
    <>
      <ellipse cx="24" cy="30" rx="10" ry="11" fill={bc}/>
      <Head species={species} tired/>
      <path d="M14 29 Q8 34 9 39" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M34 29 Q40 34 39 39" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="9"  cy="40" rx="4.5" ry="3" fill={bc}/>
      <ellipse cx="39" cy="40" rx="4.5" ry="3" fill={bc}/>
      <rect x="12" y="39" width="24" height="9"  rx="2" fill="#fbbf24"/>
      <rect x="12" y="39" width="24" height="5"  rx="2" fill="#f59e0b"/>
      <line x1="24" y1="39" x2="24" y2="48" stroke="#d97706" strokeWidth="1.5"/>
      <SweatOrSpark species={species} x={3}  y={26} s={0.9}/>
      <SweatOrSpark species={species} x={40} y={24} s={0.9}/>
    </>,

    // F2: 왼쪽 테이프
    <>
      <ellipse cx="24" cy="30" rx="10" ry="11" fill={bc}/>
      <Head species={species}/>
      <path d="M14 29 Q5 26 3 35" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M34 29 Q40 26 42 22" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <circle cx="43" cy="20" r="6" fill="#93c5fd"/>
      <circle cx="43" cy="20" r="4" fill="#bfdbfe"/>
      <circle cx="43" cy="20" r="1.5" fill="#60a5fa"/>
      <line x1="43" y1="26" x2="43" y2="38" stroke="#7dd3fc" strokeWidth="2"/>
      <rect x="12" y="38" width="24" height="10" rx="2" fill="#fbbf24"/>
      <rect x="12" y="38" width="24" height="5"  rx="2" fill="#f59e0b"/>
      <rect x="2"  y="40" width="14" height="3"  rx="1" fill="#7dd3fc" opacity="0.85"/>
      <SweatOrSpark species={species} x={3}  y={20} s={1}/>
      <SweatOrSpark species={species} x={32} y={16} s={0.8}/>
    </>,

    // F3: 오른쪽 테이프
    <>
      <ellipse cx="24" cy="30" rx="10" ry="11" fill={bc}/>
      <Head species={species}/>
      <path d="M14 29 Q8 26 6 22" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <circle cx="5" cy="20" r="6" fill="#93c5fd"/>
      <circle cx="5" cy="20" r="4" fill="#bfdbfe"/>
      <circle cx="5" cy="20" r="1.5" fill="#60a5fa"/>
      <line x1="5" y1="26" x2="5" y2="38" stroke="#7dd3fc" strokeWidth="2"/>
      <path d="M34 29 Q42 26 45 35" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <rect x="12" y="38" width="24" height="10" rx="2" fill="#fbbf24"/>
      <rect x="12" y="38" width="24" height="5"  rx="2" fill="#f59e0b"/>
      <rect x="2"  y="40" width="14" height="3"  rx="1" fill="#7dd3fc" opacity="0.5"/>
      <rect x="32" y="40" width="14" height="3"  rx="1" fill="#7dd3fc" opacity="0.85"/>
      <SweatOrSpark species={species} x={40} y={20} s={1}/>
      <SweatOrSpark species={species} x={10} y={16} s={0.8}/>
    </>,

    // F4: 완료! 지침
    <>
      <ellipse cx="24" cy="30" rx="10" ry="11" fill={bc}/>
      <Head species={species} tired/>
      <path d="M14 29 Q9 20 14 8" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <path d="M34 29 Q42 30 44 34" stroke={bc} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      <rect x="11" y="5" width="14" height="5" rx="2.5" fill="#fde68a"/>
      <rect x="30" y="36" width="18" height="12" rx="2" fill="#fbbf24"/>
      <rect x="30" y="36" width="18" height="6"  rx="2" fill="#f59e0b"/>
      <rect x="28" y="40" width="22" height="3"  rx="1" fill="#7dd3fc" opacity="0.85"/>
      <line x1="39" y1="36" x2="39" y2="48" stroke="#d97706" strokeWidth="1.5"/>
      <SweatOrSpark species={species} x={28} y={2}  s={1.4}/>
      <SweatOrSpark species={species} x={36} y={6}  s={1.1}/>
      <SweatOrSpark species={species} x={42} y={15} s={1}/>
      <SweatOrSpark species={species} x={3}  y={18} s={1.1}/>
      <SweatOrSpark species={species} x={42} y={26} s={0.8}/>
      <SweatOrSpark species={species} x={2}  y={30} s={0.7}/>
    </>,
  ]
}

// ── 캐시: 종 × 타입 조합 ────────────────────────────────────────────
const CACHE: Partial<Record<AnimalSpecies, Partial<Record<Factory['type'], JSX.Element[]>>>> = {}

function getFrames(species: AnimalSpecies, type: Factory['type']): JSX.Element[] {
  if (!CACHE[species]) CACHE[species] = {}
  if (!CACHE[species]![type]) {
    if (type === 'WA') CACHE[species]!.WA = makeWA(species)
    else if (type === 'PA') CACHE[species]!.PA = makePA(species)
    else CACHE[species]!.PK = makePK(species)
  }
  return CACHE[species]![type]!
}

interface Props {
  type: Factory['type']
  species: AnimalSpecies
  size: number
}

export function ProcessAnimation({ type, species, size }: Props) {
  const frames = getFrames(species, type)
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <g className={styles.f0}>{frames[0]}</g>
      <g className={styles.f1}>{frames[1]}</g>
      <g className={styles.f2}>{frames[2]}</g>
      <g className={styles.f3}>{frames[3]}</g>
      <g className={styles.f4}>{frames[4]}</g>
    </svg>
  )
}
