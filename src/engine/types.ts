import type { Item } from '../types/item'

export type Progresses = Record<string, number>

export type FAPhase = 'IDLE' | 'GRABBING' | 'PROCESSING' | 'PLACING' | 'WAITING'
export type FAPhases = Record<string, FAPhase>

export interface FALiveState {
  grabState: 'IDLE' | 'GRABBING' | 'WAITING'
  processState: 'IDLE' | 'PROCESSING' | 'WAITING'
  outputState: 'IDLE' | 'PLACING' | 'WAITING'
  inputBuffer: number
  inputCapacity: number
  inputItems: { grade: number; quantity: number }[]
  processingItems: { grade: number; quantity: number }[]
  procCapacity: number
  outputItem: Item | null
  outputCount: number
  outputCapacity: number
  processingItem: Item | null
  processProgress: number
}
export type FALiveStates = Record<string, FALiveState>

export interface FAState {
  grabState: 'IDLE' | 'GRABBING' | 'WAITING'
  grabTimer: number
  grabbed: Item | null

  processState: 'IDLE' | 'PROCESSING' | 'WAITING'
  processTimer: number
  inputBuffer: Item[]          // WA/PK: was pendingQueue
  processBuffer: Item | null   // WA/PK: was processing / PA: was snappedOutputItem

  outputState: 'IDLE' | 'PLACING' | 'WAITING'
  outputTimer: number
  outputBuffer: Item[]

  buffer: { grade: number; count: number; waBonus: number }[]           // PA: 수집 저장소
  processingBuffer: { grade: number; count: number; waBonus: number }[]  // PA: 처리 저장소
}

export const DEFAULT_FA_STATE: FAState = {
  grabState: 'IDLE', grabTimer: 0, grabbed: null,
  processState: 'IDLE', processTimer: 0, inputBuffer: [], processBuffer: null,
  outputState: 'IDLE', outputTimer: 0, outputBuffer: [],
  buffer: [], processingBuffer: [],
}

export interface PRState {
  outputBuffer: Item[]
}

export interface GameEngineSnapshot {
  progresses: Progresses
  faPhases: FAPhases
  bufferCounts: Record<string, { count: number; capacity: number }>
  faLiveStates: FALiveStates
  producerProgresses: Record<string, number>
  hasDerailed: boolean
}
