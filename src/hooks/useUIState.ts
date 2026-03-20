import { useCallback, useEffect, useRef, useState } from 'react'
import type { AnimalId } from '../types/animal'
import type { Item } from '../types/item'
import type { FALiveStates } from '../engine/types'
import type { UpgradeAmount } from '../features/navigation/UpgradeAmountToggle'

export function useUIState() {
  // ── 네비게이션 ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<number | null>(null)
  const activeTabRef = useRef(activeTab)
  useEffect(() => { activeTabRef.current = activeTab }, [activeTab])

  // ── 바텀시트 섹션 ──────────────────────────────────────────────────────────
  const [prodSection, setProdSection] = useState<'production' | 'factory'>('production')
  const [animalType, setAnimalType] = useState<'hamster' | 'cat' | 'dog'>('hamster')
  const [prestigeSection, setPrestigeSection] = useState<'item' | 'buffer'>('item')
  const [lbMode, setLbMode] = useState<'prestige' | 'gold'>('prestige')
  const [upgradeAmount, setUpgradeAmount] = useState<UpgradeAmount>(1)

  // ── 클릭커 ─────────────────────────────────────────────────────────────────
  const [clickerGrade, setClickerGrade] = useState(0)

  // ── 동물 배치 ──────────────────────────────────────────────────────────────
  const [placingAnimalId, setPlacingAnimalId] = useState<AnimalId | null>(null)

  // ── 팝업 선택 상태 ─────────────────────────────────────────────────────────
  const [focusFactory, setFocusFactory] = useState<{ row: number; col: number } | null>(null)
  const [selectedFactory, setSelectedFactory] = useState<{ row: number; col: number } | null>(null)
  const [selectedProducer, setSelectedProducer] = useState<{ row: number; col: number } | null>(null)
  const [selectedRs, setSelectedRs] = useState<{
    rsKey: string
    rsQueuesRef: React.MutableRefObject<Record<string, Item[]>>
  } | null>(null)

  // ── 모달 ───────────────────────────────────────────────────────────────────
  const [adTarget, setAdTarget] = useState<'speed' | 'gold' | 'prestige' | 'prestigeKeep' | null>(null)
  const [showPrestigeModal, setShowPrestigeModal] = useState(false)
  const [showPrestigeKeepModal, setShowPrestigeKeepModal] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // ── 스플래시 / 튜토리얼 ────────────────────────────────────────────────────
  const [showSplash, setShowSplash] = useState(true)
  const [tutorialStep, setTutorialStep] = useState<number | null>(
    () => !localStorage.getItem('tutorialDone') ? 0 : null
  )
  const [tutorialItemCount, setTutorialItemCount] = useState(0)

  // ── FA / 생산자 진행도 refs ────────────────────────────────────────────────
  const faLiveStatesRef = useRef<FALiveStates>({})
  const producerProgressesRef = useRef<Record<string, number>>({})

  // ── 핸들러 ─────────────────────────────────────────────────────────────────
  const handleSplashDone = useCallback(() => setShowSplash(false), [])

  const handleStartPlacing = useCallback((id: AnimalId) => {
    setPlacingAnimalId(id)
    setActiveTab(null)
  }, [])

  const handleCancelPlacing = useCallback(() => setPlacingAnimalId(null), [])

  const handleFactoryClick = useCallback((row: number, col: number) => {
    setSelectedFactory({ row, col })
  }, [])

  const handleProducerClick = useCallback((_row: number, _col: number) => {
    setSelectedProducer({ row: _row, col: _col })
  }, [])

  const handleRsClick = useCallback((
    _row: number,
    _col: number,
    rsKey: string,
    rsQueuesRef: React.MutableRefObject<Record<string, Item[]>>,
  ) => {
    setSelectedRs({ rsKey, rsQueuesRef })
  }, [])

  const handleFaLiveStateChange = useCallback((states: FALiveStates) => {
    faLiveStatesRef.current = states
  }, [])

  const handleProducerProgressChange = useCallback((progresses: Record<string, number>) => {
    producerProgressesRef.current = progresses
  }, [])

  return {
    // 네비게이션
    activeTab, setActiveTab, activeTabRef,
    // 섹션
    prodSection, setProdSection,
    animalType, setAnimalType,
    prestigeSection, setPrestigeSection,
    lbMode, setLbMode,
    upgradeAmount, setUpgradeAmount,
    // 클릭커
    clickerGrade, setClickerGrade,
    // 동물 배치
    placingAnimalId, setPlacingAnimalId,
    // 팝업
    focusFactory, setFocusFactory,
    selectedFactory, setSelectedFactory,
    selectedProducer, setSelectedProducer,
    selectedRs, setSelectedRs,
    // 모달
    adTarget, setAdTarget,
    showPrestigeModal, setShowPrestigeModal,
    showPrestigeKeepModal, setShowPrestigeKeepModal,
    showResetConfirm, setShowResetConfirm,
    // 스플래시/튜토리얼
    showSplash, setShowSplash,
    tutorialStep, setTutorialStep,
    tutorialItemCount, setTutorialItemCount,
    // refs
    faLiveStatesRef,
    producerProgressesRef,
    // 핸들러
    handleSplashDone,
    handleStartPlacing,
    handleCancelPlacing,
    handleFactoryClick,
    handleProducerClick,
    handleRsClick,
    handleFaLiveStateChange,
    handleProducerProgressChange,
  }
}
