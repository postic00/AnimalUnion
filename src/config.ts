export const CONFIG = {
  // 현재 주차
  CURRENT_WEEK: 0,
  WEEK: 0,
  NEXT_WEEK_RATE: 0.8,
  WEEK_START_DATE: '2026-03-10',
  WEEK_END_DATE: '2026-03-20',

  // CM (공통)
  CM_MOVE_SPEED: 2000,
  CM_SIZE_RATIO: 0.7,
  CM_GAP_RATIO: 0.6,
  CM_CLICKER_THRESHOLD: 2,
  CM_PRESTIGE_CONDITION: 1_000_000,
  CM_PRESTIGE_DIVISOR: 1_000_000,
  CM_GRADE_MAX: 20,

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

  // 아이템 등급별 기본 가격 배율
  GRADE_BASE_MULTIPLIER: Array(20).fill(1) as number[],

  // FA 등급별 보너스 배열
  WA_BONUS: Array(20).fill(1.5) as number[],
  PA_BONUS: Array(20).fill(0) as number[],
  PK_BONUS: Array(20).fill(2) as number[],

  // PR (생산기)
  PR_PROC_BASE: 10000, PR_PROC_RATE: 2,   PR_PROC_EXP: 1,   PR_PROC_ACC: 1,
  PR_COST_BASE: 10,    PR_COST_RATE: 1.3, PR_COST_EXP: 3,   PR_COST_ACC: 0.03,
  PR_BUILD_COST_BASE: 10,

  // FA (공장)
  FA_PROC_BASE: 1500, FA_PROC_RATE: 2,   FA_PROC_EXP: 1,   FA_PROC_ACC: 1,
  FA_COST_BASE: 50,   FA_COST_RATE: 1.3, FA_COST_EXP: 3,   FA_COST_ACC: 0.03,
  FA_PICK_TIME: 1500,
  FA_BUILD_COST_BASE: 10,

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
  AM_UNLOCK_COST: 10,

  // BD (라인)
  BD_PROC_BASE: 1,    BD_PROC_RATE: 1,   BD_PROC_EXP: 1,   BD_PROC_ACC: 1,
  BD_COST_BASE: 1000, BD_COST_RATE: 1.3, BD_COST_EXP: 3,   BD_COST_ACC: 0.03,

  // PF_BC (건설 비용 할인)
  PF_BC_PROC_BASE: 0.002, PF_BC_PROC_RATE: 1, PF_BC_PROC_EXP: 1, PF_BC_PROC_ACC: 1, PF_BC_PROC_MAX: 100,
  PF_BC_COST_BASE: 10,    PF_BC_COST_RATE: 1.5, PF_BC_COST_EXP: 3, PF_BC_COST_ACC: 0.05,

  // PF_LC (라인 비용 할인)
  PF_LC_PROC_BASE: 0.002, PF_LC_PROC_RATE: 1, PF_LC_PROC_EXP: 1, PF_LC_PROC_ACC: 1, PF_LC_PROC_MAX: 100,
  PF_LC_COST_BASE: 10,    PF_LC_COST_RATE: 1.5, PF_LC_COST_EXP: 3, PF_LC_COST_ACC: 0.05,

  // PF_PS (생산자 시작 레벨)
  PF_PS_PROC_BASE: 0.2,  PF_PS_PROC_RATE: 1, PF_PS_PROC_EXP: 1, PF_PS_PROC_ACC: 1, PF_PS_PROC_MAX: 100,
  PF_PS_COST_BASE: 10,   PF_PS_COST_RATE: 1.5, PF_PS_COST_EXP: 3, PF_PS_COST_ACC: 0.05,

  // PF_GM (골드 배율)
  PF_GM_PROC_BASE: 0.002, PF_GM_PROC_RATE: 1, PF_GM_PROC_EXP: 1, PF_GM_PROC_ACC: 1, PF_GM_PROC_MAX: 100,
  PF_GM_COST_BASE: 10,    PF_GM_COST_RATE: 1.5, PF_GM_COST_EXP: 3, PF_GM_COST_ACC: 0.05,

  // PF_IG (초기 골드)
  PF_IG_PROC_BASE: 1000,
  PF_IG_COST_BASE: 10,    PF_IG_COST_RATE: 1.5, PF_IG_COST_EXP: 3, PF_IG_COST_ACC: 0.05,

  // WR (근무 보상)
  WR_OFFLINE_MAX_SECONDS: 4 * 60 * 60,  // 휴게 보상 최대 오프라인 시간 (초, 4시간)
  WR_OFFLINE_RATE: 0.3,          // 휴게 보상 비율 (goldPerSec 대비, 30%)
  WR_SALARY_SECONDS: 600,        // 월급 지급 주기 (초)
  WR_SALARY_RATE: 0.2,           // 월급 비율 (goldPerSec * 600 * 20% → gold)
  WR_MEAL_SECONDS: 600,          // 식사 보상 요구 플레이 시간 (초)
  WR_MEAL_BOOST_MS: 10 * 60 * 1000,  // 식사 부스터 지속 시간 (ms)
  WR_BREAKFAST_START: 7,         // 아침 시작 시 (시)
  WR_BREAKFAST_END: 10,          // 아침 종료 시 (시)
  WR_LUNCH_START: 12,            // 점심 시작 시 (시)
  WR_LUNCH_END: 14,              // 점심 종료 시 (시)
  WR_DINNER_START: 18,           // 저녁 시작 시 (시)
  WR_DINNER_END: 21,             // 저녁 종료 시 (시)
}

export type ConfigKey = keyof typeof CONFIG

export function applyWeekConfig(weekConfig: Partial<Record<string, unknown>>): void {
  for (const key of Object.keys(weekConfig)) {
    if (!(key in CONFIG)) continue

    const current = (CONFIG as Record<string, unknown>)[key]
    const incoming = weekConfig[key]

    // 1. 타입 검증
    if (typeof incoming !== typeof current) continue

    // 2. 배열 길이 검증
    if (Array.isArray(current)) {
      if (!Array.isArray(incoming) || incoming.length !== current.length) continue
      if (incoming.some(v => typeof v !== typeof current[0])) continue
    }

    // 3. 숫자 범위 검증
    if (typeof incoming === 'number') {
      if (!isFinite(incoming) || incoming < 0) continue
    }

    (CONFIG as Record<string, unknown>)[key] = incoming
  }
}
