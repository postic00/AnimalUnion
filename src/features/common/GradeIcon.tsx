import type { JSX } from 'react'

type Props = { size: number; grade: number; packed?: boolean }

function Icon1({ s }: { s: number }) { // 고추
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g1" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ff6b6b"/>
          <stop offset="100%" stopColor="#b71c1c"/>
        </linearGradient>
      </defs>
      <path d="M14 6 Q12 2 10 4" stroke="#2e7d32" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M15 5 Q16 1 18 3" stroke="#388e3c" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M10 7 Q5 10 4 16 Q3 23 9 28 Q12 31 16 31 Q14 28 11 23 Q8 17 12 11 Q17 8 22 7 Q17 4 10 7Z" fill="url(#gi_g1)" stroke="#7f1010" strokeWidth="1.5"/>
      <ellipse cx="9" cy="16" rx="1.5" ry="5" fill="#fff" opacity="0.25"/>
    </svg>
  )
}

function Icon2({ s }: { s: number }) { // 설탕
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g2t" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff"/>
          <stop offset="100%" stopColor="#f0e8dc"/>
        </linearGradient>
        <linearGradient id="gi_g2s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8ddd0"/>
          <stop offset="100%" stopColor="#c4b59e"/>
        </linearGradient>
        <linearGradient id="gi_g2r" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fff"/>
          <stop offset="100%" stopColor="#e0d6c8"/>
        </linearGradient>
      </defs>
      <path d="M16 6 L26 12 L16 18 L6 12Z" fill="url(#gi_g2t)" stroke="#b0a08a" strokeWidth="1.2"/>
      <path d="M6 12 L16 18 L16 28 L6 22Z" fill="url(#gi_g2s)" stroke="#b0a08a" strokeWidth="1.2"/>
      <path d="M26 12 L16 18 L16 28 L26 22Z" fill="url(#gi_g2r)" stroke="#b0a08a" strokeWidth="1.2"/>
      <circle cx="12" cy="10" r="1.2" fill="#fff" opacity="0.8"/>
      <circle cx="10" cy="12" r="0.6" fill="#fff" opacity="0.5"/>
    </svg>
  )
}

function Icon3({ s }: { s: number }) { // 딸기
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g3" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#ff7979"/>
          <stop offset="100%" stopColor="#c0392b"/>
        </linearGradient>
      </defs>
      <path d="M13 9 Q10 3 8 6" stroke="#27ae60" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M16 7 Q16 1 16 4" stroke="#27ae60" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M19 9 Q22 3 24 6" stroke="#27ae60" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M9 11 Q5 19 10 24 Q13 29 16 30 Q19 29 22 24 Q27 19 23 11 Q20 7 16 8 Q12 7 9 11Z" fill="url(#gi_g3)" stroke="#922b21" strokeWidth="1.8"/>
      <circle cx="13" cy="16" r="1" fill="#f9c8c8" opacity="0.7"/>
      <circle cx="19" cy="16" r="1" fill="#f9c8c8" opacity="0.7"/>
      <circle cx="16" cy="20" r="1" fill="#f9c8c8" opacity="0.7"/>
      <ellipse cx="12" cy="13" rx="1.5" ry="3" fill="#fff" opacity="0.3"/>
    </svg>
  )
}

function Icon4({ s }: { s: number }) { // 고추장
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g4" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#a0714f"/>
          <stop offset="100%" stopColor="#5c3310"/>
        </linearGradient>
      </defs>
      <rect x="13" y="2" width="6" height="5" rx="2" fill="#7a4e30" stroke="#3e2010" strokeWidth="1"/>
      <ellipse cx="16" cy="7" rx="7" ry="2.5" fill="#6b4226" stroke="#3e2010" strokeWidth="1.2"/>
      <path d="M9 9 Q7 12 6 17 Q6 23 9 27 Q12 30 16 30 Q20 30 23 27 Q26 23 26 17 Q25 12 23 9Z" fill="url(#gi_g4)" stroke="#3e2010" strokeWidth="1.5"/>
      <path d="M8 15 Q16 17 24 15" stroke="#4a2e14" strokeWidth="0.8" fill="none" opacity="0.5"/>
      <path d="M7 20 Q16 22 25 20" stroke="#4a2e14" strokeWidth="0.8" fill="none" opacity="0.5"/>
      <ellipse cx="16" cy="8" rx="5" ry="1.5" fill="#c0392b" opacity="0.7"/>
    </svg>
  )
}

