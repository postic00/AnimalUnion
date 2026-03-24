import { create } from 'zustand'

interface BoostState {
  speedBoostRemaining: number
  goldBoostRemaining: number
}

interface BoostActions {
  addSpeedBoost: (ms: number) => void
  addGoldBoost: (ms: number) => void
  tickBoosts: () => void
  setBoosts: (speed: number, gold: number) => void
}

export const useBoostStore = create<BoostState & BoostActions>((set, get) => ({
  speedBoostRemaining: 0,
  goldBoostRemaining: 0,

  addSpeedBoost: (ms) => set(s => ({ speedBoostRemaining: s.speedBoostRemaining + ms })),
  addGoldBoost: (ms) => set(s => ({ goldBoostRemaining: s.goldBoostRemaining + ms })),

  tickBoosts: () => {
    const { speedBoostRemaining, goldBoostRemaining } = get()
    if (speedBoostRemaining > 0 || goldBoostRemaining > 0) {
      set({
        speedBoostRemaining: Math.max(0, speedBoostRemaining - 1000),
        goldBoostRemaining: Math.max(0, goldBoostRemaining - 1000),
      })
    }
  },

  setBoosts: (speed, gold) => set({ speedBoostRemaining: speed, goldBoostRemaining: gold }),
}))

// 모듈 레벨 ref — RAF 루프/핸들러에서 React 사이클 밖에서 읽음
export const speedBoostRemainingRef = { current: 0 }
export const goldBoostRemainingRef = { current: 0 }

useBoostStore.subscribe(state => {
  speedBoostRemainingRef.current = state.speedBoostRemaining
  goldBoostRemainingRef.current = state.goldBoostRemaining
})
