import {
  INITIAL_LIVES,
  LEVEL_UP_THRESHOLD,
  PLAYFIELD_BOTTOM_OFFSET,
  PARTICLE_COUNT,
  PARTICLE_LIFETIME,
  MAX_COMBO_MULTIPLIER,
  getLevelConfig,
  generateNumber,
} from './constants.js'

let nextId = 1

export const initialState = {
  fallingNumbers: [],
  score: 0,
  combo: 0,
  maxCombo: 0,
  lives: INITIAL_LIVES,
  level: 1,
  typedBuffer: '',
  particles: [],
  shaking: false,
  spawnTimer: 0,
  numbersDestroyed: 0,
  gameOver: false,
  levelUpFlash: false,
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'TICK': {
      const { dt, viewportHeight } = action
      const deadline = viewportHeight - PLAYFIELD_BOTTOM_OFFSET
      const now = performance.now()

      // Move numbers down
      let missed = []
      let alive = []
      for (const num of state.fallingNumbers) {
        const newY = num.y + num.speed * dt
        if (newY >= deadline) {
          missed.push(num)
        } else {
          alive.push({ ...num, y: newY })
        }
      }

      // Remove expired particles
      const activeParticles = state.particles.filter(
        (p) => now - p.createdAt < PARTICLE_LIFETIME
      )

      // Handle missed numbers
      let { lives, combo, shaking, gameOver, score } = state
      if (missed.length > 0) {
        lives = lives - missed.length
        combo = 0
        shaking = true
        if (lives <= 0) {
          lives = 0
          gameOver = true
        }
      }

      // Spawn logic
      const config = getLevelConfig(state.level)
      let spawnTimer = state.spawnTimer + dt
      let newNumbers = []
      if (spawnTimer >= config.spawnInterval / 1000) {
        spawnTimer = 0
        const value = generateNumber(config.maxDigits)
        const padding = 60
        const x = padding + Math.random() * (window.innerWidth - padding * 2)
        newNumbers.push({
          id: nextId++,
          value,
          x,
          y: -30,
          speed: config.baseSpeed + Math.random() * 20 - 10,
          createdAt: now,
        })
      }

      // Level up check
      let { level, numbersDestroyed, levelUpFlash } = state
      if (levelUpFlash) levelUpFlash = false

      return {
        ...state,
        fallingNumbers: [...alive, ...newNumbers],
        particles: activeParticles,
        lives,
        combo,
        shaking: shaking && !state.shaking ? true : state.shaking,
        gameOver,
        score,
        spawnTimer,
        level,
        numbersDestroyed,
        levelUpFlash,
      }
    }

    case 'KEY_PRESS': {
      const { key } = action
      const buffer = state.typedBuffer + key

      // Check for exact match first
      const exactMatch = state.fallingNumbers.find((n) => n.value === buffer)
      if (exactMatch) {
        const now = performance.now()
        const newCombo = state.combo + 1
        const multiplier = Math.min(MAX_COMBO_MULTIPLIER, 1 + newCombo * 0.25)
        const basePoints = exactMatch.value.length * 100
        const levelBonus = state.level * 10
        const points = Math.round((basePoints + levelBonus) * multiplier)

        // Create particles at the number's position
        const newParticles = []
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.5
          newParticles.push({
            id: nextId++,
            x: exactMatch.x,
            y: exactMatch.y,
            dx: Math.cos(angle),
            dy: Math.sin(angle),
            createdAt: now,
          })
        }

        const newDestroyed = state.numbersDestroyed + 1
        let newLevel = state.level
        let levelUpFlash = false
        if (newDestroyed > 0 && newDestroyed % LEVEL_UP_THRESHOLD === 0) {
          newLevel = state.level + 1
          levelUpFlash = true
        }

        return {
          ...state,
          fallingNumbers: state.fallingNumbers.filter((n) => n.id !== exactMatch.id),
          score: state.score + points,
          combo: newCombo,
          maxCombo: Math.max(state.maxCombo, newCombo),
          typedBuffer: '',
          particles: [...state.particles, ...newParticles],
          numbersDestroyed: newDestroyed,
          level: newLevel,
          levelUpFlash,
        }
      }

      // Check if buffer is a partial match for any number
      const hasPartial = state.fallingNumbers.some((n) =>
        n.value.startsWith(buffer) && n.value !== buffer
      )
      if (hasPartial) {
        return { ...state, typedBuffer: buffer }
      }

      // No match at all — clear buffer
      return { ...state, typedBuffer: '' }
    }

    case 'CLEAR_SHAKE':
      return { ...state, shaking: false }

    case 'RESET':
      nextId = 1
      return { ...initialState }

    default:
      return state
  }
}
