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
  myGoldScore?: number
  hasGoldSeason?: boolean
  onSubmitGold?: () => Promise<void>
  onRankUpdate?: (rank: number | null, score: number | null) => void
}

export default function LeaderboardTab({
  playerName,
  mode,
  friendDeviceIds,
  myPrestigeScore = 0,
  myGoldScore = 0,
  hasGoldSeason = false,
  onSubmitGold,
  onRankUpdate,
}: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'top' | 'around' | 'friend'>('top')
  const [startRank, setStartRank] = useState(1)

  const myDeviceId = SaveService.getDeviceId()
  const myIndex = entries.findIndex(e => e.player_name === playerName)
  const myEntry = myIndex >= 0 ? entries[myIndex] : null
  const myRank = myIndex >= 0 ? startRank + myIndex : null
  const myScore = mode === 'gold' ? myGoldScore : myPrestigeScore
  const myUnregistered = myScore === 0

  // 헤더 순위 업데이트
  const notParticipating = mode === 'gold' ? !hasGoldSeason : myPrestigeScore === 0
  useEffect(() => {
    if (notParticipating) { onRankUpdate?.(null, null); return }
    onRankUpdate?.(myUnregistered ? null : myRank, myEntry?.score ?? null)
  }, [myRank, myEntry?.score, myUnregistered, notParticipating]) // eslint-disable-line react-hooks/exhaustive-deps

  const injectMe = (data: LeaderboardEntry[]): LeaderboardEntry[] => {
    const deduped = data.filter((e, i) => data.findIndex(x => x.player_name === e.player_name) === i)
    const hasMe = deduped.some(e => e.id === myDeviceId || e.player_name === playerName)
    if (hasMe) return deduped
    return [...deduped, { id: myDeviceId, player_name: playerName, score: myScore, created_at: '' }]
  }

  const filterZero = (data: LeaderboardEntry[]) =>
    mode === 'gold' ? data.filter(e => e.score > 0) : data

  const doFetch = async () => {
    setLoading(true)
    try {
      if (view === 'top') {
        // 환생: 항상 조회 + 나 주입 / 골드: week=서버WEEK로 항상 조회, 참여 시에만 나 주입
        const fetchFn = mode === 'prestige' ? ScoreService.fetchPrestige : ScoreService.fetchGold
        const data = filterZero(await fetchFn(10))
        setEntries(mode === 'gold' && !hasGoldSeason ? data : injectMe(data))
        setStartRank(1)

      } else if (view === 'around') {
        // 환생: myPrestigeScore=0 → 빈 목록 / 골드: !hasGoldSeason → 빈 목록
        const noAround = mode === 'gold' ? !hasGoldSeason : myPrestigeScore === 0
        if (noAround) { setEntries([]); setStartRank(1); return }
        if (mode === 'gold') await onSubmitGold?.()
        const fetchFn = mode === 'prestige' ? ScoreService.fetchPrestigeAround : ScoreService.fetchGoldAround
        const result = await fetchFn(myDeviceId)
        setEntries(injectMe(filterZero(result.entries)))
        setStartRank(result.startRank)

      } else { // friend
        // 환생/골드 모두: id IN(친구IDs, 내ID) 조회 + 나 주입
        // 골드: fetchFriendsGold 내부에서 week=서버WEEK 필터 적용
        const ids = [...friendDeviceIds, myDeviceId]
        const fetchFn = mode === 'prestige' ? ScoreService.fetchFriendsPrestige : ScoreService.fetchFriendsGold
        const data = filterZero(await fetchFn(ids))
        const list = (mode === 'gold' && !hasGoldSeason) ? data : injectMe(data)
        list.sort((a, b) => b.score - a.score)
        setEntries(list)
        setStartRank(1)
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
          {mode === 'prestige' ? '⭐' : '💰'} {isDisabled ? '미등록' : formatGold(e.score)}
        </span>
        {mode === 'prestige' && e.prestige_count !== undefined && (
          <span className={styles.prestige}>환생 {e.prestige_count}회</span>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.viewRow}>
        <button style={{ flex: 1 }} className={view === 'top' ? 'aqua-btn-active' : 'aqua-btn'} onClick={() => setView('top')} disabled={loading}>TOP 10</button>
        <button style={{ flex: 1 }} className={view === 'around' ? 'aqua-btn-active' : 'aqua-btn'} onClick={() => setView('around')} disabled={loading}>내 순위</button>
        <button style={{ flex: 1 }} className={view === 'friend' ? 'aqua-btn-active' : 'aqua-btn'} onClick={() => setView('friend')} disabled={loading}>친구</button>
        <button style={{ flex: 1 }} className="aqua-btn" onClick={() => doFetch()} disabled={loading}>{loading ? '...' : '↻'}</button>
      </div>

      {view === 'around' && mode === 'prestige' && myPrestigeScore === 0 ? (
        <div className={styles.noPrestige}>
          <div>환생 후 순위에 등록됩니다.</div>
        </div>
      ) : view === 'around' && mode === 'gold' && !hasGoldSeason ? (
        <div className={styles.noPrestige}>
          <div>현재 참여 중인 골드 시즌이 없습니다.</div>
          <div>시즌 기간: {CONFIG.WEEK_START_DATE} ~ {CONFIG.WEEK_END_DATE}</div>
        </div>
      ) : (
        <div className={styles.list}>
          {loading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : entries.length === 0 ? (
            <div className={styles.loading}>아직 등록된 순위가 없습니다</div>
          ) : entries.map((e, i) => renderRow(e, view === 'friend' ? i + 1 : startRank + i))}
        </div>
      )}
    </div>
  )
}
