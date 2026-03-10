import { useState } from 'react'
import type { Clicker } from '../types/clicker'
import styles from './TabBar.module.css'

interface Props {
  clicker: Clicker
  onClickerClick: () => void
  onTabChange: (tab: number | null) => void
  sheetOpen: boolean
}

export default function TabBar({ clicker, onClickerClick, onTabChange, sheetOpen }: Props) {
  const [activeTab, setActiveTab] = useState<number | null>(null)
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const progress = clicker.clickCount / clicker.threshold
  const dashOffset = circumference * (1 - progress)

  const handleTab = (tab: number) => {
    const next = activeTab === tab ? null : tab
    setActiveTab(next)
    onTabChange(next)
  }

  return (
    <div className={styles.tabBar}>
      {['생산', '공장', '탭3'].map((label, i) => (
        <div key={i} className={styles.tab} onClick={() => handleTab(i)}>
          {label}
        </div>
      ))}
      <button
        className={styles.clickerButton}
        style={{ bottom: sheetOpen ? 'calc(40vh + 68px)' : 68 }}
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
        <span className={styles.clickerIcon}>👆</span>
      </button>
    </div>
  )
}
