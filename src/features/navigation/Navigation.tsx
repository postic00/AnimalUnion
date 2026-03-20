import { formatGold } from '../../utils/formatGold'
import coinIcon from '../../assets/coin.svg'
import styles from './Navigation.module.css'

interface Props {
  gold: number
  goldPerSec: number
  prestigePoints: number
  totalPrestigePoints: number
}

export default function Navigation({ gold, goldPerSec, prestigePoints, totalPrestigePoints }: Props) {
  return (
    <nav className={styles.nav}>
      <div className={styles.goldCard}>
        <img src={coinIcon} className={styles.coinIcon} alt="gold" />
        <div className={styles.goldInfo}>
          <span className={styles.goldAmount}>{formatGold(gold)}</span>
          <span className={styles.perSec}>+{formatGold(goldPerSec)}/s</span>
        </div>
      </div>
      <div className={styles.prestigeCard}>
        <span className={styles.prestigeIcon}>⭐</span>
        <div className={styles.prestigeInfo}>
          <span className={styles.prestigeAmount}>{formatGold(totalPrestigePoints)}</span>
          <span className={styles.prestigeLabel}>미사용 {formatGold(prestigePoints)}</span>
        </div>
      </div>
    </nav>
  )
}