function Icon5({ s }: { s: number }) { // 설탕시럽
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g5" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ffe082"/>
          <stop offset="100%" stopColor="#f9a825"/>
        </linearGradient>
      </defs>
      <rect x="12" y="1" width="8" height="3" rx="1.5" fill="#c49a2c" stroke="#8b6914" strokeWidth="1"/>
      <rect x="13" y="3" width="6" height="5" rx="1" fill="#e0c068" stroke="#b8860b" strokeWidth="1.2"/>
      <path d="M10 8 Q8 10 8 16 Q8 24 10 27 Q12 30 16 30 Q20 30 22 27 Q24 24 24 16 Q24 10 22 8Z" fill="url(#gi_g5)" stroke="#b8860b" strokeWidth="1.5"/>
      <path d="M10 18 Q10 24 12 27 Q14 29 16 29 Q18 29 20 27 Q22 24 22 18Z" fill="#e6a200" opacity="0.5"/>
      <ellipse cx="12" cy="14" rx="1.5" ry="4" fill="#fff" opacity="0.3"/>
      <path d="M14 8 Q13 10 14 12" stroke="#e6a200" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
    </svg>
  )
}

function Icon6({ s }: { s: number }) { // 딸기잼
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g6j" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9eb8"/>
          <stop offset="100%" stopColor="#e0456b"/>
        </linearGradient>
      </defs>
      <rect x="12" y="1" width="8" height="3" rx="1" fill="#d8d8d8" stroke="#999" strokeWidth="0.8"/>
      <rect x="11" y="3" width="10" height="4" rx="1.5" fill="#c0c0c0" stroke="#888" strokeWidth="1"/>
      <rect x="12" y="7" width="8" height="3" fill="#ffe0ea" stroke="#d4a0b0" strokeWidth="0.8" opacity="0.7"/>
      <path d="M8 10 Q7 12 7 18 Q7 25 10 28 Q13 30 16 30 Q19 30 22 28 Q25 25 25 18 Q25 12 24 10Z" fill="#ffe8f0" stroke="#d4a0b0" strokeWidth="1.2" opacity="0.85"/>
      <path d="M8 16 Q8 25 10 28 Q13 30 16 30 Q19 30 22 28 Q24 25 24 16Z" fill="url(#gi_g6j)" opacity="0.9"/>
      <circle cx="13" cy="22" r="1.5" fill="#ff6080" opacity="0.6"/>
      <circle cx="18" cy="25" r="1.2" fill="#ff6080" opacity="0.5"/>
      <ellipse cx="10.5" cy="16" rx="1.2" ry="5" fill="#fff" opacity="0.4"/>
    </svg>
  )
}

function Icon7({ s }: { s: number }) { // 매운사탕
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g7" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff8a65"/>
          <stop offset="100%" stopColor="#d32f2f"/>
        </linearGradient>
      </defs>
      <g transform="rotate(-30 16 16)">
        <path d="M7 16 Q4 12 2 9" stroke="#e65100" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M7 16 Q4 20 2 23" stroke="#e65100" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M25 16 Q28 12 30 9" stroke="#e65100" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M25 16 Q28 20 30 23" stroke="#e65100" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <ellipse cx="16" cy="16" rx="10" ry="8" fill="url(#gi_g7)" stroke="#b71c1c" strokeWidth="1.8"/>
        <path d="M16 11 Q14 14 16 16 Q18 14 16 11Z" fill="#ffeb3b" opacity="0.7"/>
        <ellipse cx="13" cy="14" rx="2" ry="1.5" fill="#fff" opacity="0.3"/>
      </g>
    </svg>
  )
}

