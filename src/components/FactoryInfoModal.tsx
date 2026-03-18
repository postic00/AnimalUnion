import type { Factory } from '../types/factory'
import type { FALiveState } from '../hooks/useGameLoop'
import { ANIMAL_NAMES } from '../types/animal'
import { getFactoryBonus, RECIPES, getMaterialQuantity } from '../balance'
import { GradeIcon } from './GradeIcon'
import { FactoryTypeIcon } from './FactoryTypeIcon'
import styles from './FactoryInfoModal.module.css'

const TYPE_LABEL: Record<string, string> = { WA: '세척', PA: '가공', PK: '포장' }

const GRAB_LABEL: Record<string, string> = { IDLE: '대기', GRABBING: '집는 중' }
const GRAB_COLOR: Record<string, string> = { IDLE: '#9ca3af', GRABBING: '#f59e0b' }

const PROC_LABEL: Record<string, string> = {
  IDLE: '대기', PROCESSING: '처리 중', PLACING: '배출 중', WAITING: '출력 대기',
}
const PROC_COLOR: Record<string, string> = {
  IDLE: '#9ca3af', PROCESSING: '#22c55e', PLACING: '#3b82f6', WAITING: '#ef4444',
}

interface Props {
  factory: Factory
  live?: FALiveState
  materialQuantityLevels: number[]
  onClose: () => void
}

export default function FactoryInfoModal({ factory, live, materialQuantityLevels, onClose }: Props) {
  const qty = getMaterialQuantity(materialQuantityLevels[factory.grade - 1] ?? 1)
  const bonus = getFactoryBonus(factory.type, factory.grade)
  const recipe = factory.type === 'PA' ? RECIPES[factory.grade] : null

  const grabState = live?.grabState ?? 'IDLE'
  const processState = live?.processState ?? 'IDLE'
  const inputBuffer = live?.inputBuffer ?? 0
  const inputCapacity = live?.inputCapacity ?? 0
  const hasOutput = live?.hasOutputItem ?? false
  const progress = live?.processProgress ?? 0

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className={styles.header}>
          <FactoryTypeIcon type={factory.type} size={26} />
          <span className={styles.typeName}>{TYPE_LABEL[factory.type]}</span>
          <span className={styles.badge}>{factory.grade}등급</span>
          <span className={styles.badge}>Lv.{factory.level}</span>
          <span className={styles.bonusBadge}>+{(bonus * 100).toFixed(0)}%</span>
          {factory.animalId && (
            <span className={styles.animalBadge}>{ANIMAL_NAMES[factory.animalId]}</span>
          )}
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* 3단 레이아웃 */}
        <div className={styles.body}>

          {/* 좌: 입력 버퍼 */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>입력 버퍼</span>
            <span className={styles.panelCount}>{inputBuffer}<span className={styles.panelCapacity}>/{inputCapacity}</span></span>
            <div className={styles.bufferBar}>
              <div
                className={styles.bufferFill}
                style={{ width: `${inputCapacity > 0 ? (inputBuffer / inputCapacity) * 100 : 0}%`, background: '#3b82f6' }}
              />
            </div>
            {/* PA: 레시피 버퍼 내용 */}
            {recipe && (
              <div className={styles.recipeBuffer}>
                {recipe.map((r, i) => (
                  <div key={i} className={styles.recipeRow}>
                    <GradeIcon size={16} grade={r.grade} />
                    <span className={styles.recipeNeed}>×{r.count * qty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 중: 그랩 + 처리 */}
          <div className={styles.middle}>
            <div className={styles.stateBox}>
              <span className={styles.stateLabel}>그랩</span>
              <span className={styles.stateDot} style={{ color: GRAB_COLOR[grabState] }}>●</span>
              <span className={styles.stateText} style={{ color: GRAB_COLOR[grabState] }}>
                {GRAB_LABEL[grabState]}
              </span>
            </div>
            <div className={styles.divider} />
            <div className={styles.stateBox}>
              <span className={styles.stateLabel}>처리</span>
              <span className={styles.stateDot} style={{ color: PROC_COLOR[processState] }}>●</span>
              <span className={styles.stateText} style={{ color: PROC_COLOR[processState] }}>
                {PROC_LABEL[processState]}
              </span>
              {processState === 'PROCESSING' && (
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* 우: 출력 버퍼 */}
          <div className={styles.panel}>
            <span className={styles.panelLabel}>출력 버퍼</span>
            <span className={styles.panelCount}>{hasOutput ? 1 : 0}<span className={styles.panelCapacity}>/1</span></span>
            <div className={styles.bufferBar}>
              <div
                className={styles.bufferFill}
                style={{ width: hasOutput ? '100%' : '0%', background: hasOutput ? '#ef4444' : '#e5e7eb' }}
              />
            </div>
            <div className={styles.dirLabel}>
              {factory.dir === 'UP_TO_DOWN' ? '↓ 위→아래' : '↑ 아래→위'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
