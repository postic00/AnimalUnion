import { CONFIG } from '../config'
import type { WorkData, GoldReward, MealReward } from '../types/workData'

export function getCurrentMealType(): 'breakfast' | 'lunch' | 'dinner' | null {
  const hour = new Date().getHours()
  if (hour >= CONFIG.WR_BREAKFAST_START && hour < CONFIG.WR_BREAKFAST_END) return 'breakfast'
  if (hour >= CONFIG.WR_LUNCH_START && hour < CONFIG.WR_LUNCH_END) return 'lunch'
  if (hour >= CONFIG.WR_DINNER_START && hour < CONFIG.WR_DINNER_END) return 'dinner'
  return null
}

export function calcOfflineReward(workData: WorkData, goldPerSec: number): GoldReward | null {
  const elapsedSec = Math.min((Date.now() - workData.lastWorked) / 1000, CONFIG.WR_OFFLINE_MAX_SECONDS)
  if (elapsedSec < 300) return null
  const gold = Math.floor(goldPerSec * elapsedSec * CONFIG.WR_OFFLINE_RATE)
  if (gold <= 0) return null
  return { type: 'offline', gold }
}

export function calcMealReward(workData: WorkData): MealReward | null {
  const type = getCurrentMealType()
  if (!type) return null
  const today = new Date().toISOString().slice(0, 10)
  if (workData.meals[type] === today) return null
  return { type, boostMs: CONFIG.WR_MEAL_BOOST_MS }
}

export function calcSalaryReward(workData: WorkData, goldPerSec: number): GoldReward | null {
  if (workData.salary.secondsAccumulated < CONFIG.WR_SALARY_SECONDS) return null
  const gold = Math.floor(goldPerSec * CONFIG.WR_SALARY_SECONDS * CONFIG.WR_SALARY_RATE)
  if (gold <= 0) return null
  return { type: 'salary', gold }
}

// WorkData 틱 업데이트 (1초마다 호출)
export function tickWorkData(workData: WorkData): WorkData {
  return {
    ...workData,
    salary: { secondsAccumulated: workData.salary.secondsAccumulated + 1 },
  }
}
