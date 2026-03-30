import { useCallback, useEffect, useRef, useState } from 'react'
import type { AnimalId } from '../types/animal'
import type { Item } from '../types/item'
import type { FALiveStates, PRState } from '../engine/types'
import type { UpgradeAmount } from '../features/navigation/UpgradeAmountToggle'

export type ActiveModal =
  | { type: 'ad'; target: 'speed' | 'gold' | 'prestige' | 'prestigeKeep' | 'reward' }
  | { type: 'factory'; row: number; col: number }
  | { type: 'producer'; row: number; col: number; prStatesRef?: React.MutableRefObject<Record<string, PRState>> }
  | { type: 'rs'; rsKey: string; rsQueuesRef: React.MutableRefObject<Record<string, Item[]>> }
  | { type: 'prestige' }
  | { type: 'prestigeKeep' }
  | { type: 'resetConfirm' }
  | { type: 'exitConfirm' }

export function useUIState() {
  // ── 네비게이션 ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<number | null>(null)
  const activeTabRef = useRef(activeTab)
  useEffect(() => { activeTabRef.current = activeTab }, [activeTab])

  // ── 바텀시트 섹션 ──────────────────────────────────────────────────────────
  const [prodSection, setProdSection] = useState<'production' | 'factory'>('production')
  const [animalType, setAnimalType] = useState<'hamster' | 'cat' | 'dog' | 'friend'>('hamster')
  const [prestigeSection, setPrestigeSection] = useState<'item' | 'buffer'>('item')
  const [lbMode, setLbMode] = useState<'prestige' | 'gold'>('gold')
  const [upgradeAmount, setUpgradeAmount] = useState<UpgradeAmount>(1)

  // ── 클릭커 ─────────────────────────────────────────────────────────────────
  const [clickerGrade, setClickerGrade] = useState(0)

  // ── 동물 배치 ──────────────────────────────────────────────────────────────
  const [placingAnimalId, setPlacingAnimalId] = useState<AnimalId | null>(null)

  // ── 팝업 선택 상태 ─────────────────────────────────────────────────────────
  const [focusFactory, setFocusFactory] = useState<{ row: number; col: number } | null>(null)

  // ── 모달 (단일 상태 - 동시 열림 방지) ────────────────────────────────────
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null)

  // 파생 값
  const adTarget = activeModal?.type === 'ad' ? activeModal.target : null
  const selectedFactory = activeModal?.type === 'factory' ? { row: activeModal.row, col: activeModal.col } : null
  const selectedProducer = activeModal?.type === 'producer' ? { row: activeModal.row, col: activeModal.col, prStatesRef: activeModal.prStatesRef ?? null } : null
  const selectedRs = activeModal?.type === 'rs' ? { rsKey: activeModal.rsKey, rsQueuesRef: activeModal.rsQueuesRef } : null
  const showPrestigeModal = activeModal?.type === 'prestige'
  const showPrestigeKeepModal = activeModal?.type === 'prestigeKeep'
  const showResetConfirm = activeModal?.type === 'resetConfirm'
  const showExitConfirm = activeModal?.type === 'exitConfirm'

  // 호환 세터
  const setAdTarget = useCallback((target: 'speed' | 'gold' | 'prestige' | 'prestigeKeep' | 'reward' | null) => {
    setActiveModal(target ? { type: 'ad', target } : null)
  }, [])
  const setSelectedFactory = useCallback((val: { row: number; col: number } | null) => {
    setActiveModal(val ? { type: 'factory', ...val } : null)
  }, [])
  const setSelectedProducer = useCallback((val: { row: number; col: number } | null) => {
    setActiveModal(val ? { type: 'producer', ...val } : null)
  }, [])
  const setSelectedRs = useCallback((val: { rsKey: string; rsQueuesRef: React.MutableRefObject<Record<string, Item[]>> } | null) => {
    setActiveModal(val ? { type: 'rs', ...val } : null)
  }, [])
  const setShowPrestigeModal = useCallback((show: boolean) => {
    setActiveModal(show ? { type: 'prestige' } : null)
  }, [])
  const setShowPrestigeKeepModal = useCallback((show: boolean) => {
    setActiveModal(show ? { type: 'prestigeKeep' } : null)
  }, [])
  const setShowResetConfirm = useCallback((show: boolean) => {
    setActiveModal(show ? { type: 'resetConfirm' } : null)
  }, [])
  const setShowExitConfirm = useCallback((show: boolean) => {
    setActiveModal(show ? { type: 'exitConfirm' } : null)
  }, [])

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
    setActiveModal({ type: 'factory', row, col })
  }, [])

  const handleProducerClick = useCallback((_row: number, _col: number, prStatesRef: React.MutableRefObject<Record<string, PRState>>) => {
    setActiveModal({ type: 'producer', row: _row, col: _col, prStatesRef })
  }, [])

  const handleRsClick = useCallback((
    _row: number,
    _col: number,
    rsKey: string,
    rsQueuesRef: React.MutableRefObject<Record<string, Item[]>>,
  ) => {
    setActiveModal({ type: 'rs', rsKey, rsQueuesRef })
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
    // 모달 (단일 상태)
    activeModal, setActiveModal,
    // 모달 파생 값 (호환)
    adTarget, setAdTarget,
    selectedFactory, setSelectedFactory,
    selectedProducer, setSelectedProducer,
    selectedRs, setSelectedRs,
    showPrestigeModal, setShowPrestigeModal,
    showPrestigeKeepModal, setShowPrestigeKeepModal,
    showResetConfirm, setShowResetConfirm,
    showExitConfirm, setShowExitConfirm,
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
