import type { ReactNode } from 'react'
import styles from './BottomSheet.module.css'

interface Props {
  open: boolean
  onClose: () => void
  header?: ReactNode
  children: React.ReactNode
}

export default function BottomSheet({ open, header, children }: Props) {
  if (!open) return null

  return (
    <div className={styles.sheet}>
      {header && <div className={styles.sheetHeader}>{header}</div>}
      <div className={styles.sheetBody}>{children}</div>
    </div>
  )
}