function Icon8({ s }: { s: number }) { // 딸기캔디
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g8" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffb6c1"/>
          <stop offset="100%" stopColor="#e91e63"/>
        </linearGradient>
      </defs>
      <rect x="15" y="19" width="2.5" height="12" rx="1" fill="#d4a017" stroke="#b8860b" strokeWidth="0.8"/>
      <circle cx="16" cy="13" r="10" fill="url(#gi_g8)" stroke="#c2185b" strokeWidth="1.8"/>
      <path d="M16 5 Q22 8 20 13 Q18 18 13 16 Q8 14 10 10 Q12 6 16 5Z" fill="#fff" opacity="0.2"/>
      <circle cx="12" cy="10" r="2" fill="#fff" opacity="0.4"/>
    </svg>
  )
}

function Icon9({ s }: { s: number }) { // 매콤딸기소스
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <path d="M13 4 L19 4 L18 7 L14 7Z" fill="#555" stroke="#333" strokeWidth="1"/>
      <rect x="13" y="7" width="6" height="3" fill="#ddd" stroke="#aaa" strokeWidth="0.8"/>
      <path d="M9 10 L23 10 L25 28 Q16 30 7 28Z" fill="#f5f5f5" stroke="#bbb" strokeWidth="1.2"/>
      <rect x="9" y="16" width="5" height="10" fill="#d32f2f" opacity="0.8"/>
      <rect x="14" y="16" width="4" height="10" fill="#f9a825" opacity="0.8"/>
      <rect x="18" y="16" width="5" height="10" fill="#e91e63" opacity="0.8"/>
      <rect x="10" y="11" width="12" height="5" rx="1" fill="#fff" stroke="#ddd" strokeWidth="0.5"/>
      <circle cx="13" cy="13.5" r="1" fill="#d32f2f"/>
      <circle cx="16" cy="13.5" r="1" fill="#f9a825"/>
      <circle cx="19" cy="13.5" r="1" fill="#e91e63"/>
      <ellipse cx="11" cy="18" rx="1" ry="4" fill="#fff" opacity="0.3"/>
    </svg>
  )
}

function Icon10({ s }: { s: number }) { // 삼색소스
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g10" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff7043"/>
          <stop offset="30%" stopColor="#ffd54f"/>
          <stop offset="100%" stopColor="#ec407a"/>
        </linearGradient>
      </defs>
      <path d="M14 2 L18 2 L17 5 L15 5Z" fill="#666" stroke="#444" strokeWidth="1"/>
      <path d="M13 5 Q12 8 10 12 Q8 18 9 24 Q10 28 16 29 Q22 28 23 24 Q24 18 22 12 Q20 8 19 5Z" fill="url(#gi_g10)" stroke="#bf360c" strokeWidth="1.5"/>
      <ellipse cx="12" cy="16" rx="1.5" ry="5" fill="#fff" opacity="0.3"/>
      <circle cx="16" cy="16" r="3" fill="#fff" opacity="0.3"/>
      <text x="16" y="18" textAnchor="middle" fontSize="5" fill="#bf360c" fontWeight="bold">★</text>
    </svg>
  )
}

function Icon11({ s }: { s: number }) { // 모듬캔디
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <path d="M5 14 L27 14 L24 28 Q16 30 8 28Z" fill="#deb887" stroke="#8b6914" strokeWidth="1.5"/>
      <path d="M8 18 L24 18" stroke="#c4a060" strokeWidth="0.8" opacity="0.5"/>
      <path d="M8 22 L24 22" stroke="#c4a060" strokeWidth="0.8" opacity="0.5"/>
      <circle cx="11" cy="11" r="3.5" fill="#d32f2f" stroke="#b71c1c" strokeWidth="1"/>
      <circle cx="16" cy="9" r="3.5" fill="#e91e63" stroke="#c2185b" strokeWidth="1"/>
      <circle cx="21" cy="11" r="3.5" fill="#ff9800" stroke="#e65100" strokeWidth="1"/>
      <circle cx="10" cy="10" r="1" fill="#fff" opacity="0.4"/>
      <circle cx="15" cy="8" r="1" fill="#fff" opacity="0.4"/>
      <circle cx="20" cy="10" r="1" fill="#fff" opacity="0.4"/>
    </svg>
  )
}

