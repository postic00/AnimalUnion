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

  const myIndex = entries.findIndex(e => e.player_name === playerName)
  const myEntry = myIndex >= 0 ? entries[myIndex] : null
  const myRank = myIndex >= 0 ? startRank + myIndex : null

  useEffect(() => {
    onRankUpdate?.(myRank, myEntry?.score ?? null)
  }, [myRank, myEntry?.score]) // eslint-disable-line react-hooks/exhaustive-deps

  const doFetch = async () => {
    setLoading(true)
    try {
      if (view === 'friend') {
        const myDeviceId = SaveService.getDeviceId()
        const allIds = [...new Set([myDeviceId, ...friendDeviceIds])]
        const data = await ScoreService.fetchFriendsPrestige(allIds)
        // 내 항목이 없으면 직접 추가
        const hasMe = data.some(e => e.player_name === playerName)
        const list = hasMe ? data : [
          { id: myDeviceId, player_name: playerName, score: myPrestigeScore, created_at: '' },
          ...data,
        ]
        list.sort((a, b) => b.score - a.score)
        setEntries(list)
        setStartRank(1)
      } else if (view === 'top') {
        if (mode === 'gold') await onSubmitGold?.()
        const fetch = mode === 'prestige' ? ScoreService.fetchPrestige : ScoreService.fetchGold
        const data = await fetch(10)
        setEntries(data)
        setStartRank(1)
      } else {
        if (mode === 'gold') await onSubmitGold?.()
        const deviceId = SaveService.getDeviceId()
        const fetch = mode === 'prestige' ? ScoreService.fetchPrestigeAround : ScoreService.fetchGoldAround
        const result = await fetch(deviceId)
        setEntries(result.entries)
        setStartRank(result.startRank)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    doFetch()
  }, [mode, view]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.container}>
      {/* 뷰 전환 + 새로고침 */}
      <div className={styles.viewRow}>
        <button
          className={view === 'top' ? 'aqua-btn-active' : 'aqua-btn'}
          onClick={() => setView('top')}
          disabled={loading}
        >
          TOP 10
        </button>
        <button
          className={view === 'around' ? 'aqua-btn-active' : 'aqua-btn'}
          onClick={() => setView('around')}
          disabled={loading}
        >
          내 순위
        </button>
        <button
          className={view === 'friend' ? 'aqua-btn-active' : 'aqua-btn'}
          onClick={() => setView('friend')}
          disabled={loading}
        >
          친구
        </button>
        <button className={styles.refreshBtn} onClick={() => doFetch()} disabled={loading}>
          {loading ? '...' : '↻'}
        </button>
      </div>

      {/* 리더보드 */}
      {view === 'friend' ? (
        <div className={styles.list}>
          {loading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : entries.length === 0 ? (
            <div className={styles.loading}>친구가 없어요</div>
          ) : entries.map((e, i) => (
            <div key={e.id} className={`${styles.row} ${e.player_name === playerName ? styles.myRow : ''}`}>
              <span className={styles.rank}>
                {i + 1 === 1 ? '🥇' : i + 1 === 2 ? '🥈' : i + 1 === 3 ? '🥉' : `${i + 1}`}
              </span>
              <span className={styles.name}>{e.player_name}</span>
              <span className={styles.score}>⭐ {formatGold(e.score)}</span>
              {e.prestige_count !== undefined && (
                <span className={styles.prestige}>환생 {e.prestige_count}회</span>
              )}
            </div>
          ))}
        </div>
      ) : hasPrestigedThisWeek ? (
        <div className={styles.list}>
          {loading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : entries.length === 0 ? (
            <div className={styles.loading}>아직 등록된 순위가 없습니다</div>
          ) : entries.map((e, i) => (
            <div key={e.id} className={`${styles.row} ${e.player_name === playerName ? styles.myRow : ''}`}>
              <span className={styles.rank}>
                {startRank + i === 1 ? '🥇' : startRank + i === 2 ? '🥈' : startRank + i === 3 ? '🥉' : `${startRank + i}`}
              </span>
              <span className={styles.name}>{e.player_name}</span>
              <span className={styles.score}>{mode === 'prestige' ? '⭐' : '💰'} {formatGold(e.score)}</span>
              {mode === 'prestige' && e.prestige_count !== undefined && (
                <span className={styles.prestige}>환생 {e.prestige_count}회</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noPrestige}>
          <div>참여중인 시즌이 종료되었어요.</div>
          <div>환생 후 시즌 참여 가능합니다.</div>
          <div className={styles.newSeason}>새로운 시즌: {CONFIG.WEEK}시즌 ({CONFIG.WEEK_START_DATE} ~ {CONFIG.WEEK_END_DATE})</div>
        </div>
      )}
    </div>
  )
}
