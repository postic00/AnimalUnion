import { CONFIG } from '../config'
import type { Board } from '../types/board'
import type { Item } from '../types/item'
import type { Producer } from '../types/producer'
import type { Factory } from '../types/factory'
import type { Animal } from '../types/animal'
import {
  getProducerValue,
  getProducerInterval,
  getFinalGold,
  getFactoryPickTime,
  getFactoryProcessTime,
  getMaterialQuantity,
  applyWaBonus,
  applyPkBonus,
  createRecipeOutput,
  getRsBufferCapacity,
  getFaBufferCapacity,
  getRailMoveSpeed,
  RECIPES,
} from '../balance'
import {
  getCellCenter,
  getCellDirection,
  getCell,
  isBlocked,
  buildSpatialHash,
  dist,
} from '../utils/boardUtils'
import type {
  FAState,
  PRState,
  FALiveStates,
  GameEngineSnapshot,
} from './types'
import { DEFAULT_FA_STATE } from './types'

// ── 상수 ────────────────────────────────────────────────────────────────────
const MAX_DELTA_MS = 50
const SNAP_RADIUS = 0.3
const RS_OCCUPY_RADIUS = 1.0

// ── 설정 인터페이스 ──────────────────────────────────────────────────────────
export interface GameEngineConfig {
  board: Board
  cellSize: number
  producers: Producer[]
  factories: Factory[]
  animals: Animal[]
  materialQuantityLevels: number[]
  itemValueLevels: number[]
  faBufferLevel: number
  rsBufferLevel: number
  railSpeedLevel: number
  speedMultiplier: number
  onGoldEarned: (amount: number, x: number, y: number) => void
  onFactoryProcess?: (animalId: string | null) => void
}

// ── 복원 데이터 인터페이스 ────────────────────────────────────────────────────
export interface GameEngineRestoreData {
  items: Item[]
  faStates: Record<string, FAState>
  rsQueues: Record<string, Item[]>
  produceTimers: Record<string, number>
  prStates: Record<string, PRState>
}

// ── GameEngine ───────────────────────────────────────────────────────────────
export class GameEngine {
  // 내부 게임 상태
  items: Item[] = []
  faStates: Record<string, FAState> = {}
  rsQueues: Record<string, Item[]> = {}
  produceTimers: Record<string, number> = {}
  prStates: Record<string, PRState> = {}
  hasDerailed = false
  lastGoldTime = Date.now()

  private prRoundRobin: Record<string, number> = {}
  private spatialHash: Map<string, Item[]> = new Map()
  private pendingClickerSpawns = 0
  private pendingClickerGrade = 1
  private lastTime = 0

  // 설정 (React에서 업데이트)
  private config: GameEngineConfig
  private producersByPos: Map<string, Producer> = new Map()
  private rsToPrs: Map<string, { row: number; col: number }[]> = new Map()
  private itemSize: number
  private pickTime: number

  constructor(config: GameEngineConfig) {
    this.config = { ...config }
    this.itemSize = config.cellSize * CONFIG.CM_GAP_RATIO
    this.pickTime = getFactoryPickTime()
    this.rebuildProducersByPos()
    this.rebuildRsToPrs()
  }

  // ── 설정 업데이트 ────────────────────────────────────────────────────────
  updateConfig(partial: Partial<GameEngineConfig>): void {
    Object.assign(this.config, partial)
    if (partial.cellSize !== undefined) {
      this.itemSize = this.config.cellSize * CONFIG.CM_GAP_RATIO
    }
    if (partial.producers !== undefined) {
      this.rebuildProducersByPos()
    }
    if (partial.board !== undefined || partial.cellSize !== undefined) {
      this.rebuildRsToPrs()
    }
  }

  // ── 상태 복원 ─────────────────────────────────────────────────────────────
  restore(data: Partial<GameEngineRestoreData>): void {
    if (data.items) this.items = data.items
    if (data.faStates) this.faStates = data.faStates
    if (data.rsQueues) this.rsQueues = data.rsQueues
    if (data.produceTimers) this.produceTimers = data.produceTimers
    if (data.prStates) this.prStates = data.prStates
    this.lastTime = 0
    this.lastGoldTime = Date.now()
  }

  // ── 상태 내보내기 (저장용) ───────────────────────────────────────────────
  exportState(): GameEngineRestoreData {
    return {
      items: this.items,
      faStates: this.faStates,
      rsQueues: this.rsQueues,
      produceTimers: this.produceTimers,
      prStates: this.prStates,
    }
  }

  getRenderItems(): Item[] {
    return [...this.items]
  }

  // ── clicker ──────────────────────────────────────────────────────────────
  spawnClickerItem(grade: number): void {
    this.pendingClickerGrade = grade
    this.pendingClickerSpawns++
  }

  clearItems(): void {
    this.items = []
    this.hasDerailed = false
    this.lastGoldTime = Date.now()
  }

  dismissDerail(): void {
    this.hasDerailed = false
    this.lastGoldTime = Date.now()
  }

