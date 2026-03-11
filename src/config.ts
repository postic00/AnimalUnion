export const CONFIG = {
  // 기술적 고정값
  MOVE_SPEED: 1200,              // 레일 한 칸 이동 시간 (ms)
  PICK_TIME: 800,                // FA 아이템 집는 시간 (ms)
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

  // FA 처리 시간
  FA_PICK_TIME: 800,             // 기본 처리 시간 (ms)
  FA_PICK_TIME_MULTIPLIER: 1,    // 레벨당 감소 배수

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

  // 아이템 기본 가격 레벨업
  ITEM_VALUE_LEVEL_COST_BASE: 1,         // 레벨업 비용 기준
  ITEM_VALUE_LEVEL_COST_EXPONENT: 2,     // 레벨업 비용 지수
  ITEM_VALUE_PER_LEVEL: 1,              // 레벨당 가치 증가량

  // 재료 수량
  MATERIAL_QUANTITY_COST_BASE: 10,     // 수량 레벨업 기본 비용 (골드)
  MATERIAL_QUANTITY_COST_EXPONENT: 3,  // 수량 레벨업 비용 지수

  // 동물
  ANIMAL_UNLOCK_COST: 1,               // 해금 비용 (포인트)
  ANIMAL_UPGRADE_COST_BASE: 1,         // 업그레이드 비용 기준
  ANIMAL_UPGRADE_COST_EXPONENT: 2,     // 업그레이드 비용 지수
  ANIMAL_STAT_BASE: 0.1,               // 레벨 1 stat (보너스 +10%)
  ANIMAL_STAT_PER_LEVEL: 0.05,         // 레벨당 stat 증가 (+5%)
} as const
