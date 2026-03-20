import { useEffect, useRef } from 'react'

export function useGameLoop(callback, isRunning) {
  const callbackRef = useRef(callback)
  const rafRef = useRef(null)
  const prevTimeRef = useRef(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!isRunning) {
      prevTimeRef.current = null
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    function loop(timestamp) {
      if (prevTimeRef.current === null) {
        prevTimeRef.current = timestamp
      }
      const dt = Math.min((timestamp - prevTimeRef.current) / 1000, 0.1)
      prevTimeRef.current = timestamp
      callbackRef.current(dt)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isRunning])

  // Auto-pause when tab is hidden
  useEffect(() => {
    if (!isRunning) return
    function handleVisibility() {
      if (document.hidden) {
        prevTimeRef.current = null
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isRunning])
}
