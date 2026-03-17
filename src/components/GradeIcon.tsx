import type { JSX } from 'react'

type Props = { size: number; grade: number; packed?: boolean }

function Icon1({ s }: { s: number }) { // 고추
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 꼭지 */}
      <rect x="15" y="1" width="2.5" height="7" rx="1.2" fill="#15803d"/>
      <path d="M16 5 Q21 3 23 6 Q20 7 16 7Z" fill="#16a34a"/>
      {/* 몸통 */}
      <path d="M13 8 Q7 12 8 20 Q9 28 16 30 Q23 28 24 20 Q25 12 19 8 Q16 6 13 8Z" fill="#dc2626"/>
      {/* 광택 */}
      <ellipse cx="12.5" cy="14" rx="2" ry="4" fill="#ef4444" opacity="0.55"/>
    </svg>
  )
}

function Icon2({ s }: { s: number }) { // 설탕 (사탕)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 몸통 */}
      <ellipse cx="16" cy="16" rx="9" ry="7" fill="#fbbf24"/>
      {/* 줄무늬 */}
      <ellipse cx="16" cy="16" rx="9" ry="7" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 3"/>
      {/* 왼쪽 포장 */}
      <path d="M7 13 Q4 11 3 9" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M7 19 Q4 21 3 23" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* 오른쪽 포장 */}
      <path d="M25 13 Q28 11 29 9" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M25 19 Q28 21 29 23" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* 광택 */}
      <ellipse cx="12" cy="13" rx="2.5" ry="1.5" fill="#fde68a" opacity="0.7"/>
    </svg>
  )
}

function Icon3({ s }: { s: number }) { // 딸기
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 꼭지 잎 */}
      <path d="M16 7 Q13 2 10 5 Q13 7 16 7Z" fill="#16a34a"/>
      <path d="M16 7 Q16 1 20 3 Q19 6 16 7Z" fill="#22c55e"/>
      <path d="M16 7 Q19 2 22 5 Q19 7 16 7Z" fill="#16a34a"/>
      {/* 꼭지 중심 */}
      <circle cx="16" cy="7" r="2" fill="#15803d"/>
      {/* 몸통 */}
      <path d="M9 11 Q7 18 16 29 Q25 18 23 11 Q19 7 16 8 Q13 7 9 11Z" fill="#ef4444"/>
      {/* 씨앗 */}
      <ellipse cx="13" cy="16" rx="1" ry="1.5" fill="#fca5a5" transform="rotate(-10 13 16)"/>
      <ellipse cx="19" cy="16" rx="1" ry="1.5" fill="#fca5a5" transform="rotate(10 19 16)"/>
      <ellipse cx="16" cy="20" rx="1" ry="1.5" fill="#fca5a5"/>
      <ellipse cx="12" cy="21" rx="0.8" ry="1.2" fill="#fca5a5"/>
      <ellipse cx="20" cy="21" rx="0.8" ry="1.2" fill="#fca5a5"/>
      {/* 광택 */}
      <ellipse cx="12" cy="13" rx="1.5" ry="2.5" fill="#f87171" opacity="0.5"/>
    </svg>
  )
}

function Icon4({ s }: { s: number }) { // 고추장 (항아리)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 뚜껑 */}
      <ellipse cx="16" cy="8" rx="9" ry="3" fill="#92400e"/>
      <rect x="13" y="4" width="6" height="4" rx="1" fill="#b45309"/>
      {/* 항아리 몸통 */}
      <path d="M7 10 Q6 18 8 24 Q10 28 16 28 Q22 28 24 24 Q26 18 25 10Z" fill="#c2410c"/>
      {/* 내용물 표시 */}
      <ellipse cx="16" cy="12" rx="7" ry="2.5" fill="#dc2626" opacity="0.6"/>
      {/* 광택 */}
      <ellipse cx="11" cy="16" rx="2" ry="4" fill="#ef4444" opacity="0.35"/>
      {/* 테두리 */}
      <path d="M7 10 Q6 18 8 24 Q10 28 16 28 Q22 28 24 24 Q26 18 25 10" fill="none" stroke="#7c2d12" strokeWidth="1"/>
    </svg>
  )
}

