export interface Producer {
  row: number
  col: number
  built: boolean  // 건설 여부
  level: number   // 0 = 비활성, 1+ = 생산
}
