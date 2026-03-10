import { useState } from 'react'
import type { Board } from '../types/board'
import type { Factory } from '../types/factory'
import type { Animal, AnimalId } from '../types/animal'
import { ANIMAL_NAMES, ANIMAL_IDS } from '../types/animal'
import { getFactoryBuildCost, getFactoryLevelUpgradeCost } from '../balance'
import { formatGold } from '../utils/formatGold'
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

export default function FactoryTab({ board, factories, gold, animals, onBuild, onSetType, onSetDir, onSetGrade, onUpgradeLevel, onSetAnimal, maxGrade }: Props) {
  const faCells: { row: number; col: number }[] = []
  board.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell.type === 'FA') faCells.push({ row: rowIdx, col: colIdx })
    })
  })

  // 3개씩 묶어서 층(floor)으로 그룹화
  const floors: { row: number; col: number }[][] = []
  for (let i = 0; i < faCells.length; i += 3) {
    floors.push(faCells.slice(i, i + 3))
  }

  const [closedFloors, setClosedFloors] = useState<Record<number, boolean>>({})
  const toggleFloor = (i: number) => setClosedFloors(prev => ({ ...prev, [i]: !prev[i] }))

  const buildCost = getFactoryBuildCost()

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>공장</h2>
      {floors.map((cells, floorIdx) => (
        <div key={floorIdx} className={styles.floor}>
          <button className={styles.floorHeader} onClick={() => toggleFloor(floorIdx)}>
            <span className={styles.floorLabel}>{floorIdx + 1}F</span>
            <span className={styles.floorArrow}>{closedFloors[floorIdx] ? '▼' : '▲'}</span>
          </button>
          {!closedFloors[floorIdx] && cells.map(({ row, col }, i) => {
            const factory = factories.find(f => f.row === row && f.col === col)

            if (!factory || !factory.built) {
              return (
                <div key={i} className={styles.card}>
                  <div className={styles.row}>
                    <span className={styles.name}>{i + 1}</span>
                    <span className={styles.status}>미건설</span>
                    <button
                      className={styles.buildButton}
                      onClick={() => onBuild(row, col)}
                      disabled={gold < buildCost}
                    >
                      건설 🪙{formatGold(buildCost)}
                    </button>
                  </div>
                </div>
              )
            }

            const levelCost = getFactoryLevelUpgradeCost(factory.level)
            const unlockedAnimals = animals.filter(a => a.unlocked)

            return (
              <div key={i} className={styles.card}>
                <div className={styles.rowBetween}>
                  <span className={styles.name}>{i + 1}</span>
                  <div className={styles.group}>
                    {(['WA', 'PA', 'PK'] as Factory['type'][]).map(t => (
                      <button
                        key={t}
                        className={`${styles.typeButton} ${factory.type === t ? styles.active : ''}`}
                        onClick={() => onSetType(row, col, t)}
                      >
                        {t === 'WA' ? '세척' : t === 'PA' ? '가공' : '포장'}
                      </button>
                    ))}
                  </div>
                  <div className={styles.group}>
                    {(['UP_TO_DOWN', 'DOWN_TO_UP'] as Factory['dir'][]).map(d => (
                      <button
                        key={d}
                        className={`${styles.typeButton} ${factory.dir === d ? styles.active : ''}`}
                        onClick={() => onSetDir(row, col, d)}
                      >
                        {d === 'UP_TO_DOWN' ? '↓' : '↑'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.rowBetween}>
                  <div className={styles.group}>
                    <button className={styles.arrowButton} onClick={() => onSetGrade(row, col, factory.grade - 1)} disabled={factory.grade <= 1}>←</button>
                    <span className={styles.gradeLabel}>{factory.grade}</span>
                    <button className={styles.arrowButton} onClick={() => onSetGrade(row, col, factory.grade + 1)} disabled={factory.grade >= maxGrade}>→</button>
                  </div>
                  <div className={styles.group}>
                    <button
                      className={`${styles.typeButton} ${factory.animalId === null ? styles.active : ''}`}
                      onClick={() => onSetAnimal(row, col, null)}
                    >
                      없음
                    </button>
                    {unlockedAnimals.map(a => (
                      <button
                        key={a.id}
                        className={`${styles.typeButton} ${factory.animalId === a.id ? styles.active : ''}`}
                        onClick={() => onSetAnimal(row, col, a.id)}
                      >
                        {ANIMAL_NAMES[a.id]}
                      </button>
                    ))}
                  </div>
                  <div className={styles.group}>
                    <span className={styles.lvLabel}>Lv.{factory.level}</span>
                    <button
                      className={styles.upgradeButton}
                      onClick={() => onUpgradeLevel(row, col)}
                      disabled={gold < levelCost}
                    >
                      🪙{formatGold(levelCost)}
                    </button>
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
