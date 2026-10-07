import { useCallback, useEffect, useRef, useState } from 'react'
import { STUDY_PROMPT_VERSION, writeStudyNote } from '../api/gemini'
import type { CuratedDataset, StudyLens, StudyPoint } from '../types/curator'
import { useLocalStorage } from './useLocalStorage'

const DRAFTS_KEY = 'kaggle-scroller:study-drafts'

type StudyPoints = Record<StudyLens, StudyPoint[]>

interface StoredDraft {
  version: number
  points: StudyPoints
}

export type StudyDraftStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useStudyDraft(dataset: CuratedDataset | null, apiKey: string) {
  const [cache, setCache] = useLocalStorage<Record<string, StoredDraft>>(DRAFTS_KEY, {})
  const cacheRef = useRef(cache)
  cacheRef.current = cache

  const [points, setPoints] = useState<StudyPoints | null>(null)
  const [status, setStatus] = useState<StudyDraftStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const write = useCallback(
    (current: CuratedDataset, force: boolean) => {
      const cached = cacheRef.current[current.ref]
      if (!force && cached?.version === STUDY_PROMPT_VERSION) {
        abortRef.current?.abort()
        setPoints(cached.points)
        setStatus('ready')
        setError(null)
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const id = ++requestId.current
      setStatus('loading')
      setError(null)

      void writeStudyNote(apiKey, current, controller.signal)
        .then((next) => {
          if (id !== requestId.current) return
          setCache((prev) => ({
            ...prev,
            [current.ref]: { version: STUDY_PROMPT_VERSION, points: next },
          }))
          setPoints(next)
          setStatus('ready')
        })
        .catch((err: unknown) => {
          if (id !== requestId.current || controller.signal.aborted) return
          setStatus('error')
          setError(err instanceof Error ? err.message : 'Gemini could not write this note.')
        })
    },
    [apiKey, setCache],
  )

  useEffect(() => {
    if (!dataset || !apiKey) {
      abortRef.current?.abort()
      setPoints(null)
      setStatus('idle')
      setError(null)
      return
    }

    write(dataset, false)
    return () => abortRef.current?.abort()
  }, [dataset, apiKey, write])

  const rewrite = useCallback(() => {
    if (!dataset || !apiKey) return
    write(dataset, true)
  }, [apiKey, dataset, write])

  return { points, status, error, rewrite }
}
