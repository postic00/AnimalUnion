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
  onNameChange: (name: string) => void
  onSubmitGold?: () => Promise<void>
}

export default function LeaderboardTab({ playerName, mode, onNameChange, onSubmitGold }: Props) {
  const hasPrestigedThisWeek = CONFIG.WEEK > 0 && CONFIG.WEEK <= CONFIG.CURRENT_WEEK
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'top' | 'around'>('top')
  const [startRank, setStartRank] = useState(1)

  const myIndex = entries.findIndex(e => e.player_name === playerName)
  const myEntry = myIndex >= 0 ? entries[myIndex] : null
  const myRank = myIndex >= 0 ? startRank + myIndex : null
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(playerName)

  const doFetch = async () => {
    setLoading(true)
    try {
      if (mode === 'gold') await onSubmitGold?.()
      if (view === 'top') {
        const fetch = mode === 'prestige' ? ScoreService.fetchPrestige : ScoreService.fetchGold
        const data = await fetch(10)
        setEntries(data)
        setStartRank(1)
      } else {
        const deviceId = SaveService.getDeviceId()
        const fetch = mode === 'prestige' ? ScoreService.fetchPrestigeAround : ScoreService.fetchGoldAround
        const result = await fetch(deviceId)
        setEntries(result.entries)
        setStartRank(result.startRank)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const refresh = () => { doFetch() }

  useEffect(() => {
    doFetch()
  }, [mode, view]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNameSave = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    onNameChange(trimmed)
    setEditingName(false)
  }

  return (
    <div className={styles.container}>
      {/* 내 순위 */}
      <div className={styles.myScore}>
        <div className={styles.myLeft}>
          <span className={styles.myIcon}>{mode === 'prestige' ? '⭐' : '💰'}</span>
          <div className={styles.myInfo}>
            {editingName ? (
              <div className={styles.nameEdit}>
                <textarea
                  className={styles.nameInput}
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleNameSave())}
                  placeholder="닉네임 입력"
                  maxLength={16}
                  rows={1}
                  autoFocus
                />
                <button className={styles.nameSaveBtn} onClick={handleNameSave}>확인</button>
              </div>
            ) : (
              <div className={styles.nameRow}>
                <span className={styles.myName}>{playerName}</span>
                <button className={styles.nameEditBtn} onClick={() => { setNameInput(playerName); setEditingName(true) }}>✏️</button>
              </div>
            )}
          </div>
        </div>
        {myEntry && myRank && (
          <div className={styles.myRankInfo}>
            <span className={styles.myRankNum}>
              {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : `#${myRank}`}
            </span>
            <span className={styles.myRankScore}>{formatGold(myEntry.score)}</span>
          </div>
        )}
        {!myEntry && !loading && view === 'around' && hasPrestigedThisWeek && (
          <span className={styles.myRankNone}>미등록</span>
        )}
      </div>

      {/* 뷰 전환 + 새로고침 */}
      <div className={styles.viewRow}>
        <button
          className={`${styles.viewBtn} ${view === 'top' ? styles.viewBtnActive : ''}`}
          onClick={() => setView('top')}
          disabled={loading}
        >
          TOP 10
        </button>
        <button
          className={`${styles.viewBtn} ${view === 'around' ? styles.viewBtnActive : ''}`}
          onClick={() => setView('around')}
          disabled={loading}
        >
          내 주변
        </button>
        <button className={styles.refreshBtn} onClick={refresh} disabled={loading}>
          {loading ? '...' : '↻'}
        </button>
      </div>

      {/* 리더보드 */}
      {hasPrestigedThisWeek ? (
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
