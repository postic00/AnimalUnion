import {
  deleteScores as _deleteScores,
  submitPrestigeScore as _submitPrestigeScore,
  submitGoldScore as _submitGoldScore,
  fetchPrestigeLeaderboard as _fetchPrestigeLeaderboard,
  fetchGoldLeaderboard as _fetchGoldLeaderboard,
} from '../lib/supabase'
export type { LeaderboardEntry } from '../lib/supabase'

export const ScoreService = {
  // ── 점수 제출 ─────────────────────────────────────────────────────────────
  deleteAll(deviceId: string): Promise<void> {
    return _deleteScores(deviceId).catch(e => console.warn('[ScoreService] deleteAll 실패:', e))
  },

  submitPrestige(deviceId: string, playerName: string, score: number, prestigeCount: number): Promise<boolean> {
    return _submitPrestigeScore(deviceId, playerName, score, prestigeCount)
  },

  submitGold(deviceId: string, playerName: string, score: number): Promise<boolean> {
    return _submitGoldScore(deviceId, playerName, score)
  },

  // ── 리더보드 조회 ─────────────────────────────────────────────────────────
  fetchPrestige(limit = 100) {
    return _fetchPrestigeLeaderboard(limit)
  },

  fetchGold(limit = 100) {
    return _fetchGoldLeaderboard(limit)
  },
}
