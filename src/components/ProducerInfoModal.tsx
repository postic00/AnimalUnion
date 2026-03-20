import { useEffect, useRef, useState } from 'react'
import type { Producer } from '../types/producer'
import { getProducerBuildCost, getProducerUpgradeCost, getProducerInterval, getMaterialQuantity } from '../balance'
import { formatGold, formatQuantity } from '../utils/formatGold'
import { GradeIcon } from './GradeIcon'
import coinIcon from '../assets/coin.svg'
import styles from './ProducerInfoModal.module.css'

const GRADE_NAMES: Record<number, string> = { 1: '고추', 2: '설탕', 3: '딸기' }
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
  tutorialHighlightBuild?: boolean
  tutorialHighlightClose?: boolean
  producerProgressesRef?: React.RefObject<Record<string, number>>
  progressKey?: string
}

export default function ProducerInfoModal({ producer, producerIndex, gold, materialQuantityLevels, builtCount, onBuild, onUpgrade, onClose, tutorialHighlightBuild, tutorialHighlightClose, producerProgressesRef, progressKey }: Props) {
  const grade = GRADE_COLORS[producer.grade] ?? GRADE_COLORS[1]
  const [progress, setProgress] = useState(0)
  const progressKeyRef = useRef(progressKey)
  progressKeyRef.current = progressKey
  useEffect(() => {
    if (!producerProgressesRef || !progressKey) return
    const id = setInterval(() => {
      setProgress(producerProgressesRef.current?.[progressKeyRef.current ?? ''] ?? 0)
    }, 100)
    return () => clearInterval(id)
  }, [producerProgressesRef, progressKey])
  const buildCost = getProducerBuildCost(builtCount)
  const upgradeCost = getProducerUpgradeCost(producer.level)
  const quantity = getMaterialQuantity(materialQuantityLevels[producer.grade - 1] ?? 1)
  const interval = getProducerInterval(producer.level) * quantity
  const perSec = interval > 0 && isFinite(interval) ? quantity * 1000 / interval : 0

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} style={{ borderColor: grade.border }} onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className={styles.header}>
          <GradeIcon size={28} grade={producer.grade} />
          <div className={styles.titleGroup}>
            <span className={styles.title} style={{ color: grade.color }}>
              생산기 {producerIndex + 1}
            </span>
            <span className={styles.gradeName} style={{ color: grade.color }}>
              {GRADE_NAMES[producer.grade] ?? `${producer.grade}등급`}
            </span>
          </div>
          {producer.built && (
            <span className={styles.levelBadge}>Lv.{producer.level}</span>
          )}
          <button className={`${styles.closeBtn}${tutorialHighlightClose ? ` ${styles.closeBtnHighlight}` : ''}`} onClick={onClose}>✕</button>
        </div>

        {/* 상태 */}
        {producer.built ? (
          <div className={styles.stats} style={{ background: grade.bg }}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>초당 생산량</span>
              <span className={styles.statValue} style={{ color: grade.color }}>
                {perSec < 10 ? perSec.toFixed(3) : perSec < 100 ? perSec.toFixed(2) : perSec < 1000 ? perSec.toFixed(1) : formatQuantity(perSec)}/s
              </span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statLabel}>수량 배율</span>
              <span className={styles.statValue} style={{ color: grade.color }}>
                ×{formatQuantity(quantity)}
              </span>
            </div>
          </div>
        ) : (
          <div className={styles.stats} style={{ background: '#f9fafb' }}>
            <span className={styles.unbuilt}>미건설</span>
          </div>
        )}

        {/* 생산 프로그레스 */}
        {producer.built && (
          <div className={styles.progressWrap}>
            <div className={styles.progressLabel}>생산 진행</div>
            <div className={styles.progressTrack}>
              <div className={styles.progressBar} style={{ width: `${progress * 100}%`, background: grade.color }} />
            </div>
          </div>
        )}

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
  )
}
