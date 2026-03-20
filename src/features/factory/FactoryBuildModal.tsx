import { getFactoryBuildCost } from '../../balance'
import { formatGold } from '../../utils/formatGold'
import coinIcon from '../../assets/coin.svg'
import styles from './FactoryBuildModal.module.css'

interface Props {
  gold: number
  onBuild: () => void
  onClose: () => void
  tutorialHighlight?: boolean
}

export default function FactoryBuildModal({ gold, onBuild, onClose, tutorialHighlight }: Props) {
  const cost = getFactoryBuildCost()
  const canAfford = gold >= cost

  return (
    <div className="modal-overlay-soft" onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>공장 건설</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <p className={styles.desc}>이 칸에 공장을 건설합니다.</p>
        <button
          className={`${styles.buildBtn}${tutorialHighlight ? ` ${styles.buildBtnHighlight}` : ''}`}
          onClick={() => { onBuild(); onClose() }}
          disabled={!canAfford}
        >
          <img src={coinIcon} className={styles.coinIcon} alt="gold" />
          <span>{formatGold(cost)}</span>
          {!canAfford && <span className={styles.lack}>골드 부족</span>}
        </button>
      </div>
    </div>
  )
}
