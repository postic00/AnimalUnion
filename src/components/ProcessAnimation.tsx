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
// cx=24 cy=16 기준, 48×48 viewBox

function HamsterHead({ tired }: { tired?: boolean }) {
  return (
    <>
      {/* 귀 (크고 둥글게) */}
      <circle cx="11" cy="8" r="7" fill="#fde9b8" stroke="#1a1a1a" strokeWidth="1.5"/>
      <circle cx="11" cy="9" r="4.5" fill="#ffb8c0"/>
      <circle cx="37" cy="8" r="7" fill="#fde9b8" stroke="#1a1a1a" strokeWidth="1.5"/>
      <circle cx="37" cy="9" r="4.5" fill="#ffb8c0"/>
      {/* 얼굴 */}
      <circle cx="24" cy="19" r="13" fill="#fde9b8" stroke="#1a1a1a" strokeWidth="1.5"/>
      {/* 볼 주머니 (햄스터 특징! 크고 볼록하게) */}
      <ellipse cx="9"  cy="23" rx="7.5" ry="6" fill="#ffb8c0" opacity="0.85"/>
      <ellipse cx="39" cy="23" rx="7.5" ry="6" fill="#ffb8c0" opacity="0.85"/>
      {/* 눈 (작고 가깝게) */}
      {tired
        ? <>
            <path d="M19 17 Q21.5 19.5 24 17" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M24 17 Q26.5 19.5 29 17" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </>
        : <>
            <circle cx="21" cy="16" r="3" fill="#1a1a1a"/>
            <circle cx="27" cy="16" r="3" fill="#1a1a1a"/>
            <circle cx="19.8" cy="14.5" r="1" fill="#fff"/>
            <circle cx="25.8" cy="14.5" r="1" fill="#fff"/>
          </>
      }
      {/* 코 */}
      <ellipse cx="24" cy="21" rx="2" ry="1.5" fill="#1a1a1a"/>
      {/* 입 */}
      <path d="M24 22.5 Q21 25.5 19 24" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M24 22.5 Q27 25.5 29 24" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round"/>
    </>
  )
}

function CatHead({ tired }: { tired?: boolean }) {
  return (
    <>
      {/* 귀 (길고 날카롭게!) */}
      <path d="M9 19 L6 3 L21 14 Z" fill="#f0f0f0" stroke="#1a1a1a" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M39 19 L42 3 L27 14 Z" fill="#f0f0f0" stroke="#1a1a1a" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 18 L8 6 L19 14 Z" fill="#ffb8c0"/>
      <path d="M38 18 L40 6 L29 14 Z" fill="#ffb8c0"/>
      {/* 얼굴 */}
      <circle cx="24" cy="19" r="13" fill="#f8f8f8" stroke="#1a1a1a" strokeWidth="1.5"/>
      {/* 볼 */}
      <ellipse cx="14" cy="22" rx="4" ry="2.8" fill="#ffb8c0" opacity="0.65"/>
      <ellipse cx="34" cy="22" rx="4" ry="2.8" fill="#ffb8c0" opacity="0.65"/>
      {/* 수염 3줄 (고양이 특징!) */}
      <line x1="1"  y1="19" x2="15" y2="21" stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="1"  y1="22.5" x2="15" y2="23" stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="1"  y1="26" x2="15" y2="25" stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="47" y1="19" x2="33" y2="21" stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="47" y1="22.5" x2="33" y2="23" stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="47" y1="26" x2="33" y2="25" stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round"/>
      {/* 눈 (고양이 세로 동공!) */}
      {tired
        ? <>
            <path d="M19 17 Q21.5 19.5 24 17" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M24 17 Q26.5 19.5 29 17" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </>
        : <>
            <circle cx="20" cy="16" r="3.5" fill="#1a1a1a"/>
            <circle cx="28" cy="16" r="3.5" fill="#1a1a1a"/>
            <ellipse cx="20" cy="16" rx="1" ry="2.8" fill="#7c3aed" opacity="0.45"/>
            <ellipse cx="28" cy="16" rx="1" ry="2.8" fill="#7c3aed" opacity="0.45"/>
            <circle cx="21.3" cy="14.5" r="1" fill="#fff"/>
            <circle cx="29.3" cy="14.5" r="1" fill="#fff"/>
          </>
      }
      {/* 코 (삼각형) */}
      <path d="M22 21 L24 19.5 L26 21 Q24 23 22 21Z" fill="#f43f5e"/>
    </>
  )
}