function Icon5({ s }: { s: number }) { // 설탕시럽 (꿀단지)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 병 몸통 */}
      <rect x="10" y="12" width="12" height="16" rx="3" fill="#fbbf24"/>
      {/* 병 어깨 */}
      <ellipse cx="16" cy="13" rx="6" ry="2.5" fill="#f59e0b"/>
      {/* 병 목 */}
      <rect x="13" y="6" width="6" height="7" rx="2" fill="#fcd34d"/>
      {/* 뚜껑 */}
      <rect x="12" y="4" width="8" height="4" rx="2" fill="#92400e"/>
      {/* 드립 */}
      <path d="M16 12 Q18 15 17 18" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 광택 */}
      <ellipse cx="12.5" cy="18" rx="1.5" ry="3.5" fill="#fde68a" opacity="0.6"/>
    </svg>
  )
}

function Icon6({ s }: { s: number }) { // 딸기잼 (유리병)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 병 몸통 */}
      <rect x="8" y="13" width="16" height="16" rx="4" fill="#fda4af"/>
      {/* 잼 내용 */}
      <rect x="8" y="18" width="16" height="11" rx="4" fill="#e11d48"/>
      {/* 병 어깨 */}
      <ellipse cx="16" cy="14" rx="8" ry="3" fill="#fb7185"/>
      {/* 뚜껑 */}
      <rect x="10" y="8" width="12" height="7" rx="2" fill="#9f1239"/>
      <ellipse cx="16" cy="8" rx="6" ry="2" fill="#be123c"/>
      {/* 딸기 장식 */}
      <circle cx="16" cy="21" r="3" fill="#fda4af"/>
      <path d="M14 19 Q16 17 18 19" fill="#16a34a"/>
      {/* 광택 */}
      <ellipse cx="10.5" cy="19" rx="1.5" ry="3" fill="#fecdd3" opacity="0.7"/>
    </svg>
  )
}

function Icon7({ s }: { s: number }) { // 고추사탕 (막대사탕)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 막대 */}
      <rect x="20" y="18" width="2.5" height="12" rx="1.2" fill="#d97706" transform="rotate(-35 20 18)"/>
      {/* 사탕 몸통 */}
      <circle cx="14" cy="13" r="10" fill="#dc2626"/>
      {/* 나선 무늬 */}
      <path d="M14 4 Q20 8 20 14 Q20 20 14 22 Q8 20 8 14 Q8 8 14 7" fill="none" stroke="#fef2f2" strokeWidth="3" strokeLinecap="round"/>
      <path d="M14 8 Q18 10 18 14 Q18 18 14 19" fill="none" stroke="#fef2f2" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      {/* 광택 */}
      <ellipse cx="10" cy="9" rx="3" ry="2" fill="#f87171" opacity="0.6"/>
    </svg>
  )
}

function Icon8({ s }: { s: number }) { // 딸기에이드 (컵)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 컵 몸통 */}
      <path d="M7 10 L9 28 Q9 30 11 30 L21 30 Q23 30 23 28 L25 10Z" fill="#fda4af"/>
      {/* 음료 */}
      <path d="M8 14 L10 28 Q10 30 11 30 L21 30 Q23 30 23 28 L24 14Z" fill="#e11d48"/>
      {/* 컵 테두리 */}
      <rect x="6" y="8" width="20" height="4" rx="2" fill="#be185d"/>
      {/* 빨대 */}
      <rect x="19" y="2" width="2.5" height="18" rx="1.2" fill="#7e22ce"/>
      {/* 얼음/거품 */}
      <ellipse cx="12" cy="14" rx="2" ry="1.5" fill="#fecdd3" opacity="0.8"/>
      <ellipse cx="17" cy="13" rx="1.5" ry="1.2" fill="#fecdd3" opacity="0.8"/>
    </svg>
  )
}

