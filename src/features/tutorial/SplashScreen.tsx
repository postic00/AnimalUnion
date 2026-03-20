import { useEffect, useRef, useState } from 'react'
import { CloudService } from '../../services/CloudService'
import { SaveService } from '../../services/SaveService'
import { applyWeekConfig } from '../../config'
import styles from './SplashScreen.module.css'

interface Props {
  onDone: () => void
}

const MIN_DISPLAY_MS = 1500



export default function SplashScreen({ onDone }: Props) {
  const [fading, setFading] = useState(false)
  const configDoneRef = useRef(false)
  const timerDoneRef = useRef(false)

  const tryDone = () => {
    if (configDoneRef.current && timerDoneRef.current) setFading(true)
  }

  useEffect(() => {
    CloudService.fetchAndSaveWeekConfig().then(() => {
      const fresh = SaveService.loadWeekConfig()
      if (fresh) applyWeekConfig(fresh)
      configDoneRef.current = true
      tryDone()
    }).catch(() => {
      configDoneRef.current = true
      tryDone()
    })

    const timer = setTimeout(() => {
      timerDoneRef.current = true
      configDoneRef.current = true
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
      <img src="/tutorial/slide1.png" className={styles.bgImg} alt="" />
      <div className={styles.content}>
        <img src="/tutorial/slide1.png" className={styles.splashImg} alt="" />
        <div className={styles.title}>동물노동조합</div>
        <div className={styles.subtitle}>마라탕후루 공장</div>
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
