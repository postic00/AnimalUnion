import type { AnimalId } from './animal'

export interface Factory {
  row: number
  col: number
  built: boolean
  type: 'WA' | 'PA' | 'PK'
  grade: number                      // 0 = 미업그레이드, 1~20
  level: number                      // 0 = 미업그레이드, 1+ (처리 속도)
  dir: 'UP_TO_DOWN' | 'DOWN_TO_UP'  // 위→아래 or 아래→위
  animalId: AnimalId | null          // 배치된 동물
}
