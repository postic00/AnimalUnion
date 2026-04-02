import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob'
import { Capacitor } from '@capacitor/core'
import { showTossRewardedAd, preloadTossAd } from './tossAd'
import { isTossEnvironment } from './toss'

const REWARDED_AD_ID = 'ca-app-pub-1253913975799895/7795966902'

export async function initAdMob() {
  if (isTossEnvironment()) {
    preloadTossAd()
    return
  }
  if (!Capacitor.isNativePlatform()) return
  await AdMob.initialize({ testingDevices: [], initializeForTesting: false })
}

export async function showRewardedAd(): Promise<boolean> {
  if (isTossEnvironment()) return showTossRewardedAd()
  if (!Capacitor.isNativePlatform()) return true

  try {
    await AdMob.prepareRewardVideoAd({ adId: REWARDED_AD_ID })

    return new Promise((resolve) => {
      let rewarded = false

      const listeners: Promise<{ remove: () => void }>[] = []

      const cleanup = () => {
        listeners.forEach(p => p.then(h => h.remove()))
      }

      listeners.push(AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        rewarded = true
      }))

      listeners.push(AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        cleanup()
        resolve(rewarded)
      }))

      listeners.push(AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
        cleanup()
        resolve(false)
      }))

      AdMob.showRewardVideoAd()
    })
  } catch {
    return false
  }
}
