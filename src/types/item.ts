export interface Item {
  id: string
  x: number       // 현재 위치
  y: number
  dx: number      // 이동 방향
  dy: number
  targetX: number // 다음 셀 중앙 (waypoint)
  targetY: number
  value: number   // RE 도달 시 획득 골드 (기본값)
  waBonus: number    // 누적 WA 보너스
  paBonus: number    // 누적 PA 보너스
  pkBonus: number    // 누적 PK 보너스
  waGrades: number[] // 처리된 WA 등급 목록 (중복 방지)
  paGrades: number[] // 처리된 PA 등급 목록 (중복 방지)
  pkGrades: number[] // 처리된 PK 등급 목록 (중복 방지)
}
