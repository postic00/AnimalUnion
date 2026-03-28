import { useCallback } from 'react'
import { saveGame } from '../utils/saveLoad'
import type { MutableRefObject, Dispatch, SetStateAction } from 'react'
import type { Factory } from '../types/factory'
import type { AnimalId, FriendId } from '../types/animal'
import type { Friend } from '../types/gameState'
import type { UpgradeAmount } from '../features/navigation/UpgradeAmountToggle'
import { CONFIG, applyWeekConfig } from '../config'
import { initialBoard } from '../data/initialBoard'
import { initialGameState } from '../types/gameState'
import { useGoldStore, goldRef, totalEarnedRef, earnedInSecRef, goldBufferRef, totalEarnedBufferRef } from '../stores/goldStore'
import { useGameStore, gameStateRef, boardRef, mutedRef, goldMultiplierLevelRef } from '../stores/gameStore'
import { useBoostStore, goldBoostRemainingRef, speedBoostRemainingRef } from '../stores/boostStore'
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
  getBulkCount,
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
  getInitialGold,
  getInitialGoldCost,
  RECIPES,
} from '../balance'
import { soundHamster, soundCoin, soundCat, soundBuild } from '../utils/sound'
import { SaveService } from '../services/SaveService'
import { CloudService } from '../services/CloudService'
import { ScoreService } from '../services/ScoreService'
import type { WorkData } from '../types/workData'

// ── Context 타입 ─────────────────────────────────────────────────────────────
export interface GameActionsCtx {
  // Board 저장/초기화 ref (Board 컴포넌트 내부 상태)
  boardSaveRef: MutableRefObject<() => void>
  boardClearRef: MutableRefObject<() => void>
  // clicker
  spawnClickerItemRef: MutableRefObject<((grade: number) => void) | null>
  clickerGradeRef: MutableRefObject<number>
  spawnUnlockTimeRef: MutableRefObject<number>
  platform: string
  // UI state setters (cross-cutting concerns)
  setClickerGrade: Dispatch<SetStateAction<number>>
  setTutorialStep: Dispatch<SetStateAction<number | null>>
  setTutorialItemCount: Dispatch<SetStateAction<number>>
  setSelectedFactory: (val: { row: number; col: number } | null) => void
  setShowPrestigeModal: (show: boolean) => void
  setShowPrestigeKeepModal: (show: boolean) => void
  setShowSplash: Dispatch<SetStateAction<boolean>>
  adTarget: 'speed' | 'gold' | 'prestige' | 'prestigeKeep' | 'reward' | null
  setAdTarget: (target: 'speed' | 'gold' | 'prestige' | 'prestigeKeep' | 'reward' | null) => void
  workDataRef: MutableRefObject<WorkData>
  setWorkData: Dispatch<SetStateAction<WorkData>>
  onRewardClaim: (multiplier: number) => void
  resetSalary: () => void
  tutorialStep: number | null
  BOOST_MS: number
}

