import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { showRewardedAd } from '../../utils/admob'
import { isTossEnvironment } from '../../utils/toss'
import { getTossAdDebugInfo } from '../../utils/tossAd'
import styles from './AdModal.module.css'

interface Props {
  onComplete: () => void
  onClose: () => void
}

export default function AdModal({ onComplete, onClose }: Props) {
  const isNative = Capacitor.isNativePlatform() || isTossEnvironment()
  const [confirmed, setConfirmed] = useState(false)
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (!confirmed) return

    if (isNative) {
      showRewardedAd().then(rewarded => {
        if (rewarded) onComplete()
        else onClose()
      })
      return
    }

    if (count <= 0) {
      onComplete()
      return
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [confirmed, count, isNative]) // eslint-disable-line react-hooks/exhaustive-deps

  // 확인 모달
  const debug = getTossAdDebugInfo()
  if (!confirmed) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.adBox}>
          <span className={styles.adIcon}>📺</span>
          <span className={styles.adText}>광고를 시청하고 보상을 받으세요!</span>
          <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.6, textAlign: 'left', width: '100%' }}>
            <div>isToss: {String(isTossEnvironment())}</div>
            <div>env: {debug.operationalEnv}</div>
            <div>adGroupId: {debug.adGroupId}</div>
            <div>loadSupported: {String(debug.loadSupported)}</div>
            <div>showSupported: {String(debug.showSupported)}</div>
            <div>adLoaded: {String(debug.adLoaded)}</div>
          </div>
        </div>
        <div className={styles.btnRow}>
          <button className={styles.confirmBtn} onClick={() => setConfirmed(true)}>시청하기</button>
          <button className={styles.skipBtn} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )

  // 광고 로딩/재생 중
  if (isNative) return (
    <div className="modal-overlay">
      <div className={styles.spinner} />
    </div>
  )

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
