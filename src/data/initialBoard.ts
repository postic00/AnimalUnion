import type { Board } from '../types/board'

export const initialBoard: Board = [
  // 생산행 0 - PR 공급
  [
    { type: 'EM' }, { type: 'PR' }, { type: 'EM' },
    { type: 'PR' }, { type: 'EM' }, { type: 'PR' }, { type: 'EM' },
  ],
  // 생산행 1 - 메인 레일
  [
    { type: 'RS' }, { type: 'RRN' }, { type: 'RRN' },
    { type: 'RRN' }, { type: 'RRN' }, { type: 'RRN' }, { type: 'RDR' },
  ],
  // 묶음 1 - A (공장)
  [
    { type: 'EM' }, { type: 'FA' }, { type: 'EM' },
    { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'RDN' },
  ],
  // 묶음 1 - B (회수 레일)
  [
    { type: 'RE' }, { type: 'RLN' }, { type: 'RLN' },
    { type: 'RLN' }, { type: 'RLN' }, { type: 'RLN' }, { type: 'RLR' },
  ],
]
