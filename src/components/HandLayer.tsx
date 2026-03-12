import type { Factory } from '../types/factory'
import { getSpecies, HandSvg } from './Cell'
import styles from './Cell.module.css'

interface Props {
  factories: Factory[]
  cellSize: number
}

export default function HandLayer({ factories, cellSize }: Props) {
  const hh = Math.floor(cellSize * 7 / 9)
  const handStyle = { left: 0, top: '50%', marginTop: -hh / 2 } as const

  return (
    <>
      {factories.filter(f => f.built && f.level > 0).map(f => {
        const species = getSpecies(f.animalId)
        const isUpToDown = f.dir === 'UP_TO_DOWN'
        return (
          <div
            key={`hand-${f.row}-${f.col}`}
            style={{
              position: 'absolute',
              top: f.row * cellSize,
              left: f.col * cellSize,
              width: cellSize,
              height: cellSize,
              zIndex: 5,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <div
              className={`${styles.handWrap} ${isUpToDown ? styles.handGrab : styles.handGrabInv}`}
              style={handStyle}
            >
              <HandSvg species={species} w={cellSize} h={hh} />
            </div>
            <div
              className={`${styles.handWrap} ${isUpToDown ? styles.handPlace : styles.handPlaceInv}`}
              style={handStyle}
            >
              <HandSvg species={species} w={cellSize} h={hh} />
            </div>
          </div>
        )
      })}
    </>
  )
}
