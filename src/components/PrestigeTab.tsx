import { useState } from 'react'
import type { GameState } from '../types/gameState'
import type { AnimalId } from '../types/animal'
import { ANIMAL_IDS } from '../types/animal'
import { canPrestige, getPrestigePoints, getItemValueLevelCost, getItemValue, getAnimalUnlockCost, getAnimalUpgradeCost, getAnimalStat, getBufferUpgradeCost, getRsBufferCapacity, getFaBufferCapacity } from '../balance'
import { formatGold, formatNumber } from '../utils/formatGold'
import { CONFIG } from '../config'
import coinIcon from '../assets/coin.svg'
import styles from './PrestigeTab.module.css'

const PRODUCT_NAMES: Record<number, string> = {
  1: '고추', 2: '양파', 3: '마늘', 4: '고추기름', 5: '딸기',
  6: '마늘기름', 7: '꼬치', 8: '화자오', 9: '포도', 10: '두반장',
  11: '설탕시럽', 12: '새우튀김', 13: '팔각', 14: '코팅액', 15: '마라육수',
  16: '탕후루꼬치', 17: '마라소스', 18: '탕후루', 19: '마라탕', 20: '마라탕후루',
}

const PRODUCT_EMOJIS: Record<number, string> = {
  1: '🌶️', 2: '🧅', 3: '🧄', 4: '🫙', 5: '🍓',
  6: '🫒', 7: '🍢', 8: '🌰', 9: '🍇', 10: '🍯',
  11: '🧁', 12: '🍤', 13: '⭐', 14: '✨', 15: '🍲',
  16: '🍡', 17: '🫗', 18: '🍭', 19: '🥘', 20: '🏆',
}

const ANIMAL_EMOJI: Record<string, string> = { hamster: '🐹', cat: '🐱', dog: '🐶' }
const ANIMAL_TYPE_NAME: Record<string, string> = { hamster: '햄스터', cat: '고양이', dog: '강아지' }

const HAT_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e','#06b6d4',
  '#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f43f5e',
  '#84cc16','#0ea5e9','#a855f7','#fb923c','#34d399',
  '#60a5fa','#f472b6','#facc15','#4ade80','#c084fc',
]

