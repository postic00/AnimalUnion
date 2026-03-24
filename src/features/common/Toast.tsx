import { useEffect, useState } from 'react'
import styles from './Toast.module.css'

interface Props {
  message: string
  onHide: () => void
  index?: number
}

export default function Toast({ message, onHide, index = 0 }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const showRaf = requestAnimationFrame(() => setVisible(true))
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onHide, 300)
    }, 2500)
    return () => {
      cancelAnimationFrame(showRaf)
      clearTimeout(hideTimer)
    }
  }, [onHide])

  return (
    <div
      className={`${styles.toast} ${visible ? styles.visible : ''}`}
      style={{ bottom: `calc(${80 + index * 56}px + env(safe-area-inset-bottom, 0px))` }}
    >
      {message}
    </div>
  )
}
