import { useState } from 'react'
import styles from './SettingsTab.module.css'

interface Props {
  savedAt: number | null
  muted: boolean
  onToggleMute: () => void
  onHardReset: () => void
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export default function SettingsTab({ savedAt, muted, onToggleMute, onHardReset }: Props) {
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
      <div className={styles.section}>
        <p className={styles.sectionTitle}>소리</p>
        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.label}>음소거</span>
            <button
              className={muted ? styles.toggleOn : styles.toggleOff}
              onClick={onToggleMute}
            >
              {muted ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>데이터</p>
        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.label}>마지막 저장</span>
            <span className={styles.value}>{savedAt ? formatDate(savedAt) : '없음'}</span>
          </div>
        </div>
        <div className={styles.card}>
          {confirmReset && (
            <p className={styles.warning}>모든 진행 상황이 삭제돼요. 한 번 더 누르면 초기화돼요.</p>
          )}
          <button
            className={confirmReset ? styles.confirmButton : styles.resetButton}
            onClick={handleReset}
          >
            {confirmReset ? '확인 — 초기화' : '게임 초기화'}
          </button>
          {confirmReset && (
            <button className={styles.cancelButton} onClick={() => setConfirmReset(false)}>
              취소
            </button>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>정보</p>
        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.label}>버전</span>
            <span className={styles.value}>v0.9.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
