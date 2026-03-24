import { useState, useCallback, useRef, useEffect } from 'react'
import styles from './SettingsTab.module.css'

interface Props {
  savedAt: number | null
  muted: boolean
  onToggleMute: () => void
  onCloudSave: () => Promise<boolean>
  onCloudLoad: () => Promise<boolean>
  onTransferSave: () => Promise<string | null>
  onTransferLoad: (code: string) => Promise<boolean>
  onHardReset: () => void
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatCountdown(ms: number): string {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SettingsTab({ savedAt, muted, onToggleMute, onCloudSave, onCloudLoad, onTransferSave, onTransferLoad, onHardReset }: Props) {
  const [cloudMsg, setCloudMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [loading, setLoading] = useState<'save' | 'load' | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveCooldownRef = useRef(0)
  const SAVE_COOLDOWN_MS = 30_000

  // 기기 이전 - 코드 발급
  const [transferCode, setTransferCode] = useState<string | null>(null)
  const [transferLoading, setTransferLoading] = useState<'issue' | 'apply' | null>(null)
  const [transferMsg, setTransferMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [countdown, setCountdown] = useState(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiresAtRef = useRef(0)

  // 기기 이전 - 코드 입력
  const [inputCode, setInputCode] = useState('')

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  const showMsg = useCallback((text: string, ok: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setCloudMsg({ text, ok })
    timerRef.current = setTimeout(() => setCloudMsg(null), 3000)
  }, [])

  const showTransferMsg = useCallback((text: string, ok: boolean) => {
    setTransferMsg({ text, ok })
  }, [])

  const handleSave = useCallback(async () => {
    if (loading || Date.now() < saveCooldownRef.current) return
    setLoading('save')
    try {
      const ok = await onCloudSave()
      if (ok) saveCooldownRef.current = Date.now() + SAVE_COOLDOWN_MS
      showMsg(ok ? '클라우드에 저장했어요' : '저장에 실패했어요', ok)
    } catch {
      showMsg('저장에 실패했어요', false)
    } finally {
      setLoading(null)
    }
  }, [onCloudSave, showMsg, loading])

  const handleLoad = useCallback(async () => {
    setLoading('load')
    try {
      const ok = await onCloudLoad()
      showMsg(ok ? '불러오기 완료!' : '불러올 데이터가 없어요', ok)
    } catch {
      showMsg('불러오기에 실패했어요', false)
    } finally {
      setLoading(null)
    }
  }, [onCloudLoad, showMsg])

  const handleIssueCode = useCallback(async () => {
    if (transferLoading) return
    setTransferLoading('issue')
    setTransferMsg(null)
    try {
      const code = await onTransferSave()
      if (!code) { showTransferMsg('코드 발급에 실패했어요', false); return }
      setTransferCode(code)
      expiresAtRef.current = Date.now() + 15 * 60 * 1000
      setCountdown(15 * 60 * 1000)
      if (countdownRef.current) clearInterval(countdownRef.current)
      countdownRef.current = setInterval(() => {
        const remaining = expiresAtRef.current - Date.now()
        if (remaining <= 0) {
          setCountdown(0)
          setTransferCode(null)
          if (countdownRef.current) clearInterval(countdownRef.current)
        } else {
          setCountdown(remaining)
        }
      }, 1000)
    } catch {
      showTransferMsg('코드 발급에 실패했어요', false)
    } finally {
      setTransferLoading(null)
    }
  }, [onTransferSave, showTransferMsg, transferLoading])

  const handleApplyCode = useCallback(async () => {
    const code = inputCode.trim()
    if (code.length !== 6 || transferLoading) return
    setTransferLoading('apply')
    setTransferMsg(null)
    try {
      const ok = await onTransferLoad(code)
      if (ok) {
        showTransferMsg('이전 완료! 게임을 다시 시작해요', true)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        showTransferMsg('코드가 올바르지 않거나 만료됐어요', false)
      }
    } catch {
      showTransferMsg('오류가 발생했어요', false)
    } finally {
      setTransferLoading(null)
    }
  }, [inputCode, onTransferLoad, showTransferMsg, transferLoading])

  return (
    <div className={styles.container}>

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

      {/* 클라우드 저장 */}
      <div className={styles.card} style={{ background: '#f0f9ff', borderColor: '#7dd3fc' }}>
        <div className={styles.cardLeft}>
          <span className={styles.cardIcon}>☁️</span>
          <div className={styles.cardInfo}>
            <span className={styles.cardName} style={{ color: '#0c4a6e' }}>클라우드 저장</span>
            <span className={styles.cardSub} style={{ color: cloudMsg ? (cloudMsg.ok ? '#16a34a' : '#e11d48') : '#0284c7' }}>
              {cloudMsg ? cloudMsg.text : '서버에 현재 상태를 저장해요'}
            </span>
          </div>
        </div>
        <button
          className={styles.resetBtn}
          style={{ background: '#0ea5e9', opacity: loading ? 0.6 : 1 }}
          onClick={handleSave}
          disabled={!!loading}
        >
          {loading === 'save' ? '...' : '저장'}
        </button>
        <button
          className={styles.resetBtn}
          style={{ background: '#6366f1', marginLeft: 8, opacity: loading ? 0.6 : 1 }}
          onClick={handleLoad}
          disabled={!!loading}
        >
          {loading === 'load' ? '...' : '불러오기'}
        </button>
      </div>

      {/* 기기 변경 */}
      <div className={styles.card} style={{ background: '#fdf4ff', borderColor: '#e9d5ff', flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
        <div className={styles.cardLeft}>
          <span className={styles.cardIcon}>📱</span>
          <div className={styles.cardInfo}>
            <span className={styles.cardName} style={{ color: '#581c87' }}>기기 변경</span>
            <span className={styles.cardSub} style={{ color: transferMsg ? (transferMsg.ok ? '#16a34a' : '#e11d48') : '#7c3aed' }}>
              {transferMsg ? transferMsg.text : '코드로 다른 기기에 데이터를 옮겨요'}
            </span>
          </div>
        </div>

        {/* 코드 발급 (구기기) */}
        <div className={styles.transferRow}>
          <span className={styles.transferLabel}>이 기기 코드 발급</span>
          {transferCode && countdown > 0 ? (
            <div className={styles.codeBox}>
              <span className={styles.codeText}>{transferCode}</span>
              <span className={styles.codeTimer}>{formatCountdown(countdown)}</span>
              <button
                className={styles.resetBtn}
                style={{ background: '#7c3aed', marginLeft: 4 }}
                onClick={async () => {
                  const text = `기기 이전 코드: ${transferCode}\n(15분 이내 입력)`
                  if (navigator.share) {
                    await navigator.share({ title: '동물노동조합 기기 이전 코드', text })
                  } else {
                    await navigator.clipboard.writeText(text)
                    showTransferMsg('클립보드에 복사됐어요', true)
                  }
                }}
              >
                공유
              </button>
            </div>
          ) : (
            <button
              className={styles.resetBtn}
              style={{ background: '#7c3aed', opacity: transferLoading ? 0.6 : 1 }}
              onClick={handleIssueCode}
              disabled={!!transferLoading}
            >
              {transferLoading === 'issue' ? '...' : '코드 받기'}
            </button>
          )}
        </div>

        {/* 코드 입력 (신기기) */}
        <div className={styles.transferRow}>
          <span className={styles.transferLabel}>코드 입력</span>
          <input
            className={styles.codeInput}
            type="tel"
            inputMode="numeric"
            maxLength={6}
            placeholder="6자리"
            value={inputCode}
            onChange={e => setInputCode(e.target.value.replace(/\D/g, ''))}
          />
          <button
            className={styles.resetBtn}
            style={{ background: '#059669', opacity: (transferLoading || inputCode.length !== 6) ? 0.6 : 1, marginLeft: 8 }}
            onClick={handleApplyCode}
            disabled={!!transferLoading || inputCode.length !== 6}
          >
            {transferLoading === 'apply' ? '...' : '적용'}
          </button>
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
        <button className={styles.resetBtn} onClick={onHardReset}>
          초기화
        </button>
      </div>

    </div>
  )
}
