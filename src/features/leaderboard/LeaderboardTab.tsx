import { useState, useEffect } from 'react'
import { ScoreService } from '../../services/ScoreService'
import type { LeaderboardEntry } from '../../services/ScoreService'
import { SaveService } from '../../services/SaveService'
import { formatGold } from '../../utils/formatGold'
import { CONFIG } from '../../config'
import styles from './LeaderboardTab.module.css'

interface Props {
  playerName: string
  mode: 'prestige' | 'gold'
  friendDeviceIds: string[]
  myPrestigeScore?: number
  onSubmitGold?: () => Promise<void>
  onRankUpdate?: (rank: number | null, score: number | null) => void
}

export default function LeaderboardTab({ playerName, mode, friendDeviceIds, myPrestigeScore = 0, onSubmitGold, onRankUpdate }: Props) {
  const hasPrestigedThisWeek = CONFIG.WEEK > 0 && CONFIG.WEEK <= CONFIG.CURRENT_WEEK
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'top' | 'around' | 'friend'>('top')
  const [startRank, setStartRank] = useState(1)
  const [myInjected, setMyInjected] = useState(false)

  const myIndex = entries.findIndex(e => e.player_name === playerName)
  const myEntry = myIndex >= 0 ? entries[myIndex] : null
  const myRank = myIndex >= 0 ? startRank + myIndex : null
  const myUnregistered = myInjected && myPrestigeScore === 0

  useEffect(() => {
    onRankUpdate?.(myUnregistered ? null : myRank, myEntry?.score ?? null)
  }, [myRank, myEntry?.score, myUnregistered]) // eslint-disable-line react-hooks/exhaustive-deps

  const injectMe = (data: LeaderboardEntry[]): LeaderboardEntry[] => {
    const myDeviceId = SaveService.getDeviceId()
    // 중복 제거 (player_name 기준)
    const deduped = data.filter((e, i) => data.findIndex(x => x.player_name === e.player_name) === i)
    const hasMe = deduped.some(e => e.id === myDeviceId || e.player_name === playerName)
    if (hasMe) { setMyInjected(false); return deduped }
    setMyInjected(true)
    return [...deduped, { id: myDeviceId, player_name: playerName, score: myPrestigeScore, created_at: '' }]
  }

  const doFetch = async () => {
    setLoading(true)
    try {
      if (view === 'friend') {
        if (friendDeviceIds.length === 0) {
          setEntries(injectMe([]))
          setStartRank(1)
          return
        }
        if (mode === 'gold') await onSubmitGold?.()
        const fetch = mode === 'prestige' ? ScoreService.fetchFriendsPrestige : ScoreService.fetchFriendsGold
        const data = await fetch(friendDeviceIds)
        const list = injectMe(data)
        list.sort((a, b) => b.score - a.score)
        setEntries(list)
        setStartRank(1)
      } else if (view === 'top') {
        if (mode === 'gold') await onSubmitGold?.()
        const fetch = mode === 'prestige' ? ScoreService.fetchPrestige : ScoreService.fetchGold
        const data = await fetch(10)
        const list = injectMe(data)
        setEntries(list)
        setStartRank(1)
      } else {
        if (mode === 'gold') await onSubmitGold?.()
        const deviceId = SaveService.getDeviceId()
        const fetch = mode === 'prestige' ? ScoreService.fetchPrestigeAround : ScoreService.fetchGoldAround
        const result = await fetch(deviceId)
        const list = injectMe(result.entries)
        setEntries(list)
        setStartRank(result.startRank)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    doFetch()
  }, [mode, view]) // eslint-disable-line react-hooks/exhaustive-deps

  const renderRow = (e: LeaderboardEntry, rank: number) => {
    const isMe = e.player_name === playerName
    const isDisabled = isMe && myUnregistered
    return (
      <div
        key={e.id || e.player_name}
        className={`${styles.row} ${isMe && !isDisabled ? styles.myRow : ''} ${isDisabled ? styles.disabledRow : ''}`}
      >
        <span className={styles.rank}>
          {isDisabled ? '-' : view === 'friend' ? `${rank}` : rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`}
        </span>
        <span className={styles.name}>{e.player_name}</span>
        <span className={styles.score}>
          {view === 'friend' ? '⭐' : mode === 'prestige' ? '⭐' : '💰'} {isDisabled ? '미등록' : formatGold(e.score)}
        </span>
        {view !== 'friend' && mode === 'prestige' && e.prestige_count !== undefined && (
          <span className={styles.prestige}>환생 {e.prestige_count}회</span>
        )}
        {view === 'friend' && e.prestige_count !== undefined && (
          <span className={styles.prestige}>환생 {e.prestige_count}회</span>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 뷰 전환 + 새로고침 */}
      <div className={styles.viewRow}>
        <button style={{ flex: 1 }} className={view === 'top' ? 'aqua-btn-active' : 'aqua-btn'} onClick={() => setView('top')} disabled={loading}>TOP 10</button>
        <button style={{ flex: 1 }} className={view === 'around' ? 'aqua-btn-active' : 'aqua-btn'} onClick={() => setView('around')} disabled={loading || myPrestigeScore === 0}>내 순위</button>
        <button style={{ flex: 1 }} className={view === 'friend' ? 'aqua-btn-active' : 'aqua-btn'} onClick={() => setView('friend')} disabled={loading}>친구</button>
        <button style={{ flex: 1 }} className="aqua-btn" onClick={() => doFetch()} disabled={loading}>{loading ? '...' : '↻'}</button>
      </div>

      {/* 리더보드 */}
      {view === 'friend' ? (
        <div className={styles.list}>
          {loading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : entries.length === 0 ? (
            <div className={styles.loading}>친구가 없어요</div>
          ) : entries.map((e, i) => renderRow(e, i + 1))}
        </div>
      ) : view === 'around' && !hasPrestigedThisWeek ? (
        <div className={styles.noPrestige}>
          <div>참여중인 시즌이 종료되었어요.</div>
          <div>환생 후 시즌 참여 가능합니다.</div>
          <div className={styles.newSeason}>새로운 시즌: {CONFIG.WEEK}시즌 ({CONFIG.WEEK_START_DATE} ~ {CONFIG.WEEK_END_DATE})</div>
        </div>
      ) : (
        <div className={styles.list}>
          {loading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : entries.length === 0 ? (
            <div className={styles.loading}>아직 등록된 순위가 없습니다</div>
          ) : entries.map((e, i) => renderRow(e, startRank + i))}
        </div>
      )}
    </div>
  )
}
