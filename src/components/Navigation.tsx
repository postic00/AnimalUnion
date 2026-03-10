import type { GameState } from '../types/gameState'
import { formatGold } from '../utils/formatGold'
import styles from './Navigation.module.css'

interface Props {
  gameState: GameState
}

export default function Navigation({ gameState }: Props) {
  return (
    <nav className={styles.nav}>
      <span className={styles.gold}>🪙 {formatGold(gameState.gold)}</span>
      <span className={styles.perSec}>+{formatGold(gameState.goldPerSec)}/s</span>
    </nav>
  )
}
