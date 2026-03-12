import { useState } from 'react'
import styles from './Tutorial.module.css'

const STEPS = [
  {
    emoji: '🐹🐱🐶',
    title: '동물노동조합에 오신 것을\n환영합니다!',
    desc: '귀여운 동물 직원들과 함께\n마라탕후루 공장을 운영하세요.',
    sub: '방치형 공장 운영 게임',
  },
  {
    emoji: '👆',
    title: '클리커로 재료를 생산하세요',
    desc: '화면 하단 중앙의 버튼을 탭하면\n재료가 레일 위로 올라갑니다.\n생산자를 건설하면 자동으로 생산돼요!',
    sub: '생산 관리 탭에서 생산자를 건설하세요',
  },
  {
    emoji: '🏭',
    title: '공장이 재료를 자동 처리해요',
    desc: '세척(💧) → 가공(⚙️) → 포장(📦) 순서로\n공장을 건설해 재료를 완성품으로 만드세요.\n공장 레벨을 올릴수록 처리 속도가 빨라져요!',
    sub: '공장 관리 탭에서 공장을 건설하세요',
  },
  {
    emoji: '💰',
    title: '골드를 모아 업그레이드하세요',
    desc: 'RE 지점에 도달한 완성품은\n자동으로 골드로 전환됩니다.\n골드로 생산자·공장·동물을 업그레이드하세요!',
    sub: '재료 관리 탭에서 등급을 올리세요',
  },
  {
    emoji: '🐾',
    title: '동물을 배치해 효율을 높여요',
    desc: '환생 탭에서 동물을 해금하고 업그레이드하세요.\n공장에 배치하면 처리 능력이 대폭 올라가요!\n🐹 찍찍 · 🐱 야옹 · 🐶 왈왈',
    sub: '환생 탭에서 동물을 확인하세요',
  },
  {
    emoji: '⭐',
    title: '환생으로 더 빠르게 성장하세요',
    desc: '충분한 골드를 모으면 환생해서\n영구 보너스 포인트를 획득하세요.\n광고를 보면 보상이 2배가 됩니다!',
    sub: '준비됐나요? 지금 바로 시작해보세요!',
  },
]

interface Props {
  onClose: () => void
}

export default function Tutorial({ onClose }: Props) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const s = STEPS[step]

  const handleDone = () => {
    localStorage.setItem('tutorialDone', '1')
    onClose()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.skipBtn} onClick={handleDone}>건너뛰기</button>

        <div className={styles.emoji}>{s.emoji}</div>
        <h2 className={styles.title}>{s.title}</h2>
        <p className={styles.desc}>{s.desc}</p>
        <p className={styles.sub}>{s.sub}</p>

        <div className={styles.dots}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === step ? styles.dotActive : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        <div className={styles.btnRow}>
          {step > 0 && (
            <button className={styles.prevBtn} onClick={() => setStep(s => s - 1)}>이전</button>
          )}
          <button
            className={`${styles.nextBtn} ${isLast ? styles.nextBtnFinal : ''}`}
            onClick={isLast ? handleDone : () => setStep(s => s + 1)}
          >
            {isLast ? '시작하기 🎉' : '다음'}
          </button>
        </div>
      </div>
    </div>
  )
}
