import { formatGold } from '../../utils/formatGold'
import { CONFIG } from '../../config'
import coinIcon from '../../assets/coin.svg'
import styles from './Navigation.module.css'

interface Props {
  gold: number
  goldPerSec: number
  prestigePoints: number
  totalPrestigePoints: number
  salarySecondsAccumulated: number
  expectedSalary: number
}

function formatCountdown(seconds: number): string {
  const mm = Math.floor(seconds / 60)
  const ss = seconds % 60
  return `${mm}:${ss.toString().padStart(2, '0')}`
}

export default function Navigation({ gold, goldPerSec, prestigePoints, totalPrestigePoints, salarySecondsAccumulated, expectedSalary }: Props) {
  const remaining = Math.max(0, CONFIG.WR_SALARY_SECONDS - salarySecondsAccumulated)

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
      <div className={styles.salaryCard}>
        <span className={styles.salaryIcon}>💼</span>
        <div className={styles.salaryInfo}>
          <span className={styles.salaryLabel}>{formatCountdown(remaining)}</span>
          <span className={styles.salaryTitle}>월급 {formatGold(expectedSalary)}</span>
        </div>
      </div>
    </nav>
  )
}
