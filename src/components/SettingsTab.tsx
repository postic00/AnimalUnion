import { useState } from 'react'
import styles from './SettingsTab.module.css'

interface Props {
  savedAt: number | null
  muted: boolean
  onToggleMute: () => void
  onHardReset: () => void
  onShowTutorial: () => void
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export default function SettingsTab({ savedAt, muted, onToggleMute, onHardReset, onShowTutorial }: Props) {
  const [confirmReset, setConfirmReset] = useState(false)

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    onHardReset()
    setConfirmReset(false)
  }

  return (
    <div className={styles.container}>

      {/* 소리 */}
      <div className={styles.card} style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
        <div className={styles.cardLeft}>
          <span className={styles.cardIcon}>🔊</span>
          <div className={styles.cardInfo}>
            <span className={styles.cardName} style={{ color: '#14532d' }}>음소거</span>
            <span className={styles.cardSub} style={{ color: '#16a34a' }}>{muted ? '소리 꺼짐' : '소리 켜짐'}</span>
          </div>
        </div>
        <button
          className={`${styles.toggle} ${muted ? styles.toggleOn : styles.toggleOff}`}
          onClick={onToggleMute}
        >
          <span className={styles.toggleThumb} />
        </button>
      </div>

      {/* 데이터 */}
      <div className={styles.card} style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
        <div className={styles.cardLeft}>
          <span className={styles.cardIcon}>💾</span>
          <div className={styles.cardInfo}>
            <span className={styles.cardName} style={{ color: '#1e40af' }}>마지막 저장</span>
            <span className={styles.cardSub} style={{ color: '#2563eb' }}>{savedAt ? formatDate(savedAt) : '저장 없음'}</span>
          </div>
        </div>
      </div>

      {/* 초기화 */}
      <div className={styles.card} style={{ background: '#fff1f2', borderColor: '#fecdd3' }}>
        <div className={styles.cardLeft}>
          <span className={styles.cardIcon}>🗑️</span>
          <div className={styles.cardInfo}>
            <span className={styles.cardName} style={{ color: '#9f1239' }}>게임 초기화</span>
            <span className={styles.cardSub} style={{ color: '#e11d48' }}>모든 진행 상황이 삭제돼요</span>
          </div>
        </div>
        <button
          className={`${styles.resetBtn} ${confirmReset ? styles.resetBtnConfirm : ''}`}
          onClick={handleReset}
        >
          {confirmReset ? '확인' : '초기화'}
        </button>
      </div>
      {confirmReset && (
        <button className={styles.cancelBtn} onClick={() => setConfirmReset(false)}>
          취소
        </button>
      )}

      {/* 튜토리얼 */}
      <div className={styles.card} style={{ background: '#fefce8', borderColor: '#fde68a' }}>
        <div className={styles.cardLeft}>
          <span className={styles.cardIcon}>📖</span>
          <div className={styles.cardInfo}>
            <span className={styles.cardName} style={{ color: '#78350f' }}>튜토리얼</span>
            <span className={styles.cardSub} style={{ color: '#d97706' }}>게임 방법을 다시 볼게요</span>
          </div>
        </div>
        <button
          className={styles.resetBtn}
          style={{ background: '#f59e0b' }}
          onClick={onShowTutorial}
        >
          보기
        </button>
      </div>

      {/* 정보 */}
      <div className={styles.card} style={{ background: '#fafafa', borderColor: '#e5e7eb' }}>
        <div className={styles.cardLeft}>
          <span className={styles.cardIcon}>ℹ️</span>
          <div className={styles.cardInfo}>
            <span className={styles.cardName} style={{ color: '#374151' }}>동물노동조합</span>
            <span className={styles.cardSub} style={{ color: '#6b7280' }}>v0.9.0</span>
          </div>
        </div>
      </div>

    </div>
  )
}
