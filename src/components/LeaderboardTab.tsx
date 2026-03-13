import { useState, useEffect, useRef } from 'react'
import { fetchPrestigeLeaderboard, fetchGoldLeaderboard } from '../lib/supabase'
import type { LeaderboardEntry } from '../lib/supabase'
import { formatGold } from '../utils/formatGold'
import { CONFIG } from '../config'
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
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(playerName)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = (m: 'prestige' | 'gold') => {
    const fetch = m === 'prestige' ? fetchPrestigeLeaderboard : fetchGoldLeaderboard
    fetch().then(data => { setEntries(data); setLoading(false) })
  }

  useEffect(() => {
    setLoading(true)
    refresh(mode)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => refresh(mode), 60_000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [mode])

  const handleNameSave = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    onNameChange(trimmed)
    setEditingName(false)
  }

  return (
    <div className={styles.container}>
      {/* 내 점수 */}
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
