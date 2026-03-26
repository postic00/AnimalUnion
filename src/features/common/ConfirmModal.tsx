import styles from './ConfirmModal.module.css'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({ title, message, confirmLabel = '확인', cancelLabel, onConfirm, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
          <div className={styles.btns}>
            <button className={styles.confirmBtn} onClick={onConfirm}>{confirmLabel}</button>
            {cancelLabel && <button className={styles.cancelBtn} onClick={onClose}>{cancelLabel}</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
