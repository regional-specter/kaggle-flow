import { Search } from 'lucide-react'
import { useEffect } from 'react'
import type { CuratedDataset, StudyTopic } from '../../types/curator'
import { STUDY_TOPICS } from '../../types/curator'

interface DatasetNavigatorProps {
  datasets: CuratedDataset[]
  total: number
  selectedRef: string | null
  topic: StudyTopic | 'All'
  search: string
  onTopic: (topic: StudyTopic | 'All') => void
  onSearch: (value: string) => void
  onSelect: (ref: string) => void
  hidden?: boolean
}

const filters: Array<StudyTopic | 'All'> = ['All', ...STUDY_TOPICS]

export function DatasetNavigator({
  datasets,
  total,
  selectedRef,
  topic,
  search,
  onTopic,
  onSearch,
  onSelect,
  hidden = false,
}: DatasetNavigatorProps) {
  useEffect(() => {
    if (!selectedRef) return
        document.getElementById(`study-item-${selectedRef}`)?.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        })
  }, [selectedRef])

  return (
    <aside
      className={`min-w-0 border-gray-100 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7.5rem)] lg:self-start lg:overflow-x-hidden lg:overflow-y-auto lg:overscroll-y-contain lg:border-r ${
        hidden ? 'hidden lg:block' : 'block'
      }`}
    >
      <div className="sticky top-0 z-10 space-y-3 border-b border-gray-100 bg-white/95 p-3 backdrop-blur-sm lg:static">
        <div className="flex items-baseline justify-between px-1">
          <p className="text-sm font-semibold text-gray-900">Datasets</p>
          <p className="text-xs text-gray-400">
            {datasets.length === total ? total : `${datasets.length} of ${total}`}
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search the list"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-900/5"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((item) => {
            const active = item === topic
            return (
              <button
                key={item}
                type="button"
                onClick={() => onTopic(item)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:text-gray-700'
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>
      </div>

      {datasets.length === 0 ? (
        <p className="px-4 py-8 text-sm text-gray-500">Nothing in the list matches that filter.</p>
      ) : (
        <ul className="space-y-0.5 p-2" role="listbox" aria-label="Curated datasets">
          {datasets.map((dataset, index) => {
            const active = dataset.ref === selectedRef
            return (
              <li key={dataset.ref}>
                <button
                  id={`study-item-${dataset.ref}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onSelect(dataset.ref)}
                  className={`flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-xl px-2.5 py-2.5 text-left transition ${
                    active ? 'bg-gray-50' : 'hover:bg-gray-50/70'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      active ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-sm font-medium ${
                        active ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {dataset.title}
                    </span>
                    <span className="block truncate text-xs text-gray-400">{dataset.topic}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