function Icon12({ s }: { s: number }) { // 딸기마라소스
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g12" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5252"/>
          <stop offset="100%" stopColor="#880e4f"/>
        </linearGradient>
      </defs>
      <rect x="11" y="2" width="10" height="4" rx="2" fill="#c62828" stroke="#8b0000" strokeWidth="1"/>
      <path d="M9 6 Q8 10 8 18 Q8 26 12 29 Q14 30 16 30 Q18 30 20 29 Q24 26 24 18 Q24 10 23 6Z" fill="url(#gi_g12)" stroke="#6a0000" strokeWidth="1.5"/>
      <path d="M16 12 Q13 16 16 20 Q19 16 16 12Z" fill="#ff9800" opacity="0.7"/>
      <path d="M16 14 Q14.5 16.5 16 18.5 Q17.5 16.5 16 14Z" fill="#ffeb3b" opacity="0.8"/>
      <ellipse cx="11" cy="16" rx="1.2" ry="5" fill="#fff" opacity="0.2"/>
    </svg>
  )
}

function Icon13({ s }: { s: number }) { // 시그니처소스
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g13" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#7b1fa2"/>
          <stop offset="100%" stopColor="#4a0072"/>
        </linearGradient>
      </defs>
      <rect x="12" y="1" width="8" height="4" rx="1.5" fill="#ffd700" stroke="#b8860b" strokeWidth="1"/>
      <rect x="13" y="5" width="6" height="4" fill="#9c27b0" stroke="#6a1b9a" strokeWidth="0.8"/>
      <path d="M8 9 Q7 14 7 19 Q7 26 11 29 Q14 30 16 30 Q18 30 21 29 Q25 26 25 19 Q25 14 24 9Z" fill="url(#gi_g13)" stroke="#4a0072" strokeWidth="1.5"/>
      <rect x="9" y="15" width="14" height="8" rx="1.5" fill="#ffd700" opacity="0.3" stroke="#ffd700" strokeWidth="0.8"/>
      <text x="16" y="21" textAnchor="middle" fontSize="5" fill="#ffd700" fontWeight="bold">SIG</text>
      <ellipse cx="11" cy="16" rx="1.2" ry="5" fill="#fff" opacity="0.2"/>
    </svg>
  )
}

function Icon14({ s }: { s: number }) { // 프리미엄캔디
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g14" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd700"/>
          <stop offset="100%" stopColor="#b8860b"/>
        </linearGradient>
      </defs>
      <g transform="rotate(-15 16 16)">
        <path d="M7 16 Q3 11 1 7" stroke="#ffd700" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M7 16 Q3 21 1 25" stroke="#ffd700" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M25 16 Q29 11 31 7" stroke="#ffd700" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M25 16 Q29 21 31 25" stroke="#ffd700" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <ellipse cx="16" cy="16" rx="10" ry="8" fill="url(#gi_g14)" stroke="#8b6914" strokeWidth="1.8"/>
        <path d="M6 16 L26 16" stroke="#c62828" strokeWidth="2.5"/>
        <circle cx="16" cy="16" r="3" fill="#c62828" stroke="#8b0000" strokeWidth="1"/>
        <circle cx="16" cy="16" r="1.2" fill="#ff5252"/>
        <circle cx="11" cy="12" r="1" fill="#fff" opacity="0.5"/>
        <circle cx="21" cy="13" r="0.7" fill="#fff" opacity="0.4"/>
      </g>
    </svg>
  )
}

