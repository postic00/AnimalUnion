export interface Clicker {
  clickCount: number  // 누적 클릭 수
  threshold: number   // 아이템 1개 생산에 필요한 클릭 수
  level: number       // 클릭커 업그레이드 레벨
}
