export type RailType = 'RS' | 'RE' | 'RL' | 'RR' | 'RU' | 'RD'
export type FactoryType = 'WA' | 'PA' | 'PK'
export type CellType = RailType | 'PR' | 'FA' | 'CR' | 'EM'

export interface Cell {
  type: CellType
  factoryType?: FactoryType
  factoryLevel?: number
}

export type Board = Cell[][]
