import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Producer } from '../../types/producer'
import type { PRState } from '../../engine/types'
import type { Item } from '../../types/item'
import { getProducerBuildCost, getProducerUpgradeCost, getProducerInterval, getMaterialQuantity } from '../../balance'
import { formatGold, formatQuantity } from '../../utils/formatGold'
import { GradeIcon } from '../common/GradeIcon'
import coinIcon from '../../assets/coin.svg'
import styles from './ProducerInfoModal.module.css'

const GRADE_NAMES: Record<number, string> = { 1: '고추', 2: '설탕', 3: '딸기' }
const GRADE_EMOJI: Record<number, string> = { 1: '🌶️', 2: '🍬', 3: '🍓' }
const GRADE_COLORS: Record<number, { color: string; bg: string; border: string }> = {
  1: { color: '#991b1b', bg: '#fff1f1', border: '#fca5a5' },
  2: { color: '#92400e', bg: '#fffbeb', border: '#fcd34d' },
  3: { color: '#9d174d', bg: '#fdf2f8', border: '#f9a8d4' },
}

interface Props {
  producer: Producer
  producerIndex: number
  gold: number
  materialQuantityLevels: number[]
  builtCount: number
  onBuild: () => void
  onUpgrade: () => void
  onClose: () => void
  onGradeChange: (grade: number) => void
  tutorialHighlightBuild?: boolean
  tutorialHighlightClose?: boolean
  producerProgressesRef?: React.RefObject<Record<string, number>>
  prStatesRef?: React.RefObject<Record<string, PRState>>
  progressKey?: string
}

export default function ProducerInfoModal({ producer, gold, materialQuantityLevels, builtCount, onBuild, onUpgrade, onClose, onGradeChange, tutorialHighlightBuild, tutorialHighlightClose, producerProgressesRef, prStatesRef, progressKey }: Props) {
  const grade = GRADE_COLORS[producer.grade] ?? GRADE_COLORS[1]
  const [outputBuffer, setOutputBuffer] = useState<Item[]>([])
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressKeyRef = useRef(progressKey)
  useLayoutEffect(() => { progressKeyRef.current = progressKey })
  useEffect(() => {
    if (!producerProgressesRef || !progressKey) return
    let rafId: number
    let lastBuffer = 0
    let displayed = 0
    let prevTarget = 0
    const loop = (now: number) => {
      const target = producerProgressesRef.current?.[progressKeyRef.current ?? ''] ?? 0
      if (target < prevTarget - 0.3) displayed = target  // 리셋 감지 → 즉시 점프
      else displayed += (target - displayed) * 0.12
      prevTarget = target
      if (progressBarRef.current) progressBarRef.current.style.width = `${displayed * 100}%`
      if (now - lastBuffer >= 500) {
        lastBuffer = now
        setOutputBuffer([...(prStatesRef?.current?.[progressKeyRef.current ?? '']?.outputBuffer ?? [])])
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [producerProgressesRef, prStatesRef, progressKey])
  const buildCost = getProducerBuildCost(builtCount)
  const upgradeCost = getProducerUpgradeCost(producer.level)
  const quantity = getMaterialQuantity(materialQuantityLevels[producer.grade - 1] ?? 1)
  const interval = getProducerInterval(producer.level) * quantity
  const perSec = interval > 0 && isFinite(interval) ? quantity * 1000 / interval : 0

  return (
    <div className="modal-overlay-soft" onClick={onClose}>
      <div className={styles.modal} style={{ borderColor: grade.border }} onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className={styles.header}>
          <GradeIcon size={28} grade={producer.grade} />
          <span className={styles.title}>
            생산공장 Lv.{producer.level}
          </span>
          <button className={`${styles.closeBtn}${tutorialHighlightClose ? ` ${styles.closeBtnHighlight}` : ''}`} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {/* 등급 선택 */}
          <div className={styles.gradeSelector}>
            {[1, 2, 3].map(g => (
              <button
                key={g}
                className={`${styles.gradePill} ${producer.grade === g ? styles.gradePillActive : ''}`}
                style={producer.grade === g ? { backgroundColor: GRADE_COLORS[g].color, borderColor: GRADE_COLORS[g].border } : { borderColor: GRADE_COLORS[g].border, color: GRADE_COLORS[g].color }}
                onClick={() => onGradeChange(g)}
              >
                <span>{GRADE_EMOJI[g]}</span>
                <span>{GRADE_NAMES[g]}</span>
              </button>
            ))}
          </div>

          {/* 상태 */}
          {producer.built ? (
            <div className={styles.stats} style={{ background: grade.bg }}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>초당 생산량</span>
                <span className={styles.statValue} style={{ color: '#1a1a1a' }}>
                  {perSec < 10 ? perSec.toFixed(3) : perSec < 100 ? perSec.toFixed(2) : perSec < 1000 ? perSec.toFixed(1) : formatQuantity(perSec)}/s
                </span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statLabel}>수량 배율</span>
                <span className={styles.statValue} style={{ color: '#1a1a1a' }}>
                  ×{formatQuantity(quantity)}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.stats} style={{ background: 'rgba(255,255,255,0.55)' }}>
              <span className={styles.unbuilt}>이 칸에 공장을 건설합니다</span>
            </div>
          )}

          {/* 생산 프로그레스 */}
          {producer.built && (
            <div className={styles.progressWrap}>
<div className={styles.progressTrack}>
                <div ref={progressBarRef} className={styles.progressBar} style={{ width: '0%', background: grade.color }} />
              </div>
            </div>
          )}

          {/* 출력 버퍼 */}
          {producer.built && (() => {
            const grouped = outputBuffer.reduce<Record<string, { grade: number; quantity: number; count: number }>>((acc, it) => {
              const key = `${it.grade}-${it.quantity}`
              if (!acc[key]) acc[key] = { grade: it.grade, quantity: it.quantity, count: 0 }
              acc[key].count++
              return acc
            }, {})
            const sorted = Object.values(grouped).sort((a, b) => a.grade - b.grade || a.quantity - b.quantity)
            return (
              <div className={styles.outputList}>
                {sorted.map(info => (
                  <div key={`${info.grade}-${info.quantity}`} className={styles.outputRow}>
                    <GradeIcon size={18} grade={info.grade} />
                    <span className={styles.outputGradeLabel}>{info.grade}등급</span>
                    <span className={styles.outputCount}>{info.count}개</span>
                    <span className={styles.outputQty}>×{formatQuantity(info.quantity)}</span>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* 버튼 */}
          {producer.built ? (
            <button
              className={styles.actionBtn}
              style={{ background: grade.color }}
              onClick={() => { onUpgrade(); }}
              disabled={gold < upgradeCost}
            >
              <img src={coinIcon} className={styles.coinIcon} alt="" />
              <span>레벨업</span>
              <span className={styles.cost}>{formatGold(upgradeCost)}</span>
            </button>
          ) : (
            <button
              className={`${styles.actionBtn}${tutorialHighlightBuild ? ` ${styles.actionBtnHighlight}` : ''}`}
              style={{ background: '#22c55e' }}
              onClick={() => { onBuild(); onClose() }}
              disabled={gold < buildCost}
            >
              <img src={coinIcon} className={styles.coinIcon} alt="" />
              <span>건설</span>
              <span className={styles.cost}>{formatGold(buildCost)}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
