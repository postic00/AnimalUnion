import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
import { initTossBackEvent, initTossVisibility, closeView } from './utils/toss'
import type { Board as BoardType, Cell } from './types/board'
import type { GameState } from './types/gameState'
import { AnimalSvg } from './features/animal/AnimalSvg'
import { getBundleCost, getBundleCostDiscount, getPrestigePoints, getRsBufferCapacity, getGoldMultiplierBonus } from './balance'
import { useUIState } from './hooks/useUIState'
import { useGameActions } from './hooks/useGameActions'

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
      speedBoostUntil: 0,
      goldBoostUntil: 0,
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
    speedBoostUntil: saved?.boosts?.speedBoostUntil ?? 0,
    goldBoostUntil: saved?.boosts?.goldBoostUntil ?? 0,
    hasOldSave: false,
  }
}

export default function App() {
  const [initData] = useState(loadInitialState)
  const [showOldSaveAlert, setShowOldSaveAlert] = useState(initData.hasOldSave)
  const [board, setBoard] = useState<BoardType>(initData.board)
  const [resetKey, setResetKey] = useState(0)
  const [gameState, setGameState] = useState<GameState>(initData.gameState)
  const [gold, setGold] = useState(() => !localStorage.getItem('tutorialDone') ? Math.max(initData.gameState.gold, 100) : initData.gameState.gold)
  const [totalEarned, setTotalEarned] = useState(initData.gameState.totalEarned)
  const [goldPerSec, setGoldPerSec] = useState(0)
  const [savedAt, setSavedAt] = useState<number | null>(initData.savedAt)
  const [muted, setMuted] = useState<boolean>(SaveService.loadMuted())

  const gameStateRef = useRef(gameState)
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => {
    if (gameState.prestigePoints.total > 0) savePrestigeTotal(gameState.prestigePoints.total)
  }, [gameState.prestigePoints.total])
  const goldRef = useRef(gold)
  const totalEarnedRef = useRef(totalEarned)
  const earnedInSecRef = useRef(0)
  const goldBufferRef = useRef(0)
  const totalEarnedBufferRef = useRef(0)
  const bucketHistoryRef = useRef<number[]>([])
  const spawnClickerItemRef = useRef<((grade: number) => void) | null>(null)
  const boardSaveRef = useRef<() => void>(() => {})
  const clickerGradeRef = useRef<number>(1)
  const spawnUnlockTimeRef = useRef<number>(0)
  const mutedRef = useRef(muted)
  const boardRef = useRef(board)
  useEffect(() => { boardRef.current = board }, [board])

  const BOOST_MS = 10 * 60 * 1000
  const [speedBoostUntil, setSpeedBoostUntil] = useState(initData.speedBoostUntil)
  const [goldBoostUntil, setGoldBoostUntil] = useState(initData.goldBoostUntil)
  const [now, setNow] = useState(() => Date.now())

  const goldBoostUntilRef = useRef(goldBoostUntil)
  const speedBoostUntilRef = useRef(speedBoostUntil)
  const goldMultiplierLevelRef = useRef(gameState.goldMultiplierLevel ?? 0)
  const goldPerSecRef = useRef(goldPerSec)
  useLayoutEffect(() => {
    goldRef.current = gold
    totalEarnedRef.current = totalEarned
    mutedRef.current = muted
    goldBoostUntilRef.current = goldBoostUntil
    speedBoostUntilRef.current = speedBoostUntil
    goldMultiplierLevelRef.current = gameState.goldMultiplierLevel ?? 0
    goldPerSecRef.current = goldPerSec
  })

  const [workData, setWorkData] = useState<WorkData>(() => {
    const saved = SaveService.loadWorkData()
    return saved ?? { ...initialWorkData, lastWorked: Date.now() }
  })
  const workDataRef = useRef(workData)
  const [rewardQueue, setRewardQueue] = useState<Reward[][]>([])
  const pendingRewards = rewardQueue[0] ?? []
  const [salaryToast, setSalaryToast] = useState<string>('')
  const [showSalaryToast, setShowSalaryToast] = useState(false)

  const platform = /android/i.test(navigator.userAgent) ? 'android' : /iphone|ipad/i.test(navigator.userAgent) ? 'ios' : 'web'

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    if (workData.lastActivityDate !== today) {
      ScoreService.recordSession(SaveService.getDeviceId(), platform)
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
      if (queue.length > 0) setRewardQueue(queue)
    }
    // lastWorked 갱신
    setWorkData(prev => ({ ...prev, lastWorked: Date.now() }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 보상 수령 핸들러 ──────────────────────────────────────────────────────
  const pendingRewardsRef = useRef(pendingRewards)
  useLayoutEffect(() => { pendingRewardsRef.current = pendingRewards })

  const handleClaimRewards = useCallback((multiplier = 1) => {
    pendingRewardsRef.current.forEach(r => {
      if (r.gold) {
        const gold = r.gold! * multiplier
        setGold(g => g + gold * getGoldMultiplierBonus(goldMultiplierLevelRef.current) )
        goldBufferRef.current += gold
        totalEarnedBufferRef.current += gold
      }
      if (r.boostMs) {
        const boostMs = r.boostMs! * multiplier
        setSpeedBoostUntil(prev => Math.max(prev, Date.now()) + boostMs)
        setGoldBoostUntil(prev => Math.max(prev, Date.now()) + boostMs)
      }
      if (r.type === 'breakfast' || r.type === 'lunch' || r.type === 'dinner') {
        const today = new Date().toISOString().slice(0, 10)
        // ref도 즉시 업데이트하여 다음 틱에서 중복 emit 방지
        workDataRef.current = {
          ...workDataRef.current,
          meals: { ...workDataRef.current.meals, [r.type]: today },
          mealWindow: { type: workDataRef.current.mealWindow.type, seconds: 0 },
        }
        setWorkData(workDataRef.current)
      }
    })
    setRewardQueue(prev => prev.slice(1))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── UI State ──────────────────────────────────────────────────────────────
  const ui = useUIState()

  // ── Game Actions ──────────────────────────────────────────────────────────
  const actions = useGameActions({
    goldRef, totalEarnedRef, mutedRef, goldBoostUntilRef, speedBoostUntilRef,
    goldMultiplierLevelRef, earnedInSecRef, goldBufferRef, totalEarnedBufferRef,
    boardSaveRef, boardRef, gameStateRef,
    spawnClickerItemRef, clickerGradeRef, spawnUnlockTimeRef,
    setGold, setTotalEarned, setGoldPerSec, setGameState, setBoard, setResetKey, setSavedAt,
    setMuted, setSpeedBoostUntil, setGoldBoostUntil,
    goldPerSec, platform,
    setClickerGrade: ui.setClickerGrade,
    setTutorialStep: ui.setTutorialStep,
    setTutorialItemCount: ui.setTutorialItemCount,
    setSelectedFactory: ui.setSelectedFactory,
    setShowPrestigeModal: ui.setShowPrestigeModal,
    setShowPrestigeKeepModal: ui.setShowPrestigeKeepModal,
    setShowSplash: ui.setShowSplash,
    adTarget: ui.adTarget,
    setAdTarget: ui.setAdTarget,
    onRewardClaim: handleClaimRewards,
    resetSalary: () => {
      workDataRef.current = { ...initialWorkData, lastWorked: Date.now() }
      setWorkData(workDataRef.current)
			goldBufferRef.current = 0
			totalEarnedBufferRef.current = 0
			earnedInSecRef.current = 0
			bucketHistoryRef.current = []
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
    if ([3, 4, 5, 6].includes(s)) ui.setActiveTab(null)
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
    const WINDOW = 600
    const getSnapshot = () => JSON.stringify({
      ...gameStateRef.current,
      gold: goldRef.current,
      totalEarned: totalEarnedRef.current,
    })
    const save = (force = false) => {
      const snapshot = getSnapshot()
      if (!force && snapshot === lastSavedSnapshotRef.current) return
      const ok = saveGame(boardRef.current, { ...gameStateRef.current, gold: goldRef.current, totalEarned: totalEarnedRef.current, goldPerSec }, {
        speedBoostUntil: speedBoostUntilRef.current,
        goldBoostUntil: goldBoostUntilRef.current,
      })
      if (!ok) return // 원자저장: 메인 저장 실패 시 엔진 상태 저장 생략
      lastSavedSnapshotRef.current = snapshot
      boardSaveRef.current()
      setSavedAt(Date.now())
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
        const g = goldBufferRef.current
        const t = totalEarnedBufferRef.current
        if (g > 0) {
          goldBufferRef.current = 0
          totalEarnedBufferRef.current = 0
          setGold(prev => prev + g)
          setTotalEarned(prev => prev + t)
        }
        
				setNow(Date.now())

        const bucket = earnedInSecRef.current
        earnedInSecRef.current = 0
        bucketHistoryRef.current.push(bucket)
        if (bucketHistoryRef.current.length > WINDOW) bucketHistoryRef.current.shift()
        const nonZero = bucketHistoryRef.current.filter(b => b > 0)
        const total = nonZero.reduce((a, b) => a + b, 0)
        setGoldPerSec(nonZero.length > 0 ? Math.round(total / nonZero.length) : 0)

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
          setGold(g => g + salaryReward.gold! * getGoldMultiplierBonus(goldMultiplierLevelRef.current) )
          goldBufferRef.current += salaryReward.gold!
          totalEarnedBufferRef.current += salaryReward.gold!
          setSalaryToast(`💰 월급 +${formatGold(salaryReward.gold!)}`)
          setShowSalaryToast(true)
          // salary 리셋
          workDataRef.current = { ...workDataRef.current, salary: { secondsAccumulated: newWorkData.salary.secondsAccumulated - CONFIG.WR_SALARY_SECONDS } }
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 크로스커팅 핸들러 ─────────────────────────────────────────────────────
  const { setSelectedFactory, tutorialStep, setTutorialStep, placingAnimalId, setPlacingAnimalId, setActiveTab } = ui
  const { handlePlaceAnimal: actionsPlaceAnimal, handleHardReset: actionsHardReset } = actions

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
  }, [actionsHardReset, setActiveTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const bundleCost = Math.floor(getBundleCost(gameState.bundleCount) * (1 - getBundleCostDiscount(gameState.bundleDiscountLevel ?? 0)))

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
    <div style={{ minHeight: '100vh', paddingBottom: ui.activeTab !== null ? 'calc(40vh + 68px + env(safe-area-inset-bottom))' : 'calc(68px + env(safe-area-inset-bottom))', position: 'relative', transition: 'padding-bottom 0.25s ease' }}>
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
          if (ui.tutorialStep === 8) {
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
      {!ui.showSplash && <Navigation gold={gold} goldPerSec={goldPerSec} prestigePoints={gameState.prestigePoints.current} totalPrestigePoints={gameState.prestigePoints.total} salarySecondsAccumulated={workDataRef.current.salary.secondsAccumulated} expectedSalary={Math.floor(goldPerSec * CONFIG.WR_SALARY_SECONDS * CONFIG.WR_SALARY_RATE)} />}
      {!ui.showSplash && ui.tutorialStep === 6 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 23, background: 'rgba(0,0,0,0.65)', pointerEvents: 'none' }} />
      )}
      {!ui.showSplash && <div style={ui.tutorialStep === 6 ? { position: 'relative', zIndex: 24 } : undefined}><Board
        key={resetKey}
        board={board}
        onAddBundle={actions.handleAddBundle}
        onGoldEarned={actions.handleGoldEarned}
        bundleCost={bundleCost}
        canAddBundle={gold >= bundleCost}
        producers={gameState.producers}
        factories={gameState.factories}
        animals={gameState.animals}
        levelConfig={{
          materialQuantityLevels: gameState.materialQuantityLevels,
          itemValueLevels: gameState.itemValueLevels,
          faBufferLevel: gameState.faBufferLevel,
          rsBufferLevel: gameState.rsBufferLevel,
          railSpeedLevel: gameState.railSpeedLevel ?? 1,
        }}
        placingAnimalId={ui.placingAnimalId}
        onPlaceAnimal={handlePlaceAnimal}
        onCancelPlacing={ui.handleCancelPlacing}
        spawnClickerItemRef={spawnClickerItemRef}
        onSaveRef={boardSaveRef}
        muted={muted}
        speedMultiplier={now < speedBoostUntil ? 2 : 1}
        onFactoryClick={handleFactoryClick}
        onProducerClick={ui.handleProducerClick}
        onRsClick={ui.handleRsClick}
        onFaLiveStateChange={ui.handleFaLiveStateChange}
        onProducerProgressChange={ui.handleProducerProgressChange}
        tutorialHighlight={ui.tutorialStep === 6 ? 'fa' : undefined}
        disableDerail={ui.tutorialStep !== null}
      /></div>}
      {!ui.showSplash && <TabBar
        clicker={gameState.clicker}
        clickerGrade={ui.clickerGrade}
        onClickerClick={actions.handleClickerClick}
        onTabChange={(tab) => {
          ui.setActiveTab(tab)
          saveGame(board, { ...gameState, gold, totalEarned, goldPerSec }, { speedBoostUntil, goldBoostUntil })
          setSavedAt(Date.now())
        }}
        activeTab={ui.activeTab}
        speedBoostUntil={speedBoostUntil}
        goldBoostUntil={goldBoostUntil}
        now={now}
        onSpeedBoost={() => {
          if (ui.tutorialStep === 4) {
            setSpeedBoostUntil(prev => Math.max(prev, Date.now()) + BOOST_MS)
            ui.setTutorialStep(5)
          } else {
            ui.setAdTarget('speed')
          }
        }}
        onGoldBoost={() => {
          if (ui.tutorialStep === 5) {
            setGoldBoostUntil(prev => Math.max(prev, Date.now()) + BOOST_MS)
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
        header={
          ui.activeTab === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>공장</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {([['production', '🌱 생산'], ['factory', '⚙️ 가공']] as const).map(([sec, label]) => (
                    <button
                      key={sec}
                      onClick={() => { ui.setProdSection(sec) }}
                      style={{
                        padding: '4px 12px', borderRadius: 10, border: '1.5px solid',
                        borderColor: ui.prodSection === sec ? '#16a34a' : '#e5e7eb',
                        background: ui.prodSection === sec ? '#f0fdf4' : '#fff',
                        color: ui.prodSection === sec ? '#16a34a' : '#9ca3af',
                        fontSize: 13, fontWeight: 800, cursor: 'pointer',
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <UpgradeAmountToggle value={ui.upgradeAmount} onChange={ui.setUpgradeAmount} />
            </div>
          ) : ui.activeTab === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>재료 관리</h2>
              <UpgradeAmountToggle value={ui.upgradeAmount} onChange={ui.setUpgradeAmount} />
            </div>
          ) : ui.activeTab === 2 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>동물</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  {([['hamster', '햄스터'], ['cat', '고양이'], ['dog', '강아지']] as const).map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => ui.setAnimalType(type)}
                      style={{
                        padding: '4px 10px', borderRadius: 10, border: '1.5px solid',
                        borderColor: ui.animalType === type ? '#6366f1' : '#e5e7eb',
                        background: ui.animalType === type ? '#eef2ff' : '#fff',
                        color: ui.animalType === type ? '#6366f1' : '#9ca3af',
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
              <UpgradeAmountToggle value={ui.upgradeAmount} onChange={ui.setUpgradeAmount} />
            </div>
          ) : ui.activeTab === 3 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>환생</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  {([['item', '📦 아이템'], ['buffer', '🔧 기타']] as const).map(([sec, label]) => (
                    <button
                      key={sec}
                      onClick={() => ui.setPrestigeSection(sec)}
                      style={{
                        padding: '4px 10px', borderRadius: 10, border: '1.5px solid',
                        borderColor: ui.prestigeSection === sec ? '#f59e0b' : '#e5e7eb',
                        background: ui.prestigeSection === sec ? '#fffbeb' : '#fff',
                        color: ui.prestigeSection === sec ? '#d97706' : '#9ca3af',
                        fontSize: 12, fontWeight: 800, cursor: 'pointer',
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <UpgradeAmountToggle value={ui.upgradeAmount} onChange={ui.setUpgradeAmount} />
            </div>
          ) : ui.activeTab === 4 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>순위</h2>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280' }}>{CONFIG.CURRENT_WEEK}시즌</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => ui.setLbMode('prestige')}
                  style={{
                    padding: '4px 12px', borderRadius: 10, border: '1.5px solid',
                    borderColor: ui.lbMode === 'prestige' ? '#6366f1' : '#e5e7eb',
                    background: ui.lbMode === 'prestige' ? '#eef2ff' : '#fff',
                    color: ui.lbMode === 'prestige' ? '#6366f1' : '#9ca3af',
                    fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  }}
                >⭐ 환생</button>
                <button
                  onClick={() => ui.setLbMode('gold')}
                  style={{
                    padding: '4px 12px', borderRadius: 10, border: '1.5px solid',
                    borderColor: ui.lbMode === 'gold' ? '#6366f1' : '#e5e7eb',
                    background: ui.lbMode === 'gold' ? '#eef2ff' : '#fff',
                    color: ui.lbMode === 'gold' ? '#6366f1' : '#9ca3af',
                    fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  }}
                >💰 골드</button>
              </div>
            </div>
          ) : (
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191f28', letterSpacing: '-0.5px' }}>
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
            animals={gameState.animals}
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
          />
        )}
        {ui.activeTab === 4 && (
          <LeaderboardTab
            playerName={gameState.playerName}
            mode={ui.lbMode}
            onNameChange={async name => {
              if (!name.trim()) return
              setGameState(prev => ({ ...prev, playerName: name }))
              await ScoreService.updatePlayerName(SaveService.getDeviceId(), name)
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
            onHardReset={() => ui.setShowResetConfirm(true)}
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
          message={'모든 데이터가 삭제됩니다.\n정말 초기화하시겠습니까?'}
          confirmLabel="초기화"
          onConfirm={() => { ui.setShowResetConfirm(false); handleHardReset() }}
          onClose={() => ui.setShowResetConfirm(false)}
        />
      )}

      {/* 근무 보상 모달 */}
      {pendingRewards.length > 0 && (
        <WorkRewardModal rewards={pendingRewards} onClaim={handleClaimRewards} onWatchAd={() => ui.setAdTarget('reward')} />
      )}

      {/* 월급 토스트 */}
      <Toast message={salaryToast} visible={showSalaryToast} onHide={() => setShowSalaryToast(false)} />
    </div>
  )
}
