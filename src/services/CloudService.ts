import type { Board } from '../types/board'
import type { GameState } from '../types/gameState'
import type { WorkData } from '../types/workData'
import {
  fetchAndSaveWeekConfig as _fetchAndSaveWeekConfig,
  saveToCloud as _saveToCloud,
  loadFromCloud as _loadFromCloud,
  issueTransferCode as _issueTransferCode,
  loadByTransferCode as _loadByTransferCode,
  issueInviteCode as _issueInviteCode,
  sendFriendRequest as _sendFriendRequest,
  getPendingFriendRequests as _getPendingFriendRequests,
  acceptFriendRequest as _acceptFriendRequest,
  rejectFriendRequest as _rejectFriendRequest,
  fetchAcceptedFriends as _fetchAcceptedFriends,
  clearCloudSave as _clearCloudSave,
} from '../lib/userProfile'
import type { FriendRequestRow } from '../lib/userProfile'

export interface CloudExtras {
  boosts?: { speedBoostRemaining: number; goldBoostRemaining: number }
  workData?: WorkData
  items?: unknown[]
  faStates?: Record<string, unknown>
  rsQueues?: Record<string, unknown[]>
  produceTimers?: Record<string, number>
  prStates?: Record<string, unknown>
}

export const CloudService = {
  // ── 주차 설정 동기화 ─────────────────────────────────────────────────────
  fetchAndSaveWeekConfig(): Promise<void> {
    return _fetchAndSaveWeekConfig()
  },

  // ── 클라우드 저장/로드 ────────────────────────────────────────────────────
  save(
    playerName: string,
    gameState: GameState,
    board: Board,
    platform: string,
    extras?: CloudExtras
  ): Promise<boolean> {
    return _saveToCloud(playerName, gameState, board, platform, extras)
  },

  load() {
    return _loadFromCloud()
  },

  // ── 기기 이전 ─────────────────────────────────────────────────────────────
  issueTransferCode(): Promise<string | null> {
    return _issueTransferCode()
  },

  loadByTransferCode(code: string) {
    return _loadByTransferCode(code)
  },

  // ── 친구 요청 ─────────────────────────────────────────────────────────────
  issueInviteCode(): Promise<string | null> {
    return _issueInviteCode()
  },

  sendFriendRequest(inviteCode: string, myDeviceId: string, myPlayerName: string) {
    return _sendFriendRequest(inviteCode, myDeviceId, myPlayerName)
  },

  getPendingFriendRequests(): Promise<FriendRequestRow[]> {
    return _getPendingFriendRequests()
  },

  acceptFriendRequest(requestId: string, fromDeviceId: string): Promise<number | null> {
    return _acceptFriendRequest(requestId, fromDeviceId)
  },

  rejectFriendRequest(requestId: string): Promise<boolean> {
    return _rejectFriendRequest(requestId)
  },

  fetchAcceptedFriends(myDeviceId: string) {
    return _fetchAcceptedFriends(myDeviceId)
  },

  clearCloudSave(deviceId: string): Promise<void> {
    return _clearCloudSave(deviceId)
  },
}
