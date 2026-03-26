import styles from './Tutorial.module.css'

interface Props {
  step: number
  clickCount: number
  onSkip: () => void
  onNext: () => void
}

const SLIDES = [
  {
    img: '/tutorial/tut1.png',
    title: '🏭 공장을 운영해요',
    bullets: [
      '👆 클리커 버튼을 탭해 재료를 생산해요',
      '🏗️ 보드에 공장을 건설해 자동으로 가공해요',
      '📦 출하 지점에 도달하면 골드로 전환돼요',
      '💰 골드로 공장을 업그레이드해 더 빠르게!',
    ],
  },
  {
    img: '/tutorial/tut2.png',
    title: '🔧 공장 3종을 활용해요',
    bullets: [
      '💧 세척 공장 — 원재료를 깨끗하게 씻어요',
      '⚙️ 가공 공장 — 재료를 요리하고 변환해요',
      '📦 포장 공장 — 완성품을 포장해 가치를 높여요',
      '⭐ 등급이 높을수록 더 비싼 재료를 처리해요',
    ],
  },
  {
    img: '/tutorial/tut3.png',
    title: '🍡 마라탕후루를 완성해요',
    bullets: [
      '🍓 딸기 → 딸기잼버거 → 딸기오마카세',
      '🌶️ 재료를 조합하면 마라탕후루 완성!',
      '⭐ 환생할수록 아이템 가치가 올라가요',
      '🏆 시즌마다 순위에 도전해보세요!',
    ],
  },
]

export default function Tutorial({ step, clickCount, onSkip, onNext }: Props) {

  /* ── Phase 1: 이미지 슬라이드 ── */
  if (step <= 2) {
    const slide = SLIDES[step]
    const isLast = step === 2
    return (
      <div className={styles.tutorialOverlay} style={{ background: 'rgba(0,0,0,0.7)', pointerEvents: 'all' }}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.slideCard}>
          <img src={slide.img} className={styles.slideImg} alt="" />
          <p className={styles.slideTitle}>{slide.title}</p>
          <ul className={styles.bulletList}>
            {slide.bullets.map((b, i) => (
              <li key={i} className={styles.bulletItem}>{b}</li>
            ))}
          </ul>
          <button className={styles.nextBtn} onClick={onNext}>
            {isLast ? '시작하기 🎉' : '다음 →'}
          </button>
        </div>
        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <span key={i} className={i === step ? styles.dotActive : styles.dot} />
          ))}
        </div>
      </div>
    )
  }

  /* ── Step 3: 클릭 20회 ── */
  if (step === 3) {
    const progress = Math.min(clickCount, 20)
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.clickerSpotlight} />
        <div className={styles.clickerTooltip}>
          <p className={styles.tooltipText}>버튼을 탭해서 재료를 생산하세요!</p>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(progress / 20) * 100}%` }} />
          </div>
          <p className={styles.progressLabel}>{progress} / 20</p>
        </div>
      </div>
    )
  }

  /* ── Step 4: ⚡ 속도 부스트 ── */
  if (step === 4) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.speedSpotlight} />
        <div className={styles.speedTooltip}>
          <p className={styles.tooltipText}>⚡ 속도 부스트!</p>
          <p className={styles.tooltipSub}>⚡ 버튼을 눌러보세요!{'\n'}광고를 보면 10분간{'\n'}생산 속도가 빨라져요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 5: 💰 골드 부스트 ── */
  if (step === 5) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.goldSpotlight} />
        <div className={styles.goldTooltip}>
          <p className={styles.tooltipText}>💰 골드 부스트!</p>
          <p className={styles.tooltipSub}>💰 버튼을 눌러보세요!{'\n'}광고를 보면 골드 배율이 올라가요.{'\n'}두 효과는 동시에 중첩돼요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 6: FA 칸 탭 안내 ── */
  if (step === 6) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.faSpotlight} />
        <div className={styles.faTooltip}>
          <p className={styles.tooltipText}>공장 자리를 탭해보세요!</p>
          <p className={styles.tooltipSub}>🏗️ 공장 부지를 탭하면{'\n'}공장을 건설할 수 있어요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 7: 건설하기 버튼 안내 (모달 위) ── */
  if (step === 7) {
    return (
      <div className={styles.tutorialOverlay} style={{ zIndex: 600 }}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.buildGuideTooltip}>
          <p className={styles.tooltipText}>건설하기를 눌러요!</p>
          <p className={styles.tooltipSub}>공장을 건설하면{'\n'}재료를 자동으로 가공해요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 8: PR 생산자 탭 안내 ── */
  if (step === 8) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.prSpotlight} />
        <div className={styles.prTooltip}>
          <p className={styles.tooltipText}>생산자를 탭해보세요!</p>
          <p className={styles.tooltipSub}>🏗️ 생산자를 탭하면{'\n'}재료 생산 정보를 볼 수 있어요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 9: PR 모달 건설 안내 ── */
  if (step === 9) {
    return (
      <div className={styles.tutorialOverlay} style={{ zIndex: 600 }}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.buildGuideTooltip}>
          <p className={styles.tooltipText}>생산자를 건설해요!</p>
          <p className={styles.tooltipSub}>건설하면 재료를{'\n'}자동으로 생산해요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 10: 완료 팝업 ── */
  if (step === 10) {
    return (
      <div className={styles.tutorialOverlay} style={{ background: 'rgba(0,0,0,0.7)', pointerEvents: 'all' }}>
        <div className={styles.donePopup}>
          <p className={styles.doneEmoji}>🎉</p>
          <p className={styles.doneTitle}>준비 완료!</p>
          <p className={styles.doneSub}>이제 공장을 키워{'\n'}마라탕후루를 완성해보세요!</p>
          <button className={styles.nextBtn} onClick={onNext}>시작하기!</button>
        </div>
      </div>
    )
  }

  return null
}
