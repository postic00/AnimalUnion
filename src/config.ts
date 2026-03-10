export const CONFIG = {
  PRODUCE_INTERVAL: 250,   // PR 생산 주기 (ms) - 4배 생산
  MOVE_SPEED: 1200,        // 레일 한 칸 이동 시간 (ms) - 느리게
  PICK_TIME: 800,          // FA 아이템 집는 시간 (ms)
  ITEM_SIZE_RATIO: 0.7,    // 아이템 크기 (cellSize 대비)
} as const
