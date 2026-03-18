import styles from './UpgradeAmountToggle.module.css'

export type UpgradeAmount = 1 | 10 | 50 | 100 | 'MAX'
const OPTIONS: UpgradeAmount[] = [1, 10, 50, 100, 'MAX']

interface Props {
  value: UpgradeAmount
  onChange: (v: UpgradeAmount) => void
}

export default function UpgradeAmountToggle({ value, onChange }: Props) {
  return (
    <div className={styles.toggle}>
      {OPTIONS.map(opt => (
        <button
          key={opt}
          className={`${styles.btn} ${value === opt ? styles.btnActive : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt === 'MAX' ? 'MAX' : `×${opt}`}
        </button>
      ))}
    </div>
  )
}
