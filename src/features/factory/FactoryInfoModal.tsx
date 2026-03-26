import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Factory } from '../../types/factory'
import type { FALiveState, FALiveStates } from '../../hooks/useGameLoop'
import { ANIMAL_NAMES } from '../../types/animal'
import { getFactoryBonus, getFactoryLevelUpgradeCost, RECIPES, getMaterialQuantity } from '../../balance'
import { formatQuantity, formatGold } from '../../utils/formatGold'
import { GradeIcon } from '../common/GradeIcon'
import coinIcon from '../../assets/coin.svg'
import styles from './FactoryInfoModal.module.css'

const TYPE_LABEL: Record<string, string> = { WA: '세척', PA: '가공', PK: '포장' }
const TYPE_COLOR: Record<string, string> = { WA: '#3b82f6', PA: '#8b5cf6', PK: '#f97316' }

const GRAB_LABEL: Record<string, string> = { IDLE: '대기', GRABBING: '입고', WAITING: '가득 참' }
const GRAB_COLOR: Record<string, string> = { IDLE: '#9ca3af', GRABBING: '#22c55e', WAITING: '#ef4444' }

const PROC_LABEL: Record<string, string> = { IDLE: '대기', PROCESSING: '가공', WAITING: '출력 대기' }
const PROC_COLOR: Record<string, string> = { IDLE: '#9ca3af', PROCESSING: '#22c55e', WAITING: '#ef4444' }

const OUT_LABEL: Record<string, string> = { IDLE: '대기', PLACING: '출고', WAITING: '벨트 대기' }
const OUT_COLOR: Record<string, string> = { IDLE: '#9ca3af', PLACING: '#22c55e', WAITING: '#ef4444' }

const PA_MIN_GRADE = Math.min(...Object.keys(RECIPES).map(Number))

interface Props {
  factory: Factory
  faLiveStatesRef: React.RefObject<FALiveStates>
  liveKey: string
  gold: number
  materialQuantityLevels: number[]
  maxGrade: number
  onClose: () => void
  onSetType: (type: Factory['type']) => void
  onSetDir: (dir: Factory['dir']) => void
  onSetGrade: (grade: number) => void
  onUpgradeLevel: () => void
  tutorialHighlightClose?: boolean
}