  resetLastTime(): void {
    this.lastTime = 0
    this.lastGoldTime = Date.now()
  }

  // ── 단일 틱 ──────────────────────────────────────────────────────────────
  tick(): void {
    const now = performance.now()
    if (this.lastTime === 0) this.lastTime = now
    const delta = Math.min(now - this.lastTime, MAX_DELTA_MS) * (this.config.speedMultiplier ?? 1)
    this.lastTime = now

    this.tickProducers(delta)
    this.tickRsDispatch()
    this.tickRsRelease()
    this.tickItemMove(delta)
    this.tickDerailCheck()
    this.tickFactories(delta)
    this.tickClicker()
    this.tickGoldCollect()
  }

  // ── 스냅샷 계산 (runProgress에 해당) ────────────────────────────────────
  computeSnapshot(checkDerailJam = false): GameEngineSnapshot {
    const p: Record<string, number> = {}
    const fp: Record<string, string> = {}
    const { board, materialQuantityLevels, faBufferLevel, rsBufferLevel } = this.config

    board.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell.type !== 'PR') return
        const key = `${rowIdx}-${colIdx}`
        const producer = this.producersByPos.get(key)
        if (!producer?.built || producer.level === 0) return
        const timer = this.produceTimers[key] ?? 0
        const qty = getMaterialQuantity(materialQuantityLevels[producer.grade - 1] ?? 1)
        p[key] = Math.min(timer / (getProducerInterval(producer.level) * qty), 1)
      })
    })

    this.config.factories.forEach(factory => {
      if (!factory.built) return
      const key = `fa-${factory.row}-${factory.col}`
      const fas = this.faStates[key]
      if (!fas) return
      const cellKey = `${factory.row}-${factory.col}`
      fp[cellKey] = fas.outputState !== 'IDLE' ? fas.outputState
                  : fas.processState !== 'IDLE' ? fas.processState
                  : fas.grabState
      if (fas.processState === 'PROCESSING') {
        const qty = getMaterialQuantity(materialQuantityLevels[factory.grade - 1] ?? 1)
        const processTime = getFactoryProcessTime(factory.level, qty)
        p[cellKey] = Math.min(fas.processTimer / processTime, 1)
      } else if (fas.outputState !== 'IDLE' || fas.processState === 'WAITING') {
        p[cellKey] = 1
      }
    })

    const bc: Record<string, { count: number; capacity: number }> = {}
    const rsCapacity = getRsBufferCapacity(rsBufferLevel)
    board.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell.type !== 'RS') return
        const rsKey = `rs-${rowIdx}-${colIdx}`
        const count = this.rsQueues[rsKey]?.length ?? 0
        bc[`${rowIdx}-${colIdx}`] = { count, capacity: rsCapacity }
      })
    })
    board.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell.type !== 'PR') return
        const key = `${rowIdx}-${colIdx}`
        const producer = this.producersByPos.get(key)
        if (!producer?.built) return
        const count = this.prStates[key]?.outputBuffer.length ?? 0
        bc[key] = { count, capacity: rsCapacity }
      })
    })
    const faCapacity = getFaBufferCapacity(faBufferLevel)
    this.config.factories.forEach(factory => {
      if (!factory.built) return
      const fas = this.faStates[`fa-${factory.row}-${factory.col}`]
      if (!fas) return
      const cellKey = `${factory.row}-${factory.col}`
      if (factory.type === 'PA') {
        const count = fas.buffer.reduce((s, b) => s + b.count, 0)
        bc[cellKey] = { count, capacity: faCapacity }
      } else {
        const count = (fas.inputBuffer ?? []).reduce((s, it) => s + it.quantity, 0)
        bc[cellKey] = { count, capacity: faCapacity }
      }
    })

    // jam 감지
    if (checkDerailJam) {
      const { producers } = this.config
      const activePrs = producers.filter(p => p.built && p.level > 0)
      if (activePrs.length > 0 && this.items.length > 0) {
        const maxPrInterval = activePrs.reduce((max, p2) => {
          const qty = getMaterialQuantity(materialQuantityLevels[p2.grade - 1] ?? 1)
          return Math.max(max, getProducerInterval(p2.level) * qty)
        }, 0)
        const threshold = Math.max(60000, maxPrInterval * 2)
        if (Date.now() - this.lastGoldTime > threshold) {
          this.hasDerailed = true
        }
      }
    }

    // FA 라이브 상태
    const live: FALiveStates = {}
    this.config.factories.forEach(factory => {
      if (!factory.built) return
      const fas = this.faStates[`fa-${factory.row}-${factory.col}`]
      if (!fas) return
      const cellKey = `${factory.row}-${factory.col}`
      const capacity = getFaBufferCapacity(faBufferLevel)
      const inputBuffer = factory.type === 'PA'
        ? fas.buffer.reduce((s, b) => s + b.count, 0)
        : (fas.inputBuffer ?? []).reduce((s, it) => s + it.quantity, 0)
      const inputItems: { grade: number; quantity: number }[] = factory.type === 'PA'
        ? fas.buffer.map(b => ({ grade: b.grade, quantity: b.count }))
        : Object.values(
            (fas.inputBuffer ?? []).reduce<Record<number, { grade: number; quantity: number }>>((acc, it) => {
              if (acc[it.grade]) acc[it.grade].quantity += it.quantity
              else acc[it.grade] = { grade: it.grade, quantity: it.quantity }
              return acc
            }, {})
          )
      const qty = getMaterialQuantity(materialQuantityLevels[factory.grade - 1] ?? 1)
      const processTime = getFactoryProcessTime(factory.level, qty)
      const previewOutput = factory.type === 'PA'
        ? createRecipeOutput(
            factory.grade, factory, this.config.animals,
            this.config.itemValueLevels[factory.grade - 1] ?? 1,
            materialQuantityLevels[factory.grade - 1] ?? 1,
          )
        : null
      const procItems: { grade: number; quantity: number }[] = factory.type === 'PA'
        ? (fas.processingBuffer ?? []).map(b => ({ grade: b.grade, quantity: b.count }))
        : fas.processBuffer ? [{ grade: fas.processBuffer.grade, quantity: fas.processBuffer.quantity }] : []
      const recipe3 = factory.type === 'PA' ? RECIPES[factory.grade] : null
      const procCap = recipe3 ? recipe3.reduce((s, r) => s + r.count * qty, 0) : 0
      live[cellKey] = {
        grabState: fas.grabState,
        processState: fas.processState,
        outputState: fas.outputState,
        inputBuffer,
        inputCapacity: capacity,
        inputItems,
        processingItems: procItems,
        procCapacity: procCap,
        outputItem: fas.outputBuffer[0] ?? fas.processBuffer ?? previewOutput,
        outputCount: fas.outputBuffer.length,
        outputCapacity: capacity,
        processingItem: factory.type !== 'PA' ? (fas.processBuffer ?? null) : null,
        processProgress: fas.processState === 'PROCESSING' ? Math.min(fas.processTimer / processTime, 1) : 0,
      }
    })

    return {
      progresses: p,
      faPhases: fp,
      bufferCounts: bc,
      faLiveStates: live,
      producerProgresses: p,
      hasDerailed: this.hasDerailed,
    }
  }

  // ── 사전 계산 ─────────────────────────────────────────────────────────────
  private rebuildProducersByPos(): void {
    this.producersByPos.clear()
    for (const p of this.config.producers) {
      this.producersByPos.set(`${p.row}-${p.col}`, p)
    }
  }

  private rebuildRsToPrs(): void {
    this.rsToPrs.clear()
    const { board } = this.config
    board.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell.type !== 'PR') return
        let rsRow = -1, rsCol = -1
        for (let r = rowIdx + 1; r < board.length; r++) {
          for (let c = 0; c < board[r].length; c++) {
            if (board[r][c].type === 'RS') { rsRow = r; rsCol = c; break }
          }
          if (rsRow !== -1) break
        }
        if (rsRow === -1) return
        const rsKey = `rs-${rsRow}-${rsCol}`
        if (!this.rsToPrs.has(rsKey)) this.rsToPrs.set(rsKey, [])
        this.rsToPrs.get(rsKey)!.push({ row: rowIdx, col: colIdx })
      })
    })
  }

  // ── 헬퍼 ─────────────────────────────────────────────────────────────────
  private getNextTarget(currentX: number, currentY: number): { targetX: number; targetY: number; dx: number; dy: number } | null {
    const { board, cellSize } = this.config
    const col = Math.round(currentX / cellSize - 0.5)
    const row = Math.round(currentY / cellSize - 0.5)
    const cell = getCell(board, row, col)
    if (!cell) return null
    const dir = getCellDirection(cell.type)
    if (dir.dx === 0 && dir.dy === 0) return null
    const nextCol = col + dir.dx
    const nextRow = row + dir.dy
    const nextCell = getCell(board, nextRow, nextCol)
    if (!nextCell) return null
    const center = getCellCenter(nextRow, nextCol, cellSize)
    return { targetX: center.x, targetY: center.y, dx: dir.dx, dy: dir.dy }
  }

  private placeOnBelt(item: Item, outputCenter: { x: number; y: number }): Item {
    const next = this.getNextTarget(outputCenter.x, outputCenter.y)
    return next
      ? { ...item, x: outputCenter.x, y: outputCenter.y, dx: next.dx, dy: next.dy, targetX: next.targetX, targetY: next.targetY }
      : { ...item, x: outputCenter.x, y: outputCenter.y }
  }

  // ── tick 서브함수 ─────────────────────────────────────────────────────────
  private tickProducers(delta: number): void {
    const { board, materialQuantityLevels, itemValueLevels } = this.config
    const rsCapacity = getRsBufferCapacity(this.config.rsBufferLevel)
    board.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell.type !== 'PR') return
        const key = `${rowIdx}-${colIdx}`
        if (this.produceTimers[key] === undefined) this.produceTimers[key] = 0
        this.produceTimers[key] += delta

        const producer = this.producersByPos.get(key)
        if (!producer || !producer.built || producer.level === 0) {
          this.produceTimers[key] = 0
          return
        }

        const grade = producer.grade
        const quantity = getMaterialQuantity(materialQuantityLevels[grade - 1] ?? 1)
        const fullInterval = getProducerInterval(producer.level) * quantity
        if (this.produceTimers[key] < fullInterval) return

        if (!this.prStates[key]) this.prStates[key] = { outputBuffer: [] }
        const prBuf = this.prStates[key].outputBuffer
        if (prBuf.length >= rsCapacity) return

        this.produceTimers[key] = 0
        prBuf.push({
          id: crypto.randomUUID(),
          x: 0, y: 0, dx: 0, dy: 0, targetX: 0, targetY: 0,
          grade,
          value: getProducerValue(grade, itemValueLevels[grade - 1] ?? 1),
          quantity,
          waBonus: 0, paBonus: 0, pkBonus: 0,
          waGrades: [], paGrades: [], pkGrades: [],
        })
      })
    })
  }

  private tickRsDispatch(): void {
    const { board, cellSize } = this.config
    const capacity = getRsBufferCapacity(this.config.rsBufferLevel)
    board.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell.type !== 'RS') return
        const rsKey = `rs-${rowIdx}-${colIdx}`
        if (!this.rsQueues[rsKey]) this.rsQueues[rsKey] = []
        if (this.rsQueues[rsKey].length >= capacity) return

        const prs = this.rsToPrs.get(rsKey)
        if (!prs || prs.length === 0) return

        const rrIdx = this.prRoundRobin[rsKey] ?? 0
        for (let attempt = 0; attempt < prs.length; attempt++) {
          const prIdx = (rrIdx + attempt) % prs.length
          const pr = prs[prIdx]
          const prKey = `${pr.row}-${pr.col}`
          const prState = this.prStates[prKey]
          if (prState?.outputBuffer.length > 0) {
            const center = getCellCenter(rowIdx, colIdx, cellSize)
            const dir = getCellDirection('RS')
            const next = this.getNextTarget(center.x, center.y)
            if (!next) continue
            const proto = prState.outputBuffer.shift()!
            this.rsQueues[rsKey].push({
              ...proto,
              x: center.x, y: center.y,
              dx: dir.dx, dy: dir.dy,
              targetX: next.targetX, targetY: next.targetY,
            })
            this.prRoundRobin[rsKey] = (prIdx + 1) % prs.length
            window.dispatchEvent(new CustomEvent('rs-queue-change'))
            break
          }
        }
      })
    })
  }

  private tickRsRelease(): void {
    const { board, cellSize } = this.config
    board.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell.type !== 'RS') return
        const rsKey = `rs-${rowIdx}-${colIdx}`
        const queue = this.rsQueues[rsKey]
        if (!queue || queue.length === 0) return
        const center = getCellCenter(rowIdx, colIdx, cellSize)
        if (this.items.some(it => dist(it.x, it.y, center.x, center.y) < this.itemSize * RS_OCCUPY_RADIUS)) return
        this.items.push(queue.shift()!)
        window.dispatchEvent(new CustomEvent('rs-queue-change'))
      })
    })
  }

  private tickItemMove(delta: number): void {
    const { board, cellSize } = this.config
    this.spatialHash = buildSpatialHash(this.items, this.itemSize, this.spatialHash)
    const step = (cellSize / getRailMoveSpeed(this.config.railSpeedLevel)) * delta
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i]
      if (isBlocked(item, this.spatialHash, this.itemSize)) continue
      const dx = item.targetX - item.x
      const dy = item.targetY - item.y
      const distToTarget = Math.sqrt(dx * dx + dy * dy)
      if (step >= distToTarget) {
        item.x = item.targetX
        item.y = item.targetY
        const next = this.getNextTarget(item.targetX, item.targetY)
        if (next) {
          item.dx = next.dx; item.dy = next.dy
          item.targetX = next.targetX; item.targetY = next.targetY
        } else {
          const fcol = Math.round(item.targetX / cellSize - 0.5)
          const frow = Math.round(item.targetY / cellSize - 0.5)
          const fcell = getCell(board, frow, fcol)
          if (fcell?.type !== 'RE' && fcell?.type !== 'FA') {
            this.items.splice(i, 1)
            this.hasDerailed = true
          }
        }
      } else {
        const ratio = step / distToTarget
        item.x += dx * ratio
        item.y += dy * ratio
      }
    }
  }

  private tickDerailCheck(): void {
    const { board, cellSize } = this.config
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i]
      if (!isFinite(item.x) || !isFinite(item.y)) { this.items.splice(i, 1); this.hasDerailed = true; continue }
      const col = Math.round(item.x / cellSize - 0.5)
      const row = Math.round(item.y / cellSize - 0.5)
      const cell = getCell(board, row, col)
      if (!cell) { this.items.splice(i, 1); this.hasDerailed = true; continue }
      const type = cell.type
      if (!(type === 'RLN' || type === 'RRN' || type === 'RUN' || type === 'RDN'
        || type === 'RS' || type === 'RE' || type === 'FA'
        || type === 'RDR' || type === 'RLR' || type === 'RDL' || type === 'RRL')) {
        this.items.splice(i, 1)
        this.hasDerailed = true
      }
    }
  }

  private tickWaPkFactory(
    factory: Factory, delta: number, key: string,
    inputCenter: { x: number; y: number }, _outputCenter: { x: number; y: number },
    isOutputOccupied: () => boolean, placeOutput: () => void,
  ): void {
    const bufferCapacity = getFaBufferCapacity(this.config.faBufferLevel)
    const { cellSize, animals, materialQuantityLevels } = this.config
    const isTargetItem = (it: Item): boolean => {
      if (it.grade !== factory.grade) return false
      if (factory.type === 'WA') {
        if (it.waGrades.includes(factory.grade)) return false
        if (it.pkGrades.length > 0) return false
      } else {
        if (it.pkGrades.includes(factory.grade)) return false
      }
      return dist(it.x, it.y, inputCenter.x, inputCenter.y) <= cellSize * SNAP_RADIUS
    }
    const applyBonus = (item: Item) => factory.type === 'WA'
      ? applyWaBonus(item, factory, animals)
      : applyPkBonus(item, factory, animals)

    // GRAB
    {
      const fas = this.faStates[key]
      const inputQty = (fas.inputBuffer ?? []).reduce((s, it) => s + it.quantity, 0)
      if (fas.grabState === 'IDLE') {
        if (inputQty < bufferCapacity) {
          const idx = this.items.findIndex(isTargetItem)
          if (idx !== -1) {
            const grabbed = this.items[idx]
            this.items[idx] = this.items[this.items.length - 1]; this.items.pop()
            this.faStates[key] = { ...fas, grabState: 'GRABBING', grabTimer: 0, grabbed }
          }
        } else {
          this.faStates[key] = { ...fas, grabState: 'WAITING' }
        }
      } else if (fas.grabState === 'WAITING') {
        if (inputQty < bufferCapacity) this.faStates[key] = { ...fas, grabState: 'IDLE' }
      } else if (fas.grabState === 'GRABBING') {
        const newTimer = fas.grabTimer + delta
        if (newTimer >= this.pickTime) {
          const pending = applyBonus(fas.grabbed!)
          this.faStates[key] = { ...fas, grabState: 'IDLE', grabTimer: 0, grabbed: null, inputBuffer: [...(fas.inputBuffer ?? []), pending] }
        } else {
          this.faStates[key] = { ...fas, grabTimer: newTimer }
        }
      }
    }

    // PROCESS
    {
      const fas = this.faStates[key]
      const queue = fas.inputBuffer ?? []
      if (fas.processState === 'IDLE') {
        if (queue.length > 0) {
          const [next, ...rest] = queue
          this.faStates[key] = { ...fas, processState: 'PROCESSING', processTimer: 0, processBuffer: next, inputBuffer: rest }
        }
      } else if (fas.processState === 'PROCESSING') {
        const outputQty = getMaterialQuantity(materialQuantityLevels[factory.grade - 1] ?? 1)
        const processTime = getFactoryProcessTime(factory.level, outputQty)
        const newTimer = fas.processTimer + delta
        if (newTimer >= processTime) {
          this.config.onFactoryProcess?.(factory.animalId ?? null)
          const safeOutBuf = Array.isArray(fas.outputBuffer) ? fas.outputBuffer : []
          if (safeOutBuf.length < bufferCapacity) {
            const newOutputBuffer = [...safeOutBuf, fas.processBuffer!]
            const newOutputState = fas.outputState === 'IDLE' ? 'PLACING' : fas.outputState
            this.faStates[key] = { ...fas, processState: 'IDLE', processTimer: 0, outputState: newOutputState, outputTimer: fas.outputState === 'IDLE' ? 0 : fas.outputTimer, outputBuffer: newOutputBuffer, processBuffer: null }
          } else {
            this.faStates[key] = { ...fas, processState: 'WAITING', processTimer: 0 }
          }
        } else {
          this.faStates[key] = { ...fas, processTimer: newTimer }
        }
      }
    }

    // OUTPUT
    {
      const fas = this.faStates[key]
      if (fas.outputState === 'PLACING') {
        const newTimer = fas.outputTimer + delta
        if (newTimer >= this.pickTime) {
          if (!isOutputOccupied()) placeOutput()
          else this.faStates[key] = { ...fas, outputState: 'WAITING', outputTimer: 0 }
        } else {
          this.faStates[key] = { ...fas, outputTimer: newTimer }
        }
      } else if (fas.outputState === 'WAITING') {
        if (!isOutputOccupied()) placeOutput()
      }
    }
  }

  /**
   * PA (조합 공장) 틱 처리
   *
   * PA는 레시피에 정의된 여러 등급의 재료를 수집해 고등급 아이템 하나를 합성한다.
   * 상태 머신은 GRAB → PROCESS → OUTPUT 3채널이 독립적으로 동작한다.
   *
   * [buffer]          : GRAB 채널이 벨트에서 수집한 재료 저장소 (등급별 count)
   * [processingBuffer]: PROCESS 채널로 이관된 재료 (레시피 충족 판정용)
   * [processBuffer]   : 조합 완료된 출력 아이템 (PROCESSING 중 또는 WAITING)
   * [outputBuffer]    : 벨트에 내보낼 아이템 대기열
   *
   * waBonus는 weighted average로 누적되어 최종 아이템까지 전달된다.
   */
  private tickPaFactory(
    factory: Factory, delta: number, key: string,
    inputCenter: { x: number; y: number }, outputCenter: { x: number; y: number },
    isOutputOccupied: () => boolean, placeOutput: () => void,
  ): void {
    const recipe = RECIPES[factory.grade]
    if (!recipe) return
    const { cellSize, materialQuantityLevels, itemValueLevels, animals } = this.config
    const outputQuantity = getMaterialQuantity(materialQuantityLevels[factory.grade - 1] ?? 1)
    const bufferCapacity = getFaBufferCapacity(this.config.faBufferLevel)

    // 레시피 재료 중 아직 buffer가 꽉 차지 않은 첫 번째 등급 반환
    const getNeededGrade = (buf: { grade: number; count: number }[]): number | null => {
      for (const req of recipe) {
        if ((buf.find(b => b.grade === req.grade)?.count ?? 0) < bufferCapacity) return req.grade
      }
      return null
    }

    // GRAB: 벨트에서 재료 흡수 → buffer에 적재
    // 레시피에 없는 등급이 buffer에 있으면 먼저 배출(eject)한다
    {
      const fas = this.faStates[key]
      if (fas.grabState === 'IDLE') {
        const recipeGrades = new Set(recipe.map(r => r.grade))
        // 레시피에 없는 재료가 있으면 벨트로 배출
        const ejectEntry = fas.buffer.find(b => !recipeGrades.has(b.grade))
          ?? (fas.processingBuffer ?? []).find(b => !recipeGrades.has(b.grade))
        if (ejectEntry && !isOutputOccupied()) {
          this.items.push(this.placeOnBelt({
            id: crypto.randomUUID(), grade: ejectEntry.grade, quantity: ejectEntry.count, value: 0,
            x: outputCenter.x, y: outputCenter.y,
            waBonus: ejectEntry.waBonus ?? 0, paBonus: 0, pkBonus: 0,
            waGrades: [], paGrades: [], pkGrades: [],
            dx: 0, dy: 0, targetX: outputCenter.x, targetY: outputCenter.y,
          }, outputCenter))
          const fromBuffer = fas.buffer.some(b => b.grade === ejectEntry.grade)
          this.faStates[key] = fromBuffer
            ? { ...fas, buffer: fas.buffer.filter(b => b.grade !== ejectEntry.grade) }
            : { ...fas, processingBuffer: (fas.processingBuffer ?? []).filter(b => b.grade !== ejectEntry.grade) }
        } else {
          // 부족한 등급의 재료를 벨트에서 집어 올림
          const neededGrade = getNeededGrade(fas.buffer)
          if (neededGrade !== null) {
            const idx = this.items.findIndex(it =>
              it.grade === neededGrade && it.pkGrades.length === 0 &&
              dist(it.x, it.y, inputCenter.x, inputCenter.y) <= cellSize * SNAP_RADIUS
            )
            if (idx !== -1) {
              const grabbed = this.items[idx]
              this.items[idx] = this.items[this.items.length - 1]; this.items.pop()
              this.faStates[key] = { ...fas, grabState: 'GRABBING', grabTimer: 0, grabbed }
            }
          } else {
            // 모든 재료 버퍼가 꽉 참 → 대기
            this.faStates[key] = { ...fas, grabState: 'WAITING' }
          }
        }
      } else if (fas.grabState === 'WAITING') {
        if (getNeededGrade(fas.buffer) !== null) this.faStates[key] = { ...this.faStates[key], grabState: 'IDLE' }
      } else if (fas.grabState === 'GRABBING') {
        // pickTime 경과 후 grabbed 아이템을 buffer에 합산 (waBonus 가중평균)
        const newTimer = this.faStates[key].grabTimer + delta
        if (newTimer >= this.pickTime) {
          const fas2 = this.faStates[key]
          const { grade, quantity: qty, waBonus: grabbedWaBonus } = fas2.grabbed!
          const existingEntry = fas2.buffer.find(b => b.grade === grade)
          const newBuffer = existingEntry
            ? fas2.buffer.map(b => b.grade === grade
                ? { ...b, count: b.count + qty, waBonus: (b.waBonus * b.count + grabbedWaBonus * qty) / (b.count + qty) }
                : b)
            : [...fas2.buffer, { grade, count: qty, waBonus: grabbedWaBonus }]
          this.faStates[key] = { ...fas2, grabState: 'IDLE', grabTimer: 0, grabbed: null, buffer: newBuffer }
        } else {
          this.faStates[key] = { ...this.faStates[key], grabTimer: newTimer }
        }
      }
    }

    // PROCESS: buffer → processingBuffer 이관 후 레시피 충족 시 조합 시작
    // 레시피의 각 재료 필요량(req.count × outputQuantity)을 processingBuffer에 채운다
    {
      const fas = this.faStates[key]
      if (fas.processState === 'IDLE') {
        let newBuffer = [...fas.buffer]
        const newProcBuf = [...(fas.processingBuffer ?? [])]
        let transferred = false
        for (const req of recipe) {
          const need = req.count * outputQuantity
          const have = newProcBuf.find(b => b.grade === req.grade)?.count ?? 0
          const remaining = need - have
          if (remaining <= 0) continue
          const bufEntry = newBuffer.find(b => b.grade === req.grade)
          const inBuffer = bufEntry?.count ?? 0
          if (inBuffer <= 0) continue
          // 필요량만큼 buffer에서 processingBuffer로 이동 (waBonus 가중평균)
          const movedWaBonus = bufEntry?.waBonus ?? 0
          const move = Math.min(inBuffer, remaining)
          newBuffer = newBuffer.map(b => b.grade === req.grade ? { ...b, count: b.count - move } : b).filter(b => b.count > 0)
          const existing = newProcBuf.find(b => b.grade === req.grade)
          if (existing) {
            const totalCount = existing.count + move
            existing.waBonus = (existing.waBonus * existing.count + movedWaBonus * move) / totalCount
            existing.count = totalCount
          } else {
            newProcBuf.push({ grade: req.grade, count: move, waBonus: movedWaBonus })
          }
          transferred = true
        }
        // 모든 레시피 재료가 processingBuffer에 충족되면 조합 시작
        const isReady = recipe.every(req =>
          (newProcBuf.find(b => b.grade === req.grade)?.count ?? 0) >= req.count * outputQuantity
        )
        if (isReady) {
          const totalProcCount = newProcBuf.reduce((s, b) => s + b.count, 0)
          const avgWaBonus = totalProcCount > 0
            ? newProcBuf.reduce((s, b) => s + b.waBonus * b.count, 0) / totalProcCount : 0
          const base = createRecipeOutput(
            factory.grade, factory, animals,
            itemValueLevels[factory.grade - 1] ?? 1,
            materialQuantityLevels[factory.grade - 1] ?? 1,
          )
          this.faStates[key] = { ...fas, processState: 'PROCESSING', processTimer: 0, processBuffer: { ...base, id: crypto.randomUUID(), waBonus: avgWaBonus }, buffer: newBuffer, processingBuffer: [] }
        } else if (transferred) {
          this.faStates[key] = { ...fas, buffer: newBuffer, processingBuffer: newProcBuf }
        }
      } else if (fas.processState === 'PROCESSING') {
        const processTime = getFactoryProcessTime(factory.level, outputQuantity)
        const newTimer = fas.processTimer + delta
        if (newTimer >= processTime) {
          this.config.onFactoryProcess?.(factory.animalId ?? null)
          const safeOutBuf = Array.isArray(fas.outputBuffer) ? fas.outputBuffer : []
          if (safeOutBuf.length < bufferCapacity) {
            const newOutputBuffer = [...safeOutBuf, fas.processBuffer!]
            const newOutputState = fas.outputState === 'IDLE' ? 'PLACING' : fas.outputState
            this.faStates[key] = { ...fas, processState: 'IDLE', processTimer: 0, outputState: newOutputState, outputTimer: fas.outputState === 'IDLE' ? 0 : fas.outputTimer, outputBuffer: newOutputBuffer, processBuffer: null }
          } else {
            this.faStates[key] = { ...fas, processState: 'WAITING', processTimer: 0 }
          }
        } else {
          this.faStates[key] = { ...fas, processTimer: newTimer }
        }
      }
    }

    // OUTPUT
    {
      const fas = this.faStates[key]
      if (fas.outputState === 'PLACING') {
        const newTimer = fas.outputTimer + delta
        if (newTimer >= this.pickTime) {
          if (!isOutputOccupied()) placeOutput()
          else this.faStates[key] = { ...fas, outputState: 'WAITING', outputTimer: 0 }
        } else {
          this.faStates[key] = { ...fas, outputTimer: newTimer }
        }
      } else if (fas.outputState === 'WAITING') {
        if (!isOutputOccupied()) placeOutput()
      }
    }
  }

  private tickFactories(delta: number): void {
    const { board, cellSize, faBufferLevel } = this.config
    this.config.factories.forEach(factory => {
      if (!factory.built || factory.level < 1) return
      const key = `fa-${factory.row}-${factory.col}`
      if (!this.faStates[key] || !('outputState' in this.faStates[key])) {
        this.faStates[key] = { ...DEFAULT_FA_STATE }
      } else if (!Array.isArray(this.faStates[key].outputBuffer)) {
        const old = this.faStates[key].outputBuffer as unknown as Item | null
        this.faStates[key] = { ...this.faStates[key], outputBuffer: old ? [old] : [] }
      }

      const inputRow = factory.dir === 'UP_TO_DOWN' ? factory.row - 1 : factory.row + 1
      const outputRow = factory.dir === 'UP_TO_DOWN' ? factory.row + 1 : factory.row - 1
      if (!getCell(board, inputRow, factory.col) || !getCell(board, outputRow, factory.col)) return

      const inputCenter = getCellCenter(inputRow, factory.col, cellSize)
      const outputCenter = getCellCenter(outputRow, factory.col, cellSize)
      const isOutputOccupied = () =>
        this.items.some(it => dist(it.x, it.y, outputCenter.x, outputCenter.y) <= cellSize * SNAP_RADIUS)

      const placeOutput = () => {
        const fas = this.faStates[key]
        if (!Array.isArray(fas.outputBuffer) || fas.outputBuffer.length === 0 || !fas.outputBuffer[0]) return
        const capacity = getFaBufferCapacity(faBufferLevel)
        const newOutputBuffer = fas.outputBuffer.slice(1)
        this.items.push(this.placeOnBelt(fas.outputBuffer[0], outputCenter))
        let nextOutputState: FAState['outputState'] = newOutputBuffer.length > 0 ? 'PLACING' : 'IDLE'
        let nextProcessState = fas.processState
        let nextProcessBuffer = fas.processBuffer
        let nextOutputBuffer = newOutputBuffer
        if (fas.processState === 'WAITING' && fas.processBuffer !== null && newOutputBuffer.length < capacity) {
          nextOutputBuffer = [...newOutputBuffer, fas.processBuffer]
          if (nextOutputState === 'IDLE') nextOutputState = 'PLACING'
          nextProcessState = 'IDLE'
          nextProcessBuffer = null
        }
        this.faStates[key] = { ...fas, outputState: nextOutputState, outputTimer: 0, outputBuffer: nextOutputBuffer, processState: nextProcessState, processBuffer: nextProcessBuffer }
      }

      if (factory.type === 'WA' || factory.type === 'PK') {
        this.tickWaPkFactory(factory, delta, key, inputCenter, outputCenter, isOutputOccupied, placeOutput)
      } else {
        this.tickPaFactory(factory, delta, key, inputCenter, outputCenter, isOutputOccupied, placeOutput)
      }
    })
  }

  private tickClicker(): void {
    const { board, cellSize, materialQuantityLevels, itemValueLevels } = this.config
    const rsCapacity = getRsBufferCapacity(this.config.rsBufferLevel)
    while (this.pendingClickerSpawns > 0) {
      this.pendingClickerSpawns -= 1
      let rsRow = -1, rsCol = -1
      for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
          if (board[r][c].type === 'RS') { rsRow = r; rsCol = c; break }
        }
        if (rsRow !== -1) break
      }
      if (rsRow === -1) break
      const rsKey = `rs-${rsRow}-${rsCol}`
      if (!this.rsQueues[rsKey]) this.rsQueues[rsKey] = []
      if (this.rsQueues[rsKey].length >= rsCapacity) break
      const center = getCellCenter(rsRow, rsCol, cellSize)
      const next = this.getNextTarget(center.x, center.y)
      if (!next) break
      const grade = this.pendingClickerGrade
      const dir = getCellDirection('RS')
      this.rsQueues[rsKey].push({
        id: crypto.randomUUID(),
        x: center.x, y: center.y,
        dx: dir.dx, dy: dir.dy,
        targetX: next.targetX, targetY: next.targetY,
        grade,
        value: getProducerValue(grade, itemValueLevels[grade - 1] ?? 1),
        quantity: getMaterialQuantity(materialQuantityLevels[grade - 1] ?? 1),
        waBonus: 0, paBonus: 0, pkBonus: 0,
        waGrades: [], paGrades: [], pkGrades: [],
      })
    }
  }

  private tickGoldCollect(): void {
    const { board, cellSize } = this.config
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i]
      const col = Math.round(item.x / cellSize - 0.5)
      const row = Math.round(item.y / cellSize - 0.5)
      const cell = getCell(board, row, col)
      if (cell?.type !== 'RE') continue
      const center = getCellCenter(row, col, cellSize)
      if (dist(item.x, item.y, center.x, center.y) > cellSize * SNAP_RADIUS) continue
      this.config.onGoldEarned(getFinalGold(item), center.x, center.y)
      this.lastGoldTime = Date.now()
      this.items.splice(i, 1)
    }
  }
}
