import type { CSSProperties } from 'react'
import type { Factory } from '../../types/factory'
import type { AnimalSpecies } from '../animal/AnimalSvg'
import styles from './ProcessAnimation.module.css'

import hamsterWA from '../../assets/24_hamster_wa.png'
import hamsterPA from '../../assets/25_hamster_pa.png'
import hamsterPK from '../../assets/26_hamster_pk.png'
import catWA     from '../../assets/27_cat_wa.png'
import catPA     from '../../assets/28_cat_pa.png'
import catPK     from '../../assets/29_cat_pk.png'
import dogWA     from '../../assets/30_dog_wa.png'
import dogPA     from '../../assets/31_dog_pa.png'
import dogPK     from '../../assets/32_dog_pk.png'
import alienWA   from '../../assets/33_alien_wa.png'
import alienPA   from '../../assets/34_alien_pa.png'
import alienPK   from '../../assets/35_alien_pk.png'
import robotWA   from '../../assets/36_robot_wa.png'
import robotPA   from '../../assets/37_robot_pa.png'
import robotPK   from '../../assets/38_robot_pk.png'

const ANIM_IMGS: Record<string, Record<Factory['type'], string>> = {
  hamster: { WA: hamsterWA, PA: hamsterPA, PK: hamsterPK },
  cat:     { WA: catWA,     PA: catPA,     PK: catPK },
  dog:     { WA: dogWA,     PA: dogPA,     PK: dogPK },
  alien:   { WA: alienWA,   PA: alienPA,   PK: alienPK },
  friend:  { WA: alienWA,   PA: alienPA,   PK: alienPK },
  robot:   { WA: robotWA,   PA: robotPA,   PK: robotPK },
}

const OVL: CSSProperties = { position: 'absolute', bottom: 0, right: 0, zIndex: 2, pointerEvents: 'none', transform: 'scale(0.66)', transformOrigin: 'bottom right' }

// WA: 스폰지로 닦기
function SpongeOverlay({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" style={OVL}>
      <g className={styles.spongeArm}>
        {/* 손잡이 */}
        <rect x="18" y="6" width="3" height="10" rx="1.5" fill="#92400e"/>
        {/* 스폰지 */}
        <rect x="13" y="15" width="12" height="7" rx="2.5" fill="#fbbf24"/>
        <rect x="13" y="15" width="12" height="3.5" rx="2" fill="#fcd34d"/>
        {/* 거품 */}
        <circle cx="15" cy="24" r="1.5" fill="#e0f2fe" opacity="0.9"/>
        <circle cx="18" cy="25" r="1.2" fill="#e0f2fe" opacity="0.8"/>
        <circle cx="21" cy="24" r="1"   fill="#e0f2fe" opacity="0.7"/>
      </g>
    </svg>
  )
}

// PA: 국자로 젓기
function LadleOverlay({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" style={OVL}>
      <g className={styles.ladleArm}>
        {/* 자루 */}
        <rect x="18.5" y="6" width="3" height="14" rx="1.5" fill="#92400e"/>
        {/* 국자 머리 */}
        <ellipse cx="17" cy="21" rx="5.5" ry="4" fill="#94a3b8"/>
        <ellipse cx="17" cy="20" rx="5" ry="3" fill="#cbd5e1"/>
        {/* 국물 */}
        <ellipse cx="17" cy="21" rx="3.5" ry="2" fill="#fbbf24" opacity="0.7"/>
      </g>
    </svg>
  )
}

// PK: 가위로 자르기 (세로)
function ScissorsOverlay({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" style={OVL}>
      <g transform="rotate(90 16 16)">
        {/* 윗날 */}
        <g className={styles.scissorsTop}>
          <path d="M8 17 Q16 15 24 12" stroke="#64748b" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="16" cy="17" r="2.5" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
        </g>
        {/* 아랫날 */}
        <g className={styles.scissorsBot}>
          <path d="M8 17 Q16 19 24 22" stroke="#64748b" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="16" cy="17" r="2.5" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
        </g>
        {/* 손잡이 */}
        <ellipse cx="8" cy="14" rx="3" ry="4" fill="none" stroke="#94a3b8" strokeWidth="2"/>
        <ellipse cx="8" cy="20" rx="3" ry="4" fill="none" stroke="#94a3b8" strokeWidth="2"/>
      </g>
    </svg>
  )
}

interface Props {
  type: Factory['type']
  species: AnimalSpecies
  size: number
}

export function ProcessAnimation({ type, species, size }: Props) {
  const src = (ANIM_IMGS[species] ?? ANIM_IMGS.robot)[type]
  return <img src={src} width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} alt=""/>
}

export function ProcessOverlay({ type, size }: { type: Factory['type']; size: number }) {
  if (type === 'WA') return <SpongeOverlay s={size}/>
  if (type === 'PA') return <LadleOverlay  s={size}/>
  return <ScissorsOverlay s={size}/>
}
