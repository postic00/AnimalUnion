export const CONFIG = {
  // 기술적 고정값
  MOVE_SPEED: 1200,              // 레일 한 칸 이동 시간 (ms)
  ITEM_SIZE_RATIO: 0.7,          // 아이템 크기 (cellSize 대비)

  // 밸런스 상수
  ITEM_BASE_VALUE: 1,            // 아이템 기본 가격
  PRODUCE_INTERVAL: 10000,       // PR 생산 주기 기본값 (ms)
  PRODUCE_INTERVAL_MULTIPLIER: 1, // 생산 주기 감소 배수

  BUNDLE_COST_BASE: 1,           // 라인 추가 기본 비용
  BUNDLE_COST_EXPONENT: 2**2,    // 라인 추가 비용 지수

  PRODUCER_UPGRADE_BASE: 1,      // PR 업그레이드 기본 비용
  PRODUCER_UPGRADE_EXPONENT: 2**2, // PR 업그레이드 비용 지수

  CLICKER_THRESHOLD: 2,          // 클릭커 아이템 1개 생산에 필요한 클릭 수

  // FA 등급별 보너스 배열 (인덱스 0 = 1등급)
  WA_BONUS: Array(20).fill(0.2) as number[],  // WA 등급당 +20%
  PA_BONUS: Array(20).fill(0.3) as number[],  // PA 등급당 +30%
  PK_BONUS: Array(20).fill(0.5) as number[],  // PK 등급당 +50%

  // FA 처리 시간 (잡기/처리 분리)
  FA_PICK_TIME: 200,             // 잡기/놓기 시간 (ms, 고정)
  FA_PROCESS_TIME_BASE: 800,     // 처리 기본 시간 (ms, 수량×레벨 연산)
  FA_LEVEL_EFFICIENCY: 1,        // 레벨당 처리속도 증가 배수

  // FA 건설 비용
  FA_BUILD_COST_BASE: 1,
  FA_BUILD_COST_EXPONENT: 2**2,

  // FA 등급 업그레이드 비용
  FA_GRADE_UPGRADE_BASE: 1,
  FA_GRADE_UPGRADE_EXPONENT: 2**2,

  // FA 레벨 업그레이드 비용
  FA_LEVEL_UPGRADE_BASE: 1,
  FA_LEVEL_UPGRADE_EXPONENT: 2**2,

  // PR 건설 비용
  PR_BUILD_COST_BASE: 1,
  PR_BUILD_COST_EXPONENT: 2**2,

  // 환생
  PRESTIGE_CONDITION: 100_000_000,        // 환생 조건 (누적수입)
  PRESTIGE_POINTS_DIVISOR: 100_000_000,  // 포인트 1당 누적수입
  PRODUCT_GRADE_MAX: 20,                 // 최대 Product 등급

  // 아이템 등급별 기본 가격
  GRADE_BASE_VALUES: [
    1, 3, 6, 10, 20, 35, 55, 80, 120, 180,
    250, 350, 500, 700, 1000, 1400, 2000, 3000, 5000, 10000,
  ] as number[],

  // 아이템 기본 가격 레벨업
  ITEM_VALUE_LEVEL_COST_BASE: 1,
  ITEM_VALUE_LEVEL_COST_EXPONENT: 2,
  ITEM_VALUE_PER_LEVEL: 1,

  // 재료 수량
  MATERIAL_QUANTITY_COST_BASE: 10,
  MATERIAL_QUANTITY_COST_EXPONENT: 3,

  // RS 버퍼
  RS_BUFFER_BASE: 3,
  RS_BUFFER_PER_LEVEL: 2,

  // FA 버퍼
  FA_BUFFER_BASE: 20,
  FA_BUFFER_PER_LEVEL: 10,

  // 버퍼 업그레이드 비용
  BUFFER_UPGRADE_COST_BASE: 1,
  BUFFER_UPGRADE_COST_EXPONENT: 2,

  // 동물
  ANIMAL_UNLOCK_COST: 1,
  ANIMAL_UPGRADE_COST_BASE: 1,
  ANIMAL_UPGRADE_COST_EXPONENT: 2,
  ANIMAL_STAT_BASE: 0.1,
  ANIMAL_STAT_PER_LEVEL: 0.05,
} as const
