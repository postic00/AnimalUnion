import type { GameState } from '../types/gameState'
import styles from './Navigation.module.css'

interface Props {
  gameState: GameState
}

export default function Navigation({ gameState }: Props) {
  return (
    <nav className={styles.nav}>
      <span className={styles.gold}>🪙 {gameState.gold.toLocaleString()}</span>
      <span className={styles.perSec}>+{gameState.goldPerSec}/s</span>
    </nav>
  )
}
