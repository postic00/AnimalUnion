import { useCallback } from 'react'
import type { MutableRefObject, Dispatch, SetStateAction } from 'react'
import type { Board } from '../types/board'
import type { GameState } from '../types/gameState'
import type { Factory } from '../types/factory'
import type { AnimalId } from '../types/animal'
import type { UpgradeAmount } from '../features/navigation/UpgradeAmountToggle'
import { CONFIG, applyWeekConfig } from '../config'
import { initialBoard } from '../data/initialBoard'
import { initialGameState } from '../types/gameState'
import {
  getBundleCost,
  getProducerBuildCost,
  getProducerUpgradeCost,
  getFactoryBuildCost,
  getFactoryLevelUpgradeCost,
  getPrestigePoints,
  getItemValueLevelCost,
  getAnimalUnlockCost,
  getAnimalUpgradeCost,
  getMaterialQuantityLevelCost,
  getMaterialQuantity,
  getClickerThreshold,
  getClickerUpgradeCost,
  getBufferUpgradeCost,
  getRailSpeedUpgradeCost,
  getBuildCostDiscount,
  getBundleCostDiscount,
  getGoldMultiplierBonus,
  getProducerStartLevel,
  getBuildDiscountCost,
  getBundleDiscountCost,
  getProducerStartCost,
  getGoldMultiplierCost,
  RECIPES,
} from '../balance'
import { soundHamster, soundCoin, soundCat, soundBuild } from '../utils/sound'
import { SaveService } from '../services/SaveService'
import { CloudService } from '../services/CloudService'
import { ScoreService } from '../services/ScoreService'

// ── Context 타입 ─────────────────────────────────────────────────────────────
export interface GameActionsCtx {
  // 핵심 game state refs
  goldRef: MutableRefObject<number>
  totalEarnedRef: MutableRefObject<number>
  mutedRef: MutableRefObject<boolean>
  goldBoostUntilRef: MutableRefObject<number>
  speedBoostUntilRef: MutableRefObject<number>
  goldMultiplierLevelRef: MutableRefObject<number>
  earnedInSecRef: MutableRefObject<number>
  goldBufferRef: MutableRefObject<number>
  totalEarnedBufferRef: MutableRefObject<number>
  boardSaveRef: MutableRefObject<() => void>
  boardRef: MutableRefObject<Board>
  gameStateRef: MutableRefObject<GameState>
  // clicker
  spawnClickerItemRef: MutableRefObject<((grade: number) => void) | null>
  clickerGradeRef: MutableRefObject<number>
  spawnUnlockTimeRef: MutableRefObject<number>
  // game state setters
  setGold: Dispatch<SetStateAction<number>>
  setTotalEarned: Dispatch<SetStateAction<number>>
  setGoldPerSec: Dispatch<SetStateAction<number>>
  setGameState: Dispatch<SetStateAction<GameState>>
  setBoard: Dispatch<SetStateAction<Board>>
  setResetKey: Dispatch<SetStateAction<number>>
  setSavedAt: Dispatch<SetStateAction<number | null>>
  setMuted: Dispatch<SetStateAction<boolean>>
  setSpeedBoostUntil: Dispatch<SetStateAction<number>>
  setGoldBoostUntil: Dispatch<SetStateAction<number>>
  goldPerSec: number
  platform: string
  // UI state setters (cross-cutting concerns)
  setClickerGrade: Dispatch<SetStateAction<number>>
  setTutorialStep: Dispatch<SetStateAction<number | null>>
  setTutorialItemCount: Dispatch<SetStateAction<number>>
  setSelectedFactory: Dispatch<SetStateAction<{ row: number; col: number } | null>>
  setShowPrestigeModal: Dispatch<SetStateAction<boolean>>
  setShowPrestigeKeepModal: Dispatch<SetStateAction<boolean>>
  setShowSplash: Dispatch<SetStateAction<boolean>>
  adTarget: 'speed' | 'gold' | 'prestige' | 'prestigeKeep' | null
  setAdTarget: Dispatch<SetStateAction<'speed' | 'gold' | 'prestige' | 'prestigeKeep' | null>>
  tutorialStep: number | null
  BOOST_MS: number
}

