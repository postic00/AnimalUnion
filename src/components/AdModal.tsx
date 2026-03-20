import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { showRewardedAd } from '../utils/admob'
import styles from './AdModal.module.css'

interface Props {
  onComplete: () => void
  onClose: () => void
}

export default function AdModal({ onComplete, onClose }: Props) {
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // 네이티브: 바로 AdMob 호출
      setLoading(true)
      showRewardedAd().then(rewarded => {
        if (rewarded) onComplete()
        else onClose()
      })
      return
    }

    // 웹: 5초 카운트다운 시뮬레이션
    if (count <= 0) {
      onComplete()
      return
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, Capacitor.isNativePlatform()])

  if (loading) return null  // 네이티브에서는 AdMob UI가 직접 표시됨

  return (
    <div className="modal-overlay">
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
