export const INITIAL_LIVES = 3
export const NUMBERS_PER_LEVEL = 20
export const PLAYFIELD_BOTTOM_OFFSET = 80
export const PARTICLE_COUNT = 8
export const PARTICLE_LIFETIME = 400
export const SHAKE_DURATION = 200
export const MAX_COMBO_MULTIPLIER = 4
export const BUFFER_TIMEOUT = 1200
export const HIGH_SCORE_KEY = 'numberDrop_highScore'

export function getLevelConfig(level) {
  if (level === 1) {
    return { spawnInterval: 1800, baseSpeed: 80, maxDigits: 1 }
  }
  if (level === 2) {
    return { spawnInterval: 1500, baseSpeed: 100, maxDigits: 2 }
  }
  if (level === 3) {
    return { spawnInterval: 1200, baseSpeed: 120, maxDigits: 2 }
  }
  if (level === 4) {
    return { spawnInterval: 1000, baseSpeed: 140, maxDigits: 3 }
  }
  if (level === 5) {
    return { spawnInterval: 850, baseSpeed: 160, maxDigits: 4 }
  }
  if (level === 6) {
    return { spawnInterval: 700, baseSpeed: 180, maxDigits: 5 }
  }
  if (level === 7) {
    return { spawnInterval: 600, baseSpeed: 200, maxDigits: 6 }
  }
  if (level === 8) {
    return { spawnInterval: 500, baseSpeed: 220, maxDigits: 7 }
  }
  if (level === 9) {
    return { spawnInterval: 420, baseSpeed: 240, maxDigits: 8 }
  }
  if (level === 10) {
    return { spawnInterval: 350, baseSpeed: 260, maxDigits: 9 }
  }
  // Level 11+: insane mode, up to 10 digits
  return {
    spawnInterval: Math.max(250, 350 - (level - 10) * 20),
    baseSpeed: Math.min(400, 260 + (level - 10) * 20),
    maxDigits: 10,
  }
}

export function generateNumber(maxDigits) {
  if (maxDigits === 1) {
    return String(Math.floor(Math.random() * 9) + 1)
  }
  // Bias toward longer numbers as maxDigits increases
  const minDigits = maxDigits >= 5 ? 2 : 1
  const roll = Math.random()
  let digits
  if (roll < 0.2) {
    digits = minDigits
  } else if (roll < 0.45) {
    digits = Math.min(maxDigits, minDigits + 1)
  } else {
    digits = maxDigits
  }
  if (digits === 1) {
    return String(Math.floor(Math.random() * 9) + 1)
  }
  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  return String(Math.floor(Math.random() * (max - min + 1)) + min)
}