function Icon9({ s }: { s: number }) { // 딸기고추소스 (냄비)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 손잡이 */}
      <rect x="2" y="16" width="5" height="3" rx="1.5" fill="#9f1239"/>
      <rect x="25" y="16" width="5" height="3" rx="1.5" fill="#9f1239"/>
      {/* 냄비 몸통 */}
      <rect x="6" y="13" width="20" height="14" rx="3" fill="#be185d"/>
      {/* 내용물 */}
      <rect x="6" y="17" width="20" height="10" rx="3" fill="#dc2626"/>
      {/* 뚜껑 */}
      <rect x="5" y="10" width="22" height="5" rx="2.5" fill="#9f1239"/>
      <ellipse cx="16" cy="10" rx="11" ry="2.5" fill="#be185d"/>
      {/* 뚜껑 손잡이 */}
      <ellipse cx="16" cy="8" rx="3.5" ry="2" fill="#7f1d1d"/>
      {/* 김 */}
      <path d="M12 8 Q11 5 12 3" stroke="#fda4af" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M16 8 Q15 4 16 2" stroke="#fda4af" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M20 8 Q21 5 20 3" stroke="#fda4af" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
    </svg>
  )
}

function Icon10({ s }: { s: number }) { // 딸기고추잼 (그릇)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 그릇 */}
      <path d="M4 14 Q4 28 16 28 Q28 28 28 14Z" fill="#fda4af"/>
      {/* 내용물 */}
      <path d="M6 16 Q7 26 16 26 Q25 26 26 16Z" fill="#dc2626"/>
      {/* 그릇 테두리 */}
      <ellipse cx="16" cy="14" rx="12" ry="3" fill="#be185d"/>
      {/* 숟가락 */}
      <rect x="22" y="6" width="2" height="14" rx="1" fill="#92400e" transform="rotate(20 22 6)"/>
      <ellipse cx="24" cy="8" rx="3" ry="2" fill="#b45309" transform="rotate(20 24 8)"/>
    </svg>
  )
}

function Icon11({ s }: { s: number }) { // 고추설탕크래커 (쿠키)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 쿠키 몸통 */}
      <circle cx="16" cy="16" r="13" fill="#d97706"/>
      <circle cx="16" cy="16" r="11" fill="#f59e0b"/>
      {/* 초코칩 (고추/설탕 파편) */}
      <ellipse cx="11" cy="12" rx="2" ry="1.5" fill="#dc2626"/>
      <ellipse cx="19" cy="11" rx="2" ry="1.5" fill="#dc2626"/>
      <ellipse cx="13" cy="19" rx="2" ry="1.5" fill="#dc2626"/>
      <ellipse cx="21" cy="18" rx="2" ry="1.5" fill="#dc2626"/>
      <ellipse cx="16" cy="15" rx="1.5" ry="1.2" fill="#fbbf24"/>
      {/* 광택 */}
      <ellipse cx="10" cy="11" rx="3" ry="1.5" fill="#fde68a" opacity="0.5"/>
    </svg>
  )
}

function Icon12({ s }: { s: number }) { // 프리미엄소스 (캔)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 캔 몸통 */}
      <rect x="8" y="9" width="16" height="18" rx="2" fill="#7c3aed"/>
      {/* 캔 상단 */}
      <ellipse cx="16" cy="9" rx="8" ry="2.5" fill="#6d28d9"/>
      {/* 캔 하단 */}
      <ellipse cx="16" cy="27" rx="8" ry="2.5" fill="#5b21b6"/>
      {/* 금색 띠 */}
      <rect x="8" y="14" width="16" height="4" fill="#fbbf24"/>
      {/* 라벨 */}
      <rect x="9" y="19" width="14" height="7" rx="1" fill="#8b5cf6"/>
      {/* 딸기 로고 */}
      <circle cx="16" cy="22" r="2.5" fill="#fda4af"/>
      <path d="M14.5 20.5 Q16 19 17.5 20.5" fill="#16a34a" stroke="none"/>
      {/* 탭 */}
      <rect x="13" y="6" width="6" height="2" rx="1" fill="#4c1d95"/>
      <rect x="15" y="4" width="2" height="4" rx="1" fill="#6d28d9"/>
    </svg>
  )
}

