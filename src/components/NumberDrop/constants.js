export const INITIAL_LIVES = 3
export const LEVEL_UP_THRESHOLD = 15
export const PLAYFIELD_BOTTOM_OFFSET = 80
export const PARTICLE_COUNT = 8
export const PARTICLE_LIFETIME = 400
export const SHAKE_DURATION = 200
export const MAX_COMBO_MULTIPLIER = 4
export const BUFFER_TIMEOUT = 1200
export const HIGH_SCORE_KEY = 'numberDrop_highScore'

export function getLevelConfig(level) {
  if (level === 1) {
    return { spawnInterval: 2200, baseSpeed: 55, maxDigits: 1 }
  }
  if (level === 2) {
    return { spawnInterval: 1800, baseSpeed: 70, maxDigits: 1 }
  }
  if (level === 3) {
    return { spawnInterval: 1500, baseSpeed: 85, maxDigits: 2 }
  }
  if (level === 4) {
    return { spawnInterval: 1200, baseSpeed: 105, maxDigits: 2 }
  }
  if (level === 5) {
    return { spawnInterval: 1000, baseSpeed: 125, maxDigits: 3 }
  }
  if (level === 6) {
    return { spawnInterval: 850, baseSpeed: 145, maxDigits: 3 }
  }
  if (level === 7) {
    return { spawnInterval: 700, baseSpeed: 165, maxDigits: 4 }
  }
  if (level === 8) {
    return { spawnInterval: 600, baseSpeed: 185, maxDigits: 4 }
  }
  // Level 9+: keeps scaling, up to 5 digits
  return {
    spawnInterval: Math.max(350, 600 - (level - 8) * 40),
    baseSpeed: Math.min(300, 185 + (level - 8) * 20),
    maxDigits: Math.min(6, 4 + Math.floor((level - 8) / 2)),
  }
}

export function generateNumber(maxDigits) {
  if (maxDigits === 1) {
    return String(Math.floor(Math.random() * 9) + 1)
  }
  // Bias toward longer numbers as maxDigits increases
  const minDigits = maxDigits >= 4 ? 2 : 1
  const roll = Math.random()
  let digits
  if (roll < 0.25) {
    digits = minDigits
  } else if (roll < 0.55) {
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
