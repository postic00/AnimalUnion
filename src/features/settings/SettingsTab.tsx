import { useState, useCallback, useRef, useEffect } from 'react'
import type { FriendRequestRow } from '../../lib/userProfile'
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
  onIssueInviteCode: () => Promise<string | null>
  onSendFriendRequest: (code: string) => Promise<boolean>
  pendingFriendRequests: FriendRequestRow[]
  onAcceptFriendRequest: (id: string, fromDeviceId: string, fromPlayerName: string) => Promise<void>
  onRejectFriendRequest: (id: string) => Promise<void>
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

export default function SettingsTab({ savedAt, muted, onToggleMute, onCloudSave, onCloudLoad, onTransferSave, onTransferLoad, onHardReset, onIssueInviteCode, onSendFriendRequest, pendingFriendRequests, onAcceptFriendRequest, onRejectFriendRequest }: Props) {
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

  // 친구 추가
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [issuing, setIssuing] = useState(false)
  const [friendInputCode, setFriendInputCode] = useState('')
  const [adding, setAdding] = useState(false)
  const [friendMsg, setFriendMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const friendMsgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (friendMsgTimerRef.current) clearTimeout(friendMsgTimerRef.current) }, [])

  const showFriendMsg = useCallback((text: string, ok: boolean) => {
    if (friendMsgTimerRef.current) clearTimeout(friendMsgTimerRef.current)
    setFriendMsg({ text, ok })
    friendMsgTimerRef.current = setTimeout(() => setFriendMsg(null), 3000)
  }, [])

  const handleIssueInvite = useCallback(async () => {
    if (issuing) return
    setIssuing(true)
    const code = await onIssueInviteCode()
    setIssuing(false)
    if (code) {
      setInviteCode(code)
      const text = `[함께하기] 동물노동조합\n친구코드 : ${code}\n(24시간 이내 입력)\n구글플레이 : https://play.google.com/store/apps/details?id=com.postic.animalunion`
      if (navigator.share) {
        await navigator.share({ title: '동물노동조합 친구 추가', text }).catch(() => null)
      } else {
        await navigator.clipboard.writeText(text).catch(() => null)
        showFriendMsg('클립보드에 복사됐어요', true)
      }
    } else {
      showFriendMsg('코드 발급에 실패했어요', false)
    }
  }, [issuing, onIssueInviteCode, showFriendMsg])

  const handleAddFriend = useCallback(async () => {
    const code = friendInputCode.trim()
    if (code.length !== 6 || adding) return
    setAdding(true)
    const ok = await onSendFriendRequest(code)
    setAdding(false)
    if (ok) {
      setFriendInputCode('')
      showFriendMsg('친구 요청을 보냈어요! 상대방이 수락하면 친구가 돼요', true)
    } else {
      showFriendMsg('코드가 올바르지 않거나 이미 추가된 친구예요', false)
    }
  }, [friendInputCode, adding, onSendFriendRequest, showFriendMsg])

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
      <div className={styles.card}>
        <div className={styles.iconArea}>ℹ️</div>
        <div className={styles.cardInfo}>
          <div className={styles.nameRow}><span className={styles.cardName} style={{ color: '#374151' }}>동물노동조합</span></div>
          <div className={styles.bottomRow}><span className={styles.cardSub} style={{ color: '#6b7280' }}>v1.7</span></div>
        </div>
      </div>

      {/* 데이터 */}
      <div className={styles.card}>
        <div className={styles.iconArea}>💾</div>
        <div className={styles.cardInfo}>
          <div className={styles.nameRow}><span className={styles.cardName} style={{ color: '#1e40af' }}>마지막 저장</span></div>
          <div className={styles.bottomRow}><span className={styles.cardSub} style={{ color: '#2563eb' }}>{savedAt ? formatDate(savedAt) : '저장 없음'}</span></div>
        </div>
      </div>

      {/* 소리 */}
      <div className={styles.card}>
        <div className={styles.iconArea}>🔊</div>
        <div className={styles.cardInfo}>
          <div className={styles.nameRow}><span className={styles.cardName} style={{ color: '#14532d' }}>음소거</span></div>
          <div className={styles.bottomRow}><span className={styles.cardSub} style={{ color: '#16a34a' }}>{muted ? '소리 꺼짐' : '소리 켜짐'}</span></div>
        </div>
        <button className={`${styles.toggle} ${muted ? styles.toggleOn : styles.toggleOff}`} onClick={onToggleMute}>
          <span className={styles.toggleThumb} />
        </button>
      </div>

      {/* 클라우드 저장 */}
      <div className={styles.card}>
        <div className={styles.iconArea}>☁️</div>
        <div className={styles.cardInfo}>
          <div className={styles.nameRow}><span className={styles.cardName} style={{ color: '#0c4a6e' }}>클라우드 저장</span></div>
          <div className={styles.bottomRow}>
            <span className={styles.cardSub} style={{ color: cloudMsg ? (cloudMsg.ok ? '#16a34a' : '#e11d48') : '#0284c7' }}>
              {cloudMsg ? cloudMsg.text : '서버에 현재 상태를 저장해요'}
            </span>
          </div>
        </div>
        <div className={styles.cardActions}>
          <button className={styles.actionBtn} style={{ opacity: loading ? 0.6 : 1 }} onClick={handleSave} disabled={!!loading}>
            {loading === 'save' ? '...' : '저장'}
          </button>
          <button className={styles.actionBtn} style={{ opacity: loading ? 0.6 : 1 }} onClick={handleLoad} disabled={!!loading}>
            {loading === 'load' ? '...' : '불러오기'}
          </button>
        </div>
      </div>

      {/* 기기 변경 */}
      <div className={styles.cardTall}>
        <div className={styles.cardTallHeader}>
          <span className={styles.cardTallIcon}>📱</span>
          <div className={styles.cardTallInfo}>
            <span className={styles.cardName} style={{ color: '#581c87' }}>기기 변경</span>
            <span className={styles.cardSub} style={{ color: transferMsg ? (transferMsg.ok ? '#16a34a' : '#e11d48') : '#7c3aed' }}>
              {transferMsg ? transferMsg.text : '코드로 다른 기기에 데이터를 옮겨요'}
            </span>
          </div>
        </div>
        <div className={styles.transferRow}>
          <span className={styles.transferLabel}>이 기기 코드 발급</span>
          {transferCode && countdown > 0 ? (
            <div className={styles.codeBox}>
              <span className={styles.codeText}>{transferCode}</span>
              <span className={styles.codeTimer}>{formatCountdown(countdown)}</span>
              <button
                className={styles.transferBtn}
                onClick={async () => {
                  const text = `기기 이전 코드: ${transferCode}\n(15분 이내 입력)`
                  if (navigator.share) {
                    await navigator.share({ title: '동물노동조합 기기 이전 코드', text })
                  } else {
                    await navigator.clipboard.writeText(text)
                    showTransferMsg('클립보드에 복사됐어요', true)
                  }
                }}
              >공유</button>
            </div>
          ) : (
            <button className={styles.transferBtn} style={{ opacity: transferLoading ? 0.6 : 1 }} onClick={handleIssueCode} disabled={!!transferLoading}>
              {transferLoading === 'issue' ? '...' : '코드 받기'}
            </button>
          )}
        </div>
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
            className={styles.transferBtn}
            style={{ opacity: (transferLoading || inputCode.length !== 6) ? 0.6 : 1 }}
            onClick={handleApplyCode}
            disabled={!!transferLoading || inputCode.length !== 6}
          >
            {transferLoading === 'apply' ? '...' : '적용'}
          </button>
        </div>
      </div>

      {/* 친구 추가 */}
      <div className={styles.cardTall}>
        <div className={styles.cardTallHeader}>
          <span className={styles.cardTallIcon}>👥</span>
          <div className={styles.cardTallInfo}>
            <span className={styles.cardName} style={{ color: '#14532d' }}>친구 추가</span>
            <span className={styles.cardSub} style={{ color: friendMsg ? (friendMsg.ok ? '#16a34a' : '#e11d48') : '#16a34a' }}>
              {friendMsg ? friendMsg.text : '코드로 친구를 추가해요'}
            </span>
          </div>
        </div>
        <div className={styles.transferRow}>
          <span className={styles.transferLabel}>내 코드 발급</span>
          {inviteCode ? (
            <div className={styles.codeBox}>
              <span className={styles.codeText}>{inviteCode}</span>
              <button
                className={styles.transferBtn}
                onClick={async () => {
                  const text = `[함께하기] 동물노동조합\n친구코드 : ${inviteCode}\n(24시간 이내 입력)\n구글플레이 : https://play.google.com/store/apps/details?id=com.postic.animalunion`
                  if (navigator.share) {
                    await navigator.share({ title: '동물노동조합 친구 추가', text }).catch(() => null)
                  } else {
                    await navigator.clipboard.writeText(text).catch(() => null)
                    showFriendMsg('클립보드에 복사됐어요', true)
                  }
                }}
              >공유</button>
              <button className={styles.transferBtn} style={{ opacity: issuing ? 0.6 : 1 }} onClick={handleIssueInvite} disabled={issuing}>재발급</button>
            </div>
          ) : (
            <button className={styles.transferBtn} style={{ opacity: issuing ? 0.6 : 1 }} onClick={handleIssueInvite} disabled={issuing}>
              {issuing ? '...' : '발급 & 공유'}
            </button>
          )}
        </div>
        <div className={styles.transferRow}>
          <span className={styles.transferLabel}>코드 입력</span>
          <input
            className={styles.codeInput}
            type="tel"
            inputMode="numeric"
            maxLength={6}
            placeholder="6자리"
            value={friendInputCode}
            onChange={e => setFriendInputCode(e.target.value.replace(/\D/g, ''))}
          />
          <button
            className={styles.transferBtn}
            style={{ opacity: (adding || friendInputCode.length !== 6) ? 0.6 : 1 }}
            onClick={handleAddFriend}
            disabled={adding || friendInputCode.length !== 6}
          >
            {adding ? '...' : '추가'}
          </button>
        </div>
        {pendingFriendRequests.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#d97706' }}>친구 요청 {pendingFriendRequests.length}건</span>
            {pendingFriendRequests.map(req => (
              <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#92400e' }}>{req.from_player_name}</span>
                <button className={styles.transferBtn} style={{ background: '#059669' }} onClick={() => onAcceptFriendRequest(req.id, req.from_device_id, req.from_player_name)}>수락</button>
                <button className={styles.transferBtn} style={{ background: '#e11d48' }} onClick={() => onRejectFriendRequest(req.id)}>거절</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 초기화 */}
      <div className={styles.card}>
        <div className={styles.iconArea}>🗑️</div>
        <div className={styles.cardInfo}>
          <div className={styles.nameRow}><span className={styles.cardName} style={{ color: '#9f1239' }}>게임 초기화</span></div>
          <div className={styles.bottomRow}><span className={styles.cardSub} style={{ color: '#e11d48' }}>모든 진행 상황이 삭제돼요</span></div>
        </div>
        <div className={styles.cardActions}>
          <button className={styles.actionBtn} style={{ background: '#e11d48' }} onClick={onHardReset}>초기화</button>
        </div>
      </div>

    </div>
  )
}
