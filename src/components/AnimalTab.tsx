import type { GameState } from '../types/gameState'
import type { AnimalId } from '../types/animal'
import { ANIMAL_IDS } from '../types/animal'
import { getAnimalUnlockCost, getAnimalUpgradeCost, getAnimalStat } from '../balance'
import { formatGold, formatNumber } from '../utils/formatGold'
import { AnimalSvg } from './AnimalSvg'
import type { AnimalSpecies } from './AnimalSvg'
import styles from './PrestigeTab.module.css'

const ANIMAL_TYPE_NAME: Record<string, string> = { hamster: '햄스터', cat: '고양이', dog: '강아지' }

const HAT_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e','#06b6d4',
  '#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f43f5e',
  '#84cc16','#0ea5e9','#a855f7','#fb923c','#34d399',
  '#60a5fa','#f472b6','#facc15','#4ade80','#c084fc',
]

function AnimalIcon({ id }: { id: string }) {
  const type = (id.match(/^([a-z]+)/)?.[1] ?? 'hamster') as AnimalSpecies
  const num = parseInt(id.match(/(\d+)$/)?.[1] ?? '1')
  const hatColor = HAT_COLORS[(num - 1) % HAT_COLORS.length]
  return (
    <div style={{ position: 'relative', width: 36, height: 46, flexShrink: 0 }}>
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
      <span style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>
        <AnimalSvg species={type} size={32}/>
      </span>
    </div>
  )
}

function getAnimalTypeName(id: string) {
  const type = id.match(/^([a-z]+)/)?.[1] ?? ''
  return ANIMAL_TYPE_NAME[type] ?? '동물'
}

interface Props {
  gameState: GameState
  animalType: 'hamster' | 'cat' | 'dog'
  onUnlockAnimal: (id: AnimalId) => void
  onUpgradeAnimal: (id: AnimalId) => void
  onStartPlacing: (id: AnimalId) => void
  onRecallAnimal: (id: AnimalId) => void
}

export default function AnimalTab({ gameState, animalType, onUnlockAnimal, onUpgradeAnimal, onStartPlacing, onRecallAnimal }: Props) {
  const { animals, factories, prestigePoints } = gameState
  const unlockCost = getAnimalUnlockCost()
  const filteredIds = ANIMAL_IDS.filter(id => id.startsWith(animalType))

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {filteredIds.map(id => {
          const animal = animals.find(a => a.id === id)!
          const upgradeCost = getAnimalUpgradeCost(animal.level)
          const isPlaced = factories.some(f => f.animalId === id)
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
                    <span className={styles.cardSub}>+{formatNumber(getAnimalStat(animal.level) * 100)}% 가치</span>
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
    </div>
  )
}
