let ctx = null

export function initAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
}

function playTone(freq, endFreq, duration, type = 'square', volume = 0.15) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration)
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

export function playHit() {
  playTone(440, 880, 0.12, 'square', 0.12)
}

export function playCombo() {
  playTone(660, 1320, 0.1, 'square', 0.12)
  setTimeout(() => playTone(880, 1200, 0.08, 'square', 0.1), 60)
}

export function playMiss() {
  playTone(220, 80, 0.25, 'sawtooth', 0.15)
}

export function playLevelUp() {
  playTone(523, 523, 0.1, 'square', 0.12)
  setTimeout(() => playTone(659, 659, 0.1, 'square', 0.12), 120)
  setTimeout(() => playTone(784, 784, 0.15, 'square', 0.12), 240)
}

export function playGameOver() {
  playTone(440, 220, 0.2, 'sawtooth', 0.15)
  setTimeout(() => playTone(330, 165, 0.2, 'sawtooth', 0.15), 220)
  setTimeout(() => playTone(220, 80, 0.4, 'sawtooth', 0.15), 440)
}