export default function FactoryInfoModal({ factory, faLiveStatesRef, liveKey, gold, materialQuantityLevels, maxGrade, onClose, onSetType, onSetDir, onSetGrade, onUpgradeLevel, tutorialHighlightClose }: Props) {
  const [live, setLive] = useState<FALiveState | undefined>(undefined)
  const liveKeyRef = useRef(liveKey)
  useLayoutEffect(() => { liveKeyRef.current = liveKey })
  useEffect(() => {
    let rafId: number
    let last = 0
    const loop = (now: number) => {
      if (now - last >= 100) {
        last = now
        setLive(faLiveStatesRef.current?.[liveKeyRef.current])
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [faLiveStatesRef])
  const qty = getMaterialQuantity(materialQuantityLevels[factory.grade - 1] ?? 1)
  const bonus = getFactoryBonus(factory.type, factory.grade)
  const recipe = factory.type === 'PA' ? RECIPES[factory.grade] : null
  const levelCost = getFactoryLevelUpgradeCost(factory.level)
  const typeColor = TYPE_COLOR[factory.type]

  const grabState = live?.grabState ?? 'IDLE'
  const processState = live?.processState ?? 'IDLE'
  const outputState = live?.outputState ?? 'IDLE'
  const inputItems = live?.inputItems ?? []
  const processingItems = live?.processingItems ?? []
  const progress = live?.processProgress ?? 0


  const gradeMin = factory.type === 'PA' ? PA_MIN_GRADE : 1

  return (
    <div className="modal-overlay-soft" onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className={styles.header}>
          <span className={styles.typeName}>{TYPE_LABEL[factory.type]}</span>
          <span className={styles.badge}>Lv.{factory.level}</span>
          <span className={styles.bonusBadge}>+{formatQuantity(bonus * 100)}%</span>
          {factory.animalId && (
            <span className={styles.animalBadge}>{ANIMAL_NAMES[factory.animalId]}</span>
          )}
          <button className={`${styles.closeBtn}${tutorialHighlightClose ? ` ${styles.closeBtnHighlight}` : ''}`} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
        {/* 레시피 고정 표시 */}
        <div className={styles.recipeRow}>
          {recipe
            ? recipe.map((r) => (
                <span key={r.grade} className={styles.recipeItem}>
                  <GradeIcon size={13} grade={r.grade} />
                  <span className={styles.recipeCount}>×{formatQuantity(r.count * qty)}</span>
                </span>
              ))
            : <span className={styles.recipeItem}><GradeIcon size={13} grade={factory.grade} /></span>
          }
          <span className={styles.recipeArrow}>→</span>
          <span className={styles.recipeItem}>
            <GradeIcon size={13} grade={factory.grade} />
            {factory.type === 'PA' && <span className={styles.recipeCount}>×{formatQuantity(qty)}</span>}
            {factory.type === 'PK' && <span className={styles.recipeCount}>📦</span>}
          </span>
        </div>

        {/* 3단 레이아웃 */}
        <div className={styles.threeCol}>

          {/* 좌: 입력 저장소 + 그랩 상태 */}
          <div className={styles.panel}>
            <div className={styles.stateBox}>
              <span className={styles.stateDot} style={{ color: GRAB_COLOR[grabState] }}>●</span>
              <span className={styles.stateText} style={{ color: GRAB_COLOR[grabState] }}>
                {GRAB_LABEL[grabState]}
              </span>
            </div>
            <div className={styles.storageList}>
              {recipe
                ? recipe.map((r) => {
                    const have = inputItems.find(it => it.grade === r.grade)?.quantity ?? 0
                    const need = r.count * qty
                    return (
                      <div key={r.grade} className={styles.storageRow}>
                        <GradeIcon size={14} grade={r.grade} />
                        <span className={styles.storageQty} style={{ color: have > 0 ? '#374151' : '#9ca3af' }}>
                          {formatQuantity(have)}<span className={styles.storageNeed}>/{formatQuantity(need)}</span>
                        </span>
                      </div>
                    )
                  })
                : inputItems.sort((a, b) => a.grade - b.grade).map((it) => (
                    <div key={it.grade} className={styles.storageRow}>
                      <GradeIcon size={14} grade={it.grade} />
                      <span className={styles.storageQty}>{formatQuantity(it.quantity)}</span>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* 중: 처리 저장소 */}
          <div className={styles.middle}>
            <div className={styles.middleTop}>
              <div className={styles.stateBox}>
                <span className={styles.stateDot} style={{ color: PROC_COLOR[processState] }}>●</span>
                <span className={styles.stateText} style={{ color: PROC_COLOR[processState] }}>
                  {PROC_LABEL[processState]}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
            {recipe
              ? processingItems.map((it) => {
                  const need = (recipe.find(r => r.grade === it.grade)?.count ?? 0) * qty
                  return (
                    <div key={it.grade} className={styles.storageRow}>
                      <GradeIcon size={14} grade={it.grade} />
                      <span className={styles.storageQty} style={{ color: it.quantity >= need ? '#16a34a' : '#374151' }}>
                        {formatQuantity(it.quantity)}<span className={styles.storageNeed}>/{formatQuantity(need)}</span>
                      </span>
                    </div>
                  )
                })
              : processingItems.map((it) => (
                  <div key={it.grade} className={styles.storageRow}>
                    <GradeIcon size={14} grade={it.grade} />
                    <span className={styles.storageQty}>{formatQuantity(it.quantity)}</span>
                  </div>
                ))
            }
          </div>

          {/* 우: 출력 */}
          <div className={styles.panel}>
            <div className={styles.stateBox}>
              <span className={styles.stateDot} style={{ color: OUT_COLOR[outputState] }}>●</span>
              <span className={styles.stateText} style={{ color: OUT_COLOR[outputState] }}>
                {OUT_LABEL[outputState]}
              </span>
            </div>
            <div className={styles.storageRow}>
              <GradeIcon size={14} grade={factory.grade} />
              <span className={styles.storageQty}>
                {formatQuantity(live?.outputCount ?? 0)}<span className={styles.storageNeed}>/{formatQuantity(live?.outputCapacity ?? 1)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 컨트롤 */}
        <div className={styles.controls}>

          {/* 타입 선택 */}
          <div className={styles.typeRow}>
            {(['WA', 'PA', 'PK'] as Factory['type'][]).map(t => (
              <button
                key={t}
                className={`${styles.typeBtn} ${factory.type === t ? styles.typeBtnActive : ''}`}
                style={factory.type === t ? { background: TYPE_COLOR[t], color: '#fff', borderColor: TYPE_COLOR[t] } : {}}
                onClick={() => onSetType(t)}
              >
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>

          {/* 등급 + 방향 */}
          <div className={styles.row}>
            <div className={styles.gradeControl}>
              <button className={styles.gradeBtn} onClick={() => onSetGrade(factory.grade - 1)} disabled={factory.grade <= gradeMin}>‹</button>
              <GradeIcon size={22} grade={factory.grade} />
              <button className={styles.gradeBtn} onClick={() => onSetGrade(factory.grade + 1)} disabled={factory.grade >= maxGrade}>›</button>
            </div>
            <button
              className={styles.dirBtn}
              onClick={() => onSetDir(factory.dir === 'UP_TO_DOWN' ? 'DOWN_TO_UP' : 'UP_TO_DOWN')}
            >
              {factory.dir === 'UP_TO_DOWN' ? '↓ 하행' : '↑ 상행'}
            </button>
          </div>

          {/* 레벨업 */}
          <button
            className={styles.levelUpBtn}
            style={{ background: typeColor }}
            onClick={onUpgradeLevel}
            disabled={gold < levelCost}
          >
            <img src={coinIcon} className={styles.coinIcon} alt="" />
            <span>레벨업</span>
            <span className={styles.levelUpCost}>{formatGold(levelCost)}</span>
          </button>
        </div>
        </div>

      </div>
    </div>
  )
}
