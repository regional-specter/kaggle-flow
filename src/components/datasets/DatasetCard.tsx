import { motion } from 'framer-motion'
import { Bookmark, ExternalLink } from 'lucide-react'
import { useLazyDatasetDescription } from '../../hooks/useLazyDatasetDescription'
import type { KaggleCredentials, KaggleDataset } from '../../types/kaggle'
import {
  buildDatasetSummary,
  formatBytes,
  formatCount,
  formatDate,
  formatRating,
  getCreatorName,
  getDatasetDescription,
  getKaggleDatasetUrl,
} from '../../utils/format'
import { easeTransition } from '../../utils/motion'
import { StatusBadge } from '../ui/StatusBadge'

interface DatasetCardProps {
  dataset: KaggleDataset
  bookmarked: boolean
  onToggleBookmark: (ref: string, dataset: KaggleDataset) => void
  index?: number
  credentials?: KaggleCredentials
  lazyLoadDescription?: boolean
}

export function DatasetCard({
  dataset: initialDataset,
  bookmarked,
  onToggleBookmark,
  index = 0,
  credentials,
  lazyLoadDescription = false,
}: DatasetCardProps) {
  const { cardRef, dataset } = useLazyDatasetDescription({
    credentials,
    dataset: initialDataset,
    enabled: lazyLoadDescription,
  })

  const creator = getCreatorName(dataset)
  const description = getDatasetDescription(dataset)
  const hasLiveStats =
    dataset.usabilityRating != null ||
    dataset.downloadCount != null ||
    dataset.voteCount != null ||
    dataset.totalBytes != null ||
    dataset.lastUpdated != null
  const summary = hasLiveStats ? buildDatasetSummary(dataset) : null
  const primaryMetric = formatRating(dataset.usabilityRating)
  const metricLabel = 'Usability Score'

  return (
    <motion.article
      ref={cardRef}
      layout
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ ...easeTransition, delay: index * 0.04 }}
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-card transition-shadow hover:border-gray-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />

      <header className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-gray-900 sm:text-[1.05rem]">
            {dataset.title}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 sm:text-sm">
            <span className="font-medium text-gray-700">{creator}</span>
            <span className="hidden text-gray-300 sm:inline">•</span>
            <span>{formatBytes(dataset.totalBytes)}</span>
            <span className="text-gray-300">•</span>
            <span className="whitespace-nowrap">Updated {formatDate(dataset.lastUpdated)}</span>
          </div>

          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-500"
            >
              {description}
            </motion.p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            animate={bookmarked ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => onToggleBookmark(dataset.ref, dataset)}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
              bookmarked
                ? 'border-amber-200 bg-amber-50 text-amber-600'
                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:text-gray-600'
            }`}
          >
            <Bookmark
              className="h-4 w-4"
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </motion.button>

          <motion.a
            href={getKaggleDatasetUrl(dataset.ref)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in browser"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-400 transition-colors hover:border-gray-200 hover:text-gray-700"
          >
            <ExternalLink className="h-4 w-4" />
          </motion.a>
        </div>
      </header>

      {hasLiveStats && (
      <div className="mt-6 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
            {metricLabel}
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {primaryMetric}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              {formatCount(dataset.downloadCount)}
            </span>{' '}
            downloads
          </p>
        </div>

        <div className="flex gap-3 sm:flex-col sm:items-end sm:gap-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-right sm:min-w-[7rem]">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
              Votes
            </p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-gray-900">
              {formatCount(dataset.voteCount)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-right sm:min-w-[7rem]">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
              Size
            </p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-gray-900">
              {formatBytes(dataset.totalBytes)}
            </p>
          </div>
        </div>
      </div>
      )}

      {summary && (
        <p className="mt-5 border-t border-gray-50 pt-4 text-sm leading-relaxed text-gray-500 sm:mt-6 sm:pt-5">
          {summary}
        </p>
      )}

      {hasLiveStats && (
      <footer className="mt-3 flex flex-wrap gap-2 sm:mt-4">
        <StatusBadge variant="neutral">
          {formatCount(dataset.voteCount)} votes
        </StatusBadge>
        <StatusBadge variant="positive">
          Updated {formatDate(dataset.lastUpdated)}
        </StatusBadge>
      </footer>
      )}
    </motion.article>
  )
}