export function useGameActions(ctx: GameActionsCtx) {
  const {
    goldRef, totalEarnedRef, mutedRef, goldBoostUntilRef,
    goldMultiplierLevelRef, earnedInSecRef, goldBufferRef, totalEarnedBufferRef,
    boardSaveRef, boardRef, gameStateRef,
    spawnClickerItemRef, clickerGradeRef, spawnUnlockTimeRef,
    setGold, setTotalEarned, setGoldPerSec, setGameState, setBoard, setResetKey, setSavedAt,
    setMuted, setSpeedBoostUntil, setGoldBoostUntil,
    goldPerSec, platform,
    setClickerGrade, setTutorialStep, setTutorialItemCount, setSelectedFactory,
    setShowPrestigeModal, setShowPrestigeKeepModal, setShowSplash,
    adTarget, setAdTarget, tutorialStep, BOOST_MS,
  } = ctx

  // ── 골드 획득 ────────────────────────────────────────────────────────────
  const handleGoldEarned = useCallback((amount: number) => {
    if (!isFinite(amount) || amount <= 0) return
    const boostMultiplier = Date.now() < goldBoostUntilRef.current ? 3 : 1
    const multiplier = boostMultiplier * getGoldMultiplierBonus(goldMultiplierLevelRef.current)
    const earned = amount * multiplier
    earnedInSecRef.current += earned
    goldBufferRef.current += earned
    totalEarnedBufferRef.current += earned
    if (!mutedRef.current) soundCoin()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 클릭커 ───────────────────────────────────────────────────────────────
  const handleClickerClick = useCallback(() => {
    if (!mutedRef.current) soundHamster()
    const now = performance.now()
    setGameState(prev => {
      const { clickCount, threshold, level } = prev.clicker
      if (clickCount >= threshold) {
        if (now < spawnUnlockTimeRef.current) return prev
        spawnClickerItemRef.current?.(clickerGradeRef.current)
        setTutorialItemCount(c => c + 1)
        return { ...prev, clicker: { ...prev.clicker, clickCount: 0, threshold: CONFIG.CM_CLICKER_THRESHOLD } }
      }
      const next = clickCount + 1
      if (clickCount === 0) {
        const builtGrades = prev.producers.filter(p => p.built).map(p => p.grade)
        const grade = builtGrades.length > 0
          ? builtGrades[Math.floor(Math.random() * builtGrades.length)]
          : 1
        clickerGradeRef.current = grade
        setTimeout(() => setClickerGrade(grade), 0)
      }
      const grade = clickerGradeRef.current
      const quantity = getMaterialQuantity(prev.materialQuantityLevels[grade - 1] ?? 1)
      const newThreshold = getClickerThreshold(quantity, level)
      if (next >= newThreshold) spawnUnlockTimeRef.current = now + 250
      return { ...prev, clicker: { ...prev.clicker, clickCount: next, threshold: newThreshold } }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpgradeClicker = useCallback(() => {
    setGameState(prev => {
      const cost = getClickerUpgradeCost(prev.clicker.level)
      if (goldRef.current < cost) return prev
      setGold(g => g - cost)
      return { ...prev, clicker: { ...prev.clicker, level: prev.clicker.level + 1 } }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 생산기 ───────────────────────────────────────────────────────────────
  const handleBuildProducer = useCallback((index: number) => {
    setGameState(prev => {
      const builtCount = prev.producers.filter(p => p.built).length
      const cost = Math.floor(getProducerBuildCost(builtCount) * (1 - getBuildCostDiscount(prev.buildDiscountLevel ?? 0)))
      if (goldRef.current < cost) return prev
      if (!mutedRef.current) soundBuild()
      setGold(g => g - cost)
      const producers = [...prev.producers]
      producers[index] = { ...producers[index], built: true, level: Math.max(1, getProducerStartLevel(prev.producerStartLevel ?? 0)) }
      return { ...prev, producers }
    })
  }, [tutorialStep]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleProducerGradeChange = useCallback((index: number, grade: number) => {
    setGameState(prev => {
      const producers = [...prev.producers]
      producers[index] = { ...producers[index], grade }
      return { ...prev, producers }
    })
  }, [setGameState])

  const handleUpgradeProducer = useCallback((index: number, amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const producer = prev.producers[index]
      if (!producer) return prev
      let goldAmt = goldRef.current
      let level = producer.level
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0, spent = 0
      while (count < limit) {
        const cost = getProducerUpgradeCost(level)
        if (goldAmt < cost) break
        goldAmt -= cost; spent += cost; level++; count++
      }
      if (count === 0) return prev
      if (!mutedRef.current) soundBuild()
      setGold(g => g - spent)
      const producers = [...prev.producers]
      producers[index] = { ...producer, level }
      return { ...prev, producers }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 번들 ─────────────────────────────────────────────────────────────────
  const handleAddBundle = useCallback(() => {
    setGameState(prev => {
      const cost = Math.floor(getBundleCost(prev.bundleCount) * (1 - getBundleCostDiscount(prev.bundleDiscountLevel ?? 0)))
      if (goldRef.current < cost) return prev
      setGold(g => g - cost)
      setBoard(b => {
        const newBoard = b.map(row => [...row])
        const lastRow = newBoard[newBoard.length - 1]
        const reIndex = lastRow.findIndex(cell => cell.type === 'RE')
        if (reIndex !== -1) {
          lastRow[reIndex] = { type: reIndex === 0 ? 'RDL' : 'RDR' }
        }
        const goRight = reIndex === 0
        const rowA = goRight
          ? [{ type: 'RDN' as const }, { type: 'FA' as const }, { type: 'EM' as const }, { type: 'FA' as const }, { type: 'EM' as const }, { type: 'FA' as const }, { type: 'EM' as const }]
          : [{ type: 'EM' as const }, { type: 'FA' as const }, { type: 'EM' as const }, { type: 'FA' as const }, { type: 'EM' as const }, { type: 'FA' as const }, { type: 'RDN' as const }]
        const rowB = goRight
          ? [{ type: 'RRL' as const }, { type: 'RRN' as const }, { type: 'RRN' as const }, { type: 'RRN' as const }, { type: 'RRN' as const }, { type: 'RRN' as const }, { type: 'RE' as const }]
          : [{ type: 'RE' as const }, { type: 'RLN' as const }, { type: 'RLN' as const }, { type: 'RLN' as const }, { type: 'RLN' as const }, { type: 'RLN' as const }, { type: 'RLR' as const }]
        return [...newBoard, rowA, rowB]
      })
      return { ...prev, bundleCount: prev.bundleCount + 1 }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 공장 ─────────────────────────────────────────────────────────────────
  const handleBuildFactory = useCallback((row: number, col: number) => {
    setGameState(prev => {
      const cost = Math.floor(getFactoryBuildCost() * (1 - getBuildCostDiscount(prev.buildDiscountLevel ?? 0)))
      if (goldRef.current < cost) return prev
      if (!mutedRef.current) soundBuild()
      setGold(g => g - cost)
      const newFactory: Factory = {
        row, col, built: true, type: 'WA', grade: 1, level: 1, dir: 'UP_TO_DOWN', animalId: null,
      }
      return { ...prev, factories: [...prev.factories, newFactory] }
    })
    if (tutorialStep === 7) {
      setTutorialStep(8)
      setSelectedFactory(null)
    }
  }, [tutorialStep]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetFactoryType = useCallback((row: number, col: number, type: Factory['type']) => {
    const paMinGrade = Math.min(...Object.keys(RECIPES).map(Number))
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => {
        if (f.row !== row || f.col !== col) return f
        const grade = type === 'PA' && f.grade < paMinGrade ? paMinGrade : f.grade
        return { ...f, type, grade }
      }),
    }))
  }, [setGameState])

  const handleSetFactoryDir = useCallback((row: number, col: number, dir: Factory['dir']) => {
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.row === row && f.col === col ? { ...f, dir } : f),
    }))
  }, [setGameState])

  const handleSetFactoryGrade = useCallback((row: number, col: number, grade: number) => {
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.row === row && f.col === col ? { ...f, grade } : f),
    }))
  }, [setGameState])

  const handleUpgradeFactoryLevel = useCallback((row: number, col: number, amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const factory = prev.factories.find(f => f.row === row && f.col === col)
      if (!factory) return prev
      let goldAmt = goldRef.current
      let level = factory.level
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0, spent = 0
      while (count < limit) {
        const cost = getFactoryLevelUpgradeCost(level)
        if (goldAmt < cost) break
        goldAmt -= cost; spent += cost; level++; count++
      }
      if (count === 0) return prev
      if (!mutedRef.current) soundBuild()
      setGold(g => g - spent)
      return { ...prev, factories: prev.factories.map(f => f.row === row && f.col === col ? { ...f, level } : f) }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 동물 ─────────────────────────────────────────────────────────────────
  const handleUnlockAnimal = useCallback((id: AnimalId) => {
    setGameState(prev => {
      const cost = getAnimalUnlockCost()
      if (prev.prestigePoints.current < cost) return prev
      return {
        ...prev,
        prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - cost },
        animals: prev.animals.map(a => a.id === id ? { ...a, unlocked: true } : a),
      }
    })
  }, [setGameState])

  const handleUpgradeAnimal = useCallback((id: AnimalId, amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const animal = prev.animals.find(a => a.id === id)
      if (!animal || !animal.unlocked) return prev
      let points = prev.prestigePoints.current
      let level = animal.level
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      while (count < limit) {
        const cost = getAnimalUpgradeCost(level)
        if (points < cost) break
        points -= cost; level++; count++
      }
      if (count === 0) return prev
      return {
        ...prev,
        prestigePoints: { ...prev.prestigePoints, current: points },
        animals: prev.animals.map(a => a.id === id ? { ...a, level } : a),
      }
    })
  }, [setGameState])

  const handleSetFactoryAnimal = useCallback((row: number, col: number, animalId: AnimalId | null) => {
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.row === row && f.col === col ? { ...f, animalId } : f),
    }))
  }, [setGameState])

  const handlePlaceAnimal = useCallback((row: number, col: number, placingAnimalId: AnimalId | null) => {
    if (!placingAnimalId) return
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.row === row && f.col === col ? { ...f, animalId: placingAnimalId } : f),
    }))
  }, [setGameState])

  const handleRecallAnimal = useCallback((id: AnimalId) => {
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.animalId === id ? { ...f, animalId: null } : f),
    }))
  }, [setGameState])

  // ── 재료 / 아이템 가치 ────────────────────────────────────────────────────
  const handleLevelUpItemValue = useCallback((gradeIndex: number, amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      let points = prev.prestigePoints.current
      let level = prev.itemValueLevels[gradeIndex] ?? 1
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      while (count < limit) {
        const cost = getItemValueLevelCost(level)
        if (points < cost) break
        points -= cost; level++; count++
      }
      if (count === 0) return prev
      const itemValueLevels = [...prev.itemValueLevels]
      itemValueLevels[gradeIndex] = level
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: points }, itemValueLevels }
    })
  }, [setGameState])

  const handleUpgradeMaterialQuantity = useCallback((gradeIndex: number, amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      let goldAmt = goldRef.current
      let level = prev.materialQuantityLevels[gradeIndex] ?? 1
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0, spent = 0
      while (count < limit) {
        const cost = getMaterialQuantityLevelCost(level)
        if (goldAmt < cost) break
        goldAmt -= cost; spent += cost; level++; count++
      }
      if (count === 0) return prev
      setGold(g => g - spent)
      const materialQuantityLevels = [...prev.materialQuantityLevels]
      materialQuantityLevels[gradeIndex] = level
      return { ...prev, materialQuantityLevels }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 버퍼 / 레일 ───────────────────────────────────────────────────────────
  const handleUpgradeRsBuffer = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      let points = prev.prestigePoints.current
      let level = prev.rsBufferLevel
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      while (count < limit) {
        const cost = getBufferUpgradeCost(level)
        if (points < cost) break
        points -= cost; level++; count++
      }
      if (count === 0) return prev
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: points }, rsBufferLevel: level }
    })
  }, [setGameState])

  const handleUpgradeFaBuffer = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      let points = prev.prestigePoints.current
      let level = prev.faBufferLevel
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      while (count < limit) {
        const cost = getBufferUpgradeCost(level)
        if (points < cost) break
        points -= cost; level++; count++
      }
      if (count === 0) return prev
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: points }, faBufferLevel: level }
    })
  }, [setGameState])

  const handleUpgradeRailSpeed = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      let points = prev.prestigePoints.current
      let level = prev.railSpeedLevel ?? 1
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      while (count < limit) {
        if (level >= CONFIG.RAIL_SPEED_MAX_LEVEL) break
        const cost = getRailSpeedUpgradeCost(level)
        if (points < cost) break
        points -= cost; level++; count++
      }
      if (count === 0) return prev
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: points }, railSpeedLevel: level }
    })
  }, [setGameState])

  // ── 환생 보너스 ──────────────────────────────────────────────────────────
  const handleUpgradeBuildDiscount = useCallback(() => {
    setGameState(prev => {
      if ((prev.buildDiscountLevel ?? 0) >= CONFIG.PF_BC_PROC_MAX) return prev
      const cost = getBuildDiscountCost(prev.buildDiscountLevel ?? 0)
      if (prev.prestigePoints.current < cost) return prev
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - cost }, buildDiscountLevel: (prev.buildDiscountLevel ?? 0) + 1 }
    })
  }, [setGameState])

  const handleUpgradeBundleDiscount = useCallback(() => {
    setGameState(prev => {
      if ((prev.bundleDiscountLevel ?? 0) >= CONFIG.PF_LC_PROC_MAX) return prev
      const cost = getBundleDiscountCost(prev.bundleDiscountLevel ?? 0)
      if (prev.prestigePoints.current < cost) return prev
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - cost }, bundleDiscountLevel: (prev.bundleDiscountLevel ?? 0) + 1 }
    })
  }, [setGameState])

  const handleUpgradeProducerStart = useCallback(() => {
    setGameState(prev => {
      const cost = getProducerStartCost(prev.producerStartLevel ?? 0)
      if (prev.prestigePoints.current < cost) return prev
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - cost }, producerStartLevel: (prev.producerStartLevel ?? 0) + 1 }
    })
  }, [setGameState])

  const handleUpgradeGoldMultiplier = useCallback(() => {
    setGameState(prev => {
      if ((prev.goldMultiplierLevel ?? 0) >= CONFIG.PF_GM_PROC_MAX) return prev
      const cost = getGoldMultiplierCost(prev.goldMultiplierLevel ?? 0)
      if (prev.prestigePoints.current < cost) return prev
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - cost }, goldMultiplierLevel: (prev.goldMultiplierLevel ?? 0) + 1 }
    })
  }, [setGameState])

  // ── 환생 ────────────────────────────────────────────────────────────────
  const doPrestige = useCallback(async (multiplier = 1) => {
    const safeMultiplier = isFinite(multiplier) && multiplier > 0 ? multiplier : 1
    await CloudService.fetchAndSaveWeekConfig()
    const weekConfig = SaveService.loadWeekConfig()
    if (weekConfig) applyWeekConfig(weekConfig)
    const isNewSeason = CONFIG.WEEK > CONFIG.CURRENT_WEEK
    if (!mutedRef.current) soundCat()
    SaveService.saveEngineState({ items: [], faStates: {} })
    setResetKey(k => k + 1)
    setBoard(initialBoard)
    const weekRate = isNewSeason ? CONFIG.NEXT_WEEK_RATE : 1
    setGold(0)
    setTotalEarned(0)
    setGoldPerSec(0)
    setGameState(prev => {
      const earned = getPrestigePoints(totalEarnedRef.current) * safeMultiplier
      const oldTotal = prev.prestigePoints.total
      const newTotal = isNewSeason ? Math.floor(oldTotal * weekRate) + earned : oldTotal + earned
      const newPrestigeCount = prev.prestigeCount + 1
      if (prev.playerName) {
        const deviceId = SaveService.getDeviceId()
        ScoreService.submitPrestige(deviceId, prev.playerName, newTotal, newPrestigeCount)
        ScoreService.submitGold(deviceId, prev.playerName, 0)
      }
      // initialGameState 기반: 새 필드 추가 시 자동으로 리셋됨
      return {
        ...initialGameState,
        playerName: prev.playerName,
        producers: initialGameState.producers.map(p => ({ ...p, level: Math.max(1, getProducerStartLevel(prev.producerStartLevel ?? 0)) })),
        // 환생 유지 (prestige buff)
        buildDiscountLevel: prev.buildDiscountLevel,
        bundleDiscountLevel: prev.bundleDiscountLevel,
        producerStartLevel: prev.producerStartLevel,
        goldMultiplierLevel: prev.goldMultiplierLevel,
        // 환생 카운터
        prestigeCount: newPrestigeCount,
        prestigePoints: { current: newTotal, total: newTotal },
      }
    })
    const updatedConfig = { ...(weekConfig ?? {}), CURRENT_WEEK: CONFIG.WEEK }
    SaveService.saveWeekConfig(updatedConfig)
    applyWeekConfig(updatedConfig)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const doPrestigeKeepPoints = useCallback(async (multiplier = 1) => {
    const safeMultiplier = isFinite(multiplier) && multiplier > 0 ? multiplier : 1
    await CloudService.fetchAndSaveWeekConfig()
    const weekConfig = SaveService.loadWeekConfig()
    if (weekConfig) applyWeekConfig(weekConfig)
    if (!mutedRef.current) soundCat()
    SaveService.saveEngineState({ items: [], faStates: {} })
    setResetKey(k => k + 1)
    setBoard(initialBoard)
    const isNewSeason = CONFIG.WEEK > CONFIG.CURRENT_WEEK
    const weekRate = isNewSeason ? CONFIG.NEXT_WEEK_RATE : 1
    setGold(0)
    setTotalEarned(0)
    setGoldPerSec(0)
    setGameState(prev => {
      const earned = getPrestigePoints(totalEarnedRef.current) * safeMultiplier
      const oldTotal = prev.prestigePoints.total
      const newTotal = isNewSeason ? Math.floor(oldTotal * weekRate) + earned : oldTotal + earned
      const newPrestigeCount = prev.prestigeCount + 1
      if (prev.playerName) {
        const deviceId = SaveService.getDeviceId()
        ScoreService.submitPrestige(deviceId, prev.playerName, newTotal, newPrestigeCount)
        ScoreService.submitGold(deviceId, prev.playerName, 0)
      }
      const keptCurrent = isNewSeason
        ? Math.floor(prev.prestigePoints.current * weekRate) + earned
        : prev.prestigePoints.current + earned
      // initialGameState 기반: 새 필드 추가 시 자동으로 리셋됨
      return {
        ...initialGameState,
        playerName: prev.playerName,
        producers: initialGameState.producers.map(p => ({ ...p, level: Math.max(1, getProducerStartLevel(prev.producerStartLevel ?? 0)) })),
        // 환생 유지 (prestige buff)
        buildDiscountLevel: prev.buildDiscountLevel,
        bundleDiscountLevel: prev.bundleDiscountLevel,
        producerStartLevel: prev.producerStartLevel,
        goldMultiplierLevel: prev.goldMultiplierLevel,
        // 포인트 유지 전용: 버퍼/레일 유지
        rsBufferLevel: prev.rsBufferLevel,
        faBufferLevel: prev.faBufferLevel,
        railSpeedLevel: prev.railSpeedLevel,
        // 환생 카운터
        prestigeCount: newPrestigeCount,
        prestigePoints: { current: keptCurrent, total: newTotal },
      }
    })
    const updatedConfig = { ...(weekConfig ?? {}), CURRENT_WEEK: CONFIG.WEEK }
    SaveService.saveWeekConfig(updatedConfig)
    applyWeekConfig(updatedConfig)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrestige = useCallback(async () => {
    await CloudService.fetchAndSaveWeekConfig()
    const weekConfig = SaveService.loadWeekConfig()
    if (weekConfig) applyWeekConfig(weekConfig)
    setShowPrestigeModal(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrestigeKeepPoints = useCallback(() => {
    setShowPrestigeKeepModal(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 광고 ─────────────────────────────────────────────────────────────────
  const handleAdComplete = useCallback(() => {
    const target = adTarget
    setAdTarget(null)
    if (target === 'speed') {
      setSpeedBoostUntil(prev => Math.max(prev, Date.now()) + BOOST_MS)
    } else if (target === 'gold') {
      setGoldBoostUntil(prev => Math.max(prev, Date.now()) + BOOST_MS)
    } else if (target === 'prestige') {
      setShowPrestigeModal(false)
      doPrestige(2)
    } else if (target === 'prestigeKeep') {
      setShowPrestigeKeepModal(false)
      doPrestigeKeepPoints(2)
    }
  }, [adTarget, doPrestige, doPrestigeKeepPoints]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 설정 ─────────────────────────────────────────────────────────────────
  const handleToggleMute = useCallback(() => {
    setMuted(prev => { SaveService.saveMuted(!prev); return !prev })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleHardReset = useCallback(() => {
    ScoreService.deleteAllScores(SaveService.getDeviceId())
    SaveService.deleteSave()
    localStorage.removeItem('tutorialDone')
    localStorage.removeItem('animal-union-week-config')
    setBoard(initialBoard)
    setGameState({ ...initialGameState, playerName: `Player${Date.now().toString(36).toUpperCase()}` })
    setGold(100)
    setTotalEarned(0)
    setGoldPerSec(0)
    setResetKey(k => k + 1)
    setSavedAt(null)
    setTutorialStep(0)
    setTutorialItemCount(0)
    setShowSplash(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 클라우드 ──────────────────────────────────────────────────────────────
  const handleCloudSave = useCallback(async (): Promise<boolean> => {
    boardSaveRef.current?.()
    const fullState = { ...gameStateRef.current, gold: goldRef.current, totalEarned: totalEarnedRef.current, goldPerSec }
    const engineState = SaveService.loadEngineState()
    return await CloudService.save(gameStateRef.current.playerName, fullState, boardRef.current, platform, {
      boosts: { speedBoostUntil: ctx.speedBoostUntilRef.current, goldBoostUntil: goldBoostUntilRef.current },
      ...engineState,
    })
  }, [platform, goldPerSec]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCloudLoad = useCallback(async (): Promise<boolean> => {
    const data = await CloudService.load()
    if (!data || !Array.isArray(data.board) || !data.gameState) return false
    SaveService.saveEngineState({
      items: data.items,
      faStates: data.faStates,
      rsQueues: data.rsQueues as Record<string, unknown[]> | undefined,
      produceTimers: data.produceTimers,
      prStates: data.prStates,
    })
    if (data.boosts) {
      setSpeedBoostUntil(data.boosts.speedBoostUntil)
      setGoldBoostUntil(data.boosts.goldBoostUntil)
    }
    setBoard(data.board)
    setGameState(data.gameState)
    setGold(data.gameState.gold ?? 0)
    setTotalEarned(data.gameState.totalEarned ?? 0)
    setGoldPerSec(data.gameState.goldPerSec ?? 0)
    setResetKey(k => k + 1)
    return true
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    handleGoldEarned,
    handleClickerClick,
    handleUpgradeClicker,
    handleBuildProducer,
    handleProducerGradeChange,
    handleUpgradeProducer,
    handleAddBundle,
    handleBuildFactory,
    handleSetFactoryType,
    handleSetFactoryDir,
    handleSetFactoryGrade,
    handleUpgradeFactoryLevel,
    handleUnlockAnimal,
    handleUpgradeAnimal,
    handleSetFactoryAnimal,
    handlePlaceAnimal,
    handleRecallAnimal,
    handleLevelUpItemValue,
    handleUpgradeMaterialQuantity,
    handleUpgradeRsBuffer,
    handleUpgradeFaBuffer,
    handleUpgradeRailSpeed,
    handleUpgradeBuildDiscount,
    handleUpgradeBundleDiscount,
    handleUpgradeProducerStart,
    handleUpgradeGoldMultiplier,
    doPrestige,
    doPrestigeKeepPoints,
    handlePrestige,
    handlePrestigeKeepPoints,
    handleAdComplete,
    handleToggleMute,
    handleHardReset,
    handleCloudSave,
    handleCloudLoad,
  }
}
