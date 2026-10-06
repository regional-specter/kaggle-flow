import { motion } from 'framer-motion'
import type { KaggleDataset } from '../types/kaggle'
import { DatasetCard } from '../components/datasets/DatasetCard'
import { EmptyState } from '../components/ui/EmptyState'
import { staggerContainer } from '../utils/motion'

interface BookmarkedViewProps {
  datasets: KaggleDataset[]
  isBookmarked: (ref: string) => boolean
  onToggleBookmark: (ref: string, dataset: KaggleDataset) => void
  onGoToDiscover: () => void
}

export function BookmarkedView({
  datasets,
  isBookmarked,
  onToggleBookmark,
  onGoToDiscover,
}: BookmarkedViewProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Bookmarked
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your saved datasets, ready to revisit anytime.
        </p>
      </div>

      {datasets.length === 0 ? (
        <EmptyState
          title="No bookmarks yet"
          description="Bookmark datasets from Discover or Study to build your personal collection."
          action={
            <button
              type="button"
              onClick={onGoToDiscover}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
            >
              Browse datasets
            </button>
          }
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {datasets.map((dataset, index) => (
            <DatasetCard
              key={dataset.ref}
              dataset={dataset}
              bookmarked={isBookmarked(dataset.ref)}
              onToggleBookmark={onToggleBookmark}
              index={index}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