function DogHead({ tired }: { tired?: boolean }) {
  return (
    <>
      {/* 귀 (크고 축 처진 플랩!) */}
      <ellipse cx="10" cy="21" rx="7" ry="11" fill="#b8b8b8" stroke="#1a1a1a" strokeWidth="1.5"/>
      <ellipse cx="38" cy="21" rx="7" ry="11" fill="#b8b8b8" stroke="#1a1a1a" strokeWidth="1.5"/>
      {/* 얼굴 */}
      <circle cx="24" cy="16" r="13" fill="#cccccc" stroke="#1a1a1a" strokeWidth="1.5"/>
      {/* 주둥이 (크고 튀어나오게!) */}
      <ellipse cx="24" cy="24" rx="9" ry="6.5" fill="#b4b4b4" stroke="#1a1a1a" strokeWidth="1.2"/>
      {/* 볼 */}
      <ellipse cx="13" cy="18" rx="3.5" ry="2.5" fill="#ffb8c0" opacity="0.7"/>
      <ellipse cx="35" cy="18" rx="3.5" ry="2.5" fill="#ffb8c0" opacity="0.7"/>
      {/* 눈 */}
      {tired
        ? <>
            <path d="M19 13 Q21.5 15.5 24 13" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M24 13 Q26.5 15.5 29 13" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </>
        : <>
            <circle cx="20" cy="12" r="3.5" fill="#1a1a1a"/>
            <circle cx="28" cy="12" r="3.5" fill="#1a1a1a"/>
            <circle cx="18.5" cy="10.5" r="1.2" fill="#fff"/>
            <circle cx="26.5" cy="10.5" r="1.2" fill="#fff"/>
          </>
      }
      {/* 코 (크고 반짝) */}
      <ellipse cx="24" cy="21" rx="4" ry="2.8" fill="#1a1a1a"/>
      <ellipse cx="22.5" cy="20.2" rx="1.3" ry="0.9" fill="#444" opacity="0.4"/>
      {/* 혀 (강아지 특징!) */}
      {!tired && <ellipse cx="24" cy="28.5" rx="3.5" ry="3" fill="#f43f5e"/>}
      {tired  && <path d="M20 27 Q24 31 28 27" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round"/>}
    </>
  )
}

function RobotHead({ tired }: { tired?: boolean }) {
  return (
    <>
      {/* 귀 피스 */}
      <rect x="1"  y="7" width="7" height="12" rx="3" fill="#e5e7eb" stroke="#1a1a1a" strokeWidth="1.5"/>
      <rect x="40" y="7" width="7" height="12" rx="3" fill="#e5e7eb" stroke="#1a1a1a" strokeWidth="1.5"/>
      {/* 머리 돔 */}
      <rect x="8" y="4" width="32" height="28" rx="12" fill="#fef3c7" stroke="#1a1a1a" strokeWidth="1.5"/>
      {/* 바이저 */}
      <rect x="10" y="11" width="28" height="14" rx="6" fill="#4b5563" stroke="#1a1a1a" strokeWidth="1.5"/>
      {/* 볼 */}
      <ellipse cx="14" cy="21" rx="3" ry="2" fill="#ffb8c0" opacity="0.85"/>
      <ellipse cx="34" cy="21" rx="3" ry="2" fill="#ffb8c0" opacity="0.85"/>
      {/* 눈/표정 */}
      {tired
        ? <path d="M18 18 Q24 21 30 18" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
        : <>
            <rect x="14" y="13" width="6" height="6" rx="2.5" fill="#1a1a1a"/>
            <rect x="28" y="13" width="6" height="6" rx="2.5" fill="#1a1a1a"/>
            <rect x="15" y="14" width="3" height="3" rx="1" fill="#bfdbfe" opacity="0.8"/>
            <rect x="29" y="14" width="3" height="3" rx="1" fill="#bfdbfe" opacity="0.8"/>
          </>
      }
      {/* 미소 */}
      {!tired && <path d="M19 22 Q24 26 29 22" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>}
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
