import { useState, useEffect } from 'react'
import { ScoreService } from '../../services/ScoreService'
import type { LeaderboardEntry } from '../../services/ScoreService'
import { formatGold } from '../../utils/formatGold'
import { CONFIG } from '../../config'
import styles from './LeaderboardTab.module.css'

interface Props {
  playerName: string
  mode: 'prestige' | 'gold'
  onNameChange: (name: string) => void
}

export default function LeaderboardTab({ playerName, mode, onNameChange }: Props) {
  const hasPrestigedThisWeek = CONFIG.WEEK <= CONFIG.CURRENT_WEEK
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const myIndex = entries.findIndex(e => e.player_name === playerName)
  const myEntry = myIndex >= 0 ? entries[myIndex] : null
  const myRank = myIndex >= 0 ? myIndex + 1 : null
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(playerName)

  const refresh = () => {
    setLoading(true)
    const fetch = mode === 'prestige' ? ScoreService.fetchPrestige : ScoreService.fetchGold
    fetch().then(data => { setEntries(data); setLoading(false) })
  }

  useEffect(() => { refresh() }, [mode])

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
        {!myEntry && !loading && hasPrestigedThisWeek && (
          <span className={styles.myRankNone}>미등록</span>
        )}
      </div>

      {/* 새로고침 */}
      <button className={styles.refreshBtn} onClick={refresh} disabled={loading}>
        {loading ? '...' : '↻ 새로고침'}
      </button>

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
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
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
