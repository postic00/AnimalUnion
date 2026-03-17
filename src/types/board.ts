export type RailType = 'RS' | 'RE' | 'RLN' | 'RRN' | 'RUN' | 'RDN'
  | 'RDR'  // corner: 오른쪽→아래 (top+right 가드레일)
  | 'RLR'  // corner: 아래→왼쪽  (top+right 가드레일)
  | 'RDL'  // corner: 왼쪽→아래  (top+left  가드레일)
  | 'RRL'  // corner: 아래→오른쪽 (bottom+left 가드레일)
export type FactoryType = 'WA' | 'PA' | 'PK'
export type CellType = RailType | 'PR' | 'FA' | 'CR' | 'EM'

export interface Cell {
  type: CellType
  factoryType?: FactoryType
  factoryLevel?: number
}

export type Board = Cell[][]
