import { useState } from 'react'
import type { GameState } from '../types/gameState'
import type { AnimalId } from '../types/animal'
import { ANIMAL_NAMES, ANIMAL_IDS } from '../types/animal'
import { canPrestige, getPrestigePoints, getItemValueLevelCost, getItemValue, getAnimalUnlockCost, getAnimalUpgradeCost, getAnimalStat, getBufferUpgradeCost, getRsBufferCapacity, getFaBufferCapacity } from '../balance'
import { formatGold, formatNumber } from '../utils/formatGold'
import { CONFIG } from '../config'
import styles from './PrestigeTab.module.css'

const PRODUCT_NAMES: Record<number, string> = {
  1: '생파', 2: '파수프', 3: '파타르트', 4: '아토믹파', 5: '아토믹차이브',
  6: '울트라파', 7: '몬스터파', 8: '몬스터파XXL', 9: '퀀텀파',
}

interface Props {
  gameState: GameState
  onPrestige: () => void
  onPrestigeReset: () => void
  onLevelUpItemValue: (gradeIndex: number) => void
  onUnlockAnimal: (id: AnimalId) => void
  onUpgradeAnimal: (id: AnimalId) => void
  onStartPlacing: (id: AnimalId) => void
  onRecallAnimal: (id: AnimalId) => void
  onUpgradeRsBuffer: () => void
  onUpgradeFaBuffer: () => void
}

export default function PrestigeTab({ gameState, onPrestige, onPrestigeReset, onLevelUpItemValue, onUnlockAnimal, onUpgradeAnimal, onStartPlacing, onRecallAnimal, onUpgradeRsBuffer, onUpgradeFaBuffer }: Props) {
  const { totalEarned, prestigePoints, itemValueLevels, animals, rsBufferLevel, faBufferLevel } = gameState
  const possible = canPrestige(totalEarned)
  const earnPoints = getPrestigePoints(totalEarned)
  const [itemOpen, setItemOpen] = useState(true)
  const [animalOpen, setAnimalOpen] = useState(true)
  const [bufferOpen, setBufferOpen] = useState(true)
  const unlockCost = getAnimalUnlockCost()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>환생</h2>
        <span className={styles.headerInfo}>⭐{formatGold(prestigePoints)} · 🪙{formatGold(totalEarned)}</span>
      </div>

      <div className={styles.card}>
        <button className={styles.prestigeButton} onClick={onPrestige} disabled={!possible}>
          환생 +⭐{formatGold(earnPoints)}
        </button>
        <button className={styles.resetButton} onClick={onPrestigeReset}>
          환생 초기화
        </button>
      </div>

      <button className={styles.sectionHeader} onClick={() => setItemOpen(v => !v)}>
        <span className={styles.title}>아이템 가치</span>
        <span className={styles.floorArrow}>{itemOpen ? '▲' : '▼'}</span>
      </button>
      {itemOpen && Array.from({ length: CONFIG.PRODUCT_GRADE_MAX }, (_, i) => {
        const grade = i + 1
        const level = itemValueLevels[i] ?? 1
        const cost = getItemValueLevelCost(level)
        const name = PRODUCT_NAMES[grade] ?? `${grade}`
        return (
          <div key={grade} className={styles.gradeRow}>
            <span className={styles.gradeName}>{grade}. {name}</span>
            <span className={styles.gradeValue}>🪙{formatGold(getItemValue(grade, level))}</span>
            <button className={styles.unlockButton} onClick={() => onLevelUpItemValue(i)} disabled={prestigePoints < cost}>
              ⭐{formatGold(cost)}
            </button>
          </div>
        )
      })}

      <button className={styles.sectionHeader} onClick={() => setAnimalOpen(v => !v)}>
        <span className={styles.title}>동물</span>
        <span className={styles.floorArrow}>{animalOpen ? '▲' : '▼'}</span>
      </button>
      {animalOpen && ANIMAL_IDS.map(id => {
        const animal = animals.find(a => a.id === id)!
        const upgradeCost = getAnimalUpgradeCost(animal.level)
        const isPlaced = gameState.factories.some(f => f.animalId === id)
        return (
          <div key={id} className={styles.gradeRow}>
            <span className={styles.gradeName}>{ANIMAL_NAMES[id]}</span>
            {animal.unlocked ? (
              <>
                <span className={styles.gradeStat}>+{formatNumber(getAnimalStat(animal.level) * 100)}%</span>
                <span className={styles.gradeLv}>Lv.{formatNumber(animal.level)}</span>
                <button
                  className={`${styles.placeButton} ${isPlaced ? styles.placed : ''}`}
                  onClick={() => isPlaced ? onRecallAnimal(id) : onStartPlacing(id)}
                >
                  {isPlaced ? '회수' : '배치'}
                </button>
                <button className={styles.unlockButton} onClick={() => onUpgradeAnimal(id)} disabled={prestigePoints < upgradeCost}>
                  ⭐{formatGold(upgradeCost)}
                </button>
              </>
            ) : (
              <button className={styles.unlockButton} onClick={() => onUnlockAnimal(id)} disabled={prestigePoints < unlockCost}>
                해금 ⭐{formatGold(unlockCost)}
              </button>
            )}
          </div>
        )
      })}
      <button className={styles.sectionHeader} onClick={() => setBufferOpen(v => !v)}>
        <span className={styles.title}>공장/레일 버퍼</span>
        <span className={styles.floorArrow}>{bufferOpen ? '▲' : '▼'}</span>
      </button>
      {bufferOpen && (
        <>
          <div className={styles.gradeRow}>
            <span className={styles.gradeName}>RS 버퍼</span>
            <span className={styles.gradeValue}>x{getRsBufferCapacity(rsBufferLevel)}</span>
            <span className={styles.gradeLv}>Lv.{rsBufferLevel}</span>
            <button className={styles.unlockButton} onClick={onUpgradeRsBuffer} disabled={prestigePoints < getBufferUpgradeCost(rsBufferLevel)}>
              ⭐{formatGold(getBufferUpgradeCost(rsBufferLevel))}
            </button>
          </div>
          <div className={styles.gradeRow}>
            <span className={styles.gradeName}>FA 버퍼</span>
            <span className={styles.gradeValue}>x{getFaBufferCapacity(faBufferLevel)}</span>
            <span className={styles.gradeLv}>Lv.{faBufferLevel}</span>
            <button className={styles.unlockButton} onClick={onUpgradeFaBuffer} disabled={prestigePoints < getBufferUpgradeCost(faBufferLevel)}>
              ⭐{formatGold(getBufferUpgradeCost(faBufferLevel))}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
