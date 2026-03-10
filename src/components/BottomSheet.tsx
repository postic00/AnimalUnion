import styles from './BottomSheet.module.css'

interface Props {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function BottomSheet({ open, children }: Props) {
  if (!open) return null

  return (
    <div className={styles.sheet}>
      {children}
    </div>
  )
}