function Icon13({ s }: { s: number }) { // 매운케이크 (케이크)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 케이크 하단 */}
      <rect x="4" y="19" width="24" height="10" rx="3" fill="#fda4af"/>
      {/* 케이크 상단 레이어 */}
      <rect x="4" y="13" width="24" height="8" rx="2" fill="#fecdd3"/>
      {/* 크림 경계 */}
      <path d="M4 14 Q8 11 12 14 Q16 11 20 14 Q24 11 28 14" fill="none" stroke="#fda4af" strokeWidth="2.5"/>
      {/* 윗면 */}
      <ellipse cx="16" cy="13" rx="12" ry="3.5" fill="#f9a8d4"/>
      {/* 촛불 */}
      <rect x="12" y="6" width="2" height="7" rx="1" fill="#fbbf24"/>
      <rect x="18" y="5" width="2" height="8" rx="1" fill="#dc2626"/>
      {/* 불꽃 */}
      <ellipse cx="13" cy="5.5" rx="1.5" ry="2" fill="#f97316"/>
      <ellipse cx="19" cy="4.5" rx="1.5" ry="2" fill="#f97316"/>
      {/* 고추 장식 */}
      <path d="M14 20 Q16 17 18 20" fill="#dc2626"/>
    </svg>
  )
}

function Icon14({ s }: { s: number }) { // 딸기크림파이 (파이)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 파이 접시 */}
      <ellipse cx="16" cy="24" rx="13" ry="4" fill="#d97706"/>
      {/* 파이 크러스트 */}
      <path d="M3 20 Q3 26 16 26 Q29 26 29 20 L29 18 Q29 14 16 14 Q3 14 3 18Z" fill="#fbbf24"/>
      {/* 크림 */}
      <path d="M5 18 Q8 14 12 17 Q16 13 20 17 Q24 14 27 18" fill="#fef9c3" stroke="none"/>
      <path d="M5 18 Q8 14 12 17 Q16 13 20 17 Q24 14 27 18" fill="none" stroke="#fef9c3" strokeWidth="3" strokeLinecap="round"/>
      {/* 딸기 장식 */}
      <circle cx="11" cy="16" r="3" fill="#ef4444"/>
      <path d="M9.5 14 Q11 12 12.5 14" fill="#16a34a"/>
      <circle cx="21" cy="16" r="3" fill="#ef4444"/>
      <path d="M19.5 14 Q21 12 22.5 14" fill="#16a34a"/>
      {/* 파이 테두리 물결 */}
      <path d="M3 20 Q5 17 7 20 Q9 17 11 20 Q13 17 15 20 Q17 17 19 20 Q21 17 23 20 Q25 17 27 20 Q29 17 29 20" fill="none" stroke="#d97706" strokeWidth="1.5"/>
    </svg>
  )
}

function Icon15({ s }: { s: number }) { // 딸기젤리 (당고)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 막대 */}
      <rect x="14.5" y="4" width="3" height="26" rx="1.5" fill="#92400e"/>
      {/* 젤리볼 3개 */}
      <circle cx="16" cy="8" r="6" fill="#dc2626"/>
      <circle cx="16" cy="16" r="6" fill="#e11d48"/>
      <circle cx="16" cy="24" r="6" fill="#fda4af"/>
      {/* 광택 */}
      <ellipse cx="13.5" cy="6" rx="2" ry="1.5" fill="#fca5a5" opacity="0.7"/>
      <ellipse cx="13.5" cy="14" rx="2" ry="1.5" fill="#fb7185" opacity="0.7"/>
      <ellipse cx="13.5" cy="22" rx="2" ry="1.5" fill="#fecdd3" opacity="0.7"/>
    </svg>
  )
}

