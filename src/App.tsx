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
import FactoryInfoModal from './components/FactoryInfoModal'
import FactoryBuildModal from './components/FactoryBuildModal'
import ProducerInfoModal from './components/ProducerInfoModal'
import UpgradeAmountToggle from './components/UpgradeAmountToggle'
import type { UpgradeAmount } from './components/UpgradeAmountToggle'
import { initialBoard } from './data/initialBoard'
import { initialGameState } from './types/gameState'
import { saveGame, loadGame, deleteSave, saveMuted, loadMuted, loadWeekConfig, saveWeekConfig, saveItems, saveFaStates, getDeviceId } from './utils/saveLoad'
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
import { AnimalSvg } from './components/AnimalSvg'
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
  getMaterialQuantityLevelCost,
  getMaterialQuantity,
  getClickerThreshold,
  getClickerUpgradeCost,
  getBufferUpgradeCost,
  getRailSpeedUpgradeCost,
} from './balance'
import type { AnimalId } from './types/animal'

function addBundle(board: BoardType): BoardType {
  const newBoard = board.map(row => [...row])

  const lastRow = newBoard[newBoard.length - 1]
  const reIndex = lastRow.findIndex(cell => cell.type === 'RE')
  if (reIndex !== -1) {
    // RE → RDL (왼쪽에서 와서 아래로) or RDR (오른쪽에서 와서 아래로)
    lastRow[reIndex] = { type: reIndex === 0 ? 'RDL' : 'RDR' }
  }

  const goRight = reIndex === 0

  const rowA: Cell[] = goRight
    ? [{ type: 'RDN' }, { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'EM' }]
    : [{ type: 'EM' }, { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'EM' }, { type: 'FA' }, { type: 'RDN' }]

  const rowB: Cell[] = goRight
    ? [{ type: 'RRL' }, { type: 'RRN' }, { type: 'RRN' }, { type: 'RRN' }, { type: 'RRN' }, { type: 'RRN' }, { type: 'RE' }]
    : [{ type: 'RE' }, { type: 'RLN' }, { type: 'RLN' }, { type: 'RLN' }, { type: 'RLN' }, { type: 'RLN' }, { type: 'RLR' }]

  return [...newBoard, rowA, rowB]
}

