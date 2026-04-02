import { useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { showRewardedAd } from '../../utils/admob'
import { isTossEnvironment } from '../../utils/toss'
import { isTossAdReady } from '../../utils/tossAd'
import styles from './AdModal.module.css'

interface Props {
  onComplete: () => void
  onClose: () => void
}

export default function AdModal({ onComplete, onClose }: Props) {
  const isNative = Capacitor.isNativePlatform() || isTossEnvironment()
  const [count, setCount] = useState(5)
  const [showEscape, setShowEscape] = useState(false)
  const [result, setResult] = useState<{ rewarded: boolean; elapsed: number } | null>(null)
  const startTimeRef = useRef(Date.now())
  const setAdResult = (rewarded: boolean) => {
    setResult({ rewarded, elapsed: Math.round((Date.now() - startTimeRef.current) / 1000) })
  }
  const onCompleteRef = useRef(onComplete)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  const [tossNotReady] = useState(() => isTossEnvironment() && !isTossAdReady())

  useEffect(() => {
    if (isNative) {
      const escapeTimer = setTimeout(() => setShowEscape(true), 5000)
      showRewardedAd().then(rewarded => {
        clearTimeout(escapeTimer)
        setTimeout(() => setAdResult(rewarded), 500)
      }).catch(() => { clearTimeout(escapeTimer); setAdResult(false) })
      return
    }

    if (count <= 0) {
      setAdResult(true)
      return
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, isNative]) // eslint-disable-line react-hooks/exhaustive-deps

  // 광고 준비 안 됨
  if (tossNotReady) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.adBox}>
          <span className={styles.adIcon}>⏳</span>
          <span className={styles.adText}>광고를 준비중이에요.</span>
        </div>
        <button className={styles.skipBtn} onClick={onClose}>닫기</button>
      </div>
    </div>
  )

  // 결과 모달
  if (result !== null) return (
    <div className="modal-overlay">
      <div className={styles.modal}>
        <div className={styles.adBox}>
          <span className={styles.adIcon}>{result.rewarded ? '🎉' : '😢'}</span>
          <span className={styles.adText}>
            {result.rewarded ? '광고 보상이 정상 지급되었어요.' : '광고 보상이 지급되지 않았어요.'}
          </span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>{result.elapsed}초</span>
        </div>
        <button
          className={styles.confirmBtn}
          onClick={() => result.rewarded ? onCompleteRef.current() : onCloseRef.current()}
        >확인</button>
      </div>
    </div>
  )

  // 스피너
  if (isNative) return (
    <div className="modal-overlay">
      <div className={styles.spinner} />
      {showEscape && (
        <button
          className={styles.skipBtn}
          style={{ position: 'absolute', bottom: 40 }}
          onClick={() => setAdResult(false)}
        >닫기</button>
      )}
    </div>
  )

  // 웹 카운트다운
  return (
    <div className="modal-overlay">
      <div className={styles.modal}>
        <div className={styles.adBox}>
          <span className={styles.adIcon}>📺</span>
          <span className={styles.adText}>광고 시청 중...</span>
          <span className={styles.count}>{count}</span>
        </div>
        <button className={styles.skipBtn} onClick={() => setAdResult(false)}>건너뛰기</button>
      </div>
    </div>
  )
}
