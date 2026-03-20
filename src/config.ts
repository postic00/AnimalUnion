export const CONFIG = {
  // 현재 주차
  CURRENT_WEEK: 0,
  WEEK: 0,
  NEXT_WEEK_RATE: 0.8,
  WEEK_START_DATE: '2026-03-10',
  WEEK_END_DATE: '2026-03-20',

  // 기술적 고정값
  MOVE_SPEED: 2000,
  ITEM_SIZE_RATIO: 0.7,
  ITEM_GAP_RATIO: 0.6,

  // 기타 고정값
  ITEM_BASE_VALUE: 10,
  CLICKER_THRESHOLD: 2,
  FA_PICK_TIME: 1500,
  AM_UNLOCK_COST: 10,
  FA_BUILD_COST_BASE: 10,
  PR_BUILD_COST_BASE: 10,
  PR_BUILD_COST_EXP: 2,
  PRESTIGE_CONDITION: 1_000_000,
  PRESTIGE_POINTS_DIVISOR: 1_000_000,
  PRODUCT_GRADE_MAX: 20,

  // 아이템 등급별 기본 가격
  GRADE_BASE_VALUES: [
    1, 1, 1,
    10, 10, 10,
    100, 130, 200,
    1200, 3100, 5000,
    20000, 75000, 150000,
    390000, 2000000, 5100000,
    57000000, 200000000,
  ] as number[],

  // FA 등급별 보너스 배열
  WA_BONUS: Array(20).fill(1.5) as number[],
  PA_BONUS: Array(20).fill(0) as number[],
  PK_BONUS: Array(20).fill(2) as number[],

  // PR (생산기)
  PR_PROC_BASE: 10000, PR_PROC_RATE: 2,   PR_PROC_EXP: 1,   PR_PROC_ACC: 1,
  PR_COST_BASE: 10,    PR_COST_RATE: 1.3, PR_COST_EXP: 3,   PR_COST_ACC: 0.03,

  // FA (공장)
  FA_PROC_BASE: 1500, FA_PROC_RATE: 2,   FA_PROC_EXP: 1,   FA_PROC_ACC: 1,
  FA_COST_BASE: 50,   FA_COST_RATE: 1.3, FA_COST_EXP: 3,   FA_COST_ACC: 0.03,

  // IT (아이템 가치)
  IT_PROC_BASE: 1,    IT_PROC_RATE: 1,   IT_PROC_EXP: 1,   IT_PROC_ACC: 1,
  IT_COST_BASE: 20,   IT_COST_RATE: 1.3, IT_COST_EXP: 3,   IT_COST_ACC: 0.03,

  // IC (아이템 수량)
  IC_PROC_BASE: 1,    IC_PROC_RATE: 2,   IC_PROC_EXP: 1,   IC_PROC_ACC: 1,
  IC_COST_BASE: 20,   IC_COST_RATE: 1.3, IC_COST_EXP: 3,   IC_COST_ACC: 0.03,

  // BF (버퍼)
  BF_PROC_BASE: 20,   BF_PROC_RATE: 10,  BF_PROC_EXP: 1,   BF_PROC_ACC: 1,
  BF_COST_BASE: 10,   BF_COST_RATE: 1.3, BF_COST_EXP: 3,   BF_COST_ACC: 0.03,

  // RL (레일)
  RL_PROC_BASE: 2500, RL_PROC_RATE: 1,   RL_PROC_EXP: 1,   RL_PROC_ACC: 1,
  RL_COST_BASE: 10,   RL_COST_RATE: 1.3, RL_COST_EXP: 3,   RL_COST_ACC: 0.03,
  RAIL_SPEED_MAX_MULTIPLIER: 3.0,
  RAIL_SPEED_MAX_LEVEL: 60,

  // AM (동물)
  AM_PROC_BASE: 0.1,  AM_PROC_RATE: 0.05, AM_PROC_EXP: 3,  AM_PROC_ACC: 1,
  AM_COST_BASE: 10,   AM_COST_RATE: 1.3,  AM_COST_EXP: 3,  AM_COST_ACC: 0.03,

  // BD (라인)
  BD_PROC_BASE: 1,    BD_PROC_RATE: 1,   BD_PROC_EXP: 1,   BD_PROC_ACC: 1,
  BD_COST_BASE: 1000, BD_COST_RATE: 1.3, BD_COST_EXP: 3,   BD_COST_ACC: 0.03,
}

export type ConfigKey = keyof typeof CONFIG

export function applyWeekConfig(weekConfig: Partial<Record<string, unknown>>): void {
  for (const key of Object.keys(weekConfig)) {
    if (key in CONFIG) {
      (CONFIG as Record<string, unknown>)[key] = weekConfig[key]
    }
  }
}
