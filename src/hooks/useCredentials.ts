import { useCallback } from 'react'
import { hasUsableCredentials } from '../api/kaggle'
import type { KaggleCredentials } from '../types/kaggle'
import { useLocalStorage } from './useLocalStorage'

const CREDENTIALS_KEY = 'kaggle-scroller:credentials'

const emptyCredentials: KaggleCredentials = {
  username: '',
  apiKey: '',
}

export function useCredentials() {
  const [credentials, setCredentials] = useLocalStorage<KaggleCredentials>(
    CREDENTIALS_KEY,
    emptyCredentials,
  )

  const saveCredentials = useCallback(
    (next: KaggleCredentials) => {
      setCredentials(next)
    },
    [setCredentials],
  )

  const clearCredentials = useCallback(() => {
    setCredentials(emptyCredentials)
  }, [setCredentials])

  const hasCredentials = hasUsableCredentials(credentials)

  return {
    credentials,
    saveCredentials,
    clearCredentials,
    hasCredentials,
  }
}