function AnimalIcon({ id }: { id: string }) {
  const type = id.match(/^([a-z]+)/)?.[1] ?? ''
  const num = parseInt(id.match(/(\d+)$/)?.[1] ?? '1')
  const emoji = ANIMAL_EMOJI[type] ?? '🐾'
  const hatColor = HAT_COLORS[(num - 1) % HAT_COLORS.length]
  return (
    <div style={{ position: 'relative', width: 36, height: 42, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        background: hatColor,
        borderRadius: '8px 8px 4px 4px',
        width: 28, height: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 2px 6px ${hatColor}66`,
        zIndex: 1,
      }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{num}</span>
      </div>
      <span style={{ fontSize: 28, lineHeight: 1, position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>{emoji}</span>
    </div>
  )
}

function getAnimalTypeName(id: string) {
  const type = id.match(/^([a-z]+)/)?.[1] ?? ''
  return ANIMAL_TYPE_NAME[type] ?? '동물'
}

interface Props {
  gameState: GameState
  onPrestige: () => void
  onPrestigeReset: () => void
  onPrestigeKeepPoints: () => void
  onLevelUpItemValue: (gradeIndex: number) => void
  onUnlockAnimal: (id: AnimalId) => void
  onUpgradeAnimal: (id: AnimalId) => void
  onStartPlacing: (id: AnimalId) => void
  onRecallAnimal: (id: AnimalId) => void
  onUpgradeRsBuffer: () => void
  onUpgradeFaBuffer: () => void
}

export default function PrestigeTab({ gameState, onPrestige, onPrestigeKeepPoints, onLevelUpItemValue, onUnlockAnimal, onUpgradeAnimal, onStartPlacing, onRecallAnimal, onUpgradeRsBuffer, onUpgradeFaBuffer }: Props) {
  const { totalEarned, prestigePoints, itemValueLevels, animals, rsBufferLevel, faBufferLevel } = gameState
  const possible = canPrestige(totalEarned)
  const earnPoints = getPrestigePoints(totalEarned)
  const [itemOpen, setItemOpen] = useState(true)
  const [animalOpen, setAnimalOpen] = useState(true)
  const [bufferOpen, setBufferOpen] = useState(true)
  const unlockCost = getAnimalUnlockCost()

  return (
    <div className={styles.container}>

      {/* 환생 버튼 */}
      <div className={styles.prestigeBtns}>
        <button className={styles.prestigeBtn} onClick={onPrestige} disabled={!possible}>
          <span className={styles.prestigeBtnIcon}>⭐</span>
          <div className={styles.prestigeBtnTexts}>
            <span className={styles.prestigeBtnTitle}>환생</span>
            <span className={styles.prestigeBtnSub}>포인트 리셋</span>
          </div>
          <span className={styles.prestigeBtnPoints}>+{formatGold(earnPoints)}</span>
        </button>
        <button className={styles.prestigeBtnKeep} onClick={onPrestigeKeepPoints} disabled={!possible}>
          <span className={styles.prestigeBtnIcon}>⭐</span>
          <div className={styles.prestigeBtnTexts}>
            <span className={styles.prestigeBtnTitle}>환생</span>
            <span className={styles.prestigeBtnSub}>포인트 유지</span>
          </div>
          <span className={styles.prestigeBtnPoints}>+{formatGold(earnPoints)}</span>
        </button>
      </div>

      {/* 아이템 가치 */}
      <button className={styles.sectionHeader} onClick={() => setItemOpen(v => !v)}>
        <span className={styles.sectionTitle}>아이템 가치</span>
        <div className={styles.sectionLine} />
        <span className={styles.sectionArrow}>{itemOpen ? '▲' : '▼'}</span>
      </button>
      {itemOpen && (
        <div className={styles.list}>
          {Array.from({ length: CONFIG.PRODUCT_GRADE_MAX }, (_, i) => {
            const grade = i + 1
            const level = itemValueLevels[i] ?? 1
            const cost = getItemValueLevelCost(level)
            return (
              <div key={grade} className={styles.card}>
                <div className={styles.cardLeft}>
                  <span className={styles.cardEmoji}>{PRODUCT_EMOJIS[grade] ?? '📦'}</span>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardNameRow}>
                      <span className={styles.cardName}>{PRODUCT_NAMES[grade] ?? `${grade}등급`}</span>
                      <span className={styles.levelBadge}>Lv.{level}</span>
                    </div>
                    <span className={styles.cardSub}>
                      <img src={coinIcon} className={styles.subIcon} alt="" />
                      {formatGold(getItemValue(grade, level))}
                    </span>
                  </div>
                </div>
                <button className={styles.starBtn} onClick={() => onLevelUpItemValue(i)} disabled={prestigePoints < cost}>
                  ⭐ {formatGold(cost)}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 동물 */}
      <button className={styles.sectionHeader} onClick={() => setAnimalOpen(v => !v)}>
        <span className={styles.sectionTitle}>동물</span>
        <div className={styles.sectionLine} />
        <span className={styles.sectionArrow}>{animalOpen ? '▲' : '▼'}</span>
      </button>
      {animalOpen && (
        <div className={styles.list}>
          {ANIMAL_IDS.map(id => {
            const animal = animals.find(a => a.id === id)!
            const upgradeCost = getAnimalUpgradeCost(animal.level)
            const isPlaced = gameState.factories.some(f => f.animalId === id)
            return (
              <div key={id} className={`${styles.card} ${!animal.unlocked ? styles.cardLocked : ''}`}>
                <div className={styles.cardLeft}>
                  <AnimalIcon id={id} />
                  <div className={styles.cardInfo}>
                    <div className={styles.cardNameRow}>
                      <span className={styles.cardName}>{getAnimalTypeName(id)}</span>
                      {animal.unlocked && <span className={styles.levelBadge}>Lv.{formatNumber(animal.level)}</span>}
                    </div>
                    {animal.unlocked && (
                      <span className={styles.cardSub}>+{formatNumber(getAnimalStat(animal.level) * 100)}% 속도</span>
                    )}
                  </div>
                </div>
                <div className={styles.cardBtns}>
                  {animal.unlocked ? (
                    <>
                      <button
                        className={`${styles.placeBtn} ${isPlaced ? styles.placeBtnRecall : ''}`}
                        onClick={() => isPlaced ? onRecallAnimal(id) : onStartPlacing(id)}
                      >
                        {isPlaced ? '회수' : '배치'}
                      </button>
                      <button className={styles.starBtn} onClick={() => onUpgradeAnimal(id)} disabled={prestigePoints < upgradeCost}>
                        ⭐ {formatGold(upgradeCost)}
                      </button>
                    </>
                  ) : (
                    <button className={styles.unlockBtn} onClick={() => onUnlockAnimal(id)} disabled={prestigePoints < unlockCost}>
                      🔓 {formatGold(unlockCost)}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 저장소 */}
      <button className={styles.sectionHeader} onClick={() => setBufferOpen(v => !v)}>
        <span className={styles.sectionTitle}>저장소</span>
        <div className={styles.sectionLine} />
        <span className={styles.sectionArrow}>{bufferOpen ? '▲' : '▼'}</span>
      </button>
      {bufferOpen && (
        <div className={styles.list}>
          <div className={styles.card}>
            <div className={styles.cardLeft}>
              <span className={styles.cardEmoji}>▶</span>
              <div className={styles.cardInfo}>
                <div className={styles.cardNameRow}>
                  <span className={styles.cardName}>생산 저장소</span>
                  <span className={styles.levelBadge}>Lv.{rsBufferLevel}</span>
                </div>
                <span className={styles.cardSub}>용량 ×{getRsBufferCapacity(rsBufferLevel)}</span>
              </div>
            </div>
            <button className={styles.starBtn} onClick={onUpgradeRsBuffer} disabled={prestigePoints < getBufferUpgradeCost(rsBufferLevel)}>
              ⭐ {formatGold(getBufferUpgradeCost(rsBufferLevel))}
            </button>
          </div>
          <div className={styles.card}>
            <div className={styles.cardLeft}>
              <span className={styles.cardEmoji}>🏭</span>
              <div className={styles.cardInfo}>
                <div className={styles.cardNameRow}>
                  <span className={styles.cardName}>공장 저장소</span>
                  <span className={styles.levelBadge}>Lv.{faBufferLevel}</span>
                </div>
                <span className={styles.cardSub}>용량 ×{getFaBufferCapacity(faBufferLevel)}</span>
              </div>
            </div>
            <button className={styles.starBtn} onClick={onUpgradeFaBuffer} disabled={prestigePoints < getBufferUpgradeCost(faBufferLevel)}>
              ⭐ {formatGold(getBufferUpgradeCost(faBufferLevel))}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
