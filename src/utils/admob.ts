import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob'
import { Capacitor } from '@capacitor/core'

// 테스트 ID → 실제 ID로 교체 필요
const REWARDED_AD_ID = 'ca-app-pub-1253913975799895/7795966902'

export async function initAdMob() {
  if (!Capacitor.isNativePlatform()) return
  await AdMob.initialize({ testingDevices: [], initializeForTesting: false })
}

export async function showRewardedAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true

  try {
    await AdMob.prepareRewardVideoAd({ adId: REWARDED_AD_ID })

    return new Promise((resolve) => {
      let rewarded = false

      AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        rewarded = true
      })

      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        resolve(rewarded)
      })

      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
        resolve(false)
      })

      AdMob.showRewardVideoAd()
    })
  } catch {
    return false
  }
}
