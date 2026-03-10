import { useCallback, useEffect, useRef, useState } from 'react'
import Board from './components/Board'
import Navigation from './components/Navigation'
import TabBar from './components/TabBar'
import BottomSheet from './components/BottomSheet'
import ProductionTab from './components/ProductionTab'
import { initialBoard } from './data/initialBoard'
import { initialGameState } from './types/gameState'
import type { Board as BoardType, Cell } from './types/board'
import type { GameState } from './types/gameState'
import { getBundleCost, getProducerUpgradeCost } from './balance'

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
  const [board, setBoard] = useState<BoardType>(initialBoard)
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const earnedInSecRef = useRef(0)
  const lastSecRef = useRef(Date.now())
  const spawnClickerItemRef = useRef<(() => void) | null>(null)
  const [activeTab, setActiveTab] = useState<number | null>(null)

  // 초당 수익 계산 (1초마다 갱신)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = (now - lastSecRef.current) / 1000
      const perSec = Math.round(earnedInSecRef.current / elapsed)
      setGameState(prev => ({ ...prev, goldPerSec: perSec }))
      earnedInSecRef.current = 0
      lastSecRef.current = now
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleGoldEarned = useCallback((amount: number) => {
    earnedInSecRef.current += amount
    setGameState(prev => ({ ...prev, gold: prev.gold + amount }))
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

  const bundleCost = getBundleCost(gameState.bundleCount)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingBottom: 56 }}>
      <Navigation gameState={gameState} />
      <Board
        board={board}
        onAddBundle={handleAddBundle}
        onGoldEarned={handleGoldEarned}
        bundleCost={bundleCost}
        canAddBundle={gameState.gold >= bundleCost}
        producers={gameState.producers}
        spawnClickerItemRef={spawnClickerItemRef}
      />
      <TabBar
        clicker={gameState.clicker}
        onClickerClick={handleClickerClick}
        onTabChange={setActiveTab}
        sheetOpen={activeTab !== null}
      />
      <BottomSheet open={activeTab !== null} onClose={() => setActiveTab(null)}>
        {activeTab === 0 && (
          <ProductionTab
            producers={gameState.producers}
            gold={gameState.gold}
            onUpgrade={handleUpgradeProducer}
          />
        )}
      </BottomSheet>
    </div>
  )
}
