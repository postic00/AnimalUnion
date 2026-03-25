import type { Clicker } from '../../types/clicker'
import { GradeIcon } from '../common/GradeIcon'
import styles from './TabBar.module.css'

import tabFactory  from '../../assets/39_tab_factory.png'
import tabMaterial from '../../assets/40_tab_material.png'
import tabAnimal   from '../../assets/41_tab_animal.png'
import tabRebirth  from '../../assets/42_tab_rebirth.png'
import tabRanking  from '../../assets/43_tab_ranking.png'
import tabSettings from '../../assets/44_tab_settings.png'
import boostSpeed    from '../../assets/55_boost_speed.png'
import boostSpeedOff from '../../assets/56_boost_speed_off.png'
import boostGold     from '../../assets/57_boost_gold.png'
import boostGoldOff  from '../../assets/58_boost_gold_off.png'
import clickerImg    from '../../assets/59_clicker.png'
import clickerFull   from '../../assets/60_clicker_full.png'

const BOOST_DURATION = 10 * 60 * 1000 // 10분

interface Props {
  clicker: Clicker
  clickerGrade: number
  onClickerClick: () => void
  onTabChange: (tab: number | null) => void
  activeTab: number | null
  speedBoostRemaining: number
  goldBoostRemaining: number
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
  { label: '공장',   img: tabFactory },
  { label: '재료',   img: tabMaterial },
  { label: '동물',   img: tabAnimal },
  { label: '환생',   img: tabRebirth },
  { label: '순위',   img: tabRanking },
  { label: '설정',   img: tabSettings },
]

export default function TabBar({ clicker, clickerGrade, onClickerClick, onTabChange, activeTab, speedBoostRemaining, goldBoostRemaining, onSpeedBoost, onGoldBoost, tutorialHighlightTab }: Props) {
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const progress = clicker.clickCount / clicker.threshold
  const dashOffset = circumference * (1 - Math.min(progress, 1))
  const isFull = clicker.clickCount >= clicker.threshold && clicker.clickCount > 0

  const safeBottom = 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))'
  const floatBottom = activeTab !== null
    ? `calc(40vh + 76px + ${safeBottom})`
    : `calc(76px + ${safeBottom})`

  const speedRemain = Math.max(0, speedBoostRemaining)
  const goldRemain = Math.max(0, goldBoostRemaining)
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
      {TABS.map(({ label, img }, i) => (
        <div
          key={i}
          className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''} ${tutorialHighlightTab === i ? styles.tabHighlight : ''}`}
          onClick={() => handleTab(i)}
        >
          <img src={img} className={styles.tabIcon} alt={label}/>
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
          {clickerGrade > 0
            ? <GradeIcon size={28} grade={clickerGrade}/>
            : <img src={isFull ? clickerFull : clickerImg} width={28} height={28} style={{ objectFit: 'contain' }} alt=""/>
          }
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
          <img src={speedRemain > 0 ? boostSpeed : boostSpeedOff} className={styles.boostIcon} alt="speed"/>
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
          <img src={goldRemain > 0 ? boostGold : boostGoldOff} className={styles.boostIcon} alt="gold"/>
          {goldRemain > 0 && <span className={styles.boostTime}>{formatRemain(goldRemain)}</span>}
        </div>
      </button>
    </div>
  )
}
