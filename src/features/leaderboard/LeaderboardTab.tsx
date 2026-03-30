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
  myPrestigeScore?: number
  myGoldScore?: number
  hasGoldSeason?: boolean
  onSubmitGold?: () => Promise<void>
  onRankUpdate?: (rank: number | null, score: number | null) => void
}

export default function LeaderboardTab({
  playerName,
  mode,
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
  const myIndex = entries.findIndex(e => e.id === myDeviceId || e.player_name === playerName)
  const myEntry = myIndex >= 0 ? entries[myIndex] : null
  const myRank = myEntry?.rank ?? (myIndex >= 0 ? startRank + myIndex : null)
  const myScore = mode === 'gold' ? myGoldScore : myPrestigeScore
  const myUnregistered = !hasGoldSeason

  const notParticipating = !hasGoldSeason
  useEffect(() => {
    if (notParticipating) { onRankUpdate?.(null, null); return }
    onRankUpdate?.(myUnregistered ? null : myRank, myEntry?.score ?? null)
  }, [myRank, myEntry?.score, myUnregistered, notParticipating]) // eslint-disable-line react-hooks/exhaustive-deps

  const table = mode === 'prestige' ? 'leaderboard' : 'leaderboard_gold'
  const week = mode === 'gold' ? CONFIG.WEEK : 0

  const injectMe = (data: LeaderboardEntry[]): LeaderboardEntry[] => {
    const deduped = data.filter((e, i) => data.findIndex(x => x.player_name === e.player_name) === i)
    const hasMe = deduped.some(e => e.id === myDeviceId || e.player_name === playerName)
    if (hasMe) return deduped
    return [...deduped, { id: myDeviceId, player_name: playerName, score: myScore }]
  }

  const doFetch = async (submit = false) => {
    setLoading(true)
    try {
      if (submit && mode === 'gold' && hasGoldSeason) await onSubmitGold?.()
      if (view === 'top') {
        const data = await ScoreService.lbTop(table, { week, pageSize: 10 })
        setEntries(mode === 'gold' && !hasGoldSeason ? data : injectMe(data))
        setStartRank(1)

      } else if (view === 'around') {
        const noAround = mode === 'gold' ? !hasGoldSeason : myPrestigeScore === 0
        if (noAround) { setEntries([]); setStartRank(1); return }
        const result = await ScoreService.lbAround(table, myDeviceId, { week })
        setEntries(injectMe(result.entries))
        setStartRank(result.startRank)

      } else { // friend
        const data = await ScoreService.lbTop(table, { week, friendOnly: true, deviceId: myDeviceId, pageSize: 50 })
        const list = (mode === 'gold' && !hasGoldSeason) ? data : injectMe(data)
        setEntries(list)
        setStartRank(1)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    doFetch(mode === 'gold')
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    doFetch()
  }, [view]) // eslint-disable-line react-hooks/exhaustive-deps

  const renderRow = (e: LeaderboardEntry, rank: number) => {
    const isMe = e.id === myDeviceId || e.player_name === playerName
    const isDisabled = isMe && myUnregistered
    return (
      <div
        key={e.id || e.player_name}
        className={`${styles.row} ${isMe && !isDisabled ? styles.myRow : ''} ${isDisabled ? styles.disabledRow : ''}`}
      >
        <span className={styles.rank}>
          {isDisabled ? '-' : rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`}
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
        <button style={{ flex: 1 }} className="aqua-btn" onClick={() => doFetch(true)} disabled={loading}>{loading ? '...' : '↻'}</button>
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
          ) : entries.map((e, i) => renderRow(e, e.rank ?? startRank + i))}
        </div>
      )}
    </div>
  )
}
