import { useEffect, useRef, useState } from 'react'
import { fetchAndSaveWeekConfig } from '../lib/userProfile'
import { loadWeekConfig } from '../utils/saveLoad'
import { applyWeekConfig } from '../config'
import styles from './SplashScreen.module.css'

interface Props {
  onDone: () => void
}

const MIN_DISPLAY_MS = 1500

function TanghuluSvg({ size = 80 }: { size?: number }) {
  const r = size * 0.19
  const cx = size * 0.5
  const spacing = r * 2.18
  const topY = r + 2
  return (
    <svg width={size} height={size * 2} viewBox={`0 0 ${size} ${size * 2}`}>
      <rect x={cx - 3.5} y={topY - r * 0.4} width={7} height={size * 1.85} rx={3.5} fill="#78350f"/>
      {[0,1,2,3,4].map(i => {
        const cy = topY + i * spacing
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill="#ef4444"/>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(251,191,36,0.45)" strokeWidth={1.8}/>
            <ellipse cx={cx - r*0.28} cy={cy - r*0.32} rx={r*0.38} ry={r*0.21} fill="rgba(255,255,255,0.52)"/>
          </g>
        )
      })}
    </svg>
  )
}

function HamsterFace({ s }: { s: number }) {
  const cx = s / 2, cy = s / 2, r = s * 0.33
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <ellipse cx={cx - r*0.8} cy={cy + r*0.28} rx={r*0.68} ry={r*0.55} fill="#f9c4af"/>
      <ellipse cx={cx + r*0.8} cy={cy + r*0.28} rx={r*0.68} ry={r*0.55} fill="#f9c4af"/>
      <circle cx={cx} cy={cy} r={r} fill="#f9d4b0"/>
      <circle cx={cx - r*0.68} cy={cy - r*0.82} r={r*0.42} fill="#f9a8b4"/>
      <circle cx={cx + r*0.68} cy={cy - r*0.82} r={r*0.42} fill="#f9a8b4"/>
      <circle cx={cx - r*0.68} cy={cy - r*0.82} r={r*0.23} fill="#fbc4cd"/>
      <circle cx={cx + r*0.68} cy={cy - r*0.82} r={r*0.23} fill="#fbc4cd"/>
      <circle cx={cx - r*0.36} cy={cy - r*0.14} r={r*0.17} fill="#1c1917"/>
      <circle cx={cx + r*0.36} cy={cy - r*0.14} r={r*0.17} fill="#1c1917"/>
      <circle cx={cx - r*0.29} cy={cy - r*0.21} r={r*0.06} fill="#fff"/>
      <circle cx={cx + r*0.43} cy={cy - r*0.21} r={r*0.06} fill="#fff"/>
      <ellipse cx={cx} cy={cy + r*0.22} rx={r*0.15} ry={r*0.12} fill="#f472a0"/>
      <ellipse cx={cx - r*0.72} cy={cy + r*0.37} rx={r*0.32} ry={r*0.22} fill="#f9a8b4" opacity={0.5}/>
      <ellipse cx={cx + r*0.72} cy={cy + r*0.37} rx={r*0.32} ry={r*0.22} fill="#f9a8b4" opacity={0.5}/>
    </svg>
  )
}

