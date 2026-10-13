import { motion } from 'framer-motion'
import { ArrowRight, Heart } from 'lucide-react'
import type { CuratedDataset } from '../../types/curator'
import { tableSize } from '../../data/curatedDatasets'

interface StudyCardProps {
  dataset: CuratedDataset
  bookmarked: boolean
  onOpen: () => void
  onToggleBookmark: () => void
}

export function StudyCard({ dataset, bookmarked, onOpen, onToggleBookmark }: StudyCardProps) {
  return (
    <motion.article
      layout
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-card transition-shadow hover:border-gray-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-5"
    >
      <button
        type="button"
        id={`study-card-${dataset.ref}`}
        onClick={onOpen}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15"
        aria-haspopup="dialog"
        aria-label={`Open ${dataset.title}`}
      />

      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-medium text-[#4C51BF]">
              {dataset.topic}
            </span>
            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500">
              {tableSize(dataset.rows)}
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Save dataset'}
            className={`pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
              bookmarked
                ? 'border-rose-200 bg-rose-50 text-rose-500'
                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:text-gray-600'
            }`}
          >
            <Heart className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        <h2 className="mt-4 line-clamp-2 text-lg font-bold tracking-tight text-gray-900">
          {dataset.title}
        </h2>
        <p className="mt-1 text-xs font-medium text-gray-400">{dataset.owner}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-500">{dataset.summary}</p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-bold tracking-tight text-gray-900">{dataset.rowsLabel}</p>
            <p className="mt-0.5 text-xs text-gray-400">Rows · {dataset.shape}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6FED]">
            Study note
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {dataset.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}
