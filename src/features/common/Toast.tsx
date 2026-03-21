import { useEffect } from 'react'
import styles from './Toast.module.css'

interface Props {
  message: string
  visible: boolean
  onHide: () => void
}

export default function Toast({ message, visible, onHide }: Props) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      onHide()
    }, 2500)
    return () => clearTimeout(timer)
  }, [visible])

  return (
    <div className={`${styles.toast} ${visible ? styles.visible : ''}`}>
      {message}
    </div>
  )
}
