import type { KaggleDataset } from '../types/kaggle'
import type { CuratedDataset } from '../types/curator'
import { curatedLarge } from './curatedLarge'
import { curatedRest } from './curatedRest'

export const curatedDatasets: CuratedDataset[] = [...curatedLarge, ...curatedRest].sort(
  (a, b) => b.rows - a.rows,
)

export function toKaggleDataset(dataset: CuratedDataset): KaggleDataset {
  return {
    ref: dataset.ref,
    title: dataset.title,
    creatorName: dataset.owner,
    subtitle: dataset.summary,
    description: dataset.summary,
  }
}

export function tableSize(rows: number): string {
  if (rows >= 100_000) return 'Large table'
  if (rows >= 20_000) return 'Ready to model'
  return 'Compact classic'
}
