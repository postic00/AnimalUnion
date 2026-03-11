export interface Producer {
  row: number
  col: number
  built: boolean  // 건설 여부
  level: number   // 0 = 비활성, 1+ = 생산
  grade: number   // 생산 재료 등급 (1=고추, 2=양파, 3=마늘)
}
