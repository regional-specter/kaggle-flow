import type { CuratedDataset } from '../types/curator'

/** Textbook tables sit here. Unusual subjects are scored much higher on the dataset itself. */
const ORDINARY_CURIOSITY = 2
/** Tables at or above this score are the suggestion pool. Textbook tables stay searchable. */
const UNUSUAL_CURIOSITY = 7
/** How many cards a visit shows. Refresh and Shuffle draw a new slate from the pool. */
export const STUDY_SLATE_SIZE = 18
const TOPIC_CAP = 4

type Drawable = Pick<CuratedDataset, 'topic' | 'curiosity'>

function curiosityOf(dataset: Drawable): number {
  const score = dataset.curiosity ?? ORDINARY_CURIOSITY
  return score > 0 ? score : ORDINARY_CURIOSITY
}

/**
 * Weighted random order (Efraimidis–Spirakis).
 * A dataset with curiosity c is drawn with weight c², so unusual subjects
 * show up far more often than a standard textbook table, in a new order each draw.
 */
function weightedOrder<T extends Drawable>(datasets: T[]): T[] {
  return datasets
    .map((dataset) => ({
      dataset,
      key: Math.random() ** (1 / curiosityOf(dataset) ** 2),
    }))
    .sort((a, b) => b.key - a.key)
    .map((item) => item.dataset)
}

function spreadTopics<T extends Drawable>(mixed: T[]): T[] {
  const next = [...mixed]
  for (let i = 1; i < next.length; i++) {
    if (next[i].topic !== next[i - 1].topic) continue
    const topic = next[i].topic
    const swapAt = next.findIndex((item, index) => index > i && item.topic !== topic)
    if (swapAt < 0) continue
    const current = next[i]
    next[i] = next[swapAt]
    next[swapAt] = current
  }
  return next
}

function takeWithTopicCap<T extends Drawable>(candidates: T[], size: number, slate: T[]): T[] {
  const counts = new Map<string, number>()
  for (const dataset of slate) {
    counts.set(dataset.topic, (counts.get(dataset.topic) ?? 0) + 1)
  }
  const deferred: T[] = []

  for (const dataset of candidates) {
    if (slate.length >= size) break
    const seen = counts.get(dataset.topic) ?? 0
    if (seen >= TOPIC_CAP) {
      deferred.push(dataset)
      continue
    }
    slate.push(dataset)
    counts.set(dataset.topic, seen + 1)
  }

  return deferred
}

export function suggestDatasets<T extends Drawable>(
  datasets: T[],
  size = STUDY_SLATE_SIZE,
): T[] {
  const ranked = weightedOrder(datasets)
  const unusual = ranked.filter((dataset) => curiosityOf(dataset) >= UNUSUAL_CURIOSITY)
  const ordinary = ranked.filter((dataset) => curiosityOf(dataset) < UNUSUAL_CURIOSITY)
  const slate: T[] = []
  const deferred = takeWithTopicCap(unusual, size, slate)

  for (const dataset of deferred) {
    if (slate.length >= size) break
    slate.push(dataset)
  }

  if (slate.length < size) {
    takeWithTopicCap(ordinary, size, slate)
  }

  return spreadTopics(slate)
}

let sessionMix: CuratedDataset[] | null = null
let sessionSourceCount = 0

export function studyMix(datasets: CuratedDataset[]): CuratedDataset[] {
  if (!sessionMix || sessionSourceCount !== datasets.length) {
    sessionSourceCount = datasets.length
    sessionMix = suggestDatasets(datasets)
  }
  return sessionMix
}

export function remixStudy(datasets: CuratedDataset[]): CuratedDataset[] {
  sessionSourceCount = datasets.length
  sessionMix = suggestDatasets(datasets)
  return sessionMix
}
