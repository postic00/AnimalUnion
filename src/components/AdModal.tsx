import { useEffect, useState } from 'react'
import styles from './AdModal.module.css'

interface Props {
  onComplete: () => void
  onClose: () => void
}

export default function AdModal({ onComplete, onClose }: Props) {
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (count <= 0) {
      onComplete()
      return
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, onComplete])

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.adBox}>
          <span className={styles.adIcon}>📺</span>
          <span className={styles.adText}>광고 시청 중...</span>
          <span className={styles.count}>{count}</span>
        </div>
        <button className={styles.skipBtn} onClick={onClose}>건너뛰기</button>
      </div>
    </div>
  )
}
