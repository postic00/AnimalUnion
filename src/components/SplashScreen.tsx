import { useEffect, useRef, useState } from 'react'
import { fetchAndSaveWeekConfig } from '../lib/userProfile'
import { loadWeekConfig } from '../utils/saveLoad'
import { applyWeekConfig } from '../config'
import styles from './SplashScreen.module.css'

interface Props {
  onDone: () => void
}

const MIN_DISPLAY_MS = 1500

const BG_EMOJIS = [
  { emoji: '🍲', top: '8%',  left: '5%',  size: 36, rot: -15 },
  { emoji: '🐹', top: '12%', left: '75%', size: 30, rot: 20  },
  { emoji: '🍡', top: '20%', left: '88%', size: 40, rot: -10 },
  { emoji: '🐱', top: '5%',  left: '45%', size: 28, rot: 8   },
  { emoji: '🌶️', top: '35%', left: '3%',  size: 32, rot: 30  },
  { emoji: '🐶', top: '70%', left: '82%', size: 34, rot: -20 },
  { emoji: '🍲', top: '75%', left: '10%', size: 44, rot: 12  },
  { emoji: '🍡', top: '82%', left: '55%', size: 30, rot: -8  },
  { emoji: '🌶️', top: '60%', left: '90%', size: 28, rot: 25  },
  { emoji: '🐹', top: '88%', left: '30%', size: 32, rot: -18 },
  { emoji: '⭐', top: '45%', left: '92%', size: 24, rot: 0   },
  { emoji: '⭐', top: '28%', left: '2%',  size: 20, rot: 0   },
  { emoji: '🍡', top: '50%', left: '5%',  size: 26, rot: 15  },
  { emoji: '🐱', top: '90%', left: '70%', size: 28, rot: 10  },
]

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
      configDoneRef.current = true  // 타이머 만료 시 config 대기 없이 강제 진행
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
      {/* 배경 장식 이모지 */}
      {BG_EMOJIS.map((item, i) => (
        <span
          key={i}
          className={styles.bgEmoji}
          style={{
            top: item.top,
            left: item.left,
            fontSize: item.size,
            transform: `rotate(${item.rot}deg)`,
          }}
        >
          {item.emoji}
        </span>
      ))}

      {/* 중앙 글로우 */}
      <div className={styles.glow} />

      {/* 메인 콘텐츠 */}
      <div className={styles.content}>
        <div className={styles.animals}>🐹🐱🐶</div>
        <div className={styles.title}>동물노동조합</div>
        <div className={styles.subtitle}>마라탕후루 공장</div>
        <div className={styles.food}>🍲🍡</div>
      </div>
    </div>
  )
}
