import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameState } from '../../types/gameState'
import type { AnimalId, FriendId } from '../../types/animal'
import { ANIMAL_IDS } from '../../types/animal'
import { getAnimalUpgradeCost, getAnimalUnlockCost, getAnimalStat, getFriendStat } from '../../balance'
import { formatGold, formatNumber } from '../../utils/formatGold'
import { AnimalSvg } from './AnimalSvg'
import type { AnimalSpecies } from './AnimalSvg'
import type { FriendRequestRow } from '../../lib/userProfile'
import styles from '../prestige/PrestigeTab.module.css'

const ANIMAL_TYPE_NAME: Record<string, string> = { hamster: '햄스터', cat: '고양이', dog: '강아지' }

const HAT_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e','#06b6d4',
  '#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f43f5e',
  '#84cc16','#0ea5e9','#a855f7','#fb923c','#34d399',
  '#60a5fa','#f472b6','#facc15','#4ade80','#c084fc',
]

function AnimalIcon({ id }: { id: string }) {
  const type = (id.match(/^([a-z]+)/)?.[1] ?? 'hamster') as AnimalSpecies
  const num = parseInt(id.match(/(\d+)$/)?.[1] ?? '1')
  const hatColor = HAT_COLORS[(num - 1) % HAT_COLORS.length]
  return (
    <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
      <AnimalSvg species={type} size={44}/>
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        background: hatColor,
        borderRadius: '6px',
        minWidth: 16, height: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 1px 4px ${hatColor}99`,
        padding: '0 3px',
      }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{num}</span>
      </div>
    </div>
  )
}

function getAnimalTypeName(id: string) {
  const type = id.match(/^([a-z]+)/)?.[1] ?? ''
  return ANIMAL_TYPE_NAME[type] ?? '동물'
}

interface Props {
  gameState: GameState
  animalType: 'hamster' | 'cat' | 'dog' | 'friend'
  onUnlockAnimal: (id: AnimalId) => void
  onUpgradeAnimal: (id: AnimalId) => void
  onStartPlacing: (id: AnimalId) => void
  onRecallAnimal: (id: AnimalId) => void
  onIssueInviteCode: () => Promise<string | null>
  onSendFriendRequest: (code: string) => Promise<boolean>
  pendingFriendRequests: FriendRequestRow[]
  onAcceptFriendRequest: (id: string, fromDeviceId: string, fromPlayerName: string) => Promise<void>
  onRejectFriendRequest: (id: string) => Promise<void>
  onRecallFriend: (id: FriendId) => void
  onRemoveFriend: (id: FriendId) => void
}

function FriendView({ gameState, onIssueInviteCode, onSendFriendRequest, pendingFriendRequests, onAcceptFriendRequest, onRejectFriendRequest, onRecallFriend, onRemoveFriend, onStartPlacing }: {
  gameState: GameState
  onIssueInviteCode: () => Promise<string | null>
  onSendFriendRequest: (code: string) => Promise<boolean>
  pendingFriendRequests: FriendRequestRow[]
  onAcceptFriendRequest: (id: string, fromDeviceId: string, fromPlayerName: string) => Promise<void>
  onRejectFriendRequest: (id: string) => Promise<void>
  onRecallFriend: (id: FriendId) => void
  onRemoveFriend: (id: FriendId) => void
  onStartPlacing: (id: AnimalId) => void
}) {
  const { friends = [], factories } = gameState
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [issuing, setIssuing] = useState(false)
  const [inputCode, setInputCode] = useState('')
  const [adding, setAdding] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const showMsg = useCallback((text: string, ok: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMsg({ text, ok })
    timerRef.current = setTimeout(() => setMsg(null), 3000)
  }, [])

  const handleIssue = async () => {
    if (issuing) return
    setIssuing(true)
    const code = await onIssueInviteCode()
    setIssuing(false)
    if (code) {
      setInviteCode(code)
      const text = `동물노동조합 친구 코드: ${code}\n(24시간 이내 입력)\nPlay Store: https://play.google.com/store/apps/details?id=com.animalunion.game`
      if (navigator.share) {
        await navigator.share({ title: '동물노동조합 친구 추가', text }).catch(() => null)
      } else {
        await navigator.clipboard.writeText(text).catch(() => null)
        showMsg('클립보드에 복사됐어요', true)
      }
    } else {
      showMsg('코드 발급에 실패했어요', false)
    }
  }

  const handleAdd = async () => {
    const code = inputCode.trim()
    if (code.length !== 6 || adding) return
    setAdding(true)
    const ok = await onSendFriendRequest(code)
    setAdding(false)
    if (ok) {
      setInputCode('')
      showMsg('친구 요청을 보냈어요! 상대방이 수락하면 친구가 돼요', true)
    } else {
      showMsg('코드가 올바르지 않거나 이미 추가된 친구예요', false)
    }
  }

  return (
    <div className={styles.container}>
      {/* 상태 메시지 */}
      {msg && (
        <div style={{ padding: '8px 12px', borderRadius: 10, background: msg.ok ? '#ecfdf5' : '#fff1f2', color: msg.ok ? '#059669' : '#e11d48', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
          {msg.text}
        </div>
      )}

      {/* 내 코드 발급 */}
      <div className={styles.card} style={{ background: '#ecfdf5', borderColor: '#86efac' }}>
        <div className={styles.cardLeft}>
          <span style={{ fontSize: 28 }}>🔗</span>
          <div className={styles.cardInfo}>
            <span className={styles.cardName} style={{ color: '#14532d' }}>내 코드 발급</span>
            <span className={styles.cardSub} style={{ color: '#16a34a' }}>{inviteCode ?? '친구에게 전달할 초대 코드'}</span>
          </div>
        </div>
        <button
          className={styles.starBtn}
          style={{ background: '#059669', color: '#fff', opacity: issuing ? 0.6 : 1, padding: '6px 14px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}
          onClick={handleIssue}
          disabled={issuing}
        >
          {issuing ? '...' : inviteCode ? '재발급' : '발급 & 공유'}
        </button>
      </div>

      {/* 코드 입력 */}
      <div className={styles.card} style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
        <div className={styles.cardLeft}>
          <span style={{ fontSize: 28 }}>➕</span>
          <div className={styles.cardInfo}>
            <span className={styles.cardName} style={{ color: '#1e40af' }}>코드 입력</span>
            <span className={styles.cardSub} style={{ color: '#2563eb' }}>친구 코드 6자리</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={inputCode}
            onChange={e => setInputCode(e.target.value.replace(/\D/g, ''))}
            style={{ width: 72, padding: '6px 8px', border: '1.5px solid #93c5fd', borderRadius: 8, fontSize: 14, fontWeight: 700, textAlign: 'center', letterSpacing: 2, color: '#1e40af', background: '#fff', outline: 'none' }}
          />
          <button
            className={styles.starBtn}
            style={{ background: '#2563eb', color: '#fff', opacity: (adding || inputCode.length !== 6) ? 0.6 : 1, padding: '6px 12px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
            onClick={handleAdd}
            disabled={adding || inputCode.length !== 6}
          >
            {adding ? '...' : '추가'}
          </button>
        </div>
      </div>

      {/* 수락 대기 요청 */}
      {pendingFriendRequests.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#d97706' }}>친구 요청 {pendingFriendRequests.length}건</span>
          {pendingFriendRequests.map(req => (
            <div key={req.id} className={styles.card} style={{ background: '#fffbeb', borderColor: '#fcd34d' }}>
              <div className={styles.cardLeft}>
                <span style={{ fontSize: 28 }}>👤</span>
                <div className={styles.cardInfo}>
                  <span className={styles.cardName} style={{ color: '#92400e' }}>{req.from_player_name}</span>
                  <span className={styles.cardSub} style={{ color: '#b45309' }}>친구 추가 요청</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => onAcceptFriendRequest(req.id, req.from_device_id, req.from_player_name)}
                  style={{ padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                >
                  수락
                </button>
                <button
                  onClick={() => onRejectFriendRequest(req.id)}
                  style={{ padding: '6px 10px', background: '#fee2e2', color: '#e11d48', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                >
                  거절
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 친구 목록 */}
      <div className={styles.list}>
        {friends.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 14, fontWeight: 600 }}>
            아직 친구가 없어요
          </div>
        ) : (
          friends.map(friend => {
            const isPlaced = factories.some(f => f.animalId === friend.id)
            const bonus = getFriendStat(friend.rank)
            const rankLabel = friend.rank >= 9999 ? '순위 없음' : `${friend.rank}위`
            return (
              <div key={friend.id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <span style={{ fontSize: 36 }}>👤</span>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardNameRow}>
                      <span className={styles.cardName}>{friend.playerName}</span>
                      <span className={styles.levelBadge}>{rankLabel}</span>
                    </div>
                    <span className={styles.cardSub}>+{formatNumber(bonus * 100)}% 가치</span>
                  </div>
                </div>
                <div className={styles.cardBtns}>
                  <button
                    className={`${styles.placeBtn} ${isPlaced ? styles.placeBtnRecall : ''}`}
                    onClick={() => isPlaced ? onRecallFriend(friend.id) : onStartPlacing(friend.id)}
                  >
                    {isPlaced ? '회수' : '배치'}
                  </button>
                  <button
                    onClick={() => onRemoveFriend(friend.id)}
                    style={{ padding: '6px 10px', background: '#fee2e2', color: '#e11d48', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function AnimalTab({ gameState, animalType, onUnlockAnimal, onUpgradeAnimal, onStartPlacing, onRecallAnimal, onIssueInviteCode, onSendFriendRequest, pendingFriendRequests, onAcceptFriendRequest, onRejectFriendRequest, onRecallFriend, onRemoveFriend }: Props) {
  if (animalType === 'friend') {
    return (
      <FriendView
        gameState={gameState}
        onIssueInviteCode={onIssueInviteCode}
        onSendFriendRequest={onSendFriendRequest}
        pendingFriendRequests={pendingFriendRequests}
        onAcceptFriendRequest={onAcceptFriendRequest}
        onRejectFriendRequest={onRejectFriendRequest}
        onRecallFriend={onRecallFriend}
        onRemoveFriend={onRemoveFriend}
        onStartPlacing={onStartPlacing}
      />
    )
  }

  const { animals, factories } = gameState
  const prestigePoints = gameState.prestigePoints.current
  const unlockCost = getAnimalUnlockCost()
  const filteredIds = ANIMAL_IDS.filter(id => id.startsWith(animalType))

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {filteredIds.map(id => {
          const animal = animals.find(a => a.id === id)!
          const upgradeCost = getAnimalUpgradeCost(animal.level)
          const isPlaced = factories.some(f => f.animalId === id)
          return (
            <div key={id} className={`${styles.card} ${!animal.unlocked ? styles.cardLocked : ''}`}>
              <div className={styles.cardLeft}>
                <AnimalIcon id={id} />
                <div className={styles.cardInfo}>
                  <div className={styles.cardNameRow}>
                    <span className={styles.cardName}>{getAnimalTypeName(id)}</span>
                    {animal.unlocked && <span className={styles.levelBadge}>Lv.{formatNumber(animal.level)}</span>}
                  </div>
                  {animal.unlocked && (
                    <span className={styles.cardSub}>+{formatNumber(getAnimalStat(animal.level) * 100)}% 가치</span>
                  )}
                </div>
              </div>
              <div className={styles.cardBtns}>
                {animal.unlocked ? (
                  <>
                    <button
                      className={`${styles.placeBtn} ${isPlaced ? styles.placeBtnRecall : ''}`}
                      onClick={() => isPlaced ? onRecallAnimal(id) : onStartPlacing(id)}
                    >
                      {isPlaced ? '회수' : '배치'}
                    </button>
                    <button className={styles.starBtn} onClick={() => onUpgradeAnimal(id)} disabled={prestigePoints < upgradeCost}>
                      ⭐ {formatGold(upgradeCost)}
                    </button>
                  </>
                ) : (
                  <button className={styles.unlockBtn} onClick={() => onUnlockAnimal(id)} disabled={prestigePoints < unlockCost}>
                    🔓 {formatGold(unlockCost)}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
