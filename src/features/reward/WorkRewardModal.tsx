import { formatGold } from '../../utils/formatGold'
import type { Reward, MealReward } from '../../types/workData'
import styles from './WorkRewardModal.module.css'

interface Props {
  rewards: Reward[]
  onClaim: () => void
  onWatchAd?: () => void
}

function getMealEmoji(type: 'breakfast' | 'lunch' | 'dinner'): string {
  if (type === 'breakfast') return '🌅'
  if (type === 'lunch') return '☀️'
  return '🌙'
}

function getMealLabel(type: 'breakfast' | 'lunch' | 'dinner'): string {
  if (type === 'breakfast') return '아침 식사'
  if (type === 'lunch') return '점심 식사'
  return '저녁 식사'
}

function isMealReward(r: Reward): r is MealReward {
  return r.type === 'breakfast' || r.type === 'lunch' || r.type === 'dinner'
}

function getTitle(rewards: Reward[]): { icon: string; title: string } {
  const hasOffline = rewards.some(r => r.type === 'offline')
  const hasMeal = rewards.some(isMealReward)
  if (hasOffline && hasMeal) return { icon: '🎁', title: '근무 보상' }
  if (hasOffline) return { icon: '😴', title: '휴게 보상' }
  const meal = rewards.find(isMealReward)
  if (meal) return { icon: getMealEmoji(meal.type), title: getMealLabel(meal.type) }
  return { icon: '🎁', title: '보상' }
}

export default function WorkRewardModal({ rewards, onClaim, onWatchAd }: Props) {
  const { icon, title } = getTitle(rewards)
  return (
    <div className="modal-overlay">
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.icon}>{icon}</span>
          <h2 className={styles.title}>{title}</h2>
        </div>

        <div className={styles.rewardList}>
          {rewards.map((reward, i) => {
            if (reward.type === 'offline') {
              return (
                <div key={i} className={styles.rewardRow}>
                  <span className={styles.rewardEmoji}>😴</span>
                  <div className={styles.rewardInfo}>
                    <span className={styles.rewardLabel}>휴게 보상</span>
                    <span className={styles.rewardValue}>+{formatGold(reward.gold)} 골드</span>
                  </div>
                </div>
              )
            }
            if (reward.type === 'breakfast' || reward.type === 'lunch' || reward.type === 'dinner') {
              return (
                <div key={i} className={styles.rewardRow}>
                  <span className={styles.rewardEmoji}>{getMealEmoji(reward.type)}</span>
                  <div className={styles.rewardInfo}>
                    <span className={styles.rewardLabel}>{getMealLabel(reward.type)} 식사 보상</span>
                    <span className={styles.rewardValue}>speed boost 10분 + gold boost 10분</span>
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>

        {onWatchAd && (
          <button className={styles.adBtn} onClick={onWatchAd}>
            📺 3배 받기
          </button>
        )}
        <button className={styles.claimBtn} onClick={() => onClaim()}>
          받기
        </button>
      </div>
    </div>
  )
}
