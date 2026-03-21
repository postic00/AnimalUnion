import {
  updatePlayerName as _updatePlayerName,
  deleteAllScores as _deleteAllScores,
  submitPrestigeScore as _submitPrestigeScore,
  submitGoldScore as _submitGoldScore,
  fetchPrestigeLeaderboard as _fetchPrestigeLeaderboard,
  fetchGoldLeaderboard as _fetchGoldLeaderboard,
  recordSession as _recordSession,
  recordAd as _recordAd,
} from '../lib/supabase'
export type { LeaderboardEntry } from '../lib/supabase'

export const ScoreService = {
  // ── 점수 제출 ─────────────────────────────────────────────────────────────
  updatePlayerName(deviceId: string, playerName: string): Promise<void> {
    return _updatePlayerName(deviceId, playerName).catch(e => console.warn('[ScoreService] updatePlayerName 실패:', e))
  },

  deleteAllScores(deviceId: string): Promise<void> {
    return _deleteAllScores(deviceId).catch(e => console.warn('[ScoreService] deleteAllScores 실패:', e))
  },

  submitPrestige(deviceId: string, playerName: string, score: number, prestigeCount: number): Promise<boolean> {
    return _submitPrestigeScore(deviceId, playerName, score, prestigeCount)
  },

  submitGold(deviceId: string, playerName: string, score: number): Promise<boolean> {
    return _submitGoldScore(deviceId, playerName, score)
  },

  // ── 활동 기록 ─────────────────────────────────────────────────────────────
  recordSession(deviceId: string, platform: string): Promise<void> {
    return _recordSession(deviceId, platform).catch(e => console.warn('[ScoreService] recordSession 실패:', e))
  },

  recordAd(deviceId: string): Promise<void> {
    return _recordAd(deviceId).catch(e => console.warn('[ScoreService] recordAd 실패:', e))
  },

  // ── 리더보드 조회 ─────────────────────────────────────────────────────────
  fetchPrestige(limit = 100) {
    return _fetchPrestigeLeaderboard(limit)
  },

  fetchGold(limit = 100) {
    return _fetchGoldLeaderboard(limit)
  },
}