function Icon16({ s }: { s: number }) { // 딸기크림 (아이스크림)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 콘 */}
      <path d="M10 18 L16 31 L22 18Z" fill="#f59e0b"/>
      {/* 콘 줄무늬 */}
      <line x1="13" y1="18" x2="16" y2="31" stroke="#d97706" strokeWidth="1"/>
      <line x1="16" y1="18" x2="16" y2="31" stroke="#d97706" strokeWidth="1"/>
      <line x1="19" y1="18" x2="16" y2="31" stroke="#d97706" strokeWidth="1"/>
      {/* 아이스크림 스쿱 */}
      <circle cx="16" cy="13" r="9" fill="#fda4af"/>
      {/* 딸기 씨앗 */}
      <ellipse cx="12" cy="11" rx="1" ry="1.5" fill="#f87171" opacity="0.7" transform="rotate(-10 12 11)"/>
      <ellipse cx="18" cy="10" rx="1" ry="1.5" fill="#f87171" opacity="0.7" transform="rotate(10 18 10)"/>
      <ellipse cx="15" cy="16" rx="1" ry="1.5" fill="#f87171" opacity="0.7"/>
      {/* 광택 */}
      <ellipse cx="12" cy="9" rx="3" ry="2" fill="#fecdd3" opacity="0.7"/>
      {/* 드립 */}
      <path d="M22 16 Q24 18 23 21" stroke="#fda4af" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function Icon17({ s }: { s: number }) { // 고추딸기파이 (원형 파이)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 파이 바닥 */}
      <circle cx="16" cy="17" r="13" fill="#fbbf24"/>
      {/* 파이 내용 */}
      <circle cx="16" cy="17" r="10" fill="#dc2626"/>
      {/* 격자 무늬 */}
      <line x1="6" y1="17" x2="26" y2="17" stroke="#fbbf24" strokeWidth="2.5"/>
      <line x1="16" y1="7" x2="16" y2="27" stroke="#fbbf24" strokeWidth="2.5"/>
      <line x1="9" y1="10" x2="23" y2="24" stroke="#fbbf24" strokeWidth="2"/>
      <line x1="23" y1="10" x2="9" y2="24" stroke="#fbbf24" strokeWidth="2"/>
      {/* 파이 테두리 물결 */}
      <circle cx="16" cy="17" r="13" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="3 2"/>
      {/* 상단 별 장식 */}
      <circle cx="16" cy="5" r="3" fill="#d97706"/>
    </svg>
  )
}

function Icon18({ s }: { s: number }) { // 딸기설탕케이크 (케이크 조각)
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 케이크 조각 */}
      <path d="M4 13 L4 27 Q4 29 6 29 L26 29 Q28 29 28 27 L28 13Z" fill="#fda4af"/>
      {/* 케이크 레이어 */}
      <rect x="4" y="19" width="24" height="5" fill="#fecdd3"/>
      <rect x="4" y="13" width="24" height="6" fill="#fda4af"/>
      {/* 상단 크림 */}
      <path d="M4 13 Q7 9 10 13 Q13 9 16 13 Q19 9 22 13 Q25 9 28 13" fill="none" stroke="#fef9c3" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="16" cy="12" rx="12" ry="3.5" fill="#fef9c3"/>
      {/* 딸기 장식 */}
      <circle cx="10" cy="10" r="3.5" fill="#ef4444"/>
      <path d="M8.5 8 Q10 6 11.5 8" fill="#16a34a"/>
      <circle cx="22" cy="10" r="3.5" fill="#ef4444"/>
      <path d="M20.5 8 Q22 6 23.5 8" fill="#16a34a"/>
      {/* 크림 드립 */}
      <path d="M8 13 Q7 17 8 18" stroke="#fef9c3" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M24 13 Q25 17 24 18" stroke="#fef9c3" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function Icon19({ s }: { s: number }) { // 딸기고추마카롱
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 아래 쿠키 */}
      <ellipse cx="16" cy="23" rx="12" ry="5" fill="#e11d48"/>
      <ellipse cx="16" cy="21" rx="12" ry="5" fill="#be123c"/>
      {/* 크림 필링 */}
      <rect x="5" y="16" width="22" height="5" rx="1" fill="#fef9c3"/>
      {/* 위 쿠키 */}
      <ellipse cx="16" cy="14" rx="12" ry="5" fill="#fb7185"/>
      <ellipse cx="16" cy="12" rx="12" ry="5" fill="#f43f5e"/>
      {/* 위 쿠키 광택 */}
      <ellipse cx="11" cy="10.5" rx="4" ry="2" fill="#fda4af" opacity="0.5"/>
      {/* 고추 장식 */}
      <circle cx="16" cy="12" r="3" fill="#dc2626"/>
      <circle cx="13" cy="22" r="2" fill="#fda4af"/>
      <circle cx="19" cy="22" r="2" fill="#fda4af"/>
    </svg>
  )
}

