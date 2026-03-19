import TutorialCharacter from './TutorialCharacter'
import styles from './Tutorial.module.css'

const TAB_H = 'calc(68px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))'
const DIM = 'rgba(0,0,0,0.72)'

function TabBarSpotlight({ tabIndex }: { tabIndex: number }) {
  const base = { position: 'fixed' as const, bottom: 0, height: TAB_H, background: DIM, pointerEvents: 'none' as const }
  return (
    <>
      {tabIndex > 0 && <div style={{ ...base, left: 0, width: `calc(100vw * ${tabIndex} / 6)` }} />}
      {tabIndex < 5 && <div style={{ ...base, right: 0, width: `calc(100vw * ${5 - tabIndex} / 6)` }} />}
    </>
  )
}

interface Props {
  step: number
  itemCount: number
  onSkip: () => void
  onNext: () => void
  onFactoryTabClick: () => void
}

export default function Tutorial({ step, itemCount, onSkip, onNext, onFactoryTabClick }: Props) {

  /* ── Step 0: 클릭 생산기 ── */
  if (step === 0) {
    const count = Math.min(itemCount, 1)
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.clickerSpotlight} />
        <div className={styles.clickerTooltip}>
          <TutorialCharacter step={0} size={52} />
          <p className={styles.tooltipText}>버튼을 탭해서 재료를 생산하세요!</p>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${count * 100}%` }} />
          </div>
          <p className={styles.progressLabel}>{count} / 1</p>
        </div>
      </div>
    )
  }

  /* ── Step 1: ⚡ 속도 부스트 ── */
  if (step === 1) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.speedSpotlight} />
        <div className={styles.speedTooltip}>
          <TutorialCharacter step={1} size={52} />
          <p className={styles.tooltipText}>⚡ 속도 부스트!</p>
          <p className={styles.tooltipSub}>⚡ 버튼을 눌러보세요!<br/>광고를 보면 10분간<br/>생산 속도가 빨라져요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 2: 💰 골드 부스트 ── */
  if (step === 2) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.goldSpotlight} />
        <div className={styles.goldTooltip}>
          <TutorialCharacter step={2} size={52} />
          <p className={styles.tooltipText}>💰 골드 부스트!</p>
          <p className={styles.tooltipSub}>💰 버튼을 눌러보세요!<br/>광고를 보면 골드 부스트를 얻어요.<br/>두 효과는 동시에 중첩돼요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 3: FA 칸 하이라이트 (공장 부지) ── */
  if (step === 3) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.boardCenterTooltip}>
          <TutorialCharacter step={3} size={52} />
          <p className={styles.tooltipText}>공장 자리를 탭해보세요!</p>
          <p className={styles.tooltipSub}>보드에서 <strong>FA</strong> 칸을 탭하면<br/>공장을 건설할 수 있어요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 4: FactoryBuildModal → 건설하기 안내 ── */
  if (step === 4) {
    return (
      <div className={styles.tutorialOverlay} style={{ zIndex: 600 }}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.buildGuideTooltip}>
          <TutorialCharacter step={4} size={44} />
          <p className={styles.tooltipText}>건설하기를 눌러요!</p>
          <p className={styles.tooltipSub}>공장을 건설하면<br/>재료를 자동으로 가공해요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 5: 공장 완성! ── */
  if (step === 5) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.boardDim} />
        <div className={styles.boardCenterTooltip}>
          <TutorialCharacter step={5} size={52} />
          <p className={styles.tooltipText}>공장이 완성됐어요! 👏</p>
          <p className={styles.tooltipSub}>이제 공장이 재료를<br/>자동으로 가공해요.</p>
          <button className={styles.nextBtn} onClick={onNext}>닫기</button>
        </div>
      </div>
    )
  }

  /* ── Step 6: 건설된 공장 탭 → 상세 확인 안내 ── */
  if (step === 6) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.boardCenterTooltip}>
          <TutorialCharacter step={6} size={52} />
          <p className={styles.tooltipText}>건설된 공장을 탭해보세요!</p>
          <p className={styles.tooltipSub}>공장을 탭해서<br/>설정을 확인해요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 7: FactoryInfoModal 설명 (닫기 X 하이라이트) ── */
  if (step === 7) {
    return (
      <div className={styles.tutorialOverlay} style={{ zIndex: 600 }}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.buildGuideTooltip}>
          <TutorialCharacter step={7} size={44} />
          <p className={styles.tooltipText}>🏭 공장 상세 정보</p>
          <p className={styles.tooltipSub}>타입·등급·방향을 설정하고<br/>골드로 업그레이드해요.<br/>확인 후 닫기(×)를 눌러요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 8: 생산기(▶) 칸 하이라이트 ── */
  if (step === 8) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.boardCenterTooltip}>
          <TutorialCharacter step={8} size={52} />
          <p className={styles.tooltipText}>생산기 자리를 탭해보세요!</p>
          <p className={styles.tooltipSub}>보드에서 <strong>▶</strong> 칸을 탭하면<br/>생산기를 건설할 수 있어요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 9: ProducerInfoModal → 건설하기 안내 ── */
  if (step === 9) {
    return (
      <div className={styles.tutorialOverlay} style={{ zIndex: 600 }}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.buildGuideTooltip}>
          <TutorialCharacter step={9} size={44} />
          <p className={styles.tooltipText}>건설하기를 눌러요!</p>
          <p className={styles.tooltipSub}>생산기를 건설하면<br/>재료를 자동으로 생산해요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 10: 생산기 완성! ── */
  if (step === 10) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.boardDim} />
        <div className={styles.boardCenterTooltip}>
          <TutorialCharacter step={10} size={52} />
          <p className={styles.tooltipText}>생산기가 완성됐어요! 🎉</p>
          <p className={styles.tooltipSub}>이제 재료가<br/>자동으로 생산돼요.</p>
          <button className={styles.nextBtn} onClick={onNext}>닫기</button>
        </div>
      </div>
    )
  }

  /* ── Step 11: 건설된 생산기 탭 → 상세 확인 안내 ── */
  if (step === 11) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.boardCenterTooltip}>
          <TutorialCharacter step={11} size={52} />
          <p className={styles.tooltipText}>건설된 생산기를 탭해보세요!</p>
          <p className={styles.tooltipSub}>생산기를 탭해서<br/>상태를 확인해요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 12: ProducerInfoModal 설명 (닫기 X 하이라이트) ── */
  if (step === 12) {
    return (
      <div className={styles.tutorialOverlay} style={{ zIndex: 600 }}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.buildGuideTooltip}>
          <TutorialCharacter step={12} size={44} />
          <p className={styles.tooltipText}>▶ 생산기 상세 정보</p>
          <p className={styles.tooltipSub}>레벨·속도·생산량을 확인하고<br/>골드로 업그레이드해요.<br/>확인 후 닫기(×)를 눌러요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 13: 공장 탭 하이라이트 ── */
  if (step === 13) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <TabBarSpotlight tabIndex={0} />
        <div className={styles.factoryTabHitbox} onClick={onFactoryTabClick} />
        <div className={styles.factoryTabTooltip}>
          <TutorialCharacter step={13} size={52} />
          <p className={styles.tooltipText}>공장 탭을 열어봐요!</p>
          <p className={styles.tooltipSub}>🌱 공장에서 생산·가공<br/>설비를 관리해요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 14: 생산 섹션 설명 (⚙️ 가공 토글 클릭으로 이동) ── */
  if (step === 14) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.sheetTopTooltip}>
          <TutorialCharacter step={14} size={52} />
          <p className={styles.tooltipText}>🌱 생산 섹션</p>
          <p className={styles.tooltipSub}>클릭 생산기와 자동 생산기를<br/>건설하고 업그레이드해요.<br/>아래 ⚙️ 가공 버튼을 눌러보세요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 15: 가공 섹션 설명 (📦 재료 탭 클릭으로 이동) ── */
  if (step === 15) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <TabBarSpotlight tabIndex={1} />
        <div className={styles.sheetTopTooltip}>
          <TutorialCharacter step={15} size={52} />
          <p className={styles.tooltipText}>⚙️ 가공 섹션</p>
          <p className={styles.tooltipSub}>건설한 공장의 타입·등급·방향을<br/>설정해요.<br/>📦 재료 탭을 눌러보세요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 16: 재료 탭 설명 (🐾 동물 탭 클릭으로 이동) ── */
  if (step === 16) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <TabBarSpotlight tabIndex={2} />
        <div className={styles.sheetTopTooltip}>
          <TutorialCharacter step={16} size={52} />
          <p className={styles.tooltipText}>📦 재료 탭</p>
          <p className={styles.tooltipSub}>생산되는 재료의 종류와<br/>수량을 관리해요.<br/>🐾 동물 탭을 눌러보세요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 17: 동물 탭 설명 (⭐ 환생 탭 클릭으로 이동) ── */
  if (step === 17) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <TabBarSpotlight tabIndex={3} />
        <div className={styles.sheetTopTooltip}>
          <TutorialCharacter step={17} size={52} />
          <p className={styles.tooltipText}>🐾 동물 탭</p>
          <p className={styles.tooltipSub}>동물을 고용해<br/>생산 효율을 높여요.<br/>⭐ 환생 탭을 눌러보세요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 18: 환생 탭 설명 (순위 탭 클릭으로 이동) ── */
  if (step === 18) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <TabBarSpotlight tabIndex={4} />
        <div className={styles.sheetTopTooltip}>
          <TutorialCharacter step={18} size={52} />
          <p className={styles.tooltipText}>⭐ 환생 탭</p>
          <p className={styles.tooltipSub}>골드를 많이 모을수록<br/>환생 포인트를 얻어요.<br/>🏆 순위 탭을 눌러보세요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 19: 레일 / 골드 설명 ── */
  if (step === 19) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.boardDim} />
        <div className={styles.boardCenterTooltip}>
          <TutorialCharacter step={19} size={52} />
          <p className={styles.tooltipText}>레일과 골드!</p>
          <p className={styles.tooltipSub}>재료가 레일을 타고 이동해요.<br/><strong>RE</strong> 지점에 도달하면<br/>골드로 전환돼요!</p>
          <button className={styles.nextBtn} onClick={onNext}>다음 →</button>
        </div>
      </div>
    )
  }

  /* ── Step 20: 업그레이드 안내 ── */
  if (step === 20) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.sheetTopTooltip}>
          <TutorialCharacter step={20} size={52} />
          <p className={styles.tooltipText}>업그레이드!</p>
          <p className={styles.tooltipSub}>골드로 생산기와 공장을<br/>업그레이드해서<br/>더 빠르게 생산해요!</p>
          <button className={styles.nextBtn} onClick={onNext}>다음 →</button>
        </div>
      </div>
    )
  }

  /* ── Step 21: 환생 탭 spotlight ── */
  if (step === 21) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <TabBarSpotlight tabIndex={3} />
        <div className={styles.prestigeTabTooltip}>
          <TutorialCharacter step={21} size={52} />
          <p className={styles.tooltipText}>환생 탭을 열어보세요!</p>
          <p className={styles.tooltipSub}>⭐ 환생으로 포인트를 모아<br/>아이템 가치를 높일 수 있어요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 22: 환생 상세 설명 ── */
  if (step === 22) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.sheetTopTooltip}>
          <TutorialCharacter step={22} size={52} />
          <p className={styles.tooltipText}>⭐ 환생 시스템</p>
          <p className={styles.tooltipSub}>골드를 많이 모을수록<br/>더 많은 환생 포인트를 얻어요.<br/>포인트로 아이템 가치·버퍼를 업그레이드!</p>
          <button className={styles.nextBtn} onClick={onNext}>다음 →</button>
        </div>
      </div>
    )
  }

  /* ── Step 23: 순위 탭 spotlight ── */
  if (step === 23) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <TabBarSpotlight tabIndex={4} />
        <div className={styles.leaderboardTabTooltip}>
          <TutorialCharacter step={23} size={52} />
          <p className={styles.tooltipText}>시즌 순위!</p>
          <p className={styles.tooltipSub}>🏆 환생할 때마다 점수가<br/>시즌 순위에 기록돼요.</p>
        </div>
      </div>
    )
  }

  /* ── Step 24: 시즌 설명 → 완료 ── */
  if (step === 24) {
    return (
      <div className={styles.tutorialOverlay}>
        <button className={styles.tutorialSkip} onClick={onSkip}>건너뛰기</button>
        <div className={styles.sheetTopTooltip}>
          <TutorialCharacter step={24} size={52} />
          <p className={styles.tooltipText}>🏆 시즌에 참여하세요!</p>
          <p className={styles.tooltipSub}>환생을 거듭해 더 높은 점수를<br/>기록하고 순위에 도전해보세요!</p>
          <button className={styles.nextBtn} onClick={onNext}>시작하기! 🎉</button>
        </div>
      </div>
    )
  }

  return null
}
