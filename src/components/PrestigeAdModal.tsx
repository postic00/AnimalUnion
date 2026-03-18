import { CONFIG } from '../config'
import { formatGold } from '../utils/formatGold'
import styles from './PrestigeAdModal.module.css'

interface Props {
  earned: number
  currentPoints: number
  availablePoints: number
  keepPoints?: boolean
  onPrestige: () => void
  onWatchAd: () => void
  onClose: () => void
}

export default function PrestigeAdModal({ earned, currentPoints, availablePoints, keepPoints = false, onPrestige, onWatchAd, onClose }: Props) {
  const isNewSeason = CONFIG.WEEK > CONFIG.CURRENT_WEEK
  const weekRate = isNewSeason ? CONFIG.NEXT_WEEK_RATE : 1

  // 포인트 유지: 현재 가용 포인트 기준, 새 시즌이면 weekRate 패널티
  // 포인트 리셋: 총 누적 포인트 환불 기준
  // 포인트 리셋: (총 누적 + earned) × weekRate / 포인트 유지: 보유 * weekRate + earned
  const expected1x = keepPoints
    ? Math.floor(availablePoints * weekRate + earned)
    : Math.floor((currentPoints + earned) * weekRate)
  const expected2x = keepPoints
    ? Math.floor(availablePoints * weekRate + earned * 2)
    : Math.floor((currentPoints + earned * 2) * weekRate)

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.icon}>⭐</span>
          <h2 className={styles.title}>{keepPoints ? '환생 (포인트 유지)' : '환생'}</h2>
        </div>

        <div className={styles.pointsTable}>
          <div className={styles.pointsRow}>
            <span className={styles.pointsLabel}>현재</span>
            <span className={styles.pointsValue}>⭐ {formatGold(currentPoints)}</span>
          </div>
          <div className={styles.pointsRow}>
            <span className={styles.pointsLabel}>예상</span>
            <span className={styles.pointsValue}>⭐ {formatGold(expected1x)}</span>
          </div>
          {isNewSeason && (
            <div className={styles.newSeasonInfo}>
              <span className={styles.newSeasonBadge}>🌟 새 시즌</span>
              <span className={styles.newSeasonDesc}>환생 포인트가 {Math.round((1 - weekRate) * 100)}% 감소합니다</span>
            </div>
          )}
        </div>

        <button className={styles.adBtn} onClick={onWatchAd}>
          <span className={styles.adBtnIcon}>📺</span>
          <div className={styles.adBtnInfo}>
            <span className={styles.adBtnTitle}>광고 보고 2배 획득</span>
            <span className={styles.adBtnSub}>예상 ⭐ {formatGold(expected2x)}</span>
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
