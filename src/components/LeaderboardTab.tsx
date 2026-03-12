import { useState, useEffect } from 'react'
import { fetchLeaderboard, submitScore } from '../lib/supabase'
import type { LeaderboardEntry } from '../lib/supabase'
import { formatGold } from '../utils/formatGold'
import styles from './LeaderboardTab.module.css'

interface Props {
  playerName: string
  prestigePoints: number
  prestigeCount: number
  onNameChange: (name: string) => void
}

export default function LeaderboardTab({ playerName, prestigePoints, prestigeCount, onNameChange }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(playerName)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchLeaderboard().then(data => {
      setEntries(data)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async () => {
    if (!playerName.trim()) { setEditingName(true); return }
    setSubmitting(true)
    const ok = await submitScore(playerName, prestigePoints, prestigeCount)
    if (ok) {
      setSubmitted(true)
      const data = await fetchLeaderboard()
      setEntries(data)
    }
    setSubmitting(false)
  }

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
        <div className={styles.myScoreRow}>
          {editingName ? (
            <div className={styles.nameEdit}>
              <input
                className={styles.nameInput}
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                placeholder="닉네임 입력"
                maxLength={12}
                autoFocus
              />
              <button className={styles.nameSaveBtn} onClick={handleNameSave}>확인</button>
            </div>
          ) : (
            <div className={styles.nameRow}>
              <span className={styles.myName}>{playerName || '닉네임 없음'}</span>
              <button className={styles.nameEditBtn} onClick={() => { setNameInput(playerName); setEditingName(true) }}>✏️</button>
            </div>
          )}
          <div className={styles.myPoints}>⭐ {formatGold(prestigePoints)}</div>
        </div>
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitting || submitted}
        >
          {submitted ? '등록 완료 ✓' : submitting ? '등록 중...' : '순위 등록'}
        </button>
      </div>

      {/* 리더보드 */}
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
            <span className={styles.score}>⭐ {formatGold(e.score)}</span>
            <span className={styles.prestige}>환생 {e.prestige_count}회</span>
          </div>
        ))}
      </div>
    </div>
  )
}
