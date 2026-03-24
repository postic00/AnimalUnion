export interface WorkData {
  lastWorked: number  // timestamp ms
  lastActivityDate: string | null  // 'YYYY-MM-DD' 마지막 접속 기록 전송일
  meals: {
    breakfast: string | null  // 'YYYY-MM-DD' 마지막 수령일
    lunch: string | null
    dinner: string | null
  }
  salary: {
    secondsAccumulated: number  // 마지막 월급 이후 누적 초
  }
}

export const initialWorkData: WorkData = {
  lastWorked: Date.now(),
  lastActivityDate: null,
  meals: { breakfast: null, lunch: null, dinner: null },
  salary: { secondsAccumulated: 0 },
}

export type GoldReward = { type: 'offline' | 'salary'; gold: number }
export type MealReward = { type: 'breakfast' | 'lunch' | 'dinner'; boostMs: number }
export type Reward = GoldReward | MealReward
