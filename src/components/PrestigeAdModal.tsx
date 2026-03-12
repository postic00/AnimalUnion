import styles from './PrestigeAdModal.module.css'

interface Props {
  prestigePoints: number
  onPrestige: () => void
  onWatchAd: () => void
  onClose: () => void
}

export default function PrestigeAdModal({ prestigePoints, onPrestige, onWatchAd, onClose }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.icon}>⭐</span>
          <h2 className={styles.title}>환생</h2>
          <p className={styles.sub}>환생 포인트 +{prestigePoints.toLocaleString()} ⭐</p>
        </div>

        <button className={styles.adBtn} onClick={onWatchAd}>
          <span className={styles.adBtnIcon}>📺</span>
          <div className={styles.adBtnInfo}>
            <span className={styles.adBtnTitle}>광고 보고 2배 획득</span>
            <span className={styles.adBtnSub}>+{(prestigePoints * 2).toLocaleString()} ⭐</span>
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