export function useGameActions(ctx: GameActionsCtx) {
  const {
    boardSaveRef, boardClearRef,
    spawnClickerItemRef, clickerGradeRef, spawnUnlockTimeRef,
    platform,
    setClickerGrade, setTutorialStep, setTutorialItemCount, setSelectedFactory,
    setShowPrestigeModal, setShowPrestigeKeepModal, setShowSplash,
    adTarget, setAdTarget, workDataRef, setWorkData, onRewardClaim, resetSalary, tutorialStep, BOOST_MS,
  } = ctx

  // store actions (렌더링과 무관하게 최신 값 접근)
  const setGameState = useGameStore.getState().setGameState
  const setBoard = useGameStore.getState().setBoard
  const setResetKey = useGameStore.getState().setResetKey
  const setMuted = useGameStore.getState().setMuted
  const setGold = useGoldStore.getState().setGold

  // ── 골드 획득 ────────────────────────────────────────────────────────────
  const handleGoldEarned = useCallback((amount: number) => {
    if (!isFinite(amount) || amount <= 0) return
    const boostMultiplier = goldBoostRemainingRef.current > 0 ? 3 : 1
    const multiplier = boostMultiplier * getGoldMultiplierBonus(goldMultiplierLevelRef.current)
    const earned = amount * multiplier
    earnedInSecRef.current += earned
    goldBufferRef.current += earned
    totalEarnedBufferRef.current += earned
    if (!mutedRef.current) soundCoin()
  }, [])

  // ── 클릭커 ───────────────────────────────────────────────────────────────
  const handleClickerClick = useCallback(() => {
    if (!mutedRef.current) soundHamster()
    const now = performance.now()
    setGameState(prev => {
      const { clickCount, level } = prev.clicker
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
      const next = clickCount + 1
      if (next >= newThreshold) {
        if (now < spawnUnlockTimeRef.current) return prev
        spawnUnlockTimeRef.current = now + 250
        spawnClickerItemRef.current?.(grade)
        setTutorialItemCount(c => c + 1)
        return { ...prev, clicker: { ...prev.clicker, clickCount: 0, threshold: CONFIG.CM_CLICKER_THRESHOLD } }
      }
      return { ...prev, clicker: { ...prev.clicker, clickCount: next, threshold: newThreshold } }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpgradeClicker = useCallback((amount: number | 'MAX' = 1) => {
    setGameState(prev => {
      const count = getBulkCount(getClickerUpgradeCost, prev.clicker.level, amount, goldRef.current)
      if (count === 0) return prev
      let totalCost = 0
      for (let i = 0; i < count; i++) totalCost += getClickerUpgradeCost(prev.clicker.level + i)
      if (goldRef.current < totalCost) return prev
      setGold(g => g - totalCost)
      return { ...prev, clicker: { ...prev.clicker, level: prev.clicker.level + count } }
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
    if (tutorialStep === 9) {
      setTutorialStep(10)
    }
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
      const count = getBulkCount(getProducerUpgradeCost, producer.level, amount, goldRef.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getProducerUpgradeCost(producer.level + i)
      if (!mutedRef.current) soundBuild()
      setGold(g => g - spent)
      const producers = [...prev.producers]
      producers[index] = { ...producer, level: producer.level + count }
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
      const count = getBulkCount(getFactoryLevelUpgradeCost, factory.level, amount, goldRef.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getFactoryLevelUpgradeCost(factory.level + i)
      if (!mutedRef.current) soundBuild()
      setGold(g => g - spent)
      return { ...prev, factories: prev.factories.map(f => f.row === row && f.col === col ? { ...f, level: factory.level + count } : f) }
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
      const count = getBulkCount(getAnimalUpgradeCost, animal.level, amount, prev.prestigePoints.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getAnimalUpgradeCost(animal.level + i)
      return {
        ...prev,
        prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - spent },
        animals: prev.animals.map(a => a.id === id ? { ...a, level: animal.level + count } : a),
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

  // ── 친구 ─────────────────────────────────────────────────────────────────
  const handleIssueInviteCode = useCallback(async (): Promise<string | null> => {
    return CloudService.issueInviteCode()
  }, [])

  // B가 A 코드 입력 → friend_requests 삽입 + B 목록에 A 추가 (rank 포함)
  const handleSendFriendRequest = useCallback(async (code: string): Promise<boolean> => {
    const myDeviceId = SaveService.getDeviceId()
    const result = await CloudService.sendFriendRequest(code, myDeviceId)
    if (!result) return false
    setGameState(prev => {
      const friends = prev.friends ?? []
      if (friends.length >= 20) return prev
      if (friends.some(f => f.deviceId === result.deviceId)) return prev
      const nextId = `friend${friends.length + 1}` as FriendId
      const newFriend: Friend = { id: nextId, deviceId: result.deviceId, playerName: result.playerName, rank: result.rank }
      return { ...prev, friends: [...friends, newFriend] }
    })
    return true
  }, [setGameState])



  const handleRecallFriend = useCallback((id: FriendId) => {
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.animalId === id ? { ...f, animalId: null } : f),
    }))
  }, [setGameState])

  const handleRemoveFriend = useCallback((id: FriendId) => {
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.animalId === id ? { ...f, animalId: null } : f),
      friends: (prev.friends ?? []).filter(f => f.id !== id),
    }))
  }, [setGameState])

  // ── 재료 / 아이템 가치 ────────────────────────────────────────────────────
  const handleLevelUpItemValue = useCallback((gradeIndex: number, amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const level = prev.itemValueLevels[gradeIndex] ?? 1
      const count = getBulkCount(getItemValueLevelCost, level, amount, prev.prestigePoints.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getItemValueLevelCost(level + i)
      const itemValueLevels = [...prev.itemValueLevels]
      itemValueLevels[gradeIndex] = level + count
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - spent }, itemValueLevels }
    })
  }, [setGameState])

  const handleUpgradeMaterialQuantity = useCallback((gradeIndex: number, amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const level = prev.materialQuantityLevels[gradeIndex] ?? 1
      const count = getBulkCount(getMaterialQuantityLevelCost, level, amount, goldRef.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getMaterialQuantityLevelCost(level + i)
      setGold(g => g - spent)
      const materialQuantityLevels = [...prev.materialQuantityLevels]
      materialQuantityLevels[gradeIndex] = level + count
      return { ...prev, materialQuantityLevels }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 버퍼 / 레일 ───────────────────────────────────────────────────────────
  const handleUpgradeRsBuffer = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const count = getBulkCount(getBufferUpgradeCost, prev.rsBufferLevel, amount, prev.prestigePoints.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getBufferUpgradeCost(prev.rsBufferLevel + i)
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - spent }, rsBufferLevel: prev.rsBufferLevel + count }
    })
  }, [setGameState])

  const handleUpgradeFaBuffer = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const count = getBulkCount(getBufferUpgradeCost, prev.faBufferLevel, amount, prev.prestigePoints.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getBufferUpgradeCost(prev.faBufferLevel + i)
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - spent }, faBufferLevel: prev.faBufferLevel + count }
    })
  }, [setGameState])

  const handleUpgradeRailSpeed = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const currentLevel = prev.railSpeedLevel ?? 1
      const cappedCost = (level: number) => level >= CONFIG.RAIL_SPEED_MAX_LEVEL ? Infinity : getRailSpeedUpgradeCost(level)
      const count = getBulkCount(cappedCost, currentLevel, amount, prev.prestigePoints.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getRailSpeedUpgradeCost(currentLevel + i)
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - spent }, railSpeedLevel: currentLevel + count }
    })
  }, [setGameState])

  // ── 환생 보너스 ──────────────────────────────────────────────────────────
  const handleUpgradeBuildDiscount = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const currentLevel = prev.buildDiscountLevel ?? 0
      const cappedCost = (level: number) => level >= CONFIG.PF_BC_PROC_MAX ? Infinity : getBuildDiscountCost(level)
      const count = getBulkCount(cappedCost, currentLevel, amount, prev.prestigePoints.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getBuildDiscountCost(currentLevel + i)
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - spent }, buildDiscountLevel: currentLevel + count }
    })
  }, [setGameState])

  const handleUpgradeBundleDiscount = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const currentLevel = prev.bundleDiscountLevel ?? 0
      const cappedCost = (level: number) => level >= CONFIG.PF_LC_PROC_MAX ? Infinity : getBundleDiscountCost(level)
      const count = getBulkCount(cappedCost, currentLevel, amount, prev.prestigePoints.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getBundleDiscountCost(currentLevel + i)
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - spent }, bundleDiscountLevel: currentLevel + count }
    })
  }, [setGameState])

  const handleUpgradeProducerStart = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const currentLevel = prev.producerStartLevel ?? 0
      const count = getBulkCount(getProducerStartCost, currentLevel, amount, prev.prestigePoints.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getProducerStartCost(currentLevel + i)
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - spent }, producerStartLevel: currentLevel + count }
    })
  }, [setGameState])

  const handleUpgradeGoldMultiplier = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const currentLevel = prev.goldMultiplierLevel ?? 0
      const cappedCost = (level: number) => level >= CONFIG.PF_GM_PROC_MAX ? Infinity : getGoldMultiplierCost(level)
      const count = getBulkCount(cappedCost, currentLevel, amount, prev.prestigePoints.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getGoldMultiplierCost(currentLevel + i)
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - spent }, goldMultiplierLevel: currentLevel + count }
    })
  }, [setGameState])

  const handleUpgradeInitialGold = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const currentLevel = prev.initialGoldLevel ?? 0
      const count = getBulkCount(getInitialGoldCost, currentLevel, amount, prev.prestigePoints.current)
      if (count === 0) return prev
      let spent = 0
      for (let i = 0; i < count; i++) spent += getInitialGoldCost(currentLevel + i)
      return { ...prev, prestigePoints: { ...prev.prestigePoints, current: prev.prestigePoints.current - spent }, initialGoldLevel: currentLevel + count }
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
    boardSaveRef.current = () => {}
    boardClearRef.current()
    SaveService.saveEngineState({ items: [], faStates: {}, rsQueues: {}, produceTimers: {}, prStates: {} })
    setResetKey(k => k + 1)
    setBoard(initialBoard)
    const weekRate = isNewSeason ? CONFIG.NEXT_WEEK_RATE : 1
    // 제출용 값 사전 계산 (state updater 밖에서)
    const prevState = gameStateRef.current
    const totalEarned = totalEarnedRef.current
    const startGold = getInitialGold(prevState.initialGoldLevel ?? 0)
    useGoldStore.getState().reset(startGold)
    const earned = getPrestigePoints(totalEarned) * safeMultiplier
    const newTotal = isNewSeason ? Math.floor(prevState.prestigePoints.total * weekRate) + earned : prevState.prestigePoints.total + earned
    const newPrestigeCount = prevState.prestigeCount + 1
    if (prevState.playerName) {
      const deviceId = SaveService.getDeviceId()
      ScoreService.submitPrestige(deviceId, prevState.playerName, newTotal, newPrestigeCount)
      ScoreService.submitGold(deviceId, prevState.playerName, 0)
    }
    setGameState(() => ({
      ...initialGameState,
      gold: startGold,
      playerName: prevState.playerName,
      producers: initialGameState.producers.map(p => ({ ...p, level: Math.max(1, getProducerStartLevel(prevState.producerStartLevel ?? 0)) })),
      initialGoldLevel: prevState.initialGoldLevel,
      prestigeCount: newPrestigeCount,
      prestigePoints: { current: newTotal, total: newTotal },
      currentWeek: CONFIG.WEEK,
      friends: prevState.friends ?? [],
    }))
    setTimeout(() => {
      const fullState = { ...gameStateRef.current, gold: startGold, totalEarned: 0, goldPerSec: 0 }
      saveGame(boardRef.current, fullState, {
        speedBoostRemaining: speedBoostRemainingRef.current,
        goldBoostRemaining: goldBoostRemainingRef.current,
      })
    }, 0)
    resetSalary()
    const updatedConfig = { ...(weekConfig ?? {}), CURRENT_WEEK: CONFIG.WEEK }
    SaveService.saveWeekConfig(updatedConfig)
    applyWeekConfig(updatedConfig)
  }, [resetSalary]) // eslint-disable-line react-hooks/exhaustive-deps

  const doPrestigeKeepPoints = useCallback(async (multiplier = 1) => {
    const safeMultiplier = isFinite(multiplier) && multiplier > 0 ? multiplier : 1
    await CloudService.fetchAndSaveWeekConfig()
    const weekConfig = SaveService.loadWeekConfig()
    if (weekConfig) applyWeekConfig(weekConfig)
    if (!mutedRef.current) soundCat()
    boardSaveRef.current = () => {}
    boardClearRef.current()
    SaveService.saveEngineState({ items: [], faStates: {}, rsQueues: {}, produceTimers: {}, prStates: {} })
    setResetKey(k => k + 1)
    setBoard(initialBoard)
    const isNewSeason = CONFIG.WEEK > CONFIG.CURRENT_WEEK
    const weekRate = isNewSeason ? CONFIG.NEXT_WEEK_RATE : 1
    // 제출용 값 사전 계산 (state updater 밖에서)
    const prevState = gameStateRef.current
    const totalEarned = totalEarnedRef.current
    const startGold = getInitialGold(prevState.initialGoldLevel ?? 0)
    useGoldStore.getState().reset(startGold)
    const earned = getPrestigePoints(totalEarned) * safeMultiplier
    const newTotal = isNewSeason ? Math.floor(prevState.prestigePoints.total * weekRate) + earned : prevState.prestigePoints.total + earned
    const newPrestigeCount = prevState.prestigeCount + 1
    const keptCurrent = isNewSeason
      ? Math.floor(prevState.prestigePoints.current * weekRate) + earned
      : prevState.prestigePoints.current + earned
    if (prevState.playerName) {
      const deviceId = SaveService.getDeviceId()
      ScoreService.submitPrestige(deviceId, prevState.playerName, newTotal, newPrestigeCount)
      ScoreService.submitGold(deviceId, prevState.playerName, 0)
    }
    setGameState(() => ({
      ...initialGameState,
      gold: startGold,
      playerName: prevState.playerName,
      producers: initialGameState.producers.map(p => ({ ...p, level: Math.max(1, getProducerStartLevel(prevState.producerStartLevel ?? 0)) })),
      buildDiscountLevel: prevState.buildDiscountLevel,
      bundleDiscountLevel: prevState.bundleDiscountLevel,
      producerStartLevel: prevState.producerStartLevel,
      goldMultiplierLevel: prevState.goldMultiplierLevel,
      initialGoldLevel: prevState.initialGoldLevel,
      rsBufferLevel: prevState.rsBufferLevel,
      faBufferLevel: prevState.faBufferLevel,
      railSpeedLevel: prevState.railSpeedLevel,
      animals: prevState.animals,
      itemValueLevels: prevState.itemValueLevels,
      prestigeCount: newPrestigeCount,
      prestigePoints: { current: keptCurrent, total: newTotal },
      currentWeek: CONFIG.WEEK,
      friends: prevState.friends ?? [],
    }))
	setTimeout(() => {
		const fullState = { ...gameStateRef.current, gold: startGold, totalEarned: 0, goldPerSec: 0 }
		saveGame(boardRef.current, fullState, {
			speedBoostRemaining: speedBoostRemainingRef.current,
			goldBoostRemaining: goldBoostRemainingRef.current,
		})
	}, 0)

    resetSalary()
    const updatedConfig = { ...(weekConfig ?? {}), CURRENT_WEEK: CONFIG.WEEK }
    SaveService.saveWeekConfig(updatedConfig)
    applyWeekConfig(updatedConfig)
  }, [resetSalary]) // eslint-disable-line react-hooks/exhaustive-deps

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
    ScoreService.recordAd(SaveService.getDeviceId())
    if (target === 'speed') {
      useBoostStore.getState().addSpeedBoost(BOOST_MS)
    } else if (target === 'gold') {
      useBoostStore.getState().addGoldBoost(BOOST_MS)
    } else if (target === 'prestige') {
      setShowPrestigeModal(false)
      doPrestige(2)
    } else if (target === 'prestigeKeep') {
      setShowPrestigeKeepModal(false)
      doPrestigeKeepPoints(2)
    } else if (target === 'reward') {
      onRewardClaim(3)
    }
  }, [adTarget, doPrestige, doPrestigeKeepPoints, onRewardClaim]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 설정 ─────────────────────────────────────────────────────────────────
  const handleToggleMute = useCallback(() => {
    const next = !mutedRef.current
    SaveService.saveMuted(next)
    setMuted(next)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleHardReset = useCallback(() => {
    boardSaveRef.current = () => {} // 구 Board가 스토리지에 재저장하지 못하도록 차단
    boardClearRef.current()
    const deviceId = SaveService.getDeviceId()
    ScoreService.deleteAllScores(deviceId)
    CloudService.clearCloudSave(deviceId)
    CloudService.removeFriends(deviceId)
    SaveService.deleteSave()
    localStorage.removeItem('tutorialDone')
    localStorage.removeItem('animal-union-week-config')
    setBoard(initialBoard)
    setGameState({ ...initialGameState, playerName: `Player${Date.now().toString(36).toUpperCase()}` })
    useGoldStore.getState().reset(100)
    setResetKey(k => k + 1)
    useGameStore.getState().setSavedAt(null)
    setTutorialStep(0)
    setTutorialItemCount(0)
    setShowSplash(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 클라우드 ──────────────────────────────────────────────────────────────
  const handleCloudSave = useCallback(async (): Promise<boolean> => {
    boardSaveRef.current?.()
    const goldState = useGoldStore.getState()
    const fullState = { ...gameStateRef.current, gold: goldRef.current, totalEarned: totalEarnedRef.current, goldPerSec: goldState.goldPerSec }
    const engineState = SaveService.loadEngineState()
    return await CloudService.save(gameStateRef.current.playerName, fullState, boardRef.current, platform, {
      boosts: { speedBoostRemaining: speedBoostRemainingRef.current, goldBoostRemaining: goldBoostRemainingRef.current },
      workData: workDataRef.current,
      ...engineState,
    })
  }, [platform]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTransferSave = useCallback(async (): Promise<string | null> => {
    // 클라우드 저장 후 코드 발급
    const fullState = useGameStore.getState().gameState
    const { speedBoostRemaining, goldBoostRemaining } = useBoostStore.getState()
    const ok = await CloudService.save(fullState.playerName, fullState, boardRef.current, platform, {
      boosts: { speedBoostRemaining, goldBoostRemaining },
      workData: workDataRef.current ?? undefined,
      items: SaveService.loadItems() ?? [],
      faStates: SaveService.loadFaStates() ?? {},
      rsQueues: (SaveService.loadRsQueues() ?? {}) as Record<string, unknown[]>,
      produceTimers: SaveService.loadProduceTimers() ?? {},
      prStates: SaveService.loadPrStates() ?? {},
    })
    if (!ok) return null
    return CloudService.issueTransferCode()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTransferLoad = useCallback(async (code: string): Promise<boolean> => {
    const data = await CloudService.loadByTransferCode(code)
    if (!data || !Array.isArray(data.board) || !data.gameState) return false
    SaveService.saveEngineState({
      items: data.items,
      faStates: data.faStates,
      rsQueues: data.rsQueues as Record<string, unknown[]> | undefined,
      produceTimers: data.produceTimers,
      prStates: data.prStates,
    })
    if (data.boosts) {
      useBoostStore.getState().setBoosts(data.boosts.speedBoostRemaining ?? 0, data.boosts.goldBoostRemaining ?? 0)
    }
    if (data.workData) {
      workDataRef.current = data.workData
      setWorkData(data.workData)
      SaveService.saveWorkData(data.workData)
    }
    setBoard(data.board)
    setGameState(data.gameState)
    useGoldStore.getState().setGold(data.gameState.gold ?? 0)
    useGoldStore.getState().setTotalEarned(data.gameState.totalEarned ?? 0)
    setResetKey(k => k + 1)
    return true
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const mergeFriendsFromServer = useCallback(async () => {
    const myDeviceId = SaveService.getDeviceId()
    const serverFriends = await CloudService.fetchFriends(myDeviceId)
    if (serverFriends.length === 0) return
    useGameStore.getState().setGameState(prev => {
      const friends = prev.friends ?? []
      const localIds = new Set(friends.map(f => f.deviceId))
      const newFriends = serverFriends.filter(f => !localIds.has(f.deviceId))
      if (newFriends.length === 0) return prev
      const mapped = newFriends.map((f, i) => ({
        id: `friend${friends.length + i + 1}` as import('../types/animal').FriendId,
        deviceId: f.deviceId,
        playerName: f.playerName,
        rank: f.rank,
      }))
      return { ...prev, friends: [...friends, ...mapped] }
    })
  }, [])

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
      useBoostStore.getState().setBoosts(data.boosts.speedBoostRemaining ?? 0, data.boosts.goldBoostRemaining ?? 0)
    }
    if (data.workData) {
      workDataRef.current = data.workData
      setWorkData(data.workData)
      SaveService.saveWorkData(data.workData)
    }
    setBoard(data.board)
    setGameState(data.gameState)
    useGoldStore.getState().setGold(data.gameState.gold ?? 0)
    useGoldStore.getState().setTotalEarned(data.gameState.totalEarned ?? 0)
    setResetKey(k => k + 1)
    mergeFriendsFromServer()
    return true
  }, [mergeFriendsFromServer]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    mergeFriendsFromServer,
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
    handleUpgradeInitialGold,
    doPrestige,
    doPrestigeKeepPoints,
    handlePrestige,
    handlePrestigeKeepPoints,
    handleAdComplete,
    handleToggleMute,
    handleHardReset,
    handleCloudSave,
    handleCloudLoad,
    handleTransferSave,
    handleTransferLoad,
    handleIssueInviteCode,
    handleSendFriendRequest,
    handleRecallFriend,
    handleRemoveFriend,
  }
}
