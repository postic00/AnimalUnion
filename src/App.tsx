import { useCallback, useEffect, useRef, useState } from 'react'
import Board from './components/Board'
import Navigation from './components/Navigation'
import TabBar from './components/TabBar'
import BottomSheet from './components/BottomSheet'
import ProductionTab from './components/ProductionTab'
import FactoryTab from './components/FactoryTab'
import PrestigeTab from './components/PrestigeTab'
import MaterialTab from './components/MaterialTab'
import SettingsTab from './components/SettingsTab'
import SplashScreen from './components/SplashScreen'
import { initialBoard } from './data/initialBoard'
import { initialGameState } from './types/gameState'
import { saveGame, loadGame, deleteSave, getSavedAt, saveMuted, loadMuted } from './utils/saveLoad'
import type { Board as BoardType, Cell } from './types/board'
import type { GameState } from './types/gameState'
import type { Factory } from './types/factory'
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
  getBufferUpgradeCost,
} from './balance'
import type { AnimalId } from './types/animal'

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

export default function App() {
  const saved = loadGame()
  const [board, setBoard] = useState<BoardType>(saved?.board ?? initialBoard)
  const [gameState, setGameState] = useState<GameState>(saved?.gameState ?? initialGameState)
  const [savedAt, setSavedAt] = useState<number | null>(saved?.savedAt ?? getSavedAt())
  const earnedInSecRef = useRef(0)
  const bucketHistoryRef = useRef<number[]>([])
  const spawnClickerItemRef = useRef<(() => void) | null>(null)
  const [placingAnimalId, setPlacingAnimalId] = useState<AnimalId | null>(null)
  const [activeTab, setActiveTab] = useState<number | null>(null)
  const [muted, setMuted] = useState<boolean>(loadMuted())
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      saveGame(board, gameState)
      setSavedAt(Date.now())
    }, 30_000)
    return () => clearInterval(interval)
  }, [board, gameState])

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

  const handleGoldEarned = useCallback((amount: number) => {
    earnedInSecRef.current += amount
    setGameState(prev => ({ ...prev, gold: prev.gold + amount, totalEarned: prev.totalEarned + amount }))
  }, [])

  const handleClickerClick = useCallback(() => {
    setGameState(prev => {
      const next = prev.clicker.clickCount + 1
      if (next >= prev.clicker.threshold) {
        spawnClickerItemRef.current?.()
        return { ...prev, clicker: { ...prev.clicker, clickCount: 0 } }
      }
      return { ...prev, clicker: { ...prev.clicker, clickCount: next } }
    })
  }, [])

  const handleBuildProducer = useCallback((index: number) => {
    setGameState(prev => {
      const cost = getProducerBuildCost()
      if (prev.gold < cost) return prev
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
      const newFactory: Factory = {
        row, col, built: true, type: 'WA', grade: 1, level: 1, dir: 'UP_TO_DOWN', animalId: null,
      }
      return { ...prev, gold: prev.gold - cost, factories: [...prev.factories, newFactory] }
    })
  }, [])

  const handleSetFactoryType = useCallback((row: number, col: number, type: Factory['type']) => {
    setGameState(prev => ({
      ...prev,
      factories: prev.factories.map(f => f.row === row && f.col === col ? { ...f, type } : f),
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
    setBoard(initialBoard)
    setGameState(initialGameState)
    setSavedAt(null)
    setActiveTab(null)
  }, [])

  const handleToggleMute = useCallback(() => {
    setMuted(prev => {
      saveMuted(!prev)
      return !prev
    })
  }, [])

  const handlePrestige = useCallback(() => {
    setBoard(initialBoard)
    setGameState(prev => ({
      ...prev,
      gold: initialGameState.gold,
      goldPerSec: 0,
      bundleCount: 0,
      producers: initialGameState.producers,
      factories: prev.factories.map(f => ({ ...f, built: false, level: 1, grade: 1 })),
      totalEarned: 0,
      materialQuantityLevels: initialGameState.materialQuantityLevels,
      prestigeCount: prev.prestigeCount + 1,
      prestigePoints: prev.prestigePoints + getPrestigePoints(prev.totalEarned),
      rsBufferLevel: prev.rsBufferLevel,
      faBufferLevel: prev.faBufferLevel,
    }))
  }, [])

  const handlePrestigeReset = useCallback(() => {
    setGameState(prev => {
      const refund = getItemValueResetRefund(prev.itemValueLevels) + getAnimalResetRefund(prev.animals)
      return {
        ...prev,
        prestigePoints: prev.prestigePoints + refund,
        itemValueLevels: initialGameState.itemValueLevels,
        animals: initialGameState.animals,
      }
    })
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingBottom: 56 }}>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <Navigation gameState={gameState} />
      <Board
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
      />
      <TabBar
        clicker={gameState.clicker}
        onClickerClick={handleClickerClick}
        onTabChange={(tab) => {
          setActiveTab(tab)
          saveGame(board, gameState)
          setSavedAt(Date.now())
        }}
        sheetOpen={activeTab !== null}
      />
      <BottomSheet open={activeTab !== null} onClose={() => setActiveTab(null)}>
        {activeTab === 0 && (
          <ProductionTab
            producers={gameState.producers}
            gold={gameState.gold}
            materialQuantityLevels={gameState.materialQuantityLevels}
            onBuild={handleBuildProducer}
            onUpgrade={handleUpgradeProducer}
          />
        )}
        {activeTab === 1 && (
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
        {activeTab === 2 && (
          <MaterialTab
            gameState={gameState}
            onUpgradeQuantity={handleUpgradeMaterialQuantity}
          />
        )}
        {activeTab === 3 && (
          <PrestigeTab
            gameState={gameState}
            onPrestige={handlePrestige}
            onPrestigeReset={handlePrestigeReset}
            onLevelUpItemValue={handleLevelUpItemValue}
            onUnlockAnimal={handleUnlockAnimal}
            onUpgradeAnimal={handleUpgradeAnimal}
            onStartPlacing={handleStartPlacing}
            onRecallAnimal={handleRecallAnimal}
            onUpgradeRsBuffer={handleUpgradeRsBuffer}
            onUpgradeFaBuffer={handleUpgradeFaBuffer}
          />
        )}
        {activeTab === 4 && (
          <SettingsTab
            savedAt={savedAt}
            muted={muted}
            onToggleMute={handleToggleMute}
            onHardReset={handleHardReset}
          />
        )}
      </BottomSheet>
    </div>
  )
}