function CatFace({ s }: { s: number }) {
  const cx = s / 2, cy = s / 2, r = s * 0.32
  const ear = (sign: 1 | -1) => [
    `${cx + sign*r*0.82},${cy - r*0.68}`,
    `${cx + sign*r*1.08},${cy - r*1.55}`,
    `${cx + sign*r*0.32},${cy - r*0.82}`,
  ].join(' ')
  const earInner = (sign: 1 | -1) => [
    `${cx + sign*r*0.8},${cy - r*0.78}`,
    `${cx + sign*r*1.02},${cy - r*1.42}`,
    `${cx + sign*r*0.4},${cy - r*0.88}`,
  ].join(' ')
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <polygon points={ear(-1)} fill="#d4a96a"/>
      <polygon points={ear(1)} fill="#d4a96a"/>
      <polygon points={earInner(-1)} fill="#f9a8b4" opacity={0.7}/>
      <polygon points={earInner(1)} fill="#f9a8b4" opacity={0.7}/>
      <ellipse cx={cx} cy={cy + r*0.1} rx={r} ry={r*0.93} fill="#f5deb3"/>
      <ellipse cx={cx - r*0.38} cy={cy - r*0.04} rx={r*0.21} ry={r*0.18} fill="#1c1917"/>
      <ellipse cx={cx + r*0.38} cy={cy - r*0.04} rx={r*0.21} ry={r*0.18} fill="#1c1917"/>
      <ellipse cx={cx - r*0.3} cy={cy - r*0.1} rx={r*0.08} ry={r*0.07} fill="#fff"/>
      <ellipse cx={cx + r*0.45} cy={cy - r*0.1} rx={r*0.08} ry={r*0.07} fill="#fff"/>
      <polygon points={`${cx},${cy+r*0.28} ${cx-r*0.11},${cy+r*0.44} ${cx+r*0.11},${cy+r*0.44}`} fill="#f472a0"/>
      <line x1={cx-r*0.35} y1={cy+r*0.45} x2={cx-r*0.98} y2={cy+r*0.32} stroke="#9ca3af" strokeWidth="0.9" opacity="0.6"/>
      <line x1={cx-r*0.35} y1={cy+r*0.5} x2={cx-r*0.98} y2={cy+r*0.64} stroke="#9ca3af" strokeWidth="0.9" opacity="0.6"/>
      <line x1={cx+r*0.35} y1={cy+r*0.45} x2={cx+r*0.98} y2={cy+r*0.32} stroke="#9ca3af" strokeWidth="0.9" opacity="0.6"/>
      <line x1={cx+r*0.35} y1={cy+r*0.5} x2={cx+r*0.98} y2={cy+r*0.64} stroke="#9ca3af" strokeWidth="0.9" opacity="0.6"/>
    </svg>
  )
}

function DogFace({ s }: { s: number }) {
  const cx = s / 2, cy = s / 2, r = s * 0.32
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <ellipse cx={cx - r*1.08} cy={cy + r*0.38} rx={r*0.52} ry={r*0.88} fill="#b8956e"/>
      <ellipse cx={cx + r*1.08} cy={cy + r*0.38} rx={r*0.52} ry={r*0.88} fill="#b8956e"/>
      <circle cx={cx} cy={cy} r={r} fill="#c8a882"/>
      <ellipse cx={cx} cy={cy + r*0.38} rx={r*0.56} ry={r*0.44} fill="#e8c9a0"/>
      <circle cx={cx - r*0.38} cy={cy - r*0.22} r={r*0.19} fill="#1c1917"/>
      <circle cx={cx + r*0.38} cy={cy - r*0.22} r={r*0.19} fill="#1c1917"/>
      <circle cx={cx - r*0.3} cy={cy - r*0.3} r={r*0.07} fill="#fff"/>
      <circle cx={cx + r*0.46} cy={cy - r*0.3} r={r*0.07} fill="#fff"/>
      <ellipse cx={cx} cy={cy + r*0.26} rx={r*0.25} ry={r*0.17} fill="#1c1917"/>
      <ellipse cx={cx - r*0.08} cy={cy + r*0.19} rx={r*0.1} ry={r*0.07} fill="#fff" opacity={0.4}/>
      <ellipse cx={cx - r*0.62} cy={cy + r*0.16} rx={r*0.28} ry={r*0.2} fill="#f9a8b4" opacity={0.4}/>
      <ellipse cx={cx + r*0.62} cy={cy + r*0.16} rx={r*0.28} ry={r*0.2} fill="#f9a8b4" opacity={0.4}/>
    </svg>
  )
}

function BgDecoSvg() {
  const circles: [number, number, number, number][] = [
    [28, 58, 17, 0.12], [312, 98, 11, 0.1], [338, 275, 21, 0.08],
    [18, 348, 13, 0.1], [322, 498, 15, 0.1], [48, 598, 19, 0.08],
    [282, 678, 11, 0.12], [178, 78, 8, 0.09], [152, 648, 10, 0.1],
  ]
  const stars: [number, number, number][] = [
    [62, 142, 7], [292, 198, 5], [342, 402, 9],
    [14, 452, 5], [332, 618, 7], [72, 698, 11],
  ]
  return (
    <svg className={styles.bgSvg} viewBox="0 0 360 760" preserveAspectRatio="xMidYMid slice">
      {circles.map(([x, y, r, o], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={`rgba(255,255,255,${o})`}/>
      ))}
      {stars.map(([x, y, s], i) => (
        <polygon key={i}
          points={[0,1,2,3,4].flatMap(j => {
            const oRad = (j * 72 - 90) * Math.PI / 180
            const iRad = (j * 72 + 36 - 90) * Math.PI / 180
            return [
              `${x + s * Math.cos(oRad)},${y + s * Math.sin(oRad)}`,
              `${x + s * 0.42 * Math.cos(iRad)},${y + s * 0.42 * Math.sin(iRad)}`,
            ]
          }).join(' ')}
          fill="rgba(255,255,255,0.18)"
        />
      ))}
      <circle cx="44" cy="248" r="9" fill="rgba(220,38,38,0.18)"/>
      <circle cx="44" cy="231" r="9" fill="rgba(220,38,38,0.18)"/>
      <circle cx="316" cy="358" r="8" fill="rgba(220,38,38,0.16)"/>
      <circle cx="316" cy="342" r="8" fill="rgba(220,38,38,0.16)"/>
    </svg>
  )
}

