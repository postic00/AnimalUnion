import { CONFIG } from '../config'
import styles from './PrestigeAdModal.module.css'

interface Props {
  earned: number
  currentPoints: number
  onPrestige: () => void
  onWatchAd: () => void
  onClose: () => void
}

export default function PrestigeAdModal({ earned, currentPoints, onPrestige, onWatchAd, onClose }: Props) {
  const isNewSeason = CONFIG.WEEK > CONFIG.CURRENT_WEEK
  const weekRate = isNewSeason ? CONFIG.NEXT_WEEK_RATE : 1

  const expected1x = Math.floor((currentPoints + earned) * weekRate)
  const expected2x = Math.floor((currentPoints + earned * 2) * weekRate)

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.icon}>⭐</span>
          <h2 className={styles.title}>환생</h2>
        </div>

        <div className={styles.pointsTable}>
          <div className={styles.pointsRow}>
            <span className={styles.pointsLabel}>현재</span>
            <span className={styles.pointsValue}>⭐ {currentPoints.toLocaleString()}</span>
          </div>
          <div className={styles.pointsRow}>
            <span className={styles.pointsLabel}>예상</span>
            <div className={styles.pointsRight}>
              {isNewSeason && (
                <span className={styles.penalty}>새로운 시즌 -{Math.round((1 - weekRate) * 100)}%</span>
              )}
              <span className={styles.pointsValue}>⭐ {expected1x.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button className={styles.adBtn} onClick={onWatchAd}>
          <span className={styles.adBtnIcon}>📺</span>
          <div className={styles.adBtnInfo}>
            <span className={styles.adBtnTitle}>광고 보고 2배 획득</span>
            <span className={styles.adBtnSub}>예상 ⭐ {expected2x.toLocaleString()}</span>
          </div>
        </button>

        <button className={styles.normalBtn} onClick={onPrestige}>
          그냥 환생
        </button>

        <button className={styles.cancelBtn} onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  )
}
