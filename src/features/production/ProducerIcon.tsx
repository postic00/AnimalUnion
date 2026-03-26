import type { CSSProperties } from 'react'
import styles from './ProducerIcon.module.css'
import pandaGrade1 from '../../assets/21_panda_grade1.png'
import pandaGrade2 from '../../assets/22_panda_grade2.png'
import pandaGrade3 from '../../assets/23_panda_grade3.png'

const PANDA_IMGS = [pandaGrade1, pandaGrade2, pandaGrade3]

const OVL: CSSProperties = { position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none', transform: 'scale(0.66)', transformOrigin: 'bottom right' }

// Grade 1: 삽 오버레이
function ShovelOverlay({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" style={OVL}>
      <g className={styles.shovelDirt}>
        <circle cx="24" cy="29" r="1.5" fill="#92400e" opacity="0.85"/>
        <circle cx="27" cy="27" r="1"   fill="#92400e" opacity="0.7"/>
        <circle cx="21" cy="30" r="1"   fill="#92400e" opacity="0.65"/>
      </g>
      <ellipse cx="21" cy="31" rx="6" ry="1.5" fill="#a16207" opacity="0.4"/>
      <g className={styles.shovelArm}>
        <rect x="19.5" y="7" width="2.5" height="14" rx="1.2" fill="#92400e"/>
        <path d="M18 20 L23 20 L22.5 27 Q21 29 19.5 27 Z" fill="#9ca3af"/>
        <rect x="17.5" y="19" width="6" height="2" rx="0.5" fill="#6b7280"/>
      </g>
    </svg>
  )
}

// Grade 2: 낫 오버레이
function ScytheOverlay({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" style={OVL}>
      <path d="M1 30 Q2 24 3 30" stroke="#4ade80" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path className={styles.scytheGrass} d="M5 30 Q7 22 9 30" stroke="#22c55e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <g className={styles.scytheCut}>
        <line x1="5" y1="30" x2="10" y2="30" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="6" cy="28" r="1"   fill="#4ade80" opacity="0.7"/>
        <circle cx="9" cy="27" r="0.8" fill="#22c55e" opacity="0.7"/>
      </g>
      <path d="M11 30 Q12 25 13 30" stroke="#4ade80" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <g className={styles.scytheArm}>
        <rect x="18.5" y="8" width="2.5" height="13" rx="1.2" fill="#92400e"/>
        <path d="M15 20 Q24 17 27 8" stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

// Grade 3: 과일 낙하 오버레이
function FruitOverlay({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" style={OVL}>
      <ellipse className={styles.treeBerry3} cx="21" cy="15" rx="2" ry="2.4" fill="#ef4444" opacity="0.95"/>
      <ellipse className={styles.treeBerry4} cx="24" cy="20" rx="2" ry="2.4" fill="#ef4444" opacity="0.95"/>
    </svg>
  )
}

export function ProducerAnimation({ grade, size }: { grade: number; size: number }) {
  const src = PANDA_IMGS[Math.min(grade, 3) - 1] ?? pandaGrade1
  return <img src={src} width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} alt=""/>
}

export function ProducerOverlay({ grade, size }: { grade: number; size: number }) {
  if (grade === 1) return <ShovelOverlay s={size}/>
  if (grade === 2) return <ScytheOverlay s={size}/>
  return <FruitOverlay s={size}/>
}