function Icon20({ s }: { s: number }) { // 트로피
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 받침대 */}
      <rect x="10" y="27" width="12" height="3" rx="1.5" fill="#b45309"/>
      <rect x="14" y="23" width="4" height="5" rx="1" fill="#d97706"/>
      {/* 트로피 컵 */}
      <path d="M8 6 Q7 18 16 22 Q25 18 24 6Z" fill="#fbbf24"/>
      {/* 손잡이 */}
      <path d="M8 8 Q3 10 4 15 Q5 18 9 16" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
      <path d="M24 8 Q29 10 28 15 Q27 18 23 16" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
      {/* 광택 */}
      <ellipse cx="12" cy="10" rx="2.5" ry="5" fill="#fde68a" opacity="0.6"/>
      {/* 별 */}
      <path d="M16 8 L17.2 11.6 L21 11.6 L18 13.8 L19.2 17.4 L16 15.2 L12.8 17.4 L14 13.8 L11 11.6 L14.8 11.6Z" fill="#f59e0b"/>
      <path d="M16 8 L17.2 11.6 L21 11.6 L18 13.8 L19.2 17.4 L16 15.2 L12.8 17.4 L14 13.8 L11 11.6 L14.8 11.6Z" fill="#fef08a" opacity="0.6"/>
    </svg>
  )
}

// 포장됐을 때 (PK 처리)
function IconPacked({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      {/* 상자 */}
      <rect x="4" y="12" width="24" height="18" rx="2" fill="#f97316"/>
      {/* 뚜껑 */}
      <rect x="3" y="8" width="26" height="6" rx="2" fill="#ea580c"/>
      {/* 리본 세로 */}
      <rect x="14" y="8" width="4" height="22" fill="#dc2626"/>
      {/* 리본 가로 */}
      <rect x="3" y="17" width="26" height="4" fill="#dc2626"/>
      {/* 리본 매듭 */}
      <circle cx="16" cy="11" r="4" fill="#b91c1c"/>
      {/* 리본 날개 */}
      <path d="M16 11 Q12 7 9 9 Q11 12 16 11Z" fill="#dc2626"/>
      <path d="M16 11 Q20 7 23 9 Q21 12 16 11Z" fill="#dc2626"/>
      {/* 광택 */}
      <ellipse cx="8" cy="14" rx="2" ry="3" fill="#fb923c" opacity="0.5"/>
    </svg>
  )
}

const ICONS: Record<number, (s: number) => JSX.Element> = {
  1: s => <Icon1 s={s}/>,
  2: s => <Icon2 s={s}/>,
  3: s => <Icon3 s={s}/>,
  4: s => <Icon4 s={s}/>,
  5: s => <Icon5 s={s}/>,
  6: s => <Icon6 s={s}/>,
  7: s => <Icon7 s={s}/>,
  8: s => <Icon8 s={s}/>,
  9: s => <Icon9 s={s}/>,
  10: s => <Icon10 s={s}/>,
  11: s => <Icon11 s={s}/>,
  12: s => <Icon12 s={s}/>,
  13: s => <Icon13 s={s}/>,
  14: s => <Icon14 s={s}/>,
  15: s => <Icon15 s={s}/>,
  16: s => <Icon16 s={s}/>,
  17: s => <Icon17 s={s}/>,
  18: s => <Icon18 s={s}/>,
  19: s => <Icon19 s={s}/>,
  20: s => <Icon20 s={s}/>,
}

export function GradeIcon({ size, grade, packed }: Props) {
  if (packed) return <IconPacked s={size}/>
  const render = ICONS[grade]
  if (!render) return <Icon1 s={size}/>
  return render(size)
}
