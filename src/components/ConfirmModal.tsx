import styles from './ConfirmModal.module.css'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({ title, message, confirmLabel = '확인', onConfirm, onClose }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.btns}>
          <button className={styles.cancelBtn} onClick={onClose}>취소</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
