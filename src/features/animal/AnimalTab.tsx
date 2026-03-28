import type { GameState } from '../../types/gameState'
import type { AnimalId, FriendId } from '../../types/animal'
import { ANIMAL_IDS } from '../../types/animal'
import { getAnimalUpgradeCost, getAnimalUnlockCost, getAnimalStat, getFriendStat, getBulkCost, getBulkCount } from '../../balance'
import type { UpgradeAmount } from '../navigation/UpgradeAmountToggle'
import { formatGold, formatNumber } from '../../utils/formatGold'
import { AnimalSvg } from './AnimalSvg'
import type { AnimalSpecies } from './AnimalSvg'
import styles from './AnimalTab.module.css'
import friendIcon from '../../assets/61_friend.png'

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
    <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
      <AnimalSvg species={type} size={44}/>
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        background: hatColor,
        borderRadius: '6px',
        minWidth: 16, height: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 1px 4px ${hatColor}99`,
        padding: '0 3px',
      }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{num}</span>
      </div>
    </div>
  )
}

function getAnimalTypeName(id: string) {
  const type = id.match(/^([a-z]+)/)?.[1] ?? ''
  return ANIMAL_TYPE_NAME[type] ?? '동물'
}

interface Props {
  gameState: GameState
  animalType: 'hamster' | 'cat' | 'dog' | 'friend'
  upgradeAmount: UpgradeAmount
  onUnlockAnimal: (id: AnimalId) => void
  onUpgradeAnimal: (id: AnimalId) => void
  onStartPlacing: (id: AnimalId) => void
  onRecallAnimal: (id: AnimalId) => void
  onRecallFriend: (id: FriendId) => void
  onRemoveFriend: (id: FriendId) => void
}

function FriendView({ gameState, onRecallFriend, onRemoveFriend, onStartPlacing }: {
  gameState: GameState
  onRecallFriend: (id: FriendId) => void
  onRemoveFriend: (id: FriendId) => void
  onStartPlacing: (id: AnimalId) => void
}) {
  const { friends = [], factories } = gameState

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {friends.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 14, fontWeight: 600 }}>
            아직 친구가 없어요
          </div>
        ) : (
          friends.map(friend => {
            const isPlaced = factories.some(f => f.animalId === friend.id)
            const bonus = getFriendStat(friend.rank)
            return (
              <div key={friend.id} className={styles.card}>
                <div className={styles.iconArea}>
                  <img src={friendIcon} style={{ width: 64, height: 64 }} />
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.cardName}>{friend.playerName}</span>
                  </div>
                  <div className={styles.bottomRow}>
                    <span className={styles.cardSub}>+{formatNumber(bonus * 100)}% 가치</span>
                  </div>
                </div>
                <div className={styles.cardBtns}>
                  <button
                    className={`${styles.placeBtn} ${isPlaced ? styles.placeBtnRecall : ''}`}
                    onClick={() => isPlaced ? onRecallFriend(friend.id) : onStartPlacing(friend.id)}
                  >
                    {isPlaced ? '회수' : '배치'}
                  </button>
                  <button className={styles.deleteBtn} onClick={() => onRemoveFriend(friend.id)}>
                    삭제
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function AnimalTab({ gameState, animalType, upgradeAmount, onUnlockAnimal, onUpgradeAnimal, onStartPlacing, onRecallAnimal, onRecallFriend, onRemoveFriend }: Props) {
  if (animalType === 'friend') {
    return (
      <FriendView
        gameState={gameState}
        onRecallFriend={onRecallFriend}
        onRemoveFriend={onRemoveFriend}
        onStartPlacing={onStartPlacing}
      />
    )
  }

  const { animals, factories } = gameState
  const prestigePoints = gameState.prestigePoints.current
  const unlockCost = getAnimalUnlockCost()
  const filteredIds = ANIMAL_IDS.filter(id => id.startsWith(animalType))

  // FA 위치를 행/열 순번으로 변환하는 맵 생성
  const faRows = [...new Set(factories.map(f => f.row))].sort((a, b) => a - b)
  const faPosLabel = new Map(
    factories.map(f => {
      const rowIdx = faRows.indexOf(f.row) + 1
      const colIdx = factories.filter(x => x.row === f.row).sort((a, b) => a.col - b.col).indexOf(f) + 1
      return [`${f.row}-${f.col}`, `${rowIdx}행 ${colIdx}열`]
    })
  )

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {filteredIds.map(id => {
          const animal = animals.find(a => a.id === id)!
          const upgradeCost = getBulkCost(getAnimalUpgradeCost, animal.level, upgradeAmount, prestigePoints)
          const upgradeCount = upgradeAmount === 'MAX' ? Math.max(1, getBulkCount(getAnimalUpgradeCost, animal.level, 'MAX', prestigePoints)) : upgradeAmount
          const isPlaced = factories.some(f => f.animalId === id)
          return (
            <div key={id} className={`${styles.card} ${!animal.unlocked ? styles.cardLocked : ''}`}>
              <div className={styles.iconArea}>
                <AnimalIcon id={id} />
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.nameRow}>
                  <span className={styles.cardName}>{getAnimalTypeName(id)}</span>
                  {animal.unlocked && <span className={styles.levelBadge}>Lv.{formatNumber(animal.level)}</span>}
                  {animal.unlocked && <span className={styles.cardStat}>+{formatNumber(getAnimalStat(animal.level) * 100)}%</span>}
                </div>
                <div className={styles.bottomRow}>
                  {animal.unlocked && (
                    <>
                      {isPlaced && <span className={styles.placedLabel}>{(() => { const f = factories.find(f => f.animalId === id); return f ? faPosLabel.get(`${f.row}-${f.col}`) ?? '' : '' })()} 배치중</span>}
                      <button
                        className={`${styles.placeBtn} ${isPlaced ? styles.placeBtnRecall : ''}`}
                        onClick={() => isPlaced ? onRecallAnimal(id) : onStartPlacing(id)}
                      >
                        {isPlaced ? '회수' : '배치'}
                      </button>
                    </>
                  )}
                </div>
              </div>
              {animal.unlocked ? (
                <button className={styles.starBtn} onClick={() => onUpgradeAnimal(id)} disabled={prestigePoints < upgradeCost}>
                  <span>⭐ {formatGold(upgradeCost)}</span>
                  {upgradeCount > 0 && <span className={styles.lvSub}>+lv{upgradeCount}</span>}
                </button>
              ) : (
                <button className={styles.unlockBtn} onClick={() => onUnlockAnimal(id)} disabled={prestigePoints < unlockCost}>
                  🔓 {formatGold(unlockCost)}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
