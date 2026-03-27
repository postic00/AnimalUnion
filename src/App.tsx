import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Board from './features/board/Board'
import Navigation from './features/navigation/Navigation'
import TabBar from './features/navigation/TabBar'
import BottomSheet from './features/navigation/BottomSheet'
import ProductionTab from './features/production/ProductionTab'
import FactoryTab from './features/factory/FactoryTab'
import AnimalTab from './features/animal/AnimalTab'
import PrestigeTab from './features/prestige/PrestigeTab'
import MaterialTab from './features/material/MaterialTab'
import SettingsTab from './features/settings/SettingsTab'
import LeaderboardTab from './features/leaderboard/LeaderboardTab'
import Tutorial from './features/tutorial/Tutorial'
import AdModal from './features/ad/AdModal'
import PrestigeAdModal from './features/prestige/PrestigeAdModal'
import ConfirmModal from './features/common/ConfirmModal'
import WorkRewardModal from './features/reward/WorkRewardModal'
import Toast from './features/common/Toast'
import { SaveService } from './services/SaveService'
import { ScoreService } from './services/ScoreService'
import { CloudService } from './services/CloudService'
import SplashScreen from './features/tutorial/SplashScreen'
import FactoryInfoModal from './features/factory/FactoryInfoModal'
import FactoryBuildModal from './features/factory/FactoryBuildModal'
import ProducerInfoModal from './features/production/ProducerInfoModal'
import RsInfoModal from './features/rs/RsInfoModal'
import UpgradeAmountToggle from './features/navigation/UpgradeAmountToggle'
import { initialBoard } from './data/initialBoard'
import { initialGameState } from './types/gameState'
import { initialWorkData } from './types/workData'
import type { WorkData, Reward } from './types/workData'
import { saveGame, loadGame, savePrestigeTotal, loadPrestigeTotal } from './utils/saveLoad'
import { calcOfflineReward, calcMealReward, calcSalaryReward, tickWorkData } from './utils/workRewards'
import { formatGold } from './utils/formatGold'
import { CONFIG, applyWeekConfig } from './config'
import { initAdMob } from './utils/admob'
import { initTossBackEvent, initTossVisibility, closeView, isTossEnvironment } from './utils/toss'
import type { Board as BoardType, Cell } from './types/board'
import { getBundleCost, getBundleCostDiscount, getPrestigePoints, getRsBufferCapacity, getGoldMultiplierBonus } from './balance'
import { useUIState } from './hooks/useUIState'
import { useGameActions } from './hooks/useGameActions'
import { useGoldStore, goldRef, totalEarnedRef, goldBufferRef, totalEarnedBufferRef, earnedInSecRef } from './stores/goldStore'
import { useGameStore, gameStateRef, boardRef, mutedRef, goldMultiplierLevelRef } from './stores/gameStore'
import { useBoostStore, speedBoostRemainingRef, goldBoostRemainingRef } from './stores/boostStore'

// 앱 시작 시 로컬에 저장된 주차 config 즉시 적용
const cachedWeekConfig = SaveService.loadWeekConfig()
if (cachedWeekConfig) applyWeekConfig(cachedWeekConfig)

