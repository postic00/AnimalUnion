import { type ReactNode, useRef, useEffect } from 'react'
import styles from './BottomSheet.module.css'

interface Props {
  open: boolean
  onClose: () => void
  header?: ReactNode
  children: React.ReactNode
  scrollKey?: unknown
}

export default function BottomSheet({ open, header, children, scrollKey }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && bodyRef.current) bodyRef.current.scrollTop = 0
  }, [scrollKey, open])

  if (!open) return null

  return (
    <div className={styles.sheet}>
      {header && <div className={styles.sheetHeader}>{header}</div>}
      <div ref={bodyRef} className={styles.sheetBody}>{children}</div>
    </div>
  )
}
