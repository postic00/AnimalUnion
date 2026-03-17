import { useCallback, useEffect, useRef, useState } from 'react'
import Board from './components/Board'
import Navigation from './components/Navigation'
import TabBar from './components/TabBar'
import BottomSheet from './components/BottomSheet'
import ProductionTab from './components/ProductionTab'
import FactoryTab from './components/FactoryTab'
import AnimalTab from './components/AnimalTab'
import PrestigeTab from './components/PrestigeTab'
import MaterialTab from './components/MaterialTab'
import SettingsTab from './components/SettingsTab'
import LeaderboardTab from './components/LeaderboardTab'
import Tutorial from './components/Tutorial'
import AdModal from './components/AdModal'
import PrestigeAdModal from './components/PrestigeAdModal'
import ConfirmModal from './components/ConfirmModal'
import { submitPrestigeScore, submitGoldScore, deleteScores } from './lib/supabase'
import { saveToCloud, loadFromCloud, fetchAndSaveWeekConfig } from './lib/userProfile'
import SplashScreen from './components/SplashScreen'
import { initialBoard } from './data/initialBoard'
import { initialGameState } from './types/gameState'
import { saveGame, loadGame, deleteSave, saveMuted, loadMuted, loadWeekConfig, saveWeekConfig, saveItems, saveFaStates } from './utils/saveLoad'
import { CONFIG, applyWeekConfig } from './config'

// 앱 시작 시 로컬에 저장된 주차 config 즉시 적용
const cachedWeekConfig = loadWeekConfig()
if (cachedWeekConfig) applyWeekConfig(cachedWeekConfig)
import { soundHamster, soundCat, soundCoin, soundBuild } from './utils/sound'
import { initAdMob } from './utils/admob'
import { initTossBackEvent, initTossVisibility, closeView } from './utils/toss'
import type { Board as BoardType, Cell } from './types/board'
import type { GameState } from './types/gameState'
import type { Factory } from './types/factory'
import { RECIPES } from './balance'
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
  getItemValueResetRefund,
  getAnimalResetRefund,
  getMaterialQuantityLevelCost,
  getMaterialQuantity,
  getClickerThreshold,
  getClickerUpgradeCost,
  getBufferUpgradeCost,
} from './balance'
import type { AnimalId } from './types/animal'

const GRADE_EMOJIS: Record<number, string> = {
  1: '🌶️', 2: '🧅', 3: '🧄', 4: '🫙', 5: '🍓',
  6: '🫒', 7: '🍢', 8: '🌰', 9: '🍇', 10: '🍯',
  11: '🧁', 12: '🍤', 13: '⭐', 14: '✨', 15: '🍲',
  16: '🍡', 17: '🫗', 18: '🍭', 19: '🥘', 20: '🏆',
}

function addBundle(board: BoardType): BoardType {
  const newBoard = board.map(row => [...row])

  const lastRow = newBoard[newBoard.length - 1]
  const reIndex = lastRow.findIndex(cell => cell.type === 'RE')
  if (reIndex !== -1) {
    lastRow[reIndex] = { type: 'RD' }
  }

  const goRight = reIndex === 0

  const rowA: Cell[] = goRight
    ? [{ type: 'RD' }, { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'EM' }]
    : [{ type: 'EM' }, { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'RD' }]

  const rowB: Cell[] = goRight
    ? [{ type: 'RR' }, { type: 'RR' }, { type: 'RR' }, { type: 'RR' }, { type: 'RR' }, { type: 'RR' }, { type: 'RE' }]
    : [{ type: 'RE' }, { type: 'RL' }, { type: 'RL' }, { type: 'RL' }, { type: 'RL' }, { type: 'RL' }, { type: 'RL' }]

  return [...newBoard, rowA, rowB]
}

function getConsistentBoard(savedBoard: BoardType | undefined, bundleCount: number): BoardType {
  const expectedRows = 4 + bundleCount * 2
  if (savedBoard && savedBoard.length === expectedRows) return savedBoard
  let board = initialBoard
  for (let i = 0; i < bundleCount; i++) board = addBundle(board)
  return board
}

