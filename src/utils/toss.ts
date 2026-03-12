import { graniteEvent } from '@apps-in-toss/web-framework'

export function isTossEnvironment(): boolean {
  try {
    return typeof window !== 'undefined' &&
      typeof (window as unknown as Record<string, unknown>).ReactNativeWebView !== 'undefined'
  } catch {
    return false
  }
}

export function initTossBackEvent(onBack: () => void): () => void {
  if (!isTossEnvironment()) return () => {}
  try {
    return graniteEvent.addEventListener('backEvent', {
      onEvent: onBack,
      onError: () => {},
    })
  } catch {
    return () => {}
  }
}

export function initTossVisibility(onHide: () => void, onShow: () => void): () => void {
  const handler = () => {
    if (document.hidden) onHide()
    else onShow()
  }
  document.addEventListener('visibilitychange', handler)
  return () => document.removeEventListener('visibilitychange', handler)
}