export default function SplashScreen({ onDone }: Props) {
  const [fading, setFading] = useState(false)
  const configDoneRef = useRef(false)
  const timerDoneRef = useRef(false)

  const tryDone = () => {
    if (configDoneRef.current && timerDoneRef.current) setFading(true)
  }

  useEffect(() => {
    console.log('[SplashScreen] fetchAndSaveWeekConfig 시작')
    fetchAndSaveWeekConfig().then(() => {
      console.log('[SplashScreen] fetchAndSaveWeekConfig 완료')
      const fresh = loadWeekConfig()
      console.log('[SplashScreen] loadWeekConfig:', fresh)
      if (fresh) applyWeekConfig(fresh)
      console.log('[SplashScreen] CONFIG.WEEK:', (window as any).CONFIG_WEEK_DEBUG = fresh)
      configDoneRef.current = true
      console.log('[SplashScreen] configDone=true, timerDone:', timerDoneRef.current)
      tryDone()
    }).catch((e) => {
      console.warn('[SplashScreen] fetch 실패:', e)
      configDoneRef.current = true
      tryDone()
    })

    const timer = setTimeout(() => {
      timerDoneRef.current = true
      configDoneRef.current = true
      console.log('[SplashScreen] timerDone=true, configDone:', configDoneRef.current)
      tryDone()
    }, MIN_DISPLAY_MS)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!fading) return
    const timer = setTimeout(onDone, 500)
    return () => clearTimeout(timer)
  }, [fading, onDone])

  return (
    <div className={`${styles.splash} ${fading ? styles.fadeOut : ''}`}>
      <BgDecoSvg />
      <div className={styles.glow} />
      <div className={styles.content}>
        <div className={styles.tanghulu}>
          <TanghuluSvg size={82} />
        </div>
        <div className={styles.title}>동물노동조합</div>
        <div className={styles.subtitle}>마라탕후루 공장</div>
        <div className={styles.faces}>
          <HamsterFace s={58} />
          <CatFace s={58} />
          <DogFace s={58} />
        </div>
        <div className={styles.rail}>
          <svg className={styles.railTrack} viewBox="0 0 240 28" preserveAspectRatio="none">
            {/* 사탕 가드레일 */}
            {Array.from({ length: 18 }).map((_, i) => (
              <rect key={i} x={i * 14} y={0} width={14} height={5}
                fill={i % 2 === 0 ? '#ef4444' : '#fff7f7'} opacity={0.85}/>
            ))}
            {Array.from({ length: 18 }).map((_, i) => (
              <rect key={i} x={i * 14} y={23} width={14} height={5}
                fill={i % 2 === 0 ? '#ef4444' : '#fff7f7'} opacity={0.85}/>
            ))}
            {/* 물 배경 */}
            <rect x={0} y={5} width={240} height={18} fill="#bfdbfe"/>
            <path d="M0 11 Q10 8 20 11 Q30 14 40 11 Q50 8 60 11 Q70 14 80 11 Q90 8 100 11 Q110 14 120 11 Q130 8 140 11 Q150 14 160 11 Q170 8 180 11 Q190 14 200 11 Q210 8 220 11 Q230 14 240 11"
              stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" fill="none"/>
          </svg>
          <svg className={styles.skewer} viewBox="0 0 36 80" preserveAspectRatio="xMidYMid meet">
            <rect x={16} y={0} width={5} height={78} rx={2.5} fill="#78350f"/>
            {[0,1,2].map(i => (
              <g key={i}>
                <circle cx={18.5} cy={11 + i * 25} r={10} fill={i % 2 === 0 ? '#ef4444' : '#7c3aed'}/>
                <circle cx={18.5} cy={11 + i * 25} r={10} fill="none" stroke="rgba(251,191,36,0.4)" strokeWidth={1.5}/>
                <ellipse cx={14} cy={7 + i * 25} rx={3.5} ry={2} fill="rgba(255,255,255,0.5)"/>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}
