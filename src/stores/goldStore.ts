import { create } from 'zustand'

const BUCKET_WINDOW = 600

// 버퍼 — RAF에서 직접 mutate, React 렌더링과 무관
export const goldBufferRef = { current: 0 }
export const totalEarnedBufferRef = { current: 0 }
export const earnedInSecRef = { current: 0 }
const bucketHistory: number[] = []

// 최신 값 ref — RAF/핸들러에서 React 사이클 밖에서 읽음
export const goldRef = { current: 0 }
export const totalEarnedRef = { current: 0 }

interface GoldState {
  gold: number
  totalEarned: number
  goldPerSec: number
}

interface GoldActions {
  /** 매초 틱 — 버퍼 플러시 + goldPerSec 재계산. 매초 1회만 setState 호출 */
  flushTick: () => void
  setGold: (gold: number | ((prev: number) => number)) => void
  setTotalEarned: (total: number) => void
  reset: (startGold: number) => void
}

export const useGoldStore = create<GoldState & GoldActions>((set, get) => ({
  gold: 0,
  totalEarned: 0,
  goldPerSec: 0,

  flushTick: () => {
    const g = goldBufferRef.current
    const t = totalEarnedBufferRef.current
    const bucket = earnedInSecRef.current

    goldBufferRef.current = 0
    totalEarnedBufferRef.current = 0
    earnedInSecRef.current = 0

    bucketHistory.push(bucket)
    if (bucketHistory.length > BUCKET_WINDOW) bucketHistory.shift()
    const nonZero = bucketHistory.filter(b => b > 0)
    const gps = nonZero.length > 0
      ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length)
      : 0

    const prev = get()
    set({
      gold: g > 0 ? prev.gold + g : prev.gold,
      totalEarned: t > 0 ? prev.totalEarned + t : prev.totalEarned,
      goldPerSec: gps,
    })
  },

  setGold: (gold) => {
    if (typeof gold === 'function') {
      set(s => ({ gold: (gold as (prev: number) => number)(s.gold) }))
    } else {
      set({ gold })
    }
  },

  setTotalEarned: (total) => set({ totalEarned: total }),

  reset: (startGold) => {
    goldBufferRef.current = 0
    totalEarnedBufferRef.current = 0
    earnedInSecRef.current = 0
    bucketHistory.length = 0
    set({ gold: startGold, totalEarned: 0, goldPerSec: 0 })
  },
}))

useGoldStore.subscribe(state => {
  goldRef.current = state.gold
  totalEarnedRef.current = state.totalEarned
})
