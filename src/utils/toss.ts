export function isTossEnvironment(): boolean {
  try {
    return typeof window !== 'undefined' &&
      typeof (window as unknown as Record<string, unknown>).ReactNativeWebView !== 'undefined'
  } catch {
    return false
  }
}

export async function closeView(): Promise<void> {
  if (!isTossEnvironment()) return
  try {
    const { closeView: _closeView } = await import('@apps-in-toss/web-framework')
    _closeView()
  } catch {}
}

export async function initTossBackEvent(onBack: () => void): Promise<() => void> {
  if (!isTossEnvironment()) return () => {}
  try {
    const { graniteEvent } = await import('@apps-in-toss/web-framework')
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
