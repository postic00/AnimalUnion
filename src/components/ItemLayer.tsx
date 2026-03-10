import type { Item } from '../types/item'
import { CONFIG } from '../config'
import styles from './ItemLayer.module.css'

interface Props {
  items: Item[]
  cellSize: number
}

export default function ItemLayer({ items, cellSize }: Props) {
  const size = cellSize * CONFIG.ITEM_SIZE_RATIO

  return (
    <div className={styles.layer}>
      {items.map(item => (
        <div
          key={item.id}
          className={styles.item}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            left: item.x - size / 2,
            top: item.y - size / 2,
          }}
        />
      ))}
    </div>
  )
}
