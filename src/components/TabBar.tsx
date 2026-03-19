import type { Clicker } from '../types/clicker'
import { GradeIcon } from './GradeIcon'
import styles from './TabBar.module.css'

const BOOST_DURATION = 10 * 60 * 1000 // 10분

interface Props {
  clicker: Clicker
  clickerGrade: number
  onClickerClick: () => void
  onTabChange: (tab: number | null) => void
  activeTab: number | null
  speedBoostUntil: number
  goldBoostUntil: number
  now: number
  onSpeedBoost: () => void
  onGoldBoost: () => void
  tutorialHighlightTab?: number
}

function formatRemain(ms: number): string {
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}s`
}

const TABS = [
  { label: '공장', icon: '🌱' },
  { label: '재료', icon: '📦' },
  { label: '동물', icon: '🐾' },
  { label: '환생', icon: '⭐' },
  { label: '순위', icon: '🏆' },
  { label: '설정', icon: '🔧' },
]

export default function TabBar({ clicker, clickerGrade, onClickerClick, onTabChange, activeTab, speedBoostUntil, goldBoostUntil, now, onSpeedBoost, onGoldBoost, tutorialHighlightTab }: Props) {
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const progress = clicker.clickCount / clicker.threshold
  const dashOffset = circumference * (1 - Math.min(progress, 1))
  const isFull = clicker.clickCount >= clicker.threshold && clicker.clickCount > 0

  const safeBottom = 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))'
  const floatBottom = activeTab !== null
    ? `calc(40vh + 76px + ${safeBottom})`
    : `calc(76px + ${safeBottom})`

  const speedRemain = Math.max(0, speedBoostUntil - now)
  const goldRemain = Math.max(0, goldBoostUntil - now)
  const speedProgress = Math.min(speedRemain, BOOST_DURATION) / BOOST_DURATION
  const goldProgress = Math.min(goldRemain, BOOST_DURATION) / BOOST_DURATION
  const speedDash = circumference * (1 - Math.min(speedProgress, 1))
  const goldDash = circumference * (1 - Math.min(goldProgress, 1))

  const handleTab = (tab: number) => {
    const next = activeTab === tab ? null : tab
    onTabChange(next)
  }

  return (
    <div className={styles.tabBar}>
      {TABS.map(({ label, icon }, i) => (
        <div
          key={i}
          className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''} ${tutorialHighlightTab === i ? styles.tabHighlight : ''}`}
          onClick={() => handleTab(i)}
        >
          <span className={styles.tabIcon}>{icon}</span>
          <span className={styles.tabLabel}>{label}</span>
          {activeTab === i && <span className={styles.tabIndicator} />}
        </div>
      ))}

      {/* 클리커 (우측) */}
      <button
        className={`${styles.clickerButton}${isFull ? ` ${styles.clickerButtonFull}` : ''}`}
        style={{ bottom: floatBottom }}
        onClick={onClickerClick}
      >
        <svg className={styles.clickerRing} viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={radius} className={styles.ringBg} />
          <circle cx="28" cy="28" r={radius} className={styles.ringFill} strokeDasharray={circumference} strokeDashoffset={dashOffset} />
        </svg>
        <span className={styles.clickerIcon}>
          {clickerGrade > 0 ? <GradeIcon size={28} grade={clickerGrade}/> : '👆'}
        </span>
      </button>

      {/* 배속 버튼 (좌측 하단) */}
      <button
        className={`${styles.boostButton} ${speedRemain > 0 ? styles.boostActive : ''}`}
        style={{ bottom: floatBottom }}
        onClick={onSpeedBoost}
      >
        <svg className={styles.clickerRing} viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={radius} className={styles.ringBg} />
          {speedRemain > 0 && <circle cx="28" cy="28" r={radius} className={styles.boostRingFill} strokeDasharray={circumference} strokeDashoffset={speedDash} />}
        </svg>
        <div className={styles.boostInner}>
          <span className={styles.boostIcon}>⚡</span>
          {speedRemain > 0 && <span className={styles.boostTime}>{formatRemain(speedRemain)}</span>}
        </div>
      </button>

      {/* 골드배수 버튼 (좌측 상단) */}
      <button
        className={`${styles.boostButton} ${goldRemain > 0 ? styles.boostActive : ''}`}
        style={{ bottom: `calc(${floatBottom} + 68px)` }}
        onClick={onGoldBoost}
      >
        <svg className={styles.clickerRing} viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={radius} className={styles.ringBg} />
          {goldRemain > 0 && <circle cx="28" cy="28" r={radius} className={styles.boostRingFill} strokeDasharray={circumference} strokeDashoffset={goldDash} />}
        </svg>
        <div className={styles.boostInner}>
          <span className={styles.boostIcon}>💰</span>
          {goldRemain > 0 && <span className={styles.boostTime}>{formatRemain(goldRemain)}</span>}
        </div>
      </button>
    </div>
  )
}
