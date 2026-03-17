import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Board } from '../types/board'
import type { Factory } from '../types/factory'
import type { Animal, AnimalId } from '../types/animal'
import { ANIMAL_NAMES } from '../types/animal'
import { getFactoryBuildCost, getFactoryLevelUpgradeCost, RECIPES } from '../balance'
import { formatGold } from '../utils/formatGold'
import coinIcon from '../assets/coin.svg'
import { GRADE_EMOJIS } from '../data/gradeEmojis'
import styles from './FactoryTab.module.css'

interface Props {
  board: Board
  factories: Factory[]
  gold: number
  animals: Animal[]
  onBuild: (row: number, col: number) => void
  onSetType: (row: number, col: number, type: Factory['type']) => void
  onSetDir: (row: number, col: number, dir: Factory['dir']) => void
  onSetGrade: (row: number, col: number, grade: number) => void
  onUpgradeLevel: (row: number, col: number) => void
  onSetAnimal: (row: number, col: number, animalId: AnimalId | null) => void
  maxGrade: number
}

const ANIMAL_EMOJI: Record<string, string> = {
  hamster: '🐹',
  cat: '🐱',
  dog: '🐶',
}

function getAnimalEmoji(animalId: string | null): string | null {
  if (!animalId) return null
  const type = animalId.match(/^([a-z]+)/)?.[1] ?? ''
  return ANIMAL_EMOJI[type] ?? null
}

const TYPE_META: Record<Factory['type'], { label: string; icon: string; color: string; bg: string; border: string; sub: string }> = {
  WA: { label: '세척', icon: '💧', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', sub: '#3b82f6' },
  PA: { label: '가공', icon: '⚙️', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe', sub: '#8b5cf6' },
  PK: { label: '포장', icon: '📦', color: '#c2410c', bg: '#fff7ed', border: '#fed7aa', sub: '#f97316' },
}

function ComboBox({ label, options, selected, onSelect, color }: {
  label: string
  options: { value: string; label: string }[]
  selected: string
  onSelect: (v: string) => void
  color: string
}) {
  const [open, setOpen] = useState(false)
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({})
  const popupRef = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      const inTrigger = ref.current?.contains(target)
      const inPopup = popupRef.current?.contains(target)
      if (!inTrigger && !inPopup) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setPopupStyle({ position: 'fixed', bottom: window.innerHeight - rect.top + 6, left: rect.left })
    }
    setOpen(v => !v)
  }

  return (
    <div className={styles.combo} ref={ref}>
      {open && createPortal(
        <div className={styles.comboPopup} style={popupStyle} ref={popupRef}>
          {options.map(o => {
            const isSelected = o.value === selected
            return (
              <button
                key={o.value}
                className={`${styles.comboOption} ${isSelected ? styles.comboOptionSelected : ''}`}
                style={isSelected ? { color } : {}}
                onMouseDown={e => { e.preventDefault(); onSelect(o.value); setOpen(false) }}
                onTouchEnd={e => { e.preventDefault(); onSelect(o.value); setOpen(false) }}
              >
                {o.label}
                {isSelected && <span className={styles.comboCheck}>✓</span>}
              </button>
            )
          })}
        </div>,
        document.body
      )}
      <button
        className={styles.comboTrigger}
        style={{ borderColor: color, color }}
        onClick={handleToggle}
      >
        {label}
        <span className={styles.comboArrow}>{open ? '▼' : '▲'}</span>
      </button>
    </div>
  )
}

const PA_MIN_GRADE = Math.min(...Object.keys(RECIPES).map(Number))

