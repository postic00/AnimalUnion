import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework'
import { getOperationalEnvironment } from '@apps-in-toss/web-bridge'

function getAdGroupId(): string {
  try {
    return getOperationalEnvironment() === 'sandbox'
      ? 'ait-ad-test-rewarded-id'
      : 'ait.v2.live.93ce2a2ea05b4289'
  } catch {
    return 'ait-ad-test-rewarded-id'
  }
}

function isTossAdSupported(): boolean {
  try {
    return loadFullScreenAd.isSupported() === true
  } catch {
    return false
  }
}

let adLoaded = false
let adLoading = false

export function isTossAdReady(): boolean {
  return adLoaded
}

export function preloadTossAd(): void {
  if (!isTossAdSupported()) return
  if (adLoading) return
  adLoaded = false
  adLoading = true
  loadFullScreenAd({
    options: { adGroupId: getAdGroupId() },
    onEvent: (event) => {
      if (event.type === 'loaded') { adLoaded = true; adLoading = false }
      if (event.type === 'failedToLoad') { adLoaded = false; adLoading = false }
    },
    onError: () => { adLoading = false },
  })
}

export function showTossRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (!showFullScreenAd.isSupported()) { resolve(false); return }
    } catch { resolve(false); return }

    let rewarded = false
    let resolved = false
    const done = (result: boolean) => {
      if (resolved) return
      resolved = true
      resolve(result)
    }
    const timer = setTimeout(() => { done(false); preloadTossAd() }, 5000)

    const show = () => {
      adLoaded = false
      try {
        showFullScreenAd({
          options: { adGroupId: getAdGroupId() },
          onEvent: (e) => {
            if (e.type === 'userEarnedReward') rewarded = true
            if (e.type === 'dismissed') {
              clearTimeout(timer)
              done(rewarded)
              preloadTossAd()
            }
            if (e.type === 'failedToShow') {
              clearTimeout(timer); done(false); preloadTossAd()
            }
          },
          onError: () => { clearTimeout(timer); done(false); preloadTossAd() },
        })
      } catch {
        clearTimeout(timer); done(false); preloadTossAd()
      }
    }

    if (adLoaded) {
      show()
    } else if (adLoading) {
      // 프리로드 진행 중 — 완료 대기
      const poll = setInterval(() => {
        if (adLoaded) { clearInterval(poll); show() }
        else if (!adLoading) { clearInterval(poll); done(false) }
      }, 200)
    } else {
      adLoading = true
      loadFullScreenAd({
        options: { adGroupId: getAdGroupId() },
        onEvent: (event) => {
          if (event.type === 'loaded') { adLoaded = true; adLoading = false; show() }
          if (event.type === 'failedToLoad') { adLoading = false; done(false) }
        },
        onError: () => { adLoading = false; clearTimeout(timer); done(false) },
      })
    }
  })
}
