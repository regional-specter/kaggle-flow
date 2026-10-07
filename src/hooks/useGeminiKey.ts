import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

const GEMINI_KEY = 'kaggle-scroller:gemini-key'

export function useGeminiKey() {
  const [apiKey, setApiKey] = useLocalStorage(GEMINI_KEY, '')

  const saveGeminiKey = useCallback(
    (next: string) => {
      setApiKey(next.trim())
    },
    [setApiKey],
  )

  const clearGeminiKey = useCallback(() => {
    setApiKey('')
  }, [setApiKey])

  return {
    geminiKey: apiKey.trim(),
    hasGeminiKey: apiKey.trim().length > 0,
    saveGeminiKey,
    clearGeminiKey,
  }
}
