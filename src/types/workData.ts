export interface WorkData {
  lastWorked: number  // timestamp ms
  lastActivityDate: string | null  // 'YYYY-MM-DD' 마지막 접속 기록 전송일
  meals: {
    breakfast: string | null  // 'YYYY-MM-DD' 마지막 수령일
    lunch: string | null
    dinner: string | null
  }
  mealWindow: {
    type: 'breakfast' | 'lunch' | 'dinner' | null
    seconds: number  // 현재 창 내 누적 초
  }
  salary: {
    secondsAccumulated: number  // 마지막 월급 이후 누적 초
  }
}

export const initialWorkData: WorkData = {
  lastWorked: Date.now(),
  lastActivityDate: null,
  meals: { breakfast: null, lunch: null, dinner: null },
  mealWindow: { type: null, seconds: 0 },
  salary: { secondsAccumulated: 0 },
}

export interface Reward {
  type: 'offline' | 'breakfast' | 'lunch' | 'dinner' | 'salary'
  gold?: number
  boostMs?: number
}
