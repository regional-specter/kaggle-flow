import { useMemo, useState } from 'react'
import { DatasetBrief } from '../components/curator/DatasetBrief'
import { DatasetNavigator } from '../components/curator/DatasetNavigator'
import { StatsRail } from '../components/curator/StatsRail'
import { curatedDatasets, toKaggleDataset } from '../data/curatedDatasets'
import { useStudyDraft } from '../hooks/useStudyDraft'
import type { KaggleDataset } from '../types/kaggle'
import type { StudyTopic } from '../types/curator'

interface StudyViewProps {
  geminiKey: string
  hasGeminiKey: boolean
  onGoToSettings: () => void
  isBookmarked: (ref: string) => boolean
  onToggleBookmark: (ref: string, dataset: KaggleDataset) => void
}

export function StudyView({
  geminiKey,
  hasGeminiKey,
  onGoToSettings,
  isBookmarked,
  onToggleBookmark,
}: StudyViewProps) {
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState<StudyTopic | 'All'>('All')
  const [selectedRef, setSelectedRef] = useState(curatedDatasets[0]?.ref ?? '')
  const [mobileDetail, setMobileDetail] = useState(false)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return curatedDatasets.filter((dataset) => {
      if (topic !== 'All' && dataset.topic !== topic) return false
      if (!query) return true
      const haystack = [dataset.title, dataset.owner, dataset.topic, dataset.summary, dataset.fileNote, ...dataset.tags]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [search, topic])

  const selected = filtered.find((dataset) => dataset.ref === selectedRef) ?? filtered[0] ?? null
  const index = selected ? filtered.findIndex((dataset) => dataset.ref === selected.ref) : -1
  const draft = useStudyDraft(selected, geminiKey)

  const select = (ref: string) => {
    setSelectedRef(ref)
    setMobileDetail(true)
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Study list</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">
          {curatedDatasets.length} public tables for ordinary machine learning and statistics.
          Each one is already in good shape, with a plan for models, checks, interview questions,
          research angles, and a real-world use.
        </p>
      </div>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0 overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-card">
          <div className="grid min-w-0 items-start lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
            <DatasetNavigator
              datasets={filtered}
              total={curatedDatasets.length}
              selectedRef={selected?.ref ?? null}
              topic={topic}
              search={search}
              onTopic={setTopic}
              onSearch={setSearch}
              onSelect={select}
              hidden={mobileDetail}
            />
            {selected ? (
              <DatasetBrief
                dataset={selected}
                bookmarked={isBookmarked(selected.ref)}
                onToggleBookmark={() => onToggleBookmark(selected.ref, toKaggleDataset(selected))}
                onPrevious={() => {
                  const previous = filtered[index - 1]
                  if (previous) setSelectedRef(previous.ref)
                }}
                onNext={() => {
                  const next = filtered[index + 1]
                  if (next) setSelectedRef(next.ref)
                }}
                hasPrevious={index > 0}
                hasNext={index >= 0 && index < filtered.length - 1}
                onBackToList={() => setMobileDetail(false)}
                hidden={!mobileDetail}
                draftPoints={draft.points}
                draftStatus={draft.status}
                draftError={draft.error}
                hasGeminiKey={hasGeminiKey}
                onRewrite={draft.rewrite}
                onGoToSettings={onGoToSettings}
              />
            ) : (
              <div className={`px-6 py-16 text-sm text-gray-500 ${mobileDetail ? 'block' : 'hidden lg:block'}`}>
                <p>No dataset matches that search.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setTopic('All')
                    setMobileDetail(false)
                  }}
                  className="mt-3 text-sm font-medium text-gray-900 underline-offset-2 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {selected && (
          <div className={`${mobileDetail ? 'block' : 'hidden'} lg:block xl:sticky xl:top-24 xl:self-start`}>
            <StatsRail dataset={selected} />
          </div>
        )}
      </div>
    </div>
  )
}