function Icon15({ s }: { s: number }) { // 마라캔디
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g15" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#ff6f00"/>
          <stop offset="100%" stopColor="#d32f2f"/>
        </linearGradient>
        <linearGradient id="gi_g15f" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#ffeb3b"/>
          <stop offset="60%" stopColor="#ff9800"/>
          <stop offset="100%" stopColor="#ff5722"/>
        </linearGradient>
      </defs>
      <rect x="15" y="22" width="2.5" height="9" rx="1" fill="#8d6e63" stroke="#5d4037" strokeWidth="0.8"/>
      <circle cx="16" cy="17" r="9" fill="url(#gi_g15)" stroke="#b71c1c" strokeWidth="1.8"/>
      <path d="M16 10 Q21 13 19 17 Q17 21 13 19 Q9 17 11 14 Q13 11 16 10Z" fill="#ff3d00" opacity="0.4"/>
      <path d="M16 0 Q11 5 13 9 Q9 6 12 10" fill="url(#gi_g15f)" stroke="#ff6f00" strokeWidth="0.8"/>
      <path d="M16 0 Q21 5 19 9 Q23 6 20 10" fill="url(#gi_g15f)" stroke="#ff6f00" strokeWidth="0.8"/>
      <path d="M16 1 Q14 5 16 8 Q18 5 16 1Z" fill="#ffeb3b" opacity="0.9"/>
      <circle cx="12" cy="15" r="2" fill="#fff" opacity="0.3"/>
    </svg>
  )
}

function Icon16({ s }: { s: number }) { // 마라크림
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g16" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffccbc"/>
          <stop offset="100%" stopColor="#e64a19"/>
        </linearGradient>
      </defs>
      <path d="M8 12 Q10 6 16 5 Q22 6 24 12" fill="#fff3e0" stroke="#ffab91" strokeWidth="1"/>
      <path d="M10 10 Q13 7 16 6 Q19 7 22 10" fill="#ffe0b2" stroke="none"/>
      <path d="M6 12 L26 12 L24 28 Q16 30 8 28Z" fill="url(#gi_g16)" stroke="#bf360c" strokeWidth="1.5"/>
      <path d="M9 18 Q16 20 23 18" stroke="#d84315" strokeWidth="0.8" fill="none" opacity="0.4"/>
      <circle cx="13" cy="9" r="1.5" fill="#d32f2f"/>
      <circle cx="19" cy="9" r="1.5" fill="#d32f2f"/>
      <ellipse cx="10" cy="18" rx="1.2" ry="4" fill="#fff" opacity="0.2"/>
    </svg>
  )
}

function Icon17({ s }: { s: number }) { // 마라파이
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g17" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe0b2"/>
          <stop offset="100%" stopColor="#e65100"/>
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="22" rx="13" ry="7" fill="#d4a060" stroke="#8b6914" strokeWidth="1.2"/>
      <ellipse cx="16" cy="20" rx="11" ry="5.5" fill="url(#gi_g17)" stroke="#bf360c" strokeWidth="1"/>
      <path d="M8 18 L24 22" stroke="#c49a2c" strokeWidth="1.5" opacity="0.6"/>
      <path d="M8 22 L24 18" stroke="#c49a2c" strokeWidth="1.5" opacity="0.6"/>
      <path d="M12 17 L12 23" stroke="#c49a2c" strokeWidth="1.2" opacity="0.5"/>
      <path d="M20 17 L20 23" stroke="#c49a2c" strokeWidth="1.2" opacity="0.5"/>
      <path d="M14 14 Q13 11 15 10" stroke="#d32f2f" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M18 14 Q19 11 17 10" stroke="#d32f2f" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M16 8 Q15 5 16 3" stroke="#999" strokeWidth="1" fill="none" opacity="0.4" strokeLinecap="round"/>
    </svg>
  )
}

