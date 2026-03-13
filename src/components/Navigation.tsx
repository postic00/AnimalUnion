import type { GameState } from '../types/gameState'
import { formatGold } from '../utils/formatGold'
import coinIcon from '../assets/coin.svg'
import styles from './Navigation.module.css'

interface Props {
  gameState: GameState
}

export default function Navigation({ gameState }: Props) {
  return (
    <nav className={styles.nav}>
      <div className={styles.goldCard}>
        <img src={coinIcon} className={styles.coinIcon} alt="gold" />
        <div className={styles.goldInfo}>
          <span className={styles.goldAmount}>{formatGold(gameState.gold)}</span>
          <span className={styles.perSec}>+{formatGold(gameState.goldPerSec)}/s</span>
        </div>
      </div>
      <div className={styles.prestigeCard}>
        <span className={styles.prestigeIcon}>⭐</span>
        <div className={styles.prestigeInfo}>
          <span className={styles.prestigeAmount}>{formatGold(gameState.totalPrestigePoints)}</span>
          <span className={styles.prestigeLabel}>미사용 {formatGold(gameState.prestigePoints)}</span>
        </div>
      </div>
    </nav>
  )
}
