import { Fragment, memo, useEffect, useRef, useState } from 'react'
import type { Factory } from '../../types/factory'
import type { FAPhases } from '../../hooks/useGameLoop'
import { getSpecies, HandSvg } from './Cell'
import styles from './Cell.module.css'

// FA_PICK_TIME(200ms)에 맞춰 한 번 왕복하는 애니메이션 + 인터벌 오차 여유
const ANIM_DURATION = 400

interface Props {
  factories: Factory[]
  cellSize: number
  faPhases: FAPhases
}

export default memo(function HandLayer({ factories, cellSize, faPhases }: Props) {
  const hh = Math.floor(cellSize * 7 / 9)
  const baseStyle = { left: 0, top: '50%', marginTop: -hh / 2 } as const

  // 페이즈가 끝나도 ANIM_DURATION ms 동안 손을 유지
  const [grabVisible, setGrabVisible] = useState<Set<string>>(new Set())
  const [placeVisible, setPlaceVisible] = useState<Set<string>>(new Set())
  const grabTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const placeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    factories.filter(f => f.built && f.level > 0).forEach(f => {
      const key = `${f.row}-${f.col}`
      const phase = faPhases[key]
      const inGrab = phase === 'GRABBING'
      const inPlace = phase === 'PLACING' || phase === 'WAITING'

      // grab
      if (inGrab) {
        if (grabTimers.current.has(key)) {
          clearTimeout(grabTimers.current.get(key)!)
          grabTimers.current.delete(key)
        }
        setGrabVisible(prev => new Set(prev).add(key))
      } else {
        if (!grabTimers.current.has(key)) {
          const t = setTimeout(() => {
            setGrabVisible(prev => { const s = new Set(prev); s.delete(key); return s })
            grabTimers.current.delete(key)
          }, ANIM_DURATION)
          grabTimers.current.set(key, t)
        }
      }

      // place
      if (inPlace) {
        if (placeTimers.current.has(key)) {
          clearTimeout(placeTimers.current.get(key)!)
          placeTimers.current.delete(key)
        }
        setPlaceVisible(prev => new Set(prev).add(key))
      } else {
        if (!placeTimers.current.has(key)) {
          const t = setTimeout(() => {
            setPlaceVisible(prev => { const s = new Set(prev); s.delete(key); return s })
            placeTimers.current.delete(key)
          }, ANIM_DURATION)
          placeTimers.current.set(key, t)
        }
      }
    })
  }, [faPhases, factories])

  return (
    <>
      {factories.filter(f => f.built && f.level > 0).map(f => {
        const species = getSpecies(f.animalId)
        const isUpToDown = f.dir === 'UP_TO_DOWN'
        const key = `${f.row}-${f.col}`
        const overlayBase = {
          position: 'absolute' as const,
          top: f.row * cellSize,
          left: f.col * cellSize,
          width: cellSize,
          height: cellSize,
          zIndex: 5,
          pointerEvents: 'none' as const,
          overflow: 'visible' as const,
        }
        return (
          <Fragment key={key}>
            {grabVisible.has(key) && (
              <div
                style={{ ...overlayBase, clipPath: isUpToDown ? 'inset(-300% 0 100% 0)' : 'inset(100% 0 -300% 0)' }}
              >
                <div
                  className={`${styles.handWrap} ${isUpToDown ? styles.handGrab : styles.handGrabUp}`}
                  style={baseStyle}
                >
                  <HandSvg species={species} w={cellSize} h={hh} />
                </div>
              </div>
            )}
            {placeVisible.has(key) && (
              <div
                style={{ ...overlayBase, clipPath: isUpToDown ? 'inset(100% 0 -300% 0)' : 'inset(-300% 0 100% 0)' }}
              >
                <div
                  className={`${styles.handWrap} ${isUpToDown ? styles.handPlace : styles.handPlaceDown}`}
                  style={baseStyle}
                >
                  <HandSvg species={species} w={cellSize} h={hh} />
                </div>
              </div>
            )}
          </Fragment>
        )
      })}
    </>
  )
})
