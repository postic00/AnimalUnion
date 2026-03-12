import type { Clicker } from '../types/clicker'
import styles from './TabBar.module.css'

interface Props {
  clicker: Clicker
  clickerEmoji: string
  onClickerClick: () => void
  onTabChange: (tab: number | null) => void
  activeTab: number | null
}

const TABS = [
  { label: '생산', icon: '🌱' },
  { label: '공장', icon: '⚙️' },
  { label: '재료', icon: '📦' },
  { label: '환생', icon: '⭐' },
  { label: '설정', icon: '🔧' },
]

export default function TabBar({ clicker, clickerEmoji, onClickerClick, onTabChange, activeTab }: Props) {
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const progress = clicker.clickCount / clicker.threshold
  const dashOffset = circumference * (1 - Math.min(progress, 1))
  const isFull = clicker.clickCount >= clicker.threshold && clicker.clickCount > 0

  const handleTab = (tab: number) => {
    const next = activeTab === tab ? null : tab
    onTabChange(next)
  }

  return (
    <div className={styles.tabBar}>
      {TABS.map(({ label, icon }, i) => (
        <div
          key={i}
          className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
          onClick={() => handleTab(i)}
        >
          <span className={styles.tabIcon}>{icon}</span>
          <span className={styles.tabLabel}>{label}</span>
          {activeTab === i && <span className={styles.tabIndicator} />}
        </div>
      ))}
      <button
        className={`${styles.clickerButton}${isFull ? ` ${styles.clickerButtonFull}` : ''}`}
        style={{ bottom: activeTab !== null ? 'calc(40vh + 76px)' : 76 }}
        onClick={onClickerClick}
      >
        <svg className={styles.clickerRing} viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={radius} className={styles.ringBg} />
          <circle
            cx="28" cy="28" r={radius}
            className={styles.ringFill}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className={styles.clickerIcon}>{clickerEmoji}</span>
      </button>
    </div>
  )
}
