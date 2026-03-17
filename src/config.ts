export const CONFIG = {
  // 현재 주차
  CURRENT_WEEK: 0,
  WEEK: 0,
  NEXT_WEEK_RATE: 0.8,
  WEEK_START_DATE: '2026-03-10',
  WEEK_END_DATE: '2026-03-20',

  // 기술적 고정값
  MOVE_SPEED: 2500,              // 레일 한 칸 이동 시간 (ms)
  ITEM_SIZE_RATIO: 0.7,          // 아이템 크기 (cellSize 대비)
  ITEM_GAP_RATIO: 0.6,           // 아이템 간 최소 간격 (cellSize 대비)

  // 밸런스 상수
  ITEM_BASE_VALUE: 1,            // 아이템 기본 가격
  PRODUCE_INTERVAL: 1000,        // PR 생산 주기 기본값 (ms)
  PRODUCE_INTERVAL_MULTIPLIER: 2, // 생산 주기 감소 배수

  BUNDLE_COST_BASE: 1,           // 라인 추가 기본 비용
  BUNDLE_COST_EXPONENT: 2,       // 라인 추가 비용 지수

  PRODUCER_UPGRADE_BASE: 10,     // PR 업그레이드 기본 비용
  PRODUCER_UPGRADE_EXPONENT: 2,  // PR 업그레이드 비용 지수

  CLICKER_THRESHOLD: 2,          // 클릭커 아이템 1개 생산에 필요한 클릭 수

  // FA 등급별 보너스 배열 (인덱스 0 = 1등급)
  WA_BONUS: Array(20).fill(2) as number[],
  PA_BONUS: Array(20).fill(0) as number[],
  PK_BONUS: Array(20).fill(3) as number[],

  // FA 처리 시간 (잡기/처리 분리)
  FA_PICK_TIME: 1000,            // 잡기/놓기 시간 (ms, 고정)
  FA_PROCESS_TIME_BASE: 800,     // 처리 기본 시간 (ms, 수량×레벨 연산)
  FA_LEVEL_EFFICIENCY: 1,        // 레벨당 처리속도 증가 배수

  // FA 건설 비용
  FA_BUILD_COST_BASE: 10,
  FA_BUILD_COST_EXPONENT: 2**2,

  // FA 등급 업그레이드 비용
  FA_GRADE_UPGRADE_BASE: 10,
  FA_GRADE_UPGRADE_EXPONENT: 2**2,

  // FA 레벨 업그레이드 비용
  FA_LEVEL_UPGRADE_BASE: 10,
  FA_LEVEL_UPGRADE_EXPONENT: 2,

  // PR 건설 비용
  PR_BUILD_COST_BASE: 10,
  PR_BUILD_COST_EXPONENT: 2,

  // 환생
  PRESTIGE_CONDITION: 1_000_000,        // 환생 조건 (누적수입)
  PRESTIGE_POINTS_DIVISOR: 1_000_000,  // 포인트 1당 누적수입
  PRODUCT_GRADE_MAX: 20,               // 최대 Product 등급

  // 아이템 등급별 기본 가격
  GRADE_BASE_VALUES: [
    1, 1, 1, 10, 20, 35, 55, 80, 100, 150,
    200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000,
  ] as number[],

  // 아이템 기본 가격 레벨업
  ITEM_VALUE_LEVEL_COST_BASE: 10,
  ITEM_VALUE_LEVEL_COST_EXPONENT: 2,
  ITEM_VALUE_PER_LEVEL: 1,

  // 재료 수량
  MATERIAL_QUANTITY_COST_BASE: 10,
  MATERIAL_QUANTITY_COST_EXPONENT: 2,

  // RS 버퍼
  RS_BUFFER_BASE: 20,
  RS_BUFFER_PER_LEVEL: 2,

  // FA 버퍼
  FA_BUFFER_BASE: 20,
  FA_BUFFER_PER_LEVEL: 10,

  // 버퍼 업그레이드 비용
  BUFFER_UPGRADE_COST_BASE: 10,
  BUFFER_UPGRADE_COST_EXPONENT: 2,

  // 동물
  ANIMAL_UNLOCK_COST: 1,
  ANIMAL_UPGRADE_COST_BASE: 10,
  ANIMAL_UPGRADE_COST_EXPONENT: 2,
  ANIMAL_STAT_BASE: 0.1,
  ANIMAL_STAT_PER_LEVEL: 0.05,
}

export type ConfigKey = keyof typeof CONFIG

export function applyWeekConfig(weekConfig: Partial<Record<string, unknown>>): void {
  for (const key of Object.keys(weekConfig)) {
    if (key in CONFIG) {
      (CONFIG as Record<string, unknown>)[key] = weekConfig[key]
    }
  }
}
