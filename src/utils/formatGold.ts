const alpha = 'abcdefghijklmnopqrstuvwxyz'
const SUFFIXES: string[] = ['', 'k', 'm', 'b', 't']
for (let i = 0; i < 26; i++) for (let j = 0; j < 26; j++) SUFFIXES.push(alpha[i] + alpha[j])

export function formatNumber(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '∞'
  if (n < 1000) return String(Math.floor(n))
  const tier = Math.floor(Math.log10(n) / 3)
  const capped = Math.min(tier, SUFFIXES.length - 1)
  const scaled = n / Math.pow(1000, capped)
  const fixed = scaled < 10 ? scaled.toFixed(3) : scaled < 100 ? scaled.toFixed(2) : scaled.toFixed(1)
  return `${fixed}${SUFFIXES[capped]}`
}

export function formatGold(n: number): string {
  return formatNumber(n)
}

export function formatQuantity(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '∞'
  if (n < 1000) return String(Math.floor(n))
  const tier = Math.floor(Math.log10(n) / 3)
  const capped = Math.min(tier, SUFFIXES.length - 1)
  const scaled = n / Math.pow(1000, capped)
  const fixed = scaled < 10 ? scaled.toFixed(2) : scaled < 100 ? scaled.toFixed(1) : Math.floor(scaled).toString()
  return `${fixed}${SUFFIXES[capped]}`
}