function loadInitialState() {
  const saved = loadGame()
  const savedState = saved?.gameState ?? initialGameState
  if (!savedState.playerName) {
    savedState.playerName = `Player${Date.now().toString(36).toUpperCase()}`
  }
  if (savedState.totalPrestigePoints == null) {
    savedState.totalPrestigePoints = savedState.prestigePoints
  }
  return {
    board: getConsistentBoard(saved?.board, savedState.bundleCount),
    gameState: savedState,
    savedAt: saved?.savedAt ?? null,
    speedBoostUntil: saved?.boosts?.speedBoostUntil ?? 0,
    goldBoostUntil: saved?.boosts?.goldBoostUntil ?? 0,
  }
}

export default function App() {
  const [initData] = useState(loadInitialState)
  const [board, setBoard] = useState<BoardType>(initData.board)
  const [resetKey, setResetKey] = useState(0)
  const [gameState, setGameState] = useState<GameState>(initData.gameState)
  const [savedAt, setSavedAt] = useState<number | null>(initData.savedAt)
  const gameStateRef = useRef(gameState)
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  const earnedInSecRef = useRef(0)
  const bucketHistoryRef = useRef<number[]>([])
  const spawnClickerItemRef = useRef<((grade: number) => void) | null>(null)
  const [placingAnimalId, setPlacingAnimalId] = useState<AnimalId | null>(null)
  const [activeTab, setActiveTab] = useState<number | null>(null)
  const activeTabRef = useRef(activeTab)
  useEffect(() => { activeTabRef.current = activeTab }, [activeTab])
  const [lbMode, setLbMode] = useState<'prestige' | 'gold'>('prestige')
  const [prodSection, setProdSection] = useState<'production' | 'factory'>('production')
  const [animalType, setAnimalType] = useState<'hamster' | 'cat' | 'dog'>('hamster')
  const [prestigeSection, setPrestigeSection] = useState<'item' | 'buffer'>('item')
  const [clickerEmoji, setClickerEmoji] = useState('👆')
  const clickerGradeRef = useRef<number>(1)
  const spawnUnlockTimeRef = useRef<number>(0)
  const [muted, setMuted] = useState<boolean>(loadMuted())
  const [showSplash, setShowSplash] = useState(true)
  const handleSplashDone = useCallback(() => setShowSplash(false), [])
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('tutorialDone'))

  useEffect(() => { initAdMob() }, [])

  // 앱인토스: 뒤로가기 이벤트 처리
  useEffect(() => {
    let cleanup = () => {}
    initTossBackEvent(() => {
      if (activeTabRef.current !== null) {
        setActiveTab(null)
      } else {
        closeView()
      }
    }).then(fn => { cleanup = fn })
    return () => cleanup()
  }, [])

  // 앱인토스: 백그라운드 전환 시 사운드 중단
  useEffect(() => {
    return initTossVisibility(
      () => { mutedRef.current = true },
      () => { mutedRef.current = muted }
    )
  }, [muted])

  // 부스트
  const BOOST_MS = 10 * 60 * 1000
  const [speedBoostUntil, setSpeedBoostUntil] = useState(initData.speedBoostUntil)
  const [goldBoostUntil, setGoldBoostUntil] = useState(initData.goldBoostUntil)
  const [now, setNow] = useState(Date.now())
  const [adTarget, setAdTarget] = useState<'speed' | 'gold' | 'prestige' | null>(null)
  const [showPrestigeModal, setShowPrestigeModal] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const boardRef2 = useRef(board)
  const gameStateRef2 = useRef(gameState)
  useEffect(() => { boardRef2.current = board }, [board])
  useEffect(() => { gameStateRef2.current = gameState }, [gameState])

  useEffect(() => {
    const save = () => {
      saveGame(boardRef2.current, gameStateRef2.current, {
        speedBoostUntil: speedBoostUntilRef.current,
        goldBoostUntil: goldBoostUntilRef.current,
      })
      setSavedAt(Date.now())
    }
    const onVisibility = () => { if (document.hidden) save() }
    const interval = setInterval(save, 10_000)
    window.addEventListener('beforeunload', save)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', save)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const { playerName, totalEarned } = gameStateRef.current
      if (playerName) submitGoldScore(playerName, totalEarned)
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const WINDOW = 60
    const interval = setInterval(() => {
      const bucket = earnedInSecRef.current
      earnedInSecRef.current = 0
      bucketHistoryRef.current.push(bucket)
      if (bucketHistoryRef.current.length > WINDOW) {
        bucketHistoryRef.current.shift()
      }
      const total = bucketHistoryRef.current.reduce((a, b) => a + b, 0)
      const perSec = Math.round(total / bucketHistoryRef.current.length)
      setGameState(prev => ({ ...prev, goldPerSec: perSec }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const mutedRef = useRef(muted)
  mutedRef.current = muted

  const goldBoostUntilRef = useRef(goldBoostUntil)
  goldBoostUntilRef.current = goldBoostUntil
  const speedBoostUntilRef = useRef(speedBoostUntil)
  speedBoostUntilRef.current = speedBoostUntil

  const handleGoldEarned = useCallback((amount: number) => {
    const multiplier = Date.now() < goldBoostUntilRef.current ? 3 : 1
    const earned = amount * multiplier
    earnedInSecRef.current += earned
    setGameState(prev => ({ ...prev, gold: prev.gold + earned, totalEarned: prev.totalEarned + earned }))
    if (!mutedRef.current) soundCoin()
  }, [])

  const handleClickerClick = useCallback(() => {
    if (!mutedRef.current) soundHamster()
    const now = performance.now()
    setGameState(prev => {
      const { clickCount, threshold, level } = prev.clicker

      // 링 100% 상태: 스폰 잠금 해제 후 한 번 더 클릭 시 스폰
      if (clickCount >= threshold) {
        if (now < spawnUnlockTimeRef.current) return prev  // 아직 잠금 중 → 무시
        spawnClickerItemRef.current?.(clickerGradeRef.current)
        setTimeout(() => setClickerEmoji('👆'), 0)
        return { ...prev, clicker: { ...prev.clicker, clickCount: 0, threshold: CONFIG.CLICKER_THRESHOLD } }
      }

      const next = clickCount + 1

      if (clickCount === 0) {
        // 첫 클릭: 등급 결정
        const builtGrades = prev.producers.filter(p => p.built).map(p => p.grade)
        const grade = builtGrades.length > 0
          ? builtGrades[Math.floor(Math.random() * builtGrades.length)]
          : 1
        clickerGradeRef.current = grade
        setTimeout(() => setClickerEmoji(GRADE_EMOJIS[grade] ?? '🌶️'), 0)
      }

      // 매 클릭마다 현재 레벨로 threshold 재계산
      const grade = clickerGradeRef.current
      const quantity = getMaterialQuantity(prev.materialQuantityLevels[grade - 1] ?? 1)
      const newThreshold = getClickerThreshold(quantity, level)
      if (next >= newThreshold) spawnUnlockTimeRef.current = now + 250
      return { ...prev, clicker: { ...prev.clicker, clickCount: next, threshold: newThreshold } }
    })
  }, [])

  const handleUpgradeClicker = useCallback(() => {
    setGameState(prev => {
      const cost = getClickerUpgradeCost(prev.clicker.level)
      if (prev.gold < cost) return prev
      return {
        ...prev,
        gold: prev.gold - cost,
        clicker: { ...prev.clicker, level: prev.clicker.level + 1 },
      }
    })
  }, [])

  const handleBuildProducer = useCallback((index: number) => {
    setGameState(prev => {
      const cost = getProducerBuildCost()
      if (prev.gold < cost) return prev
      if (!mutedRef.current) soundBuild()
      const producers = [...prev.producers]
      producers[index] = { ...producers[index], built: true, level: 1 }
      return { ...prev, gold: prev.gold - cost, producers }
    })
  }, [])

  const handleUpgradeProducer = useCallback((index: number) => {
    setGameState(prev => {
      const producer = prev.producers[index]
      const cost = getProducerUpgradeCost(producer.level)
      if (prev.gold < cost) return prev
      if (!mutedRef.current) soundBuild()
      const producers = [...prev.producers]
      producers[index] = { ...producer, level: producer.level + 1 }
      return { ...prev, gold: prev.gold - cost, producers }
    })
  }, [])

  const handleAddBundle = () => {
    const cost = getBundleCost(gameState.bundleCount)
    if (gameState.gold < cost) return
    setGameState(prev => ({ ...prev, gold: prev.gold - cost, bundleCount: prev.bundleCount + 1 }))
    setBoard(prev => addBundle(prev))
  }

  const handleBuildFactory = useCallback((row: number, col: number) => {
    setGameState(prev => {
      const cost = getFactoryBuildCost()
      if (prev.gold < cost) return prev
      if (!mutedRef.current) soundBuild()
      const newFactory: Factory = {
        row, col, built: true, type: 'WA', grade: 1, level: 1, dir: 'UP_TO_DOWN', animalId: null,
      }
      return { ...prev, gold: prev.gold - cost, factories: [...prev.factories, newFactory] }
    })
  }, [])

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
  }, [])

  const handleSetFactoryDir = useCallback((row: number, col: number, dir: Factory['dir']) => {
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.row === row && f.col === col ? { ...f, dir } : f),
    }))
  }, [])

  const handleSetFactoryGrade = useCallback((row: number, col: number, grade: number) => {
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f =>
        f.row === row && f.col === col ? { ...f, grade } : f
      ),
    }))
  }, [])

  const handleUpgradeFactoryLevel = useCallback((row: number, col: number) => {
    setGameState(prev => {
      const factory = prev.factories.find(f => f.row === row && f.col === col)
      if (!factory) return prev
      const cost = getFactoryLevelUpgradeCost(factory.level)
      if (prev.gold < cost) return prev
      return {
        ...prev,
        gold: prev.gold - cost,
        factories: prev.factories.map(f =>
          f.row === row && f.col === col ? { ...f, level: f.level + 1 } : f
        ),
      }
    })
  }, [])

  const handleHardReset = useCallback(() => {
    deleteSave()
    localStorage.removeItem('tutorialDone')
    setBoard(initialBoard)
    setGameState(initialGameState)
    setResetKey(k => k + 1)
    setSavedAt(null)
    setActiveTab(null)
    setShowTutorial(true)
  }, [])

  const boardRef = useRef(board)
  useEffect(() => { boardRef.current = board }, [board])

  const platform = /android/i.test(navigator.userAgent) ? 'android' : /iphone|ipad/i.test(navigator.userAgent) ? 'ios' : 'web'

  const handleCloudSave = useCallback(async (): Promise<boolean> => {
    return await saveToCloud(gameStateRef.current.playerName, gameStateRef.current, boardRef.current, platform)
  }, [platform])

  const handleCloudLoad = useCallback(async (): Promise<boolean> => {
    const data = await loadFromCloud()
    if (!data) return false
    setBoard(data.board)
    setGameState(data.game_state)
    setResetKey(k => k + 1)
    return true
  }, [])

  const handleToggleMute = useCallback(() => {
    setMuted(prev => {
      saveMuted(!prev)
      return !prev
    })
  }, [])

  const doPrestige = useCallback(async (multiplier: number = 1) => {
    await fetchAndSaveWeekConfig()
    const weekConfig = loadWeekConfig()
    if (weekConfig) applyWeekConfig(weekConfig)

    if (!mutedRef.current) soundCat()
    saveItems([])
    saveFaStates({})
    setResetKey(k => k + 1)
    setBoard(initialBoard)

    const weekRate = CONFIG.WEEK > CONFIG.CURRENT_WEEK ? CONFIG.NEXT_WEEK_RATE : 1

    setGameState(prev => {
      const earned = getPrestigePoints(prev.totalEarned) * multiplier
      const newPrestigePoints = prev.prestigePoints + earned
      const newTotalPrestigePoints = (prev.totalPrestigePoints ?? prev.prestigePoints) + earned
      const newPrestigeCount = prev.prestigeCount + 1
      if (prev.playerName) {
        submitPrestigeScore(prev.playerName, newTotalPrestigePoints * weekRate, newPrestigeCount)
      }
      return {
        ...prev,
        gold: 0,
        goldPerSec: 0,
        bundleCount: 0,
        producers: initialGameState.producers,
        factories: prev.factories.map(f => ({ ...f, built: false, level: 1, grade: 1 })),
        totalEarned: 0,
        clicker: initialGameState.clicker,
        materialQuantityLevels: initialGameState.materialQuantityLevels,
        prestigeCount: newPrestigeCount,
        prestigePoints: newPrestigePoints,
        totalPrestigePoints: newTotalPrestigePoints,
        rsBufferLevel: prev.rsBufferLevel,
        faBufferLevel: prev.faBufferLevel,
      }
    })

    // 환생 후 CURRENT_WEEK = WEEK 저장 (이번 시즌 참여 표시)
    const updatedConfig = { ...(weekConfig ?? {}), CURRENT_WEEK: CONFIG.WEEK }
    saveWeekConfig(updatedConfig)
    applyWeekConfig(updatedConfig)
  }, [])

  const handlePrestige = useCallback(async () => {
    await fetchAndSaveWeekConfig()
    const weekConfig = loadWeekConfig()
    if (weekConfig) applyWeekConfig(weekConfig)
    setShowPrestigeModal(true)
  }, [])

  const handlePrestigeReset = useCallback(() => {
    setGameState(prev => {
      const refund = getItemValueResetRefund(prev.itemValueLevels) + getAnimalResetRefund(prev.animals)
      return {
        ...prev,
        prestigePoints: prev.prestigePoints + refund,
        itemValueLevels: initialGameState.itemValueLevels,
        animals: initialGameState.animals,
        clicker: initialGameState.clicker,
      }
    })
  }, [])

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
    }
  }, [adTarget, doPrestige])

  const handlePrestigeKeepPoints = useCallback(async () => {
    await fetchAndSaveWeekConfig()
    const weekConfig = loadWeekConfig()
    if (weekConfig) applyWeekConfig(weekConfig)

    saveItems([])
    saveFaStates({})
    setResetKey(k => k + 1)
    setBoard(initialBoard)

    const weekRate = CONFIG.WEEK > CONFIG.CURRENT_WEEK ? CONFIG.NEXT_WEEK_RATE : 1

    setGameState(prev => {
      const earned = getPrestigePoints(prev.totalEarned)
      const newTotalPrestigePoints = (prev.totalPrestigePoints ?? prev.prestigePoints) + earned
      const newPrestigeCount = prev.prestigeCount + 1
      if (prev.playerName) {
        submitPrestigeScore(prev.playerName, newTotalPrestigePoints * weekRate, newPrestigeCount)
      }
      return {
        ...prev,
        gold: initialGameState.gold,
        goldPerSec: 0,
        bundleCount: 0,
        producers: initialGameState.producers,
        factories: prev.factories.map(f => ({ ...f, built: false, level: 1, grade: 1 })),
        totalEarned: 0,
        clicker: initialGameState.clicker,
        materialQuantityLevels: initialGameState.materialQuantityLevels,
        prestigeCount: newPrestigeCount,
        totalPrestigePoints: newTotalPrestigePoints,
        rsBufferLevel: prev.rsBufferLevel,
        faBufferLevel: prev.faBufferLevel,
      }
    })

    // 환생 후 CURRENT_WEEK = WEEK 저장
    const updatedConfig = { ...(weekConfig ?? {}), CURRENT_WEEK: CONFIG.WEEK }
    saveWeekConfig(updatedConfig)
    applyWeekConfig(updatedConfig)
  }, [])

  const handleUnlockAnimal = useCallback((id: AnimalId) => {
    setGameState(prev => {
      const cost = getAnimalUnlockCost()
      if (prev.prestigePoints < cost) return prev
      return {
        ...prev,
        prestigePoints: prev.prestigePoints - cost,
        animals: prev.animals.map(a => a.id === id ? { ...a, unlocked: true } : a),
      }
    })
  }, [])

  const handleUpgradeAnimal = useCallback((id: AnimalId) => {
    setGameState(prev => {
      const animal = prev.animals.find(a => a.id === id)
      if (!animal || !animal.unlocked) return prev
      const cost = getAnimalUpgradeCost(animal.level)
      if (prev.prestigePoints < cost) return prev
      return {
        ...prev,
        prestigePoints: prev.prestigePoints - cost,
        animals: prev.animals.map(a => a.id === id ? { ...a, level: a.level + 1 } : a),
      }
    })
  }, [])

  const handleSetFactoryAnimal = useCallback((row: number, col: number, animalId: AnimalId | null) => {
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.row === row && f.col === col ? { ...f, animalId } : f),
    }))
  }, [])

  const handleStartPlacing = useCallback((id: AnimalId) => {
    setPlacingAnimalId(id)
    setActiveTab(null)
  }, [])

  const handlePlaceAnimal = useCallback((row: number, col: number) => {
    if (!placingAnimalId) return
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.row === row && f.col === col ? { ...f, animalId: placingAnimalId } : f),
    }))
    setPlacingAnimalId(null)
  }, [placingAnimalId])

  const handleRecallAnimal = useCallback((id: AnimalId) => {
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.animalId === id ? { ...f, animalId: null } : f),
    }))
  }, [])

  const handleLevelUpItemValue = useCallback((gradeIndex: number) => {
    setGameState(prev => {
      const level = prev.itemValueLevels[gradeIndex] ?? 1
      const cost = getItemValueLevelCost(level)
      if (prev.prestigePoints < cost) return prev
      const itemValueLevels = [...prev.itemValueLevels]
      itemValueLevels[gradeIndex] = level + 1
      return { ...prev, prestigePoints: prev.prestigePoints - cost, itemValueLevels }
    })
  }, [])

  const handleUpgradeMaterialQuantity = useCallback((gradeIndex: number) => {
    setGameState(prev => {
      const level = prev.materialQuantityLevels[gradeIndex] ?? 1
      const cost = getMaterialQuantityLevelCost(level)
      if (prev.gold < cost) return prev
      const materialQuantityLevels = [...prev.materialQuantityLevels]
      materialQuantityLevels[gradeIndex] = level + 1
      return { ...prev, gold: prev.gold - cost, materialQuantityLevels }
    })
  }, [])

  const handleUpgradeRsBuffer = useCallback(() => {
    setGameState(prev => {
      const cost = getBufferUpgradeCost(prev.rsBufferLevel)
      if (prev.prestigePoints < cost) return prev
      return { ...prev, prestigePoints: prev.prestigePoints - cost, rsBufferLevel: prev.rsBufferLevel + 1 }
    })
  }, [])

  const handleUpgradeFaBuffer = useCallback(() => {
    setGameState(prev => {
      const cost = getBufferUpgradeCost(prev.faBufferLevel)
      if (prev.prestigePoints < cost) return prev
      return { ...prev, prestigePoints: prev.prestigePoints - cost, faBufferLevel: prev.faBufferLevel + 1 }
    })
  }, [])

  const bundleCost = getBundleCost(gameState.bundleCount)

  const bgEmojis = [
    { emoji: '🍲', top: '6%',  left: '4%',  size: 38, rot: -15, op: 0.13 },
    { emoji: '🍡', top: '10%', left: '78%', size: 32, rot: 20,  op: 0.13 },
    { emoji: '🐹', top: '18%', left: '88%', size: 30, rot: -10, op: 0.15 },
    { emoji: '🌶️', top: '28%', left: '2%',  size: 28, rot: 30,  op: 0.12 },
    { emoji: '🐱', top: '38%', left: '90%', size: 34, rot: -20, op: 0.13 },
    { emoji: '🍲', top: '50%', left: '5%',  size: 42, rot: 12,  op: 0.12 },
    { emoji: '🐶', top: '60%', left: '82%', size: 30, rot: 8,   op: 0.14 },
    { emoji: '🍡', top: '70%', left: '8%',  size: 36, rot: -8,  op: 0.13 },
    { emoji: '🌶️', top: '78%', left: '88%', size: 26, rot: 25,  op: 0.12 },
    { emoji: '🐹', top: '86%', left: '3%',  size: 30, rot: -18, op: 0.14 },
    { emoji: '⭐', top: '44%', left: '94%', size: 22, rot: 0,   op: 0.15 },
    { emoji: '⭐', top: '22%', left: '1%',  size: 18, rot: 0,   op: 0.13 },
    { emoji: '🍡', top: '92%', left: '60%', size: 28, rot: 15,  op: 0.12 },
    { emoji: '🐱', top: '88%', left: '75%', size: 26, rot: 10,  op: 0.13 },
  ]

  return (
    <div style={{ minHeight: '100vh', paddingBottom: activeTab !== null ? 'calc(40vh + 68px + env(safe-area-inset-bottom))' : 'calc(68px + env(safe-area-inset-bottom))', position: 'relative', transition: 'padding-bottom 0.25s ease' }}>
      {/* 배경 이모지 레이어 */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {bgEmojis.map((item, i) => (
          <span key={i} style={{
            position: 'absolute',
            top: item.top,
            left: item.left,
            fontSize: item.size,
            opacity: item.op,
            transform: `rotate(${item.rot}deg)`,
            userSelect: 'none',
            lineHeight: 1,
          }}>{item.emoji}</span>
        ))}
      </div>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      {!showSplash && showTutorial && <Tutorial onClose={() => {
        localStorage.setItem('tutorialDone', '1')
        setShowTutorial(false)
      }} />}
      {!showSplash && <Navigation gameState={gameState} />}
      {!showSplash && <Board
        key={resetKey}
        board={board}
        onAddBundle={handleAddBundle}
        onGoldEarned={handleGoldEarned}
        bundleCost={bundleCost}
        canAddBundle={gameState.gold >= bundleCost}
        producers={gameState.producers}
        factories={gameState.factories}
        animals={gameState.animals}
        materialQuantityLevels={gameState.materialQuantityLevels}
        itemValueLevels={gameState.itemValueLevels}
        faBufferLevel={gameState.faBufferLevel}
        rsBufferLevel={gameState.rsBufferLevel}
        placingAnimalId={placingAnimalId}
        onPlaceAnimal={handlePlaceAnimal}
        onCancelPlacing={() => setPlacingAnimalId(null)}
        spawnClickerItemRef={spawnClickerItemRef}
        muted={muted}
        speedMultiplier={Date.now() < speedBoostUntil ? 2 : 1}
      />}
      {!showSplash && <TabBar
        clicker={gameState.clicker}
        clickerEmoji={clickerEmoji}
        onClickerClick={handleClickerClick}
        onTabChange={(tab) => {
          setActiveTab(tab)
          saveGame(board, gameState, { speedBoostUntil, goldBoostUntil })
          setSavedAt(Date.now())
        }}
        activeTab={activeTab}
        speedBoostUntil={speedBoostUntil}
        goldBoostUntil={goldBoostUntil}
        now={now}
        onSpeedBoost={() => { setAdTarget('speed'); }}
        onGoldBoost={() => { setAdTarget('gold'); }}
      />}
      {!showSplash && <BottomSheet
        open={activeTab !== null}
        onClose={() => setActiveTab(null)}
        header={
          activeTab === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>공장</h2>
              <div style={{ display: 'flex', gap: 6 }}>
                {([['production', '🌱 생산'], ['factory', '⚙️ 가공']] as const).map(([sec, label]) => (
                  <button
                    key={sec}
                    onClick={() => setProdSection(sec)}
                    style={{
                      padding: '4px 12px', borderRadius: 10, border: '1.5px solid',
                      borderColor: prodSection === sec ? '#16a34a' : '#e5e7eb',
                      background: prodSection === sec ? '#f0fdf4' : '#fff',
                      color: prodSection === sec ? '#16a34a' : '#9ca3af',
                      fontSize: 13, fontWeight: 800, cursor: 'pointer',
                    }}
                  >{label}</button>
                ))}
              </div>
            </div>
          ) : activeTab === 2 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>동물</h2>
              <div style={{ display: 'flex', gap: 6 }}>
                {([['hamster', '🐹 햄스터'], ['cat', '🐱 고양이'], ['dog', '🐶 강아지']] as const).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => setAnimalType(type)}
                    style={{
                      padding: '4px 10px', borderRadius: 10, border: '1.5px solid',
                      borderColor: animalType === type ? '#6366f1' : '#e5e7eb',
                      background: animalType === type ? '#eef2ff' : '#fff',
                      color: animalType === type ? '#6366f1' : '#9ca3af',
                      fontSize: 12, fontWeight: 800, cursor: 'pointer',
                    }}
                  >{label}</button>
                ))}
              </div>
            </div>
          ) : activeTab === 3 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>환생</h2>
              <div style={{ display: 'flex', gap: 6 }}>
                {([['item', '📦 아이템'], ['buffer', '🏭 저장소']] as const).map(([sec, label]) => (
                  <button
                    key={sec}
                    onClick={() => setPrestigeSection(sec)}
                    style={{
                      padding: '4px 10px', borderRadius: 10, border: '1.5px solid',
                      borderColor: prestigeSection === sec ? '#f59e0b' : '#e5e7eb',
                      background: prestigeSection === sec ? '#fffbeb' : '#fff',
                      color: prestigeSection === sec ? '#d97706' : '#9ca3af',
                      fontSize: 12, fontWeight: 800, cursor: 'pointer',
                    }}
                  >{label}</button>
                ))}
              </div>
            </div>
          ) : activeTab === 4 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>순위</h2>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280' }}>{CONFIG.CURRENT_WEEK}시즌</span>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setLbMode('prestige')}
                  style={{
                    padding: '4px 12px', borderRadius: 10, border: '1.5px solid',
                    borderColor: lbMode === 'prestige' ? '#6366f1' : '#e5e7eb',
                    background: lbMode === 'prestige' ? '#eef2ff' : '#fff',
                    color: lbMode === 'prestige' ? '#6366f1' : '#9ca3af',
                    fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  }}
                >⭐ 환생</button>
                <button
                  onClick={() => setLbMode('gold')}
                  style={{
                    padding: '4px 12px', borderRadius: 10, border: '1.5px solid',
                    borderColor: lbMode === 'gold' ? '#6366f1' : '#e5e7eb',
                    background: lbMode === 'gold' ? '#eef2ff' : '#fff',
                    color: lbMode === 'gold' ? '#6366f1' : '#9ca3af',
                    fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  }}
                >💰 골드</button>
              </div>
            </div>
          ) : (
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>
              {['공장', '재료 관리', '동물', '환생', '', '설정'][activeTab ?? 0]}
            </h2>
          )
        }
      >
        {activeTab === 0 && prodSection === 'production' && (
          <ProductionTab
            producers={gameState.producers}
            gold={gameState.gold}
            materialQuantityLevels={gameState.materialQuantityLevels}
            clicker={gameState.clicker}
            onBuild={handleBuildProducer}
            onUpgrade={handleUpgradeProducer}
            onUpgradeClicker={handleUpgradeClicker}
          />
        )}
        {activeTab === 0 && prodSection === 'factory' && (
          <FactoryTab
            board={board}
            factories={gameState.factories}
            gold={gameState.gold}
            onBuild={handleBuildFactory}
            onSetType={handleSetFactoryType}
            onSetDir={handleSetFactoryDir}
            onSetGrade={handleSetFactoryGrade}
            onUpgradeLevel={handleUpgradeFactoryLevel}
            onSetAnimal={handleSetFactoryAnimal}
            animals={gameState.animals}
            maxGrade={20}
          />
        )}
        {activeTab === 1 && (
          <MaterialTab
            gameState={gameState}
            onUpgradeQuantity={handleUpgradeMaterialQuantity}
          />
        )}
        {activeTab === 2 && (
          <AnimalTab
            gameState={gameState}
            animalType={animalType}
            onUnlockAnimal={handleUnlockAnimal}
            onUpgradeAnimal={handleUpgradeAnimal}
            onStartPlacing={handleStartPlacing}
            onRecallAnimal={handleRecallAnimal}
          />
        )}
        {activeTab === 3 && (
          <PrestigeTab
            gameState={gameState}
            section={prestigeSection}
            onPrestige={handlePrestige}
            onPrestigeReset={handlePrestigeReset}
            onPrestigeKeepPoints={handlePrestigeKeepPoints}
            onLevelUpItemValue={handleLevelUpItemValue}
            onUpgradeRsBuffer={handleUpgradeRsBuffer}
            onUpgradeFaBuffer={handleUpgradeFaBuffer}
          />
        )}
        {activeTab === 4 && (
          <LeaderboardTab
            playerName={gameState.playerName}
            mode={lbMode}
            onNameChange={name => {
              const { playerName: oldName, prestigePoints, prestigeCount, totalEarned } = gameStateRef.current
              setGameState(prev => ({ ...prev, playerName: name }))
              deleteScores(oldName).then(() => {
                submitPrestigeScore(name, prestigePoints, prestigeCount)
                submitGoldScore(name, totalEarned)
              })
            }}
          />
        )}
        {activeTab === 5 && (
          <SettingsTab
            savedAt={savedAt}
            muted={muted}
            onToggleMute={handleToggleMute}
            onCloudSave={handleCloudSave}
            onCloudLoad={handleCloudLoad}
            onHardReset={() => setShowResetConfirm(true)}
            onShowTutorial={() => { setActiveTab(null); setShowTutorial(true) }}
          />
        )}
      </BottomSheet>}

      {/* 광고 모달 */}
      {adTarget !== null && (
        <AdModal
          onComplete={handleAdComplete}
          onClose={() => setAdTarget(null)}
        />
      )}

      {/* 환생 모달 */}
      {showPrestigeModal && (
        <PrestigeAdModal
          earned={getPrestigePoints(gameState.totalEarned)}
          currentPoints={gameState.totalPrestigePoints ?? gameState.prestigePoints}
          onPrestige={() => { setShowPrestigeModal(false); doPrestige(1) }}
          onWatchAd={() => { setAdTarget('prestige') }}
          onClose={() => setShowPrestigeModal(false)}
        />
      )}

      {/* 초기화 확인 */}
      {showResetConfirm && (
        <ConfirmModal
          title="게임 초기화"
          message={'모든 데이터가 삭제됩니다.\n정말 초기화하시겠습니까?'}
          confirmLabel="초기화"
          onConfirm={() => { setShowResetConfirm(false); handleHardReset() }}
          onClose={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  )
}
