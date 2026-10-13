import { motion } from 'framer-motion'
import { Search, Shuffle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DatasetBrief } from '../components/curator/DatasetBrief'
import { StatsRail } from '../components/curator/StatsRail'
import { StudyCard } from '../components/curator/StudyCard'
import { StudyPeek } from '../components/curator/StudyPeek'
import { curatedDatasets, toKaggleDataset } from '../data/curatedDatasets'
import { useStudyDraft } from '../hooks/useStudyDraft'
import type { KaggleDataset } from '../types/kaggle'
import type { StudyTopic } from '../types/curator'
import { STUDY_TOPICS } from '../types/curator'
import { remixStudy, studyMix } from '../utils/mixDatasets'
import { staggerContainer } from '../utils/motion'

interface StudyViewProps {
  geminiKey: string
  hasGeminiKey: boolean
  onGoToSettings: () => void
  isBookmarked: (ref: string) => boolean
  onToggleBookmark: (ref: string, dataset: KaggleDataset) => void
}

const filters: Array<StudyTopic | 'All'> = ['All', ...STUDY_TOPICS]
const PEEK_TITLE_ID = 'study-peek-title'

export function StudyView({
  geminiKey,
  hasGeminiKey,
  onGoToSettings,
  isBookmarked,
  onToggleBookmark,
}: StudyViewProps) {
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState<StudyTopic | 'All'>('All')
  const [order, setOrder] = useState(() => studyMix(curatedDatasets))
  const [mixId, setMixId] = useState(0)
  const [openRef, setOpenRef] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const source = query ? curatedDatasets : order
    return source.filter((dataset) => {
      if (topic !== 'All' && dataset.topic !== topic) return false
      if (!query) return true
      const haystack = [dataset.title, dataset.owner, dataset.topic, dataset.summary, dataset.fileNote, ...dataset.tags]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [order, search, topic])

  const opened = openRef ? (curatedDatasets.find((dataset) => dataset.ref === openRef) ?? null) : null
  const index = opened ? filtered.findIndex((dataset) => dataset.ref === opened.ref) : -1
  const draft = useStudyDraft(opened, geminiKey)

  const shuffle = () => {
    setOrder(remixStudy(curatedDatasets))
    setMixId((id) => id + 1)
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Study picks</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">
            {order.length} public tables with unusual subjects: language practice, race cars, launches,
            chess, sport, and other work that is out of the ordinary. Refresh the page, or shuffle, for
            a new draw. Each table has a plan for models, checks, interview questions, research, and a
            real-world use.
          </p>
        </div>
        <button
          type="button"
          onClick={shuffle}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-card transition hover:bg-gray-50"
        >
          <Shuffle className="h-4 w-4" />
          Shuffle
        </button>
      </div>

      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the list"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 shadow-card outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-gray-900/5"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((item) => {
            const active = item === topic
            return (
              <button
                key={item}
                type="button"
                onClick={() => setTopic(item)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  active ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 shadow-card hover:text-gray-700'
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-sm text-gray-500 shadow-card">
          <p>No dataset matches that search.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setTopic('All')
            }}
            className="mt-3 text-sm font-medium text-gray-900 underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <motion.div
          key={mixId}
          className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((dataset) => (
            <StudyCard
              key={dataset.ref}
              dataset={dataset}
              bookmarked={isBookmarked(dataset.ref)}
              onOpen={() => setOpenRef(dataset.ref)}
              onToggleBookmark={() => onToggleBookmark(dataset.ref, toKaggleDataset(dataset))}
            />
          ))}
        </motion.div>
      )}

      <StudyPeek
        open={opened != null}
        titleId={PEEK_TITLE_ID}
        hasPrevious={index > 0}
        hasNext={index >= 0 && index < filtered.length - 1}
        onPrevious={() => {
          const previous = filtered[index - 1]
          if (previous) setOpenRef(previous.ref)
        }}
        onNext={() => {
          const next = filtered[index + 1]
          if (next) setOpenRef(next.ref)
        }}
        onClose={() => setOpenRef(null)}
      >
        {opened && (
          <div className="grid items-start lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="min-w-0">
              <DatasetBrief
                dataset={opened}
                titleId={PEEK_TITLE_ID}
                bookmarked={isBookmarked(opened.ref)}
                onToggleBookmark={() => onToggleBookmark(opened.ref, toKaggleDataset(opened))}
                draftPoints={draft.points}
                draftStatus={draft.status}
                draftError={draft.error}
                hasGeminiKey={hasGeminiKey}
                onRewrite={draft.rewrite}
                onGoToSettings={onGoToSettings}
              />
            </div>
            <div className="px-4 pb-5 lg:sticky lg:top-0 lg:self-start lg:px-5 lg:py-5">
              <StatsRail dataset={opened} />
            </div>
          </div>
        )}
      </StudyPeek>
    </div>
  )
}
