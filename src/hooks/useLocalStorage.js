import { useState, useEffect } from 'react'

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      const initial = typeof defaultValue === 'function' ? defaultValue() : defaultValue
      return stored !== null ? JSON.parse(stored) : initial
    } catch {
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn('localStorage write failed:', e)
    }
  }, [key, value])

  return [value, setValue]
}
