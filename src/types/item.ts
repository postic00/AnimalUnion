export interface Item {
  id: string
  x: number       // 현재 위치
  y: number
  dx: number      // 이동 방향
  dy: number
  targetX: number // 다음 셀 중앙 (waypoint)
  targetY: number
  value: number   // RE 도달 시 획득 골드
}