function getConsistentBoard(bundleCount: number): BoardType {
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
    board: getConsistentBoard(savedState.bundleCount),
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
  const [gold, setGold] = useState(() => !localStorage.getItem('tutorialDone') ? Math.max(initData.gameState.gold, 100) : initData.gameState.gold)
  const [totalEarned, setTotalEarned] = useState(initData.gameState.totalEarned)
  const [goldPerSec, setGoldPerSec] = useState(0)
  const [savedAt, setSavedAt] = useState<number | null>(initData.savedAt)
  const gameStateRef = useRef(gameState)
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  const goldRef = useRef(gold)
  goldRef.current = gold
  const totalEarnedRef = useRef(totalEarned)
  totalEarnedRef.current = totalEarned
  const earnedInSecRef = useRef(0)
  const goldBufferRef = useRef(0)
  const totalEarnedBufferRef = useRef(0)
  const bucketHistoryRef = useRef<number[]>([])
  const spawnClickerItemRef = useRef<((grade: number) => void) | null>(null)
  const boardSaveRef = useRef<() => void>(() => {})
  const [placingAnimalId, setPlacingAnimalId] = useState<AnimalId | null>(null)
  const [activeTab, setActiveTab] = useState<number | null>(null)
  const activeTabRef = useRef(activeTab)
  useEffect(() => { activeTabRef.current = activeTab }, [activeTab])
  const [focusFactory, setFocusFactory] = useState<{ row: number; col: number } | null>(null)
  const [selectedFactory, setSelectedFactory] = useState<{ row: number; col: number } | null>(null)
  const [selectedProducer, setSelectedProducer] = useState<{ row: number; col: number } | null>(null)
  const [upgradeAmount, setUpgradeAmount] = useState<UpgradeAmount>(1)
  const faLiveStatesRef = useRef<import('./hooks/useGameLoop').FALiveStates>({})
  const [lbMode, setLbMode] = useState<'prestige' | 'gold'>('prestige')
  const [prodSection, setProdSection] = useState<'production' | 'factory'>('production')
  const [animalType, setAnimalType] = useState<'hamster' | 'cat' | 'dog'>('hamster')
  const [prestigeSection, setPrestigeSection] = useState<'item' | 'buffer'>('item')
  const [clickerGrade, setClickerGrade] = useState(0)  // 0 = 손가락(기본)
  const clickerGradeRef = useRef<number>(1)
  const spawnUnlockTimeRef = useRef<number>(0)
  const [muted, setMuted] = useState<boolean>(loadMuted())
  const [showSplash, setShowSplash] = useState(true)
  const handleSplashDone = useCallback(() => setShowSplash(false), [])
  const [tutorialStep, setTutorialStep] = useState<number | null>(() => !localStorage.getItem('tutorialDone') ? 0 : null)
  const [tutorialItemCount, setTutorialItemCount] = useState(0)

  useEffect(() => {
    if (tutorialStep === 0 && tutorialItemCount >= 1) setTutorialStep(1)
  }, [tutorialItemCount, tutorialStep])

  useEffect(() => {
    const s = tutorialStep
    if (s === null) return
    if ([3, 6, 8, 11, 13, 19, 21, 23].includes(s)) setActiveTab(null)
    if (s === 14) { setActiveTab(0); setProdSection('production') }
    if (s === 20) { setActiveTab(0); setProdSection('production') }
  }, [tutorialStep])

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
  const [adTarget, setAdTarget] = useState<'speed' | 'gold' | 'prestige' | 'prestigeKeep' | null>(null)
  const [showPrestigeModal, setShowPrestigeModal] = useState(false)
  const [showPrestigeKeepModal, setShowPrestigeKeepModal] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const boardRef2 = useRef(board)
  const gameStateRef2 = useRef(gameState)
  useEffect(() => { boardRef2.current = board }, [board])
  useEffect(() => { gameStateRef2.current = gameState }, [gameState])

  const lastSavedSnapshotRef = useRef<string>('')

  // 통합 인터벌: 100ms 기준, tick 카운터로 주기별 작업 분기
  useEffect(() => {
    const WINDOW = 60
    const getSnapshot = () => JSON.stringify({
      ...gameStateRef2.current,
      gold: goldRef.current,
      totalEarned: totalEarnedRef.current,
    })
    const save = (force = false) => {
      const snapshot = getSnapshot()
      if (!force && snapshot === lastSavedSnapshotRef.current) return
      lastSavedSnapshotRef.current = snapshot
      saveGame(boardRef2.current, { ...gameStateRef2.current, gold: goldRef.current, totalEarned: totalEarnedRef.current, goldPerSec }, {
        speedBoostUntil: speedBoostUntilRef.current,
        goldBoostUntil: goldBoostUntilRef.current,
      })
      boardSaveRef.current()
      setSavedAt(Date.now())
    }
    const onVisibility = () => { if (document.hidden) save(true) }
    const onUnload = () => save()
    window.addEventListener('beforeunload', onUnload)
    document.addEventListener('visibilitychange', onVisibility)

    let tick = 0
    const interval = setInterval(() => {
      tick++

      // 100ms: 골드 버퍼 flush
      const g = goldBufferRef.current
      const t = totalEarnedBufferRef.current
      if (g > 0) {
        goldBufferRef.current = 0
        totalEarnedBufferRef.current = 0
        setGold(prev => prev + g)
        setTotalEarned(prev => prev + t)
      }

      // 500ms: 부스트 타이머 갱신
      if (tick % 5 === 0) setNow(Date.now())

      // 1000ms: 초당 골드 계산
      if (tick % 10 === 0) {
        const bucket = earnedInSecRef.current
        earnedInSecRef.current = 0
        bucketHistoryRef.current.push(bucket)
        if (bucketHistoryRef.current.length > WINDOW) bucketHistoryRef.current.shift()
        const total = bucketHistoryRef.current.reduce((a, b) => a + b, 0)
        const len = bucketHistoryRef.current.length
        setGoldPerSec(len > 0 ? Math.round(total / len) : 0)
      }

      // 60000ms: 저장 + 리더보드 업로드
      if (tick % 600 === 0) {
        save()
        const { playerName } = gameStateRef.current
        if (playerName) submitGoldScore(getDeviceId(), playerName, totalEarnedRef.current)
        tick = 0
      }
    }, 100)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', onUnload)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const mutedRef = useRef(muted)
  mutedRef.current = muted

  const goldBoostUntilRef = useRef(goldBoostUntil)
  goldBoostUntilRef.current = goldBoostUntil
  const speedBoostUntilRef = useRef(speedBoostUntil)
  speedBoostUntilRef.current = speedBoostUntil

  const handleGoldEarned = useCallback((amount: number) => {
    if (!isFinite(amount) || amount <= 0) return
    const multiplier = Date.now() < goldBoostUntilRef.current ? 3 : 1
    const earned = amount * multiplier
    earnedInSecRef.current += earned
    goldBufferRef.current += earned
    totalEarnedBufferRef.current += earned
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
        setTutorialItemCount(c => c + 1)

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
        setTimeout(() => setClickerGrade(grade), 0)
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
      if (goldRef.current < cost) return prev
      setGold(g => g - cost)
      return {
        ...prev,
        clicker: { ...prev.clicker, level: prev.clicker.level + 1 },
      }
    })
  }, [])

  const handleBuildProducer = useCallback((index: number) => {
    setGameState(prev => {
      const builtCount = prev.producers.filter(p => p.built).length
      const cost = getProducerBuildCost(builtCount)
      if (goldRef.current < cost) return prev
      if (!mutedRef.current) soundBuild()
      setGold(g => g - cost)
      const producers = [...prev.producers]
      producers[index] = { ...producers[index], built: true, level: 1 }
      return { ...prev, producers }
    })
    if (tutorialStep === 9) {
      setTutorialStep(10)
      setSelectedProducer(null)
    }
  }, [tutorialStep])

  const handleUpgradeProducer = useCallback((index: number, amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const producer = prev.producers[index]
      if (!producer) return prev
      let goldAmt = goldRef.current
      let level = producer.level
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      let spent = 0
      while (count < limit) {
        const cost = getProducerUpgradeCost(level)
        if (goldAmt < cost) break
        goldAmt -= cost
        spent += cost
        level++
        count++
      }
      if (count === 0) return prev
      if (!mutedRef.current) soundBuild()
      setGold(g => g - spent)
      const producers = [...prev.producers]
      producers[index] = { ...producer, level }
      return { ...prev, producers }
    })
  }, [])

  const handleAddBundle = useCallback(() => {
    setGameState(prev => {
      const cost = getBundleCost(prev.bundleCount)
      if (goldRef.current < cost) return prev
      setGold(g => g - cost)
      setBoard(b => addBundle(b))
      return { ...prev, bundleCount: prev.bundleCount + 1 }
    })
  }, [])

  const handleBuildFactory = useCallback((row: number, col: number) => {
    setGameState(prev => {
      const cost = getFactoryBuildCost()
      if (goldRef.current < cost) return prev
      if (!mutedRef.current) soundBuild()
      setGold(g => g - cost)
      const newFactory: Factory = {
        row, col, built: true, type: 'WA', grade: 1, level: 1, dir: 'UP_TO_DOWN', animalId: null,
      }
      return { ...prev, factories: [...prev.factories, newFactory] }
    })
    if (tutorialStep === 4) {
      setTutorialStep(5)
      setSelectedFactory(null)
    }
  }, [tutorialStep])

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

  const handleUpgradeFactoryLevel = useCallback((row: number, col: number, amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const factory = prev.factories.find(f => f.row === row && f.col === col)
      if (!factory) return prev
      let goldAmt = goldRef.current
      let level = factory.level
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      let spent = 0
      while (count < limit) {
        const cost = getFactoryLevelUpgradeCost(level)
        if (goldAmt < cost) break
        goldAmt -= cost
        spent += cost
        level++
        count++
      }
      if (count === 0) return prev
      if (!mutedRef.current) soundBuild()
      setGold(g => g - spent)
      return { ...prev, factories: prev.factories.map(f => f.row === row && f.col === col ? { ...f, level } : f) }
    })
  }, [])

  const handleHardReset = useCallback(() => {
    deleteScores(getDeviceId())
    deleteSave()
    localStorage.removeItem('tutorialDone')
    localStorage.removeItem('animal-union-week-config')
    setBoard(initialBoard)
    setGameState({ ...initialGameState, playerName: `Player${Date.now().toString(36).toUpperCase()}` })
    setGold(100)
    setTotalEarned(0)
    setGoldPerSec(0)
    setResetKey(k => k + 1)
    setSavedAt(null)
    setActiveTab(null)
    setTutorialStep(0)
    setTutorialItemCount(0)
    setShowSplash(true)
  }, [])

  const boardRef = useRef(board)
  useEffect(() => { boardRef.current = board }, [board])

  const platform = /android/i.test(navigator.userAgent) ? 'android' : /iphone|ipad/i.test(navigator.userAgent) ? 'ios' : 'web'

  const handleCloudSave = useCallback(async (): Promise<boolean> => {
    const fullState = { ...gameStateRef.current, gold: goldRef.current, totalEarned: totalEarnedRef.current, goldPerSec }
    return await saveToCloud(gameStateRef.current.playerName, fullState, boardRef.current, platform)
  }, [platform, goldPerSec])

  const handleCloudLoad = useCallback(async (): Promise<boolean> => {
    const data = await loadFromCloud()
    if (!data || !Array.isArray(data.board) || !data.game_state || typeof data.game_state !== 'object') return false
    setBoard(data.board)
    setGameState(data.game_state)
    setGold(data.game_state.gold ?? 0)
    setTotalEarned(data.game_state.totalEarned ?? 0)
    setGoldPerSec(data.game_state.goldPerSec ?? 0)
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
    const safeMultiplier = isFinite(multiplier) && multiplier > 0 ? multiplier : 1
    await fetchAndSaveWeekConfig()
    const weekConfig = loadWeekConfig()
    if (weekConfig) applyWeekConfig(weekConfig)

    const isNewSeason = CONFIG.WEEK > CONFIG.CURRENT_WEEK

    if (!mutedRef.current) soundCat()
    saveItems([])
    saveFaStates({})
    setResetKey(k => k + 1)
    setBoard(initialBoard)

    const weekRate = isNewSeason ? CONFIG.NEXT_WEEK_RATE : 1

    setGold(0)
    setTotalEarned(0)
    setGoldPerSec(0)

    setGameState(prev => {
      const earned = getPrestigePoints(totalEarnedRef.current) * safeMultiplier
      const newTotalPrestigePoints = (prev.totalPrestigePoints ?? prev.prestigePoints) + earned
      const newPrestigeCount = prev.prestigeCount + 1
      if (prev.playerName) {
        submitPrestigeScore(getDeviceId(), prev.playerName, newTotalPrestigePoints * weekRate, newPrestigeCount)
      }
      const resetBase = {
        ...prev,
        gold: 0,
        goldPerSec: 0,
        bundleCount: 0,
        producers: initialGameState.producers,
        factories: initialGameState.factories,
        totalEarned: 0,
        clicker: initialGameState.clicker,
        materialQuantityLevels: initialGameState.materialQuantityLevels,
        itemValueLevels: initialGameState.itemValueLevels,
        animals: initialGameState.animals,
        rsBufferLevel: initialGameState.rsBufferLevel,
        faBufferLevel: initialGameState.faBufferLevel,
        railSpeedLevel: initialGameState.railSpeedLevel,
        prestigeCount: newPrestigeCount,
        totalPrestigePoints: newTotalPrestigePoints,
      }
      if (isNewSeason) {
        // 새 시즌: 전부 리셋, 총 누적 포인트에 weekRate 패널티 적용
        return { ...resetBase, prestigePoints: Math.floor(newTotalPrestigePoints * weekRate) }
      }
      // 같은 시즌: 전부 리셋 + 쓴 포인트 환불
      return { ...resetBase, prestigePoints: newTotalPrestigePoints }
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


  const doPrestigeKeepPoints = useCallback(async (multiplier: number = 1) => {
    const safeMultiplier = isFinite(multiplier) && multiplier > 0 ? multiplier : 1
    await fetchAndSaveWeekConfig()
    const weekConfig = loadWeekConfig()
    if (weekConfig) applyWeekConfig(weekConfig)

    if (!mutedRef.current) soundCat()
    saveItems([])
    saveFaStates({})
    setResetKey(k => k + 1)
    setBoard(initialBoard)

    const weekRate = CONFIG.WEEK > CONFIG.CURRENT_WEEK ? CONFIG.NEXT_WEEK_RATE : 1

    setGold(0)
    setTotalEarned(0)
    setGoldPerSec(0)

    setGameState(prev => {
      const earned = getPrestigePoints(totalEarnedRef.current) * safeMultiplier
      const newTotalPrestigePoints = (prev.totalPrestigePoints ?? prev.prestigePoints) + earned
      const newPrestigeCount = prev.prestigeCount + 1
      if (prev.playerName) {
        submitPrestigeScore(getDeviceId(), prev.playerName, newTotalPrestigePoints * weekRate, newPrestigeCount)
      }
      const keptPoints = Math.floor(prev.prestigePoints * weekRate) + earned
      return {
        ...prev,
        gold: 0,
        goldPerSec: 0,
        bundleCount: 0,
        producers: initialGameState.producers,
        factories: initialGameState.factories,
        totalEarned: 0,
        clicker: initialGameState.clicker,
        materialQuantityLevels: initialGameState.materialQuantityLevels,
        prestigePoints: keptPoints,
        prestigeCount: newPrestigeCount,
        totalPrestigePoints: newTotalPrestigePoints,
        rsBufferLevel: prev.rsBufferLevel,
        faBufferLevel: prev.faBufferLevel,
      }
    })

    const updatedConfig = { ...(weekConfig ?? {}), CURRENT_WEEK: CONFIG.WEEK }
    saveWeekConfig(updatedConfig)
    applyWeekConfig(updatedConfig)
  }, [])

  const handlePrestigeKeepPoints = useCallback(() => {
    setShowPrestigeKeepModal(true)
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
    } else if (target === 'prestigeKeep') {
      setShowPrestigeKeepModal(false)
      doPrestigeKeepPoints(2)
    }
  }, [adTarget, doPrestige, doPrestigeKeepPoints])

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

  const handleUpgradeAnimal = useCallback((id: AnimalId, amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      const animal = prev.animals.find(a => a.id === id)
      if (!animal || !animal.unlocked) return prev
      let points = prev.prestigePoints
      let level = animal.level
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      while (count < limit) {
        const cost = getAnimalUpgradeCost(level)
        if (points < cost) break
        points -= cost
        level++
        count++
      }
      if (count === 0) return prev
      return {
        ...prev,
        prestigePoints: points,
        animals: prev.animals.map(a => a.id === id ? { ...a, level } : a),
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

  const handleCancelPlacing = useCallback(() => setPlacingAnimalId(null), [])

  const handleFactoryClick = useCallback((row: number, col: number) => {
    setSelectedFactory({ row, col })
    if (tutorialStep === 3) setTutorialStep(4)
    if (tutorialStep === 6) setTutorialStep(7)
  }, [tutorialStep])

  const handleFaLiveStateChange = useCallback((states: import('./hooks/useGameLoop').FALiveStates) => {
    faLiveStatesRef.current = states
  }, [])

  const handleProducerClick = useCallback((row: number, col: number) => {
    setSelectedProducer({ row, col })
    if (tutorialStep === 8) setTutorialStep(9)
    if (tutorialStep === 11) setTutorialStep(12)
  }, [tutorialStep])

  const handleRecallAnimal = useCallback((id: AnimalId) => {
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.animalId === id ? { ...f, animalId: null } : f),
    }))
  }, [])

  const handleLevelUpItemValue = useCallback((gradeIndex: number, amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      let points = prev.prestigePoints
      let level = prev.itemValueLevels[gradeIndex] ?? 1
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      while (count < limit) {
        const cost = getItemValueLevelCost(level)
        if (points < cost) break
        points -= cost
        level++
        count++
      }
      if (count === 0) return prev
      const itemValueLevels = [...prev.itemValueLevels]
      itemValueLevels[gradeIndex] = level
      return { ...prev, prestigePoints: points, itemValueLevels }
    })
  }, [])

  const handleUpgradeMaterialQuantity = useCallback((gradeIndex: number, amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      let goldAmt = goldRef.current
      let level = prev.materialQuantityLevels[gradeIndex] ?? 1
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      let spent = 0
      while (count < limit) {
        const cost = getMaterialQuantityLevelCost(level)
        if (goldAmt < cost) break
        goldAmt -= cost
        spent += cost
        level++
        count++
      }
      if (count === 0) return prev
      setGold(g => g - spent)
      const materialQuantityLevels = [...prev.materialQuantityLevels]
      materialQuantityLevels[gradeIndex] = level
      return { ...prev, materialQuantityLevels }
    })
  }, [])

  const handleUpgradeRsBuffer = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      let points = prev.prestigePoints
      let level = prev.rsBufferLevel
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      while (count < limit) {
        const cost = getBufferUpgradeCost(level)
        if (points < cost) break
        points -= cost
        level++
        count++
      }
      if (count === 0) return prev
      return { ...prev, prestigePoints: points, rsBufferLevel: level }
    })
  }, [])

  const handleUpgradeFaBuffer = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      let points = prev.prestigePoints
      let level = prev.faBufferLevel
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      while (count < limit) {
        const cost = getBufferUpgradeCost(level)
        if (points < cost) break
        points -= cost
        level++
        count++
      }
      if (count === 0) return prev
      return { ...prev, prestigePoints: points, faBufferLevel: level }
    })
  }, [])

  const handleUpgradeRailSpeed = useCallback((amount: UpgradeAmount = 1) => {
    setGameState(prev => {
      let points = prev.prestigePoints
      let level = prev.railSpeedLevel ?? 1
      const limit = amount === 'MAX' ? Infinity : amount
      let count = 0
      while (count < limit) {
        if (level >= CONFIG.RAIL_SPEED_MAX_LEVEL) break
        const cost = getRailSpeedUpgradeCost(level)
        if (points < cost) break
        points -= cost
        level++
        count++
      }
      if (count === 0) return prev
      return { ...prev, prestigePoints: points, railSpeedLevel: level }
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
      {!showSplash && tutorialStep !== null && <Tutorial
        step={tutorialStep}
        itemCount={tutorialItemCount}
        onNext={() => {
          if (tutorialStep === 24) {
            localStorage.setItem('tutorialDone', '1')
            setTutorialStep(null)
          } else {
            setTutorialStep(s => s !== null ? s + 1 : null)
          }
        }}
        onFactoryTabClick={() => { setActiveTab(0); setProdSection('production'); setTutorialStep(14) }}
        onSkip={() => {
          localStorage.setItem('tutorialDone', '1')
          setTutorialStep(null)
        }}
      />}
      {!showSplash && <Navigation gold={gold} goldPerSec={goldPerSec} prestigePoints={gameState.prestigePoints} totalPrestigePoints={gameState.totalPrestigePoints} />}
      {!showSplash && (tutorialStep === 3 || tutorialStep === 6 || tutorialStep === 8 || tutorialStep === 11) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 23, background: 'rgba(0,0,0,0.65)', pointerEvents: 'none' }} />
      )}
      {!showSplash && <div style={(tutorialStep === 3 || tutorialStep === 6 || tutorialStep === 8 || tutorialStep === 11) ? { position: 'relative', zIndex: 24 } : undefined}><Board
        key={resetKey}
        board={board}
        onAddBundle={handleAddBundle}
        onGoldEarned={handleGoldEarned}
        bundleCost={bundleCost}
        canAddBundle={gold >= bundleCost}
        producers={gameState.producers}
        factories={gameState.factories}
        animals={gameState.animals}
        materialQuantityLevels={gameState.materialQuantityLevels}
        itemValueLevels={gameState.itemValueLevels}
        faBufferLevel={gameState.faBufferLevel}
        rsBufferLevel={gameState.rsBufferLevel}
        railSpeedLevel={gameState.railSpeedLevel ?? 1}
        placingAnimalId={placingAnimalId}
        onPlaceAnimal={handlePlaceAnimal}
        onCancelPlacing={handleCancelPlacing}
        spawnClickerItemRef={spawnClickerItemRef}
        onSaveRef={boardSaveRef}
        muted={muted}
        speedMultiplier={Date.now() < speedBoostUntil ? 2 : 1}
        onFactoryClick={handleFactoryClick}
        onProducerClick={handleProducerClick}
        onFaLiveStateChange={handleFaLiveStateChange}
        tutorialHighlight={
          (tutorialStep === 3 || tutorialStep === 6) ? 'fa' :
          (tutorialStep === 8 || tutorialStep === 11) ? 'rs' : undefined
        }
      /></div>}
      {!showSplash && <TabBar
        clicker={gameState.clicker}
        clickerGrade={clickerGrade}
        onClickerClick={handleClickerClick}
        onTabChange={(tab) => {
          setActiveTab(tab)
          saveGame(board, { ...gameState, gold, totalEarned, goldPerSec }, { speedBoostUntil, goldBoostUntil })
          setSavedAt(Date.now())
          if (tutorialStep === 15 && tab === 1) setTutorialStep(16)
          if (tutorialStep === 16 && tab === 2) setTutorialStep(17)
          if (tutorialStep === 17 && tab === 3) setTutorialStep(18)
          if (tutorialStep === 18 && tab === 4) setTutorialStep(19)
          if (tutorialStep === 21 && tab === 3) setTutorialStep(22)
          if (tutorialStep === 23 && tab === 4) setTutorialStep(24)
        }}
        activeTab={activeTab}
        tutorialHighlightTab={
          tutorialStep === 13 ? 0 :
          tutorialStep === 15 ? 1 :
          tutorialStep === 16 ? 2 :
          (tutorialStep === 17 || tutorialStep === 21) ? 3 :
          (tutorialStep === 18 || tutorialStep === 23) ? 4 : undefined
        }
        speedBoostUntil={speedBoostUntil}
        goldBoostUntil={goldBoostUntil}
        now={now}
        onSpeedBoost={() => {
          if (tutorialStep === 1) {
            setSpeedBoostUntil(prev => Math.max(prev, Date.now()) + BOOST_MS)
            setTutorialStep(2)
          } else {
            setAdTarget('speed')
          }
        }}
        onGoldBoost={() => {
          if (tutorialStep === 2) {
            setGoldBoostUntil(prev => Math.max(prev, Date.now()) + BOOST_MS)
            setTutorialStep(3)
          } else {
            setAdTarget('gold')
          }
        }}
      />}
      {!showSplash && <BottomSheet
        open={activeTab !== null}
        onClose={() => { setActiveTab(null); if (tutorialStep === 18) setTutorialStep(19) }}
        scrollKey={activeTab}
        header={
          activeTab === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>공장</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {([['production', '🌱 생산'], ['factory', '⚙️ 가공']] as const).map(([sec, label]) => (
                    <button
                      key={sec}
                      onClick={() => { setProdSection(sec); if (tutorialStep === 14 && sec === 'factory') setTutorialStep(15) }}
                      className={tutorialStep === 14 && sec === 'factory' ? 'tutorial-highlight-btn' : undefined}
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
              <UpgradeAmountToggle value={upgradeAmount} onChange={setUpgradeAmount} />
            </div>
          ) : activeTab === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>재료 관리</h2>
              <UpgradeAmountToggle value={upgradeAmount} onChange={setUpgradeAmount} />
            </div>
          ) : activeTab === 2 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>동물</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  {([['hamster', '햄스터'], ['cat', '고양이'], ['dog', '강아지']] as const).map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => setAnimalType(type)}
                      style={{
                        padding: '4px 10px', borderRadius: 10, border: '1.5px solid',
                        borderColor: animalType === type ? '#6366f1' : '#e5e7eb',
                        background: animalType === type ? '#eef2ff' : '#fff',
                        color: animalType === type ? '#6366f1' : '#9ca3af',
                        fontSize: 12, fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <AnimalSvg species={type} size={18}/>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <UpgradeAmountToggle value={upgradeAmount} onChange={setUpgradeAmount} />
            </div>
          ) : activeTab === 3 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>환생</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  {([['item', '📦 아이템'], ['buffer', '🔧 기타']] as const).map(([sec, label]) => (
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
              <UpgradeAmountToggle value={upgradeAmount} onChange={setUpgradeAmount} />
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
            gold={gold}
            materialQuantityLevels={gameState.materialQuantityLevels}
            clicker={gameState.clicker}
            onBuild={handleBuildProducer}
            onUpgrade={(i) => handleUpgradeProducer(i, upgradeAmount)}
            onUpgradeClicker={handleUpgradeClicker}
          />
        )}
        {activeTab === 0 && prodSection === 'factory' && (
          <FactoryTab
            board={board}
            factories={gameState.factories}
            gold={gold}
            onBuild={handleBuildFactory}
            onSetType={handleSetFactoryType}
            onSetDir={handleSetFactoryDir}
            onSetGrade={handleSetFactoryGrade}
            onUpgradeLevel={(row, col) => handleUpgradeFactoryLevel(row, col, upgradeAmount)}
            onSetAnimal={handleSetFactoryAnimal}
            animals={gameState.animals}
            maxGrade={20}
            focusFactory={focusFactory}
            onFocusConsumed={() => setFocusFactory(null)}
          />
        )}
        {activeTab === 1 && (
          <MaterialTab
            gameState={gameState}
            gold={gold}
            onUpgradeQuantity={(i) => handleUpgradeMaterialQuantity(i, upgradeAmount)}
          />
        )}
        {activeTab === 2 && (
          <AnimalTab
            gameState={gameState}
            animalType={animalType}
            onUnlockAnimal={handleUnlockAnimal}
            onUpgradeAnimal={(id) => handleUpgradeAnimal(id, upgradeAmount)}
            onStartPlacing={handleStartPlacing}
            onRecallAnimal={handleRecallAnimal}
          />
        )}
        {activeTab === 3 && (
          <PrestigeTab
            gameState={gameState}
            section={prestigeSection}
            onPrestige={handlePrestige}
            onPrestigeKeepPoints={handlePrestigeKeepPoints}
            onLevelUpItemValue={(i) => handleLevelUpItemValue(i, upgradeAmount)}
            onUpgradeRsBuffer={() => handleUpgradeRsBuffer(upgradeAmount)}
            onUpgradeFaBuffer={() => handleUpgradeFaBuffer(upgradeAmount)}
            onUpgradeRailSpeed={() => handleUpgradeRailSpeed(upgradeAmount)}
          />
        )}
        {activeTab === 4 && (
          <LeaderboardTab
            playerName={gameState.playerName}
            mode={lbMode}
            onNameChange={async name => {
              if (!name.trim()) return
              const { prestigePoints, prestigeCount } = gameStateRef.current
              setGameState(prev => ({ ...prev, playerName: name }))
              const deviceId = getDeviceId()
              await deleteScores(deviceId)
              await submitPrestigeScore(deviceId, name, prestigePoints, prestigeCount)
              await submitGoldScore(deviceId, name, totalEarnedRef.current)
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

      {/* 공장 팝업 */}
      {selectedFactory && (() => {
        const factory = gameState.factories.find(f => f.row === selectedFactory.row && f.col === selectedFactory.col)
        if (!factory?.built) {
          return (
            <FactoryBuildModal
              gold={gold}
              onBuild={() => handleBuildFactory(selectedFactory.row, selectedFactory.col)}
              onClose={() => setSelectedFactory(null)}
              tutorialHighlight={tutorialStep === 4}
            />
          )
        }
        const liveKey = `${selectedFactory.row}-${selectedFactory.col}`
        const { row, col } = selectedFactory
        return (
          <FactoryInfoModal
            factory={factory}
            faLiveStatesRef={faLiveStatesRef}
            liveKey={liveKey}
            gold={gold}
            materialQuantityLevels={gameState.materialQuantityLevels}
            maxGrade={20}
            onClose={() => { setSelectedFactory(null); if (tutorialStep === 7) setTutorialStep(8) }}
            tutorialHighlightClose={tutorialStep === 7}
            onSetType={type => handleSetFactoryType(row, col, type)}
            onSetDir={dir => handleSetFactoryDir(row, col, dir)}
            onSetGrade={grade => handleSetFactoryGrade(row, col, grade)}
            onUpgradeLevel={() => handleUpgradeFactoryLevel(row, col, upgradeAmount)}
          />
        )
      })()}

      {/* 생산기 팝업 */}
      {selectedProducer && (() => {
        const producer = gameState.producers.find(p => p.row === selectedProducer.row && p.col === selectedProducer.col)
        if (!producer) return null
        const producerIndex = gameState.producers.indexOf(producer)
        const builtCount = gameState.producers.filter(p => p.built).length
        return (
          <ProducerInfoModal
            producer={producer}
            producerIndex={producerIndex}
            gold={gold}
            materialQuantityLevels={gameState.materialQuantityLevels}
            builtCount={builtCount}
            onBuild={() => handleBuildProducer(producerIndex)}
            onUpgrade={() => handleUpgradeProducer(producerIndex, upgradeAmount)}
            onClose={() => { setSelectedProducer(null); if (tutorialStep === 12) setTutorialStep(13) }}
            tutorialHighlightBuild={tutorialStep === 9}
            tutorialHighlightClose={tutorialStep === 12}
          />
        )
      })()}

      {/* 환생 모달 */}
      {showPrestigeModal && (
        <PrestigeAdModal
          earned={getPrestigePoints(totalEarned)}
          currentPoints={gameState.totalPrestigePoints ?? gameState.prestigePoints}
          availablePoints={gameState.prestigePoints}
          onPrestige={() => { setShowPrestigeModal(false); doPrestige(1) }}
          onWatchAd={() => { setAdTarget('prestige') }}
          onClose={() => setShowPrestigeModal(false)}
        />
      )}

      {/* 포인트 유지 환생 모달 */}
      {showPrestigeKeepModal && (
        <PrestigeAdModal
          earned={getPrestigePoints(totalEarned)}
          currentPoints={gameState.totalPrestigePoints ?? gameState.prestigePoints}
          availablePoints={gameState.prestigePoints}
          keepPoints
          onPrestige={() => { setShowPrestigeKeepModal(false); doPrestigeKeepPoints(1) }}
          onWatchAd={() => { setAdTarget('prestigeKeep') }}
          onClose={() => setShowPrestigeKeepModal(false)}
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
