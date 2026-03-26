import type { CSSProperties } from 'react'
import beltH  from '../../assets/02_belt_horizontal.png'
import beltV  from '../../assets/03_belt_vertical.png'
import beltTL from '../../assets/04_belt_corner_tl.png'
import beltTR from '../../assets/05_belt_corner_tr.png'
import beltBL from '../../assets/06_belt_corner_bl.png'
import beltBR from '../../assets/07_belt_corner_br.png'
import rsIcon from '../../assets/10_rs_waterwheel.png'
import reIcon from '../../assets/11_re_crate.png'
import styles from './Cell.module.css'

const OVL: CSSProperties = { position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'hidden' }

/** 수평 물결 (파도 주기 16px, 확장해서 seamless loop) */
function HWaves({ dir, s }: { dir: 'R' | 'L'; s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" style={OVL}>
      <g className={dir === 'R' ? styles.flowR : styles.flowL}>
        <path d="M-22 11 Q-18 8 -14 11 Q-10 14 -6 11 Q-2 8 2 11 Q6 14 10 11 Q14 8 18 11 Q22 14 26 11 Q30 8 34 11 Q38 14 42 11 Q46 8 50 11"
          stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M-22 19 Q-18 16 -14 19 Q-10 22 -6 19 Q-2 16 2 19 Q6 22 10 19 Q14 16 18 19 Q22 22 26 19 Q30 16 34 19 Q38 22 42 19 Q46 16 50 19"
          stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

/** 수직 물결 */
function VWaves({ dir, s }: { dir: 'D' | 'U'; s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" style={OVL}>
      <g className={dir === 'D' ? styles.flowD : styles.flowU}>
        <path d="M11 -22 Q8 -18 11 -14 Q14 -10 11 -6 Q8 -2 11 2 Q14 6 11 10 Q8 14 11 18 Q14 22 11 26 Q8 30 11 34 Q14 38 11 42 Q8 46 11 50"
          stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M19 -22 Q16 -18 19 -14 Q22 -10 19 -6 Q16 -2 19 2 Q22 6 19 10 Q16 14 19 18 Q22 22 19 26 Q16 30 19 34 Q22 38 19 42 Q16 46 19 50"
          stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

/** 코너 화살표 오버레이 */
function CornerArrow({ type, s }: { type: string; s: number }) {
  // 화살표 경로 & 방향 — 흐름 방향 기준
  let curvePath = ''
  let arrowPath = ''
  switch (type) {
    case 'RDR': // right→down: 왼쪽에서 들어와 아래로
      curvePath = 'M4 16 Q16 16 16 28'
      arrowPath = 'M11 24 L16 30 L21 24'
      break
    case 'RDL': // left→down: 오른쪽에서 들어와 아래로
      curvePath = 'M28 16 Q16 16 16 28'
      arrowPath = 'M11 24 L16 30 L21 24'
      break
    case 'RRL': // down→right: 위에서 들어와 오른쪽으로
      curvePath = 'M16 4 Q16 16 28 16'
      arrowPath = 'M24 11 L30 16 L24 21'
      break
    case 'RLR': // down→left: 위에서 들어와 왼쪽으로
      curvePath = 'M16 4 Q16 16 4 16'
      arrowPath = 'M8 11 L2 16 L8 21'
      break
  }
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" style={OVL}>
      <path d={curvePath} stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d={arrowPath} stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function RailIcon({ type, size }: { type: string; size: number }) {
  const wrap: CSSProperties = { position: 'relative', width: size, height: size, flexShrink: 0 }

  switch (type) {
    case 'RRN': return <div style={wrap}><img src={beltH} width={size} height={size} style={{ display: 'block', objectFit: 'fill' }} alt=""/><HWaves dir="R" s={size}/></div>
    case 'RLN': return <div style={wrap}><img src={beltH} width={size} height={size} style={{ display: 'block', objectFit: 'fill' }} alt=""/><HWaves dir="L" s={size}/></div>
    case 'RDN': return <div style={wrap}><img src={beltV} width={size} height={size} style={{ display: 'block', objectFit: 'fill' }} alt=""/><VWaves dir="D" s={size}/></div>
    case 'RUN': return <div style={wrap}><img src={beltV} width={size} height={size} style={{ display: 'block', objectFit: 'fill' }} alt=""/><VWaves dir="U" s={size}/></div>
    case 'RDR': return <div style={wrap}><img src={beltTR} width={size} height={size} style={{ display: 'block', objectFit: 'fill' }} alt=""/><CornerArrow type="RDR" s={size}/></div>
    case 'RLR': return <div style={wrap}><img src={beltBR} width={size} height={size} style={{ display: 'block', objectFit: 'fill' }} alt=""/><CornerArrow type="RLR" s={size}/></div>
    case 'RDL': return <div style={wrap}><img src={beltTL} width={size} height={size} style={{ display: 'block', objectFit: 'fill' }} alt=""/><CornerArrow type="RDL" s={size}/></div>
    case 'RRL': return <div style={wrap}><img src={beltBL} width={size} height={size} style={{ display: 'block', objectFit: 'fill' }} alt=""/><CornerArrow type="RRL" s={size}/></div>
    case 'RS':  return <img src={rsIcon} width={size} height={size} style={{ display: 'block', objectFit: 'fill' }} alt=""/>
    case 'RE':  return <img src={reIcon} width={size} height={size} style={{ display: 'block', objectFit: 'fill' }} alt=""/>
    default:    return null
  }
}
