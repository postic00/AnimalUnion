let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// 햄스터 찍찍
export function soundHamster() {
  const c = getCtx()
  const t = c.currentTime
  ;[0, 0.08].forEach(offset => {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1800, t + offset)
    osc.frequency.linearRampToValueAtTime(2200, t + offset + 0.03)
    osc.frequency.linearRampToValueAtTime(1600, t + offset + 0.06)
    g.gain.setValueAtTime(0.25, t + offset)
    g.gain.linearRampToValueAtTime(0, t + offset + 0.07)
    osc.connect(g); g.connect(c.destination)
    osc.start(t + offset); osc.stop(t + offset + 0.07)
  })
}

// 고양이 야옹
export function soundCat() {
  const c = getCtx()
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(400, t)
  osc.frequency.linearRampToValueAtTime(700, t + 0.15)
  osc.frequency.linearRampToValueAtTime(500, t + 0.35)
  osc.frequency.linearRampToValueAtTime(350, t + 0.55)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.35, t + 0.05)
  g.gain.setValueAtTime(0.35, t + 0.4)
  g.gain.linearRampToValueAtTime(0, t + 0.6)
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.frequency.setValueAtTime(6, t)
  lfoGain.gain.setValueAtTime(20, t)
  lfo.connect(lfoGain); lfoGain.connect(osc.frequency)
  osc.connect(g); g.connect(c.destination)
  lfo.start(t); lfo.stop(t + 0.6)
  osc.start(t); osc.stop(t + 0.6)
}

// 강아지 왈왈
export function soundDog() {
  const c = getCtx()
  const t = c.currentTime
  ;[0, 0.14].forEach(offset => {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, t + offset)
    osc.frequency.linearRampToValueAtTime(160, t + offset + 0.09)
    g.gain.setValueAtTime(0.28, t + offset)
    g.gain.linearRampToValueAtTime(0, t + offset + 0.1)
    const osc2 = c.createOscillator()
    const g2 = c.createGain()
    osc2.type = 'square'
    osc2.frequency.setValueAtTime(80, t + offset)
    g2.gain.setValueAtTime(0.1, t + offset)
    g2.gain.linearRampToValueAtTime(0, t + offset + 0.1)
    osc.connect(g); g.connect(c.destination)
    osc2.connect(g2); g2.connect(c.destination)
    osc.start(t + offset); osc.stop(t + offset + 0.1)
    osc2.start(t + offset); osc2.stop(t + offset + 0.1)
  })
}

// 동전 핑 (골드 획득)
export function soundCoin() {
  const c = getCtx()
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(1400, t)
  osc.frequency.linearRampToValueAtTime(1600, t + 0.02)
  g.gain.setValueAtTime(0.2, t)
  g.gain.linearRampToValueAtTime(0, t + 0.2)
  osc.connect(g); g.connect(c.destination)
  osc.start(t); osc.stop(t + 0.2)
}

// 건설/업그레이드 팡
export function soundBuild() {
  const c = getCtx()
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(300, t)
  osc.frequency.linearRampToValueAtTime(600, t + 0.1)
  osc.frequency.linearRampToValueAtTime(900, t + 0.2)
  g.gain.setValueAtTime(0.25, t)
  g.gain.linearRampToValueAtTime(0, t + 0.25)
  osc.connect(g); g.connect(c.destination)
  osc.start(t); osc.stop(t + 0.25)
}

// animalId 기반으로 소리 재생
export function soundByAnimalId(animalId: string | null | undefined) {
  if (!animalId) return
  if (animalId.startsWith('hamster')) soundHamster()
  else if (animalId.startsWith('cat')) soundCat()
  else if (animalId.startsWith('dog')) soundDog()
}
