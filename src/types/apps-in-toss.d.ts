declare module '@apps-in-toss/web-framework' {
  interface GraniteEvent {
    addEventListener(event: string, handler: { onEvent: () => void; onError: () => void }): () => void
  }
  export const graniteEvent: GraniteEvent

  export function closeView(): void

  interface AdOptions {
    options: { adGroupId: string }
    onEvent: (event: { type: string }) => void
    onError: () => void
  }

  interface LoadAdFn {
    (options: AdOptions): void
    isSupported(): boolean
  }

  export const loadFullScreenAd: LoadAdFn
  export const showFullScreenAd: LoadAdFn
}