function addBundle(board: BoardType): BoardType {
  const newBoard = board.map(row => [...row])
  const lastRow = newBoard[newBoard.length - 1]
  const reIndex = lastRow.findIndex(cell => cell.type === 'RE')
  if (reIndex !== -1) {
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
  // 구버전 감지 - loadGame() 호출 전에 체크 (loadGame은 구버전 시 자동 삭제)
  const peek = SaveService.peekSave()
  const hasOldSave = peek !== null && SaveService.isUnsupportedVersion(peek.version)
  if (hasOldSave) {
    return {
      board: initialBoard,
      gameState: { ...initialGameState },
      savedAt: null as number | null,
      speedBoostRemaining: 0,
      goldBoostRemaining: 0,
      hasOldSave: true,
    }
  }

  const saved = loadGame()
  const savedState = saved?.gameState ?? initialGameState
  if (!savedState.playerName) {
    savedState.playerName = `Player${Date.now().toString(36).toUpperCase()}`
  }
  if (typeof (savedState.prestigePoints as unknown) === 'number') {
    const oldCurrent = savedState.prestigePoints as unknown as number
    const oldTotal = (savedState as unknown as { totalPrestigePoints?: number }).totalPrestigePoints ?? oldCurrent
    savedState.prestigePoints = { current: oldCurrent, total: oldTotal }
  }
  // 세이브 초기화 후에도 prestige total 복구
  if (savedState.prestigePoints.total === 0) {
    const backed = loadPrestigeTotal()
    if (backed > 0) savedState.prestigePoints = { ...savedState.prestigePoints, total: backed }
  }
	if(savedState.currentWeek) CONFIG.CURRENT_WEEK = savedState.currentWeek
  return {
    board: getConsistentBoard(savedState.bundleCount),
    gameState: savedState,
    savedAt: saved?.savedAt ?? null,
    speedBoostRemaining: saved?.boosts?.speedBoostRemaining ?? Math.max(0, (saved?.boosts?.speedBoostUntil ?? 0) - Date.now()),
    goldBoostRemaining: saved?.boosts?.goldBoostRemaining ?? Math.max(0, (saved?.boosts?.goldBoostUntil ?? 0) - Date.now()),
    hasOldSave: false,
  }
}

const platform = /android/i.test(navigator.userAgent) ? 'android' : /iphone|ipad/i.test(navigator.userAgent) ? 'ios' : 'web'

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

if(typeof window !== 'undefined' && isTossEnvironment()) {
	document.documentElement.style.setProperty('--safe-area-inset-top', '0px')
	document.documentElement.style.setProperty('--safe-area-inset-bottom', '0px')
}

export default function App() {
  const [initData] = useState(loadInitialState)
  const [showOldSaveAlert, setShowOldSaveAlert] = useState(initData.hasOldSave)

  // ── store 구독 (컴포넌트별 선택적 리렌더링) ────────────────────────────────
  const gold = useGoldStore(s => s.gold)
  const totalEarned = useGoldStore(s => s.totalEarned)
  const goldPerSec = useGoldStore(s => s.goldPerSec)
  const gameState = useGameStore(s => s.gameState)
  const board = useGameStore(s => s.board)
  const resetKey = useGameStore(s => s.resetKey)
  const savedAt = useGameStore(s => s.savedAt)
  const muted = useGameStore(s => s.muted)
  const speedBoostRemaining = useBoostStore(s => s.speedBoostRemaining)
  const goldBoostRemaining = useBoostStore(s => s.goldBoostRemaining)

  // ── store 초기화 (최초 1회) ──────────────────────────────────────────────
  useState(() => {
    const startGold = !localStorage.getItem('tutorialDone')
      ? Math.max(initData.gameState.gold, 100)
      : initData.gameState.gold
    useGoldStore.getState().setGold(startGold)
    useGoldStore.getState().setTotalEarned(initData.gameState.totalEarned)
    useGameStore.getState().init(initData.gameState, initData.board)
    useGameStore.getState().setSavedAt(initData.savedAt)
    useGameStore.getState().setMuted(SaveService.loadMuted())
    useBoostStore.getState().setBoosts(initData.speedBoostRemaining, initData.goldBoostRemaining)
    // refs 즉시 동기화 (subscribe는 setState 직후 실행되므로 이미 됨)
  })

  useEffect(() => {
    if (gameState.prestigePoints.total > 0) savePrestigeTotal(gameState.prestigePoints.total)
  }, [gameState.prestigePoints.total])

  // Board 내부에서 사용하는 clicker ref 등
  const spawnClickerItemRef = useRef<((grade: number) => void) | null>(null)
  const boardSaveRef = useRef<() => void>(() => {})
  const clickerGradeRef = useRef<number>(1)
  const spawnUnlockTimeRef = useRef<number>(0)
  const goldPerSecRef = useRef(goldPerSec)
  useEffect(() => { goldPerSecRef.current = goldPerSec }, [goldPerSec])

  const BOOST_MS = 10 * 60 * 1000

  const [workData, setWorkData] = useState<WorkData>(() => {
    const saved = SaveService.loadWorkData()
    return saved ?? { ...initialWorkData, lastWorked: Date.now() }
  })
  const workDataRef = useRef(workData)
  const [rewardQueue, setRewardQueue] = useState<Reward[][]>([])
  const pendingRewards = rewardQueue[0] ?? []
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([])
  const toastIdRef = useRef(0)
  const addToast = useCallback((message: string) => {
    setToasts(prev => [...prev, { id: ++toastIdRef.current, message }])
  }, [])

  // ── 순위탭 이름 편집 / 내 순위 ────────────────────────────────────────────
  const [lbNameEditing, setLbNameEditing] = useState(false)
  const [lbNameInput, setLbNameInput] = useState('')
  const [lbMyRank, setLbMyRank] = useState<number | null>(null)
  const [lbMyScore, setLbMyScore] = useState<number | null>(null)
  const handleLbNameSave = useCallback(async () => {
    const trimmed = lbNameInput.trim()
    if (!trimmed) return
    useGameStore.getState().setGameState(prev => ({ ...prev, playerName: trimmed }))
    await ScoreService.updatePlayerName(SaveService.getDeviceId(), trimmed)
    setLbNameEditing(false)
  }, [lbNameInput])

  // ── 친구 요청 ─────────────────────────────────────────────────────────────
  const [pendingFriendRequests, setPendingFriendRequests] = useState<import('./lib/userProfile').FriendRequestRow[]>([])
  useEffect(() => {
    CloudService.getPendingFriendRequests().then(setPendingFriendRequests)
  }, [])

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    if (workData.lastActivityDate !== today) {
      ScoreService.recordSession(SaveService.getDeviceId(), platform)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorkData(prev => ({ ...prev, lastActivityDate: today }))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 앱 시작 시 휴게 보상 계산 ─────────────────────────────────────────────
  useEffect(() => {
    const saved = SaveService.loadWorkData()
    if (saved) {
      const queue: Reward[][] = []
      const offlineReward = calcOfflineReward(saved, goldPerSecRef.current)
      if (offlineReward) queue.push([offlineReward])
      const mealReward = calcMealReward(saved)
      if (mealReward) queue.push([mealReward])
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (queue.length > 0) setRewardQueue(queue)
    }
    // lastWorked 갱신
     
    setWorkData(prev => ({ ...prev, lastWorked: Date.now() }))
  }, [])

  // ── 보상 수령 핸들러 ──────────────────────────────────────────────────────
  const pendingRewardsRef = useRef(pendingRewards)
  useEffect(() => { pendingRewardsRef.current = pendingRewards })

  const handleClaimRewards = useCallback((multiplier = 1) => {
    pendingRewardsRef.current.forEach(r => {
      if (r.type === 'offline' || r.type === 'salary') {
        const earnedGold = r.gold * multiplier
        useGoldStore.getState().setGold(g => g + earnedGold * getGoldMultiplierBonus(goldMultiplierLevelRef.current))
        goldBufferRef.current += earnedGold
        totalEarnedBufferRef.current += earnedGold
      }
      if (r.type === 'breakfast' || r.type === 'lunch' || r.type === 'dinner') {
        const boostMs = r.boostMs * multiplier
        useBoostStore.getState().addSpeedBoost(boostMs)
        useBoostStore.getState().addGoldBoost(boostMs)
        const today = new Date().toISOString().slice(0, 10)
        // ref도 즉시 업데이트하여 다음 틱에서 중복 emit 방지
        workDataRef.current = {
          ...workDataRef.current,
          meals: { ...workDataRef.current.meals, [r.type]: today },
        }
        setWorkData(workDataRef.current)
      }
    })
    setRewardQueue(prev => prev.slice(1))
  }, [])  

  // ── UI State ──────────────────────────────────────────────────────────────
  const ui = useUIState()

  // ── Game Actions ──────────────────────────────────────────────────────────
  const actions = useGameActions({
    boardSaveRef,
    spawnClickerItemRef, clickerGradeRef, spawnUnlockTimeRef,
    platform,
    setClickerGrade: ui.setClickerGrade,
    setTutorialStep: ui.setTutorialStep,
    setTutorialItemCount: ui.setTutorialItemCount,
    setSelectedFactory: ui.setSelectedFactory,
    setShowPrestigeModal: ui.setShowPrestigeModal,
    setShowPrestigeKeepModal: ui.setShowPrestigeKeepModal,
    setShowSplash: ui.setShowSplash,
    adTarget: ui.adTarget,
    setAdTarget: ui.setAdTarget,
    workDataRef,
    setWorkData,
    onRewardClaim: handleClaimRewards,
    resetSalary: () => {
      workDataRef.current = {
        ...workDataRef.current,
        lastWorked: Date.now(),
        salary: { secondsAccumulated: 0 },
      }
      setWorkData(workDataRef.current)
      goldBufferRef.current = 0
      totalEarnedBufferRef.current = 0
      earnedInSecRef.current = 0
    },
    tutorialStep: ui.tutorialStep,
    BOOST_MS,
  })

  // ── 튜토리얼 사이드이펙트 ─────────────────────────────────────────────────
  useEffect(() => {
    if (ui.tutorialStep === 3 && ui.tutorialItemCount >= 20) ui.setTutorialStep(4)
  }, [ui.tutorialItemCount, ui.tutorialStep]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const s = ui.tutorialStep
    if (s === null) return
    if ([3, 4, 5, 6, 7, 8].includes(s)) ui.setActiveTab(null)
    // 공장이 이미 있으면 6·7 스킵
    if ((s === 6 || s === 7) && gameState.factories.some(f => f.built)) ui.setTutorialStep(8)
    // 생산자가 이미 있으면 8·9 스킵
    if ((s === 8 || s === 9) && gameState.producers.some(p => p.built)) ui.setTutorialStep(10)
  }, [ui.tutorialStep]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── AdMob / Toss ──────────────────────────────────────────────────────────
  useEffect(() => { initAdMob() }, [])

  useEffect(() => {
    let cleanup = () => {}
    initTossBackEvent(() => {
      if (ui.activeTabRef.current !== null) ui.setActiveTab(null)
      else closeView()
    }).then(fn => { cleanup = fn })
    return () => cleanup()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return initTossVisibility(
      () => { mutedRef.current = true },
      () => { mutedRef.current = muted }
    )
  }, [muted])

  // ── 저장 인터벌 ──────────────────────────────────────────────────────────
  const lastSavedSnapshotRef = useRef<string>('')
  useEffect(() => {
    const getSnapshot = () => JSON.stringify({
      ...gameStateRef.current,
      gold: goldRef.current,
      totalEarned: totalEarnedRef.current,
    })
    const save = (force = false) => {
      const snapshot = getSnapshot()
      if (!force && snapshot === lastSavedSnapshotRef.current) return
      const ok = saveGame(boardRef.current, { ...gameStateRef.current, gold: goldRef.current, totalEarned: totalEarnedRef.current, goldPerSec: goldPerSecRef.current }, {
        speedBoostRemaining: speedBoostRemainingRef.current,
        goldBoostRemaining: goldBoostRemainingRef.current,
      })
      if (!ok) return // 원자저장: 메인 저장 실패 시 엔진 상태 저장 생략
      lastSavedSnapshotRef.current = snapshot
      boardSaveRef.current()
      useGameStore.getState().setSavedAt(Date.now())
    }
    const onVisibility = () => { if (document.hidden) { save(true); SaveService.saveWorkData(workDataRef.current) } }
    const onUnload = () => save()
    window.addEventListener('beforeunload', onUnload)
    document.addEventListener('visibilitychange', onVisibility)

    let rafId: number

	  let lastTick = 0
    const loop = (now: number) => {
      // ~1000ms: 초당 골드 계산
      if (now - lastTick >= 1000) {
        lastTick = now
        useGoldStore.getState().flushTick()
        useBoostStore.getState().tickBoosts()

        // workData 틱
        const newWorkData = tickWorkData(workDataRef.current)
        workDataRef.current = newWorkData

        // 식사 보상 체크 (같은 타입 중복 방지)
        const mealReward = calcMealReward(workDataRef.current)
        if (mealReward) setRewardQueue(prev =>
          prev.some(batch => batch.some(r => r.type === mealReward.type)) ? prev : [...prev, [mealReward]]
        )

        // 월급 체크
        const salaryReward = calcSalaryReward(workDataRef.current, goldPerSecRef.current ?? 0)
        if (salaryReward) {
          // 월급 지급
          const salaryGold = salaryReward.gold * getGoldMultiplierBonus(goldMultiplierLevelRef.current)
          useGoldStore.getState().setGold(g => g + salaryGold)
          goldBufferRef.current += salaryReward.gold
          totalEarnedBufferRef.current += salaryReward.gold
          addToast(`💰 월급 +${formatGold(salaryReward.gold)}`)
          // salary 리셋
          workDataRef.current = { ...workDataRef.current, salary: { secondsAccumulated: 0 } }
          setWorkData(workDataRef.current)
        }
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    // 60s: 저장 + 리더보드 업로드
    const saveInterval = setInterval(() => {
      save()
      SaveService.saveWorkData(workDataRef.current)
      const { playerName } = gameStateRef.current
      if (playerName) ScoreService.submitGold(SaveService.getDeviceId(), playerName, totalEarnedRef.current)
    }, 60000)

    return () => {
      cancelAnimationFrame(rafId)
      clearInterval(saveInterval)
      window.removeEventListener('beforeunload', onUnload)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [addToast])

  // ── 크로스커팅 핸들러 ─────────────────────────────────────────────────────
  const { setSelectedFactory, setSelectedProducer, tutorialStep, setTutorialStep, placingAnimalId, setPlacingAnimalId, setActiveTab } = ui
  const { handlePlaceAnimal: actionsPlaceAnimal, handleHardReset: actionsHardReset } = actions

  // 생산자 클릭: 튜토리얼 8→9 연동
  const handleProducerClick = useCallback((row: number, col: number) => {
    setSelectedProducer({ row, col })
    if (tutorialStep === 8) setTutorialStep(9)
  }, [setSelectedProducer, tutorialStep, setTutorialStep])

  // 공장 클릭: 튜토리얼 6→7 연동
  const handleFactoryClick = useCallback((row: number, col: number) => {
    setSelectedFactory({ row, col })
    if (tutorialStep === 6) setTutorialStep(7)
  }, [setSelectedFactory, tutorialStep, setTutorialStep])

  // 동물 배치: placingAnimalId 전달 후 초기화
  const handlePlaceAnimal = useCallback((row: number, col: number) => {
    actionsPlaceAnimal(row, col, placingAnimalId)
    setPlacingAnimalId(null)
  }, [actionsPlaceAnimal, placingAnimalId, setPlacingAnimalId])

  // 하드 리셋: activeTab + workData + rewardQueue + prestige total 초기화
  const handleHardReset = useCallback(() => {
    actionsHardReset()
    setActiveTab(null)
    workDataRef.current = { ...initialWorkData, lastWorked: Date.now() }
    setWorkData(workDataRef.current)
    setRewardQueue([])
    localStorage.removeItem('animal-union-prestige-total')
  }, [actionsHardReset, setActiveTab])  

  const bundleCost = useMemo(() =>
    Math.floor(getBundleCost(gameState.bundleCount) * (1 - getBundleCostDiscount(gameState.bundleDiscountLevel ?? 0))),
    [gameState.bundleCount, gameState.bundleDiscountLevel]
  )

  const animals = useMemo(() => [
    ...gameState.animals,
    ...(gameState.friends ?? []).map(f => ({ id: f.id, level: 1, unlocked: true, name: f.playerName, rank: f.rank })),
  ], [gameState.animals, gameState.friends])

  const levelConfig = useMemo(() => ({
    materialQuantityLevels: gameState.materialQuantityLevels,
    itemValueLevels: gameState.itemValueLevels,
    faBufferLevel: gameState.faBufferLevel,
    rsBufferLevel: gameState.rsBufferLevel,
    railSpeedLevel: gameState.railSpeedLevel ?? 1,
  }), [gameState.materialQuantityLevels, gameState.itemValueLevels, gameState.faBufferLevel, gameState.rsBufferLevel, gameState.railSpeedLevel])

  return (
    <div style={{ minHeight: '100vh', paddingBottom: ui.activeTab !== null ? 'calc(40vh + 68px + ver(--safe-area-inset-bottom, 0px))' : 'calc(68px + var(--safe-area-inset-bottom, 0px))', position: 'relative', transition: 'padding-bottom 0.25s ease' }}>
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
      {ui.showSplash && <SplashScreen onDone={ui.handleSplashDone} />}
      {!ui.showSplash && ui.tutorialStep !== null && <Tutorial
        step={ui.tutorialStep}
        clickCount={ui.tutorialItemCount}
        onNext={() => {
          if (ui.tutorialStep === 10) {
            localStorage.setItem('tutorialDone', '1')
            ui.setTutorialStep(null)
          } else {
            ui.setTutorialStep(s => s !== null ? s + 1 : null)
          }
        }}
        onSkip={() => {
          localStorage.setItem('tutorialDone', '1')
          ui.setTutorialStep(null)
        }}
      />}
      {!ui.showSplash && <Navigation gold={gold} goldPerSec={goldPerSec} prestigePoints={gameState.prestigePoints.current} totalPrestigePoints={gameState.prestigePoints.total} salarySecondsAccumulated={workData.salary.secondsAccumulated} expectedSalary={Math.floor(goldPerSec * CONFIG.WR_SALARY_SECONDS * CONFIG.WR_SALARY_RATE)} />}
      {!ui.showSplash && <Board
        key={resetKey}
        board={board}
        onAddBundle={actions.handleAddBundle}
        onGoldEarned={actions.handleGoldEarned}
        bundleCost={bundleCost}
        canAddBundle={gold >= bundleCost}
        producers={gameState.producers}
        factories={gameState.factories}
        animals={animals}
        levelConfig={levelConfig}
        placingAnimalId={ui.placingAnimalId}
        onPlaceAnimal={handlePlaceAnimal}
        onCancelPlacing={ui.handleCancelPlacing}
        spawnClickerItemRef={spawnClickerItemRef}
        onSaveRef={boardSaveRef}
        muted={muted}
        speedMultiplier={speedBoostRemaining > 0 ? 2 : 1}
        onFactoryClick={handleFactoryClick}
        onProducerClick={handleProducerClick}
        onRsClick={ui.handleRsClick}
        onFaLiveStateChange={ui.handleFaLiveStateChange}
        onProducerProgressChange={ui.handleProducerProgressChange}
        tutorialHighlight={undefined}
        disableDerail={ui.tutorialStep !== null}
      />}
      {!ui.showSplash && <TabBar
        clicker={gameState.clicker}
        clickerGrade={ui.clickerGrade}
        onClickerClick={actions.handleClickerClick}
        onTabChange={(tab) => {
          ui.setActiveTab(tab)
          saveGame(board, { ...gameState, gold, totalEarned, goldPerSec }, { speedBoostRemaining, goldBoostRemaining })
          useGameStore.getState().setSavedAt(Date.now())
        }}
        activeTab={ui.activeTab}
        speedBoostRemaining={speedBoostRemaining}
        goldBoostRemaining={goldBoostRemaining}
        onSpeedBoost={() => {
          if (ui.tutorialStep === 4) {
            useBoostStore.getState().addSpeedBoost(BOOST_MS)
            ui.setTutorialStep(5)
          } else {
            ui.setAdTarget('speed')
          }
        }}
        onGoldBoost={() => {
          if (ui.tutorialStep === 5) {
            useBoostStore.getState().addGoldBoost(BOOST_MS)
            ui.setTutorialStep(6)
          } else {
            ui.setAdTarget('gold')
          }
        }}
      />}
      {!ui.showSplash && <BottomSheet
        open={ui.activeTab !== null}
        onClose={() => { ui.setActiveTab(null) }}
        scrollKey={ui.activeTab}
        topBar={[0, 1, 2, 3].includes(ui.activeTab ?? -1) ? <UpgradeAmountToggle value={ui.upgradeAmount} onChange={ui.setUpgradeAmount} /> : undefined}
        header={
          ui.activeTab === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px', whiteSpace: 'nowrap', width: 25, flexShrink: 0 }}>공장</h2>
              <div style={{ display: 'flex', flex: 1, gap: 4, justifyContent: 'flex-end' }}>
                {([['production', '🌱 생산'], ['factory', '⚙️ 가공']] as const).map(([sec, label]) => (
                  <button key={sec} onClick={() => { ui.setProdSection(sec) }} className={ui.prodSection === sec ? 'aqua-btn-active' : 'aqua-btn'}>{label}</button>
                ))}
              </div>
            </div>
          ) : ui.activeTab === 1 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px', whiteSpace: 'nowrap', width: 25, flexShrink: 0 }}>재료</h2>
              <div style={{ display: 'flex', flex: 1, gap: 4, justifyContent: 'flex-end' }} />
            </div>
          ) : ui.activeTab === 2 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px', whiteSpace: 'nowrap', width: 25, flexShrink: 0 }}>동물</h2>
              <div style={{ display: 'flex', flex: 1, gap: 4, justifyContent: 'flex-end' }}>
                {([['hamster', '🐹 햄스터'], ['cat', '🐱 고양이'], ['dog', '🐶 강아지'], ['friend', '👥 친구']] as const).map(([type, label]) => (
                  <button key={type} onClick={() => ui.setAnimalType(type as typeof ui.animalType)} className={ui.animalType === type ? 'aqua-btn-active' : 'aqua-btn'}>{label}</button>
                ))}
              </div>
            </div>
          ) : ui.activeTab === 3 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px', whiteSpace: 'nowrap', width: 25, flexShrink: 0 }}>환생</h2>
              <div style={{ display: 'flex', flex: 1, gap: 4, justifyContent: 'flex-end' }}>
                {([['item', '📦 아이템'], ['buffer', '🔧 기타']] as const).map(([sec, label]) => (
                  <button key={sec} onClick={() => ui.setPrestigeSection(sec)} className={ui.prestigeSection === sec ? 'aqua-btn-active' : 'aqua-btn'}>{label}</button>
                ))}
              </div>
            </div>
          ) : ui.activeTab === 4 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              {lbNameEditing ? (
                <>
                  <input
                    style={{ flex: 1, fontSize: 13, fontWeight: 700, border: '1.5px solid #06b6d4', borderRadius: 6, padding: '2px 6px', outline: 'none', minWidth: 0 }}
                    value={lbNameInput}
                    onChange={e => setLbNameInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLbNameSave()}
                    maxLength={16}
                    autoFocus
                  />
                  <button className="aqua-btn" onClick={handleLbNameSave}>확인</button>
                  <button className="aqua-btn" onClick={() => setLbNameEditing(false)}>취소</button>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#191f28', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gameState.playerName}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>
                      {lbMyRank ? `${lbMyRank === 1 ? '🥇' : lbMyRank === 2 ? '🥈' : lbMyRank === 3 ? '🥉' : `#${lbMyRank}`} ${lbMyScore !== null ? formatGold(lbMyScore) : ''}` : '미등록'}
                    </span>
                  </div>
                  <button className="aqua-btn" onClick={() => { setLbNameInput(gameState.playerName); setLbNameEditing(true) }}>✏️</button>
                  <button className="aqua-btn" onClick={() => ui.setLbMode(ui.lbMode === 'prestige' ? 'gold' : 'prestige')}>
                    {ui.lbMode === 'prestige' ? '⭐ 환생' : '💰 골드'}
                  </button>
                </>
              )}
            </div>
          ) : (
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px', whiteSpace: 'nowrap', width: 25, flexShrink: 0 }}>
              {['공장', '재료 관리', '동물', '환생', '', '설정'][ui.activeTab ?? 0]}
            </h2>
          )
        }
      >
        {ui.activeTab === 0 && ui.prodSection === 'production' && (
          <ProductionTab
            producers={gameState.producers}
            gold={gold}
            materialQuantityLevels={gameState.materialQuantityLevels}
            clicker={gameState.clicker}
            onBuild={actions.handleBuildProducer}
            onUpgrade={(i) => actions.handleUpgradeProducer(i, ui.upgradeAmount)}
            onUpgradeClicker={actions.handleUpgradeClicker}
            onGradeChange={actions.handleProducerGradeChange}
          />
        )}
        {ui.activeTab === 0 && ui.prodSection === 'factory' && (
          <FactoryTab
            board={board}
            factories={gameState.factories}
            gold={gold}
            onBuild={actions.handleBuildFactory}
            onSetType={actions.handleSetFactoryType}
            onSetDir={actions.handleSetFactoryDir}
            onSetGrade={actions.handleSetFactoryGrade}
            onUpgradeLevel={(row, col) => actions.handleUpgradeFactoryLevel(row, col, ui.upgradeAmount)}
            onSetAnimal={actions.handleSetFactoryAnimal}
            animals={animals}
            maxGrade={20}
            focusFactory={ui.focusFactory}
            onFocusConsumed={() => ui.setFocusFactory(null)}
          />
        )}
        {ui.activeTab === 1 && (
          <MaterialTab
            gameState={gameState}
            gold={gold}
            onUpgradeQuantity={(i) => actions.handleUpgradeMaterialQuantity(i, ui.upgradeAmount)}
          />
        )}
        {ui.activeTab === 2 && (
          <AnimalTab
            gameState={gameState}
            animalType={ui.animalType}
            onUnlockAnimal={actions.handleUnlockAnimal}
            onUpgradeAnimal={(id) => actions.handleUpgradeAnimal(id, ui.upgradeAmount)}
            onStartPlacing={ui.handleStartPlacing}
            onRecallAnimal={actions.handleRecallAnimal}
            onRecallFriend={actions.handleRecallFriend}
            onRemoveFriend={actions.handleRemoveFriend}
          />
        )}
        {ui.activeTab === 3 && (
          <PrestigeTab
            gameState={{ ...gameState, totalEarned }}
            section={ui.prestigeSection}
            onPrestige={actions.handlePrestige}
            onPrestigeKeepPoints={actions.handlePrestigeKeepPoints}
            onLevelUpItemValue={(i) => actions.handleLevelUpItemValue(i, ui.upgradeAmount)}
            onUpgradeRsBuffer={() => actions.handleUpgradeRsBuffer(ui.upgradeAmount)}
            onUpgradeFaBuffer={() => actions.handleUpgradeFaBuffer(ui.upgradeAmount)}
            onUpgradeRailSpeed={() => actions.handleUpgradeRailSpeed(ui.upgradeAmount)}
            onUpgradeBuildDiscount={actions.handleUpgradeBuildDiscount}
            onUpgradeBundleDiscount={actions.handleUpgradeBundleDiscount}
            onUpgradeProducerStart={actions.handleUpgradeProducerStart}
            onUpgradeGoldMultiplier={actions.handleUpgradeGoldMultiplier}
            onUpgradeInitialGold={actions.handleUpgradeInitialGold}
          />
        )}
        {ui.activeTab === 4 && (
          <LeaderboardTab
            playerName={gameState.playerName}
            mode={ui.lbMode}
            friendDeviceIds={(gameState.friends ?? []).map(f => f.deviceId)}
            myPrestigeScore={gameState.prestigePoints.total}
            onRankUpdate={(rank, score) => { setLbMyRank(rank); setLbMyScore(score) }}
            onSubmitGold={async () => {
              const { playerName } = gameStateRef.current
              if (playerName) await ScoreService.submitGold(SaveService.getDeviceId(), playerName, totalEarnedRef.current)
            }}
          />
        )}
        {ui.activeTab === 5 && (
          <SettingsTab
            savedAt={savedAt}
            muted={muted}
            onToggleMute={actions.handleToggleMute}
            onCloudSave={actions.handleCloudSave}
            onCloudLoad={actions.handleCloudLoad}
            onTransferSave={actions.handleTransferSave}
            onTransferLoad={actions.handleTransferLoad}
            onHardReset={() => ui.setShowResetConfirm(true)}
            onIssueInviteCode={actions.handleIssueInviteCode}
            onSendFriendRequest={actions.handleSendFriendRequest}
            pendingFriendRequests={pendingFriendRequests}
            onAcceptFriendRequest={async (id, devId, name) => {
              const ok = await actions.handleAcceptFriendRequest(id, devId, name)
              if (ok) setPendingFriendRequests(prev => prev.filter(r => r.id !== id))
            }}
            onRejectFriendRequest={async (id) => {
              await actions.handleRejectFriendRequest(id)
              setPendingFriendRequests(prev => prev.filter(r => r.id !== id))
            }}
          />
        )}
      </BottomSheet>}

      {/* 광고 모달 */}
      {ui.adTarget !== null && (
        <AdModal
          onComplete={actions.handleAdComplete}
          onClose={() => ui.setAdTarget(null)}
        />
      )}

      {/* 공장 팝업 */}
      {ui.selectedFactory && (() => {
        const factory = gameState.factories.find(f => f.row === ui.selectedFactory!.row && f.col === ui.selectedFactory!.col)
        if (!factory?.built) {
          return (
            <FactoryBuildModal
              gold={gold}
              onBuild={() => actions.handleBuildFactory(ui.selectedFactory!.row, ui.selectedFactory!.col)}
              onClose={() => ui.setSelectedFactory(null)}
              tutorialHighlight={ui.tutorialStep === 7}
            />
          )
        }
        const liveKey = `${ui.selectedFactory.row}-${ui.selectedFactory.col}`
        const { row, col } = ui.selectedFactory
        return (
          <FactoryInfoModal
            factory={factory}
            faLiveStatesRef={ui.faLiveStatesRef}
            liveKey={liveKey}
            gold={gold}
            materialQuantityLevels={gameState.materialQuantityLevels}
            maxGrade={20}
            onClose={() => { ui.setSelectedFactory(null) }}
            onSetType={type => actions.handleSetFactoryType(row, col, type)}
            onSetDir={dir => actions.handleSetFactoryDir(row, col, dir)}
            onSetGrade={grade => actions.handleSetFactoryGrade(row, col, grade)}
            onUpgradeLevel={() => actions.handleUpgradeFactoryLevel(row, col, ui.upgradeAmount)}
          />
        )
      })()}

      {/* 생산기 팝업 */}
      {ui.selectedProducer && (() => {
        const producer = gameState.producers.find(p => p.row === ui.selectedProducer!.row && p.col === ui.selectedProducer!.col)
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
            onBuild={() => actions.handleBuildProducer(producerIndex)}
            onUpgrade={() => actions.handleUpgradeProducer(producerIndex, ui.upgradeAmount)}
            onClose={() => { ui.setSelectedProducer(null) }}
            onGradeChange={(grade) => actions.handleProducerGradeChange(producerIndex, grade)}
            producerProgressesRef={ui.producerProgressesRef}
            progressKey={`${ui.selectedProducer.row}-${ui.selectedProducer.col}`}
            tutorialHighlightBuild={ui.tutorialStep === 9}
          />
        )
      })()}

      {/* 환생 모달 */}
      {ui.showPrestigeModal && (
        <PrestigeAdModal
          earned={getPrestigePoints(totalEarned)}
          currentPoints={gameState.prestigePoints.total}
          availablePoints={gameState.prestigePoints.current}
          onPrestige={() => { ui.setShowPrestigeModal(false); actions.doPrestige(1) }}
          onWatchAd={() => { ui.setAdTarget('prestige') }}
          onClose={() => ui.setShowPrestigeModal(false)}
        />
      )}

      {/* 포인트 유지 환생 모달 */}
      {ui.showPrestigeKeepModal && (
        <PrestigeAdModal
          earned={getPrestigePoints(totalEarned)}
          currentPoints={gameState.prestigePoints.total}
          availablePoints={gameState.prestigePoints.current}
          keepPoints
          onPrestige={() => { ui.setShowPrestigeKeepModal(false); actions.doPrestigeKeepPoints(1) }}
          onWatchAd={() => { ui.setAdTarget('prestigeKeep') }}
          onClose={() => ui.setShowPrestigeKeepModal(false)}
        />
      )}

      {/* RS 버퍼 팝업 */}
      {ui.selectedRs && (
        <RsInfoModal
          rsKey={ui.selectedRs.rsKey}
          rsQueuesRef={ui.selectedRs.rsQueuesRef}
          capacity={getRsBufferCapacity(gameState.rsBufferLevel)}
          onClose={() => ui.setSelectedRs(null)}
        />
      )}

      {/* 구버전 저장 데이터 경고 */}
      {showOldSaveAlert && (
        <ConfirmModal
          title="저장 데이터 호환 불가"
          message={'이전 버전의 저장 데이터가 발견되었습니다.\n삭제하고 새로 시작합니다.'}
          confirmLabel="확인"
          onConfirm={() => { SaveService.deleteSave(); setShowOldSaveAlert(false) }}
          onClose={() => { SaveService.deleteSave(); setShowOldSaveAlert(false) }}
        />
      )}

      {/* 초기화 확인 */}
      {ui.showResetConfirm && (
        <ConfirmModal
          title="게임 초기화"
          message={'모든 데이터가 삭제됩니다.\n정말 초기화하시겠습니까?\n\n(주의) 클라우드 저장 데이터도 함께 삭제됩니다.'}
          confirmLabel="초기화"
          cancelLabel="취소"
          onConfirm={() => { ui.setShowResetConfirm(false); handleHardReset() }}
          onClose={() => ui.setShowResetConfirm(false)}
        />
      )}

      {/* 근무 보상 모달 */}
      {pendingRewards.length > 0 && (
        <WorkRewardModal rewards={pendingRewards} onClaim={handleClaimRewards} onWatchAd={() => ui.setAdTarget('reward')} />
      )}

      {toasts.map((t, i) => (
        <Toast key={t.id} message={t.message} index={i} onHide={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
      ))}
    </div>
  )
}
