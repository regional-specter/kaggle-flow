import type { CuratedDataset } from '../types/curator'

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = next[i]
    next[i] = next[j]
    next[j] = current
  }
  return next
}

export function mixDatasets(datasets: CuratedDataset[]): CuratedDataset[] {
  const mixed = shuffle(datasets)
  for (let i = 1; i < mixed.length; i++) {
    if (mixed[i].topic !== mixed[i - 1].topic) continue
    const topic = mixed[i].topic
    const swapAt = mixed.findIndex((item, index) => index > i && item.topic !== topic)
    if (swapAt < 0) continue
    const current = mixed[i]
    mixed[i] = mixed[swapAt]
    mixed[swapAt] = current
  }
  return mixed
}

let sessionMix: CuratedDataset[] | null = null

export function studyMix(datasets: CuratedDataset[]): CuratedDataset[] {
  if (!sessionMix || sessionMix.length !== datasets.length) {
    sessionMix = mixDatasets(datasets)
  }
  return sessionMix
}

export function remixStudy(datasets: CuratedDataset[]): CuratedDataset[] {
  sessionMix = mixDatasets(datasets)
  return sessionMix
}
