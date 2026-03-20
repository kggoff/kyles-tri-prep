import { useReducer, useEffect, useCallback, useState, useRef } from 'react'
import { gameReducer, initialState } from './gameReducer.js'
import { useGameLoop } from './useGameLoop.js'
import { SHAKE_DURATION, HIGH_SCORE_KEY, PLAYFIELD_BOTTOM_OFFSET, NUMBERS_PER_LEVEL } from './constants.js'
import { initAudio, playHit, playCombo, playMiss, playLevelUp, playGameOver } from './audio.js'
import { fetchLeaderboard, submitScore, isSupabaseEnabled } from './leaderboard.js'
import './NumberDrop.css'

export default function NumberDrop() {
  const [screen, setScreen] = useState('title')
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem(HIGH_SCORE_KEY)) || 0
    } catch {
      return 0
    }
  })
  const [leaderboard, setLeaderboard] = useState([])
  const [playerName, setPlayerName] = useState(() => {
    try {
      return localStorage.getItem('numberDrop_playerName') || ''
    } catch {
      return ''
    }
  })
  const [scoreSubmitted, setScoreSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  const nameInputRef = useRef(null)
  const shakeTimeoutRef = useRef(null)
  const prevShakingRef = useRef(false)
  const prevLevelRef = useRef(1)

  const isPlaying = screen === 'playing' && !state.gameOver
  const hasSupabase = isSupabaseEnabled()

  // Load leaderboard on mount and when returning to title
  useEffect(() => {
    if (screen === 'title' || screen === 'gameover') {
      fetchLeaderboard(10).then(setLeaderboard)
    }
  }, [screen])

  // Game loop tick
  const tick = useCallback(
    (dt) => {
      dispatch({ type: 'TICK', dt, viewportHeight: window.innerHeight })
    },
    []
  )
  useGameLoop(tick, isPlaying)

  // Handle game over transition
  useEffect(() => {
    if (state.gameOver && screen === 'playing') {
      playGameOver()
      const newHigh = Math.max(highScore, state.score)
      if (newHigh > highScore) {
        setHighScore(newHigh)
        try {
          localStorage.setItem(HIGH_SCORE_KEY, String(newHigh))
        } catch {}
      }
      setScoreSubmitted(false)
      setTimeout(() => {
        setScreen('gameover')
        // Focus name input after transition
        setTimeout(() => nameInputRef.current?.focus(), 100)
      }, 600)
    }
  }, [state.gameOver, screen, state.score, highScore])

  // Sound effects for shaking (miss) and level up
  useEffect(() => {
    if (state.shaking && !prevShakingRef.current) {
      playMiss()
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current)
      shakeTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'CLEAR_SHAKE' })
      }, SHAKE_DURATION)
    }
    prevShakingRef.current = state.shaking
  }, [state.shaking])

  useEffect(() => {
    if (state.level > prevLevelRef.current) {
      playLevelUp()
    }
    prevLevelRef.current = state.level
  }, [state.level])

  // Keyboard input
  useEffect(() => {
    function handleKeyDown(e) {
      if (screen === 'title' && !showLeaderboard) {
        initAudio()
        dispatch({ type: 'RESET' })
        setScreen('playing')
        return
      }

      if (screen === 'title' && showLeaderboard) {
        if (e.key === 'Escape') {
          setShowLeaderboard(false)
        }
        return
      }

      if (screen === 'gameover') {
        // Don't capture keys while typing name
        return
      }

      if (screen === 'playing' && !state.gameOver) {
        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault()
          dispatch({ type: 'KEY_PRESS', key: e.key })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [screen, state.gameOver, showLeaderboard])

  // Play hit sounds on successful number destruction
  const prevDestroyedRef = useRef(0)
  useEffect(() => {
    if (state.numbersDestroyed > prevDestroyedRef.current) {
      if (state.combo >= 4) {
        playCombo()
      } else {
        playHit()
      }
    }
    prevDestroyedRef.current = state.numbersDestroyed
  }, [state.numbersDestroyed, state.combo])

  async function handleSubmitScore(e) {
    e.preventDefault()
    if (!playerName.trim() || submitting || scoreSubmitted) return
    setSubmitting(true)
    try {
      localStorage.setItem('numberDrop_playerName', playerName.trim())
    } catch {}
    const result = await submitScore({
      playerName: playerName.trim(),
      score: state.score,
      level: state.level,
      maxCombo: state.maxCombo,
      numbersDestroyed: state.numbersDestroyed,
    })
    if (result) {
      setScoreSubmitted(true)
      fetchLeaderboard(10).then(setLeaderboard)
    }
    setSubmitting(false)
  }

  function handleShare() {
    const url = window.location.origin + window.location.pathname + '?game'
    navigator.clipboard.writeText(url).then(() => {
      setShareMsg('LINK COPIED!')
      setTimeout(() => setShareMsg(''), 2000)
    }).catch(() => {
      setShareMsg('COPY FAILED')
      setTimeout(() => setShareMsg(''), 2000)
    })
  }

  function handlePlayAgain() {
    dispatch({ type: 'RESET' })
    setScreen('playing')
    setScoreSubmitted(false)
  }

  function handleBackToTitle() {
    setScreen('title')
    setScoreSubmitted(false)
  }

  const deadline = window.innerHeight - PLAYFIELD_BOTTOM_OFFSET
  const dangerZone = deadline - 120

  return (
    <div className={`nd-root ${state.shaking ? 'nd-root--shake' : ''}`}>

      {screen === 'title' && !showLeaderboard && (
        <div className="nd-title">
          <div className="nd-title-decoration">{'<< ======== >>'}</div>
          <h1>
            NUMBER<br />DROP
          </h1>
          <div className="nd-title-decoration">{'<< ======== >>'}</div>
          <div className="nd-title-stats">
            <span>HIGH SCORE</span>
            <span className="nd-title-highscore">{String(highScore).padStart(8, '0')}</span>
          </div>
          <div className="nd-insert-coin">PRESS ANY KEY</div>
          <div className="nd-title-buttons">
            {hasSupabase && (
              <button className="nd-btn" onClick={(e) => { e.stopPropagation(); setShowLeaderboard(true) }}>
                LEADERBOARD
              </button>
            )}
            <button className="nd-btn nd-btn--share" onClick={(e) => { e.stopPropagation(); handleShare() }}>
              SHARE
            </button>
          </div>
          {shareMsg && <div className="nd-share-msg">{shareMsg}</div>}
          <div className="nd-title-footer">
            <span>TYPE NUMBERS BEFORE THEY FALL</span>
          </div>
        </div>
      )}

      {screen === 'title' && showLeaderboard && (
        <div className="nd-leaderboard-screen">
          <h2>LEADERBOARD</h2>
          <div className="nd-leaderboard-table">
            <div className="nd-lb-header">
              <span className="nd-lb-rank">#</span>
              <span className="nd-lb-name">NAME</span>
              <span className="nd-lb-score">SCORE</span>
              <span className="nd-lb-level">LVL</span>
            </div>
            {leaderboard.length === 0 && (
              <div className="nd-lb-empty">NO SCORES YET</div>
            )}
            {leaderboard.map((entry, i) => (
              <div key={entry.id} className={`nd-lb-row ${i < 3 ? 'nd-lb-row--top' : ''}`}>
                <span className="nd-lb-rank">{i + 1}</span>
                <span className="nd-lb-name">{entry.player_name}</span>
                <span className="nd-lb-score">{String(entry.score).padStart(8, '0')}</span>
                <span className="nd-lb-level">{entry.level}</span>
              </div>
            ))}
          </div>
          <button className="nd-btn" onClick={() => setShowLeaderboard(false)}>
            BACK
          </button>
        </div>
      )}

      {screen === 'playing' && (
        <>
          {/* HUD */}
          <div className="nd-hud">
            <div className="nd-hud-left">
              <div className="nd-hud-label">SCORE</div>
              <div className="nd-hud-score">
                {String(state.score).padStart(8, '0')}
              </div>
            </div>
            <div className="nd-hud-center">
              <div className="nd-hud-label">LEVEL</div>
              <div className={`nd-hud-level ${state.levelUpFlash ? 'nd-hud-level--flash' : ''}`}>
                {state.level}
              </div>
            </div>
            <div className="nd-hud-right">
              <div className="nd-hud-label">LIVES</div>
              <div className="nd-hud-lives">
                {Array.from({ length: state.lives }).map((_, i) => (
                  <span key={i} className="nd-heart">&#9829;</span>
                ))}
                {Array.from({ length: 3 - state.lives }).map((_, i) => (
                  <span key={i + 'e'} className="nd-heart nd-heart--empty">&#9829;</span>
                ))}
              </div>
            </div>
          </div>

          {/* Level progress bar */}
          {(() => {
            const progress = (state.levelKills + (NUMBERS_PER_LEVEL - state.levelSpawned + state.fallingNumbers.length > 0 ? 0 : 0)) / NUMBERS_PER_LEVEL
            const progressPct = Math.min(100, (state.levelKills / NUMBERS_PER_LEVEL) * 100)
            return (
              <div className="nd-progress">
                <div className="nd-progress-label">
                  <span>LVL {state.level}</span>
                  <span>{state.levelKills}/{NUMBERS_PER_LEVEL}</span>
                </div>
                <div className="nd-progress-bar">
                  <div
                    className="nd-progress-fill"
                    style={{ width: progressPct + '%' }}
                  />
                </div>
              </div>
            )
          })()}

          {/* Combo display */}
          {state.combo >= 2 && (
            <div className={`nd-combo ${state.combo >= 5 ? 'nd-combo--mega' : ''}`}>
              {state.combo}x COMBO
            </div>
          )}

          {/* Falling numbers */}
          {state.fallingNumbers.map((num) => {
            const isDanger = num.y > dangerZone
            const isMulti = num.value.length > 1
            return (
              <span
                key={num.id}
                className={`nd-number ${isMulti ? 'nd-number--multi' : ''} ${isDanger ? 'nd-number--danger' : ''}`}
                style={{
                  transform: `translate(${num.x}px, ${num.y}px)`,
                }}
              >
                {num.value}
              </span>
            )
          })}

          {/* Particles */}
          {state.particles.map((p) => (
            <span
              key={p.id}
              className="nd-particle"
              style={{
                left: p.x + 'px',
                top: p.y + 'px',
                '--nd-dx': p.dx,
                '--nd-dy': p.dy,
              }}
            />
          ))}

          {/* Deadline */}
          <div
            className="nd-deadline"
            style={{ top: deadline + 'px' }}
          />

          {/* Typed buffer */}
          <div className="nd-buffer" style={{ top: deadline + 20 + 'px' }}>
            {state.typedBuffer && (
              <span className="nd-buffer-text">{state.typedBuffer}<span className="nd-buffer-cursor">_</span></span>
            )}
          </div>
        </>
      )}

      {screen === 'gameover' && (
        <div className="nd-gameover">
          <h2>GAME OVER</h2>
          <div className="nd-gameover-stats">
            <div className="nd-gameover-row">
              <span>SCORE</span>
              <span className="nd-gameover-value">{String(state.score).padStart(8, '0')}</span>
            </div>
            <div className="nd-gameover-row">
              <span>LEVEL</span>
              <span className="nd-gameover-value">{state.level}</span>
            </div>
            <div className="nd-gameover-row">
              <span>MAX COMBO</span>
              <span className="nd-gameover-value">{state.maxCombo}x</span>
            </div>
            <div className="nd-gameover-row">
              <span>DESTROYED</span>
              <span className="nd-gameover-value">{state.numbersDestroyed}</span>
            </div>
            {state.score >= highScore && state.score > 0 && (
              <div className="nd-gameover-newhi">&#9733; NEW HIGH SCORE &#9733;</div>
            )}
          </div>

          {/* Name entry + submit for leaderboard */}
          {hasSupabase && !scoreSubmitted && state.score > 0 && (
            <form className="nd-name-form" onSubmit={handleSubmitScore}>
              <label className="nd-name-label">ENTER YOUR NAME</label>
              <div className="nd-name-row">
                <input
                  ref={nameInputRef}
                  className="nd-name-input"
                  type="text"
                  maxLength={12}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                  placeholder="AAA"
                  autoComplete="off"
                  spellCheck="false"
                />
                <button className="nd-btn nd-btn--submit" type="submit" disabled={submitting || !playerName.trim()}>
                  {submitting ? '...' : 'SUBMIT'}
                </button>
              </div>
            </form>
          )}
          {scoreSubmitted && (
            <div className="nd-submitted">SCORE SUBMITTED!</div>
          )}

          {/* Mini leaderboard */}
          {hasSupabase && leaderboard.length > 0 && (
            <div className="nd-mini-leaderboard">
              <div className="nd-mini-lb-title">TOP SCORES</div>
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div key={entry.id} className={`nd-mini-lb-row ${i < 3 ? 'nd-mini-lb-row--top' : ''}`}>
                  <span className="nd-mini-lb-rank">{i + 1}.</span>
                  <span className="nd-mini-lb-name">{entry.player_name}</span>
                  <span className="nd-mini-lb-score">{String(entry.score).padStart(8, '0')}</span>
                </div>
              ))}
            </div>
          )}

          <div className="nd-gameover-actions">
            <button className="nd-btn" onClick={handlePlayAgain}>PLAY AGAIN</button>
            <button className="nd-btn nd-btn--secondary" onClick={handleBackToTitle}>MENU</button>
          </div>
        </div>
      )}
    </div>
  )
}