function Icon18({ s }: { s: number }) { // 탕후루
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <rect x="15" y="4" width="2" height="26" rx="0.8" fill="#c49a2c" stroke="#8b6914" strokeWidth="0.8"/>
      <circle cx="16" cy="23" r="4.5" fill="#e53935" stroke="#b71c1c" strokeWidth="1.2"/>
      <circle cx="14" cy="22" r="1" fill="#fff" opacity="0.3"/>
      <circle cx="16" cy="14" r="4" fill="#7b1fa2" stroke="#4a148c" strokeWidth="1.2"/>
      <circle cx="14" cy="13" r="1" fill="#fff" opacity="0.3"/>
      <circle cx="16" cy="6" r="3.5" fill="#ff9800" stroke="#e65100" strokeWidth="1.2"/>
      <circle cx="14.5" cy="5" r="0.8" fill="#fff" opacity="0.3"/>
      <circle cx="20" cy="22" r="0.8" fill="#fff" opacity="0.6"/>
      <circle cx="19" cy="13" r="0.6" fill="#fff" opacity="0.5"/>
    </svg>
  )
}

function Icon19({ s }: { s: number }) { // 마라탕
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g19" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5722"/>
          <stop offset="100%" stopColor="#bf360c"/>
        </linearGradient>
      </defs>
      <path d="M10 8 Q9 4 10 2" stroke="#bbb" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round"/>
      <path d="M16 7 Q15 3 16 1" stroke="#bbb" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round"/>
      <path d="M22 8 Q23 4 22 2" stroke="#bbb" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round"/>
      <path d="M3 14 Q3 24 8 28 Q12 30 16 30 Q20 30 24 28 Q29 24 29 14Z" fill="url(#gi_g19)" stroke="#8b2500" strokeWidth="1.5"/>
      <path d="M2 14 L30 14" stroke="#d84315" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="16" cy="16" rx="11" ry="3" fill="#ff8a65" opacity="0.5"/>
      <circle cx="11" cy="18" r="2" fill="#d32f2f" opacity="0.7"/>
      <circle cx="16" cy="17" r="1.5" fill="#4caf50" opacity="0.6"/>
      <circle cx="21" cy="18" r="1.8" fill="#ff9800" opacity="0.7"/>
      <ellipse cx="2" cy="16" rx="2" ry="3" fill="none" stroke="#8b2500" strokeWidth="1.5"/>
      <ellipse cx="30" cy="16" rx="2" ry="3" fill="none" stroke="#8b2500" strokeWidth="1.5"/>
    </svg>
  )
}

function Icon20({ s }: { s: number }) { // 마라탕후루
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="gi_g20" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd700"/>
          <stop offset="100%" stopColor="#ff8f00"/>
        </linearGradient>
      </defs>
      <path d="M6 10 L3 4 L10 8 L16 2 L22 8 L29 4 L26 10Z" fill="url(#gi_g20)" stroke="#b8860b" strokeWidth="1.2"/>
      <circle cx="10" cy="8" r="1.2" fill="#ff1744"/>
      <circle cx="16" cy="4" r="1.2" fill="#e91e63"/>
      <circle cx="22" cy="8" r="1.2" fill="#ff1744"/>
      <ellipse cx="16" cy="24" rx="13" ry="5" fill="url(#gi_g20)" stroke="#b8860b" strokeWidth="1.2"/>
      <ellipse cx="16" cy="23" rx="10" ry="3.5" fill="#fff8e1" stroke="#ffd54f" strokeWidth="0.8"/>
      <rect x="15" y="11" width="2" height="14" rx="0.8" fill="#8d6e63" stroke="#5d4037" strokeWidth="0.8"/>
      <circle cx="16" cy="20" r="3" fill="#e53935" stroke="#b71c1c" strokeWidth="1"/>
      <circle cx="16" cy="15" r="2.8" fill="#7b1fa2" stroke="#4a148c" strokeWidth="1"/>
      <circle cx="16" cy="11" r="2.5" fill="#ff9800" stroke="#e65100" strokeWidth="1"/>
      <path d="M5 14 L6 12 L7 14 L6 16Z" fill="#ffd700" opacity="0.6"/>
      <path d="M25 16 L26 14 L27 16 L26 18Z" fill="#ffd700" opacity="0.5"/>
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
