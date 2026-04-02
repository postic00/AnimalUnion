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

export function getTossAdDebugInfo() {
  return {
    operationalEnv: (() => { try { return getOperationalEnvironment() } catch { return 'error' } })(),
    adGroupId: getAdGroupId(),
    loadSupported: (() => { try { return loadFullScreenAd.isSupported() } catch { return false } })(),
    showSupported: (() => { try { return showFullScreenAd.isSupported() } catch { return false } })(),
    adLoaded,
  }
}

export function isTossAdSupported(): boolean {
  try {
    return loadFullScreenAd.isSupported() === true
  } catch {
    return false
  }
}

let adLoaded = false

export function preloadTossAd(): void {
  if (!isTossAdSupported()) return
  adLoaded = false
  loadFullScreenAd({
    options: { adGroupId: getAdGroupId() },
    onEvent: (event) => {
      if (event.type === 'loaded') adLoaded = true
    },
    onError: () => {},
  })
}

export function showTossRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!showFullScreenAd.isSupported()) { resolve(false); return }

    let rewarded = false
    let resolved = false
    const done = (result: boolean) => {
      if (resolved) return
      resolved = true
      resolve(result)
    }
    const timer = setTimeout(() => done(false), 15000)

    const show = () => {
      try {
        showFullScreenAd({
          options: { adGroupId: getAdGroupId() },
          onEvent: (e) => {
            if (e.type === 'userEarnedReward') rewarded = true
            if (e.type === 'dismissed') {
              clearTimeout(timer)
              preloadTossAd()
              done(rewarded)
            }
            if (e.type === 'failedToShow') {
              clearTimeout(timer); done(false)
            }
          },
          onError: () => { clearTimeout(timer); done(false) },
        })
      } catch {
        clearTimeout(timer); done(false)
      }
    }

    if (adLoaded) {
      show()
    } else {
      clearTimeout(timer)
      done(false)
    }
  })
}
