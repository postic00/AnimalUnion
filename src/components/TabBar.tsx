import styles from './TabBar.module.css'

export default function TabBar() {
  return (
    <div className={styles.tabBar}>
      <div className={styles.tab}>탭1</div>
      <div className={styles.tab}>탭2</div>
      <div className={styles.tab}>탭3</div>
    </div>
  )
}
