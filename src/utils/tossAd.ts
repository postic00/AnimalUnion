import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework'

// TODO: 앱인토스 콘솔에서 발급받은 광고 그룹 ID로 교체
const AD_GROUP_ID = 'ait-ad-test-rewarded-id'

export function isTossAdSupported(): boolean {
  try {
    return loadFullScreenAd.isSupported()
  } catch {
    return false
  }
}

export function preloadTossAd(): void {
  if (!isTossAdSupported()) return
  loadFullScreenAd({
    options: { adGroupId: AD_GROUP_ID },
    onEvent: () => {},
    onError: () => {},
  })
}

export function showTossRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isTossAdSupported()) {
      resolve(true)
      return
    }
    let rewarded = false
    showFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'userEarnedReward') rewarded = true
        if (event.type === 'dismissed') {
          preloadTossAd()
          resolve(rewarded)
        }
      },
      onError: () => resolve(false),
    })
  })
}
