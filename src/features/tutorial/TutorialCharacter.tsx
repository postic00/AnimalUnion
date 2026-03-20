const STEP_CHARS = ['hamster', 'cat', 'dog', 'panda'] as const
type CharType = typeof STEP_CHARS[number]

function HamsterChar({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 64 72">
      {/* 몸통 */}
      <ellipse cx="32" cy="56" rx="20" ry="16" fill="#fcd5b0"/>
      {/* 배 */}
      <ellipse cx="32" cy="58" rx="13" ry="10" fill="#fde8cc"/>
      {/* 왼팔 */}
      <ellipse cx="13" cy="54" rx="5" ry="7" fill="#fcd5b0" transform="rotate(-20,13,54)"/>
      {/* 오른팔 (흔드는) */}
      <ellipse cx="51" cy="48" rx="5" ry="7" fill="#fcd5b0" transform="rotate(30,51,48)"/>
      {/* 오른손 */}
      <circle cx="55" cy="43" r="4" fill="#fcd5b0"/>
      {/* 귀 */}
      <ellipse cx="16" cy="14" rx="8" ry="7" fill="#f9a8d4"/>
      <ellipse cx="48" cy="14" rx="8" ry="7" fill="#f9a8d4"/>
      <ellipse cx="16" cy="14" rx="5" ry="4.5" fill="#fce7f3"/>
      <ellipse cx="48" cy="14" rx="5" ry="4.5" fill="#fce7f3"/>
      {/* 머리 */}
      <ellipse cx="32" cy="28" rx="18" ry="16" fill="#fcd5b0"/>
      {/* 볼 */}
      <ellipse cx="18" cy="32" rx="6" ry="4.5" fill="#fda4af" opacity="0.55"/>
      <ellipse cx="46" cy="32" rx="6" ry="4.5" fill="#fda4af" opacity="0.55"/>
      {/* 눈 */}
      <circle cx="25" cy="25" r="3" fill="#1c1917"/>
      <circle cx="39" cy="25" r="3" fill="#1c1917"/>
      <circle cx="26" cy="23.5" r="1.2" fill="#fff"/>
      <circle cx="40" cy="23.5" r="1.2" fill="#fff"/>
      {/* 코 */}
      <ellipse cx="32" cy="31" rx="3" ry="2.2" fill="#f43f5e"/>
      {/* 입 */}
      <path d="M28 34 Q32 38 36 34" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function CatChar({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 64 72">
      {/* 꼬리 */}
      <path d="M50 68 Q60 55 55 44" fill="none" stroke="#d4a96a" strokeWidth="6" strokeLinecap="round"/>
      {/* 몸통 */}
      <ellipse cx="32" cy="55" rx="19" ry="16" fill="#d4a96a"/>
      {/* 배 */}
      <ellipse cx="32" cy="57" rx="12" ry="10" fill="#fde68a" opacity="0.7"/>
      {/* 왼팔 */}
      <ellipse cx="14" cy="54" rx="5" ry="7" fill="#d4a96a" transform="rotate(-15,14,54)"/>
      {/* 오른팔 */}
      <ellipse cx="50" cy="54" rx="5" ry="7" fill="#d4a96a" transform="rotate(15,50,54)"/>
      {/* 귀 */}
      <polygon points="14,20 9,6 22,14"  fill="#d4a96a"/>
      <polygon points="50,20 55,6 42,14" fill="#d4a96a"/>
      <polygon points="15,19 11,8 21,14" fill="#fde68a"/>
      <polygon points="49,19 53,8 43,14" fill="#fde68a"/>
      {/* 머리 */}
      <ellipse cx="32" cy="28" rx="18" ry="16" fill="#d4a96a"/>
      {/* 눈 */}
      <ellipse cx="24" cy="25" rx="4" ry="3.5" fill="#1c1917"/>
      <ellipse cx="40" cy="25" rx="4" ry="3.5" fill="#1c1917"/>
      <ellipse cx="24" cy="25" rx="1.3" ry="2.7" fill="#7c3aed" opacity="0.5"/>
      <ellipse cx="40" cy="25" rx="1.3" ry="2.7" fill="#7c3aed" opacity="0.5"/>
      <circle cx="25.5" cy="23.5" r="1.3" fill="#fff"/>
      <circle cx="41.5" cy="23.5" r="1.3" fill="#fff"/>
      {/* 코 */}
      <path d="M29 31 L32 34 L35 31 Q32 28 29 31Z" fill="#f43f5e"/>
      {/* 수염 */}
      <line x1="6"  y1="30" x2="24" y2="32" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="6"  y1="33" x2="24" y2="33" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="58" y1="30" x2="40" y2="32" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="58" y1="33" x2="40" y2="33" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function DogChar({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 64 72">
      {/* 꼬리 (흔드는) */}
      <path d="M50 62 Q64 54 60 44" fill="none" stroke="#c8a882" strokeWidth="7" strokeLinecap="round"/>
      {/* 몸통 */}
      <ellipse cx="32" cy="55" rx="20" ry="16" fill="#e8c99a"/>
      {/* 배 */}
      <ellipse cx="32" cy="57" rx="13" ry="10" fill="#f5ddb8" opacity="0.8"/>
      {/* 왼팔 */}
      <ellipse cx="13" cy="55" rx="5" ry="8" fill="#e8c99a" transform="rotate(-10,13,55)"/>
      {/* 오른팔 */}
      <ellipse cx="51" cy="55" rx="5" ry="8" fill="#e8c99a" transform="rotate(10,51,55)"/>
      {/* 귀 (처진) */}
      <ellipse cx="14" cy="20" rx="7" ry="11" fill="#c8a882"/>
      <ellipse cx="50" cy="20" rx="7" ry="11" fill="#c8a882"/>
      {/* 머리 */}
      <ellipse cx="32" cy="26" rx="18" ry="16" fill="#e8c99a"/>
      {/* 주둥이 */}
      <ellipse cx="32" cy="34" rx="10" ry="7" fill="#d4a96a"/>
      {/* 눈 */}
      <circle cx="24" cy="23" r="3.5" fill="#1c1917"/>
      <circle cx="40" cy="23" r="3.5" fill="#1c1917"/>
      <circle cx="25.2" cy="21.5" r="1.4" fill="#fff"/>
      <circle cx="41.2" cy="21.5" r="1.4" fill="#fff"/>
      {/* 코 */}
      <ellipse cx="32" cy="30" rx="4.5" ry="3" fill="#1c1917"/>
      <ellipse cx="30.5" cy="29.5" rx="1.5" ry="1" fill="#44403c" opacity="0.4"/>
      {/* 혀 */}
      <ellipse cx="32" cy="38" rx="4" ry="3" fill="#f43f5e"/>
    </svg>
  )
}

function PandaChar({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 64 72">
      {/* 몸통 */}
      <ellipse cx="32" cy="55" rx="20" ry="16" fill="#f1f5f9"/>
      {/* 배 */}
      <ellipse cx="32" cy="57" rx="13" ry="10" fill="#fff" opacity="0.8"/>
      {/* 왼팔 */}
      <ellipse cx="12" cy="52" rx="6" ry="8" fill="#334155" transform="rotate(-15,12,52)"/>
      {/* 오른팔 (흔드는) */}
      <ellipse cx="52" cy="48" rx="6" ry="8" fill="#334155" transform="rotate(25,52,48)"/>
      {/* 귀 */}
      <circle cx="16" cy="12" r="8" fill="#334155"/>
      <circle cx="48" cy="12" r="8" fill="#334155"/>
      {/* 머리 */}
      <ellipse cx="32" cy="28" rx="19" ry="17" fill="#f1f5f9"/>
      {/* 눈 패치 */}
      <ellipse cx="22" cy="26" rx="7" ry="6" fill="#334155"/>
      <ellipse cx="42" cy="26" rx="7" ry="6" fill="#334155"/>
      {/* 눈 */}
      <circle cx="22" cy="26" r="3.5" fill="#1c1917"/>
      <circle cx="42" cy="26" r="3.5" fill="#1c1917"/>
      <circle cx="23" cy="24.5" r="1.3" fill="#fff"/>
      <circle cx="43" cy="24.5" r="1.3" fill="#fff"/>
      {/* 코 */}
      <ellipse cx="32" cy="33" rx="3.5" ry="2.5" fill="#475569"/>
      {/* 입 */}
      <path d="M28 36 Q32 40 36 36" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

import type { JSX } from 'react'

const CHARS: Record<CharType, (s: number) => JSX.Element> = {
  hamster: s => <HamsterChar s={s} />,
  cat:     s => <CatChar s={s} />,
  dog:     s => <DogChar s={s} />,
  panda:   s => <PandaChar s={s} />,
}

interface Props {
  step: number
  size?: number
}

export default function TutorialCharacter({ step, size = 80 }: Props) {
  const type = STEP_CHARS[step % STEP_CHARS.length]
  return CHARS[type](size)
}