export default function FactoryTab({ board, factories, gold, onBuild, onSetType, onSetDir, onSetGrade, onUpgradeLevel, maxGrade }: Props) {
  const faCells: { row: number; col: number }[] = []
  board.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell.type === 'FA') faCells.push({ row: rowIdx, col: colIdx })
    })
  })

  const floors: { row: number; col: number }[][] = []
  for (let i = 0; i < faCells.length; i += 3) {
    floors.push(faCells.slice(i, i + 3))
  }

  const [closedFloors, setClosedFloors] = useState<Record<number, boolean>>({})
  const toggleFloor = (i: number) => setClosedFloors(prev => ({ ...prev, [i]: !prev[i] }))

  const buildCost = getFactoryBuildCost()

  return (
    <div className={styles.container}>
      {floors.map((cells, floorIdx) => (
        <div key={floorIdx} className={styles.floor}>
          <button className={styles.floorHeader} onClick={() => toggleFloor(floorIdx)}>
            <div className={styles.floorLeft}>
              <span className={styles.floorBadge}>{floorIdx + 1}F</span>
              <span className={styles.floorCount}>공장 {cells.length}개</span>
            </div>
            <div className={styles.floorDivider} />
            <span className={styles.floorArrow}>{closedFloors[floorIdx] ? '▼' : '▲'}</span>
          </button>

          {!closedFloors[floorIdx] && cells.map(({ row, col }, i) => {
            const factory = factories.find(f => f.row === row && f.col === col)

            if (!factory || !factory.built) {
              return (
                <div key={i} className={styles.emptyCard}>
                  <span className={styles.emptyLabel}>공장 {i + 1} · 미건설</span>
                  <button className={styles.buildBtn} onClick={() => onBuild(row, col)} disabled={gold < buildCost}>
                    <img src={coinIcon} className={styles.btnIcon} alt="" />
                    {formatGold(buildCost)}
                  </button>
                </div>
              )
            }

            const meta = TYPE_META[factory.type]
            const levelCost = getFactoryLevelUpgradeCost(factory.level)

            const typeOptions = (['WA', 'PA', 'PK'] as Factory['type'][]).map(t => ({
              value: t, label: `${TYPE_META[t].icon} ${TYPE_META[t].label}`
            }))
            const dirOptions = [
              { value: 'UP_TO_DOWN', label: '↓ 하행' },
              { value: 'DOWN_TO_UP', label: '↑ 상행' },
            ]
            return (
              <div key={i} className={styles.card} style={{ background: meta.bg, borderColor: meta.border }}>
                <div className={styles.cardBody}>
                  {/* 좌측: 아이콘 + 동물 + 이름 + 레벨 */}
                  <div className={styles.cardLeft}>
                    <div className={styles.iconStack}>
                      <span className={styles.typeIcon}>{meta.icon}</span>
                      <span className={styles.animalBadge}>
                        {factory.animalId ? getAnimalEmoji(factory.animalId) : <span className={styles.noAnimal}>✕</span>}
                      </span>
                    </div>
                    <div className={styles.cardInfo}>
                      <div className={styles.nameRow}>
                        <span className={styles.cardName} style={{ color: meta.color }}>공장 {i + 1}</span>
                        <span className={styles.levelBadge} style={{ background: meta.sub }}>Lv.{factory.level}</span>
                      </div>
                      {factory.animalId && (
                        <span className={styles.animalLabel}>{ANIMAL_NAMES[factory.animalId]}</span>
                      )}
                    </div>
                  </div>
                  {/* 우측: 2행 컨트롤 */}
                  <div className={styles.cardRight}>
                    <div className={styles.controlRow}>
                      <div className={styles.gradeControl}>
                        <button className={styles.gradeBtn} onClick={() => onSetGrade(row, col, factory.grade - 1)} disabled={factory.grade <= (factory.type === 'PA' ? PA_MIN_GRADE : 1)}>‹</button>
                        <span className={styles.gradeVal} style={{ color: meta.color }}>
                          <span style={{ fontSize: 18 }}>{GRADE_EMOJIS[factory.grade] ?? '?'}</span>
                        </span>
                        <button className={styles.gradeBtn} onClick={() => onSetGrade(row, col, factory.grade + 1)} disabled={factory.grade >= maxGrade}>›</button>
                      </div>
                      <button className={styles.upgradeBtn} style={{ background: meta.sub }} onClick={() => onUpgradeLevel(row, col)} disabled={gold < levelCost}>
                        <img src={coinIcon} className={styles.btnIcon} alt="" />
                        {formatGold(levelCost)}
                      </button>
                    </div>
                    <div className={styles.controlRow}>
                      <ComboBox
                        label={`${meta.icon} ${meta.label}`}
                        options={typeOptions}
                        selected={factory.type}
                        onSelect={v => onSetType(row, col, v as Factory['type'])}
                        color={meta.sub}
                      />
                      <ComboBox
                        label={factory.dir === 'UP_TO_DOWN' ? '↓ 하행' : '↑ 상행'}
                        options={dirOptions}
                        selected={factory.dir}
                        onSelect={v => onSetDir(row, col, v as Factory['dir'])}
                        color={meta.sub}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
