import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  ChevronDown,
  Heart,
  LineChart,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CuratedDataset, StudyLens } from '../../types/curator'
import { STUDY_LENSES } from '../../types/curator'
import type { StudyTone } from '../../types/curator'
import { getKaggleDatasetUrl } from '../../utils/format'

const lensIcons = {
  models: Sparkles,
  statistics: LineChart,
  interviews: MessageSquare,
  research: BookOpen,
  applications: Briefcase,
} as const

const toneClass: Record<StudyTone, string> = {
  good: 'bg-emerald-50 text-emerald-700',
  warn: 'bg-red-50 text-red-600',
  idle: 'bg-gray-100 text-gray-500',
}

const dotClass: Record<StudyTone, string> = {
  good: 'bg-emerald-500',
  warn: 'bg-red-500',
  idle: 'bg-gray-400',
}

interface DatasetBriefProps {
  dataset: CuratedDataset
  bookmarked: boolean
  onToggleBookmark: () => void
  onPrevious: () => void
  onNext: () => void
  hasPrevious: boolean
  hasNext: boolean
  onBackToList: () => void
  hidden?: boolean
}

function initials(owner: string): string {
  const words = owner.split(/\s+/).filter((word) => /[A-Za-z]/.test(word))
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase()
  const letters = owner.replace(/[^A-Za-z]/g, '')
  return letters.slice(0, 2).toUpperCase() || 'DS'
}

function StatusPill({ tone, label }: { tone: StudyTone; label: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${toneClass[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass[tone]}`} />
      {label}
    </span>
  )
}

export function DatasetBrief({
  dataset,
  bookmarked,
  onToggleBookmark,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onBackToList,
  hidden = false,
}: DatasetBriefProps) {
  const [open, setOpen] = useState<StudyLens[]>(['models', 'interviews'])

  useEffect(() => {
    setOpen(['models', 'interviews'])
  }, [dataset.ref])

  const toggle = (lens: StudyLens) => {
    setOpen((current) =>
      current.includes(lens) ? current.filter((item) => item !== lens) : [...current, lens],
    )
  }

  return (
    <section className={hidden ? 'hidden lg:block' : 'block'}>
      <motion.div
        key={dataset.ref}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="p-4 sm:p-7"
      >
        <button
          type="button"
          onClick={onBackToList}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          All datasets
        </button>

        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
              {initials(dataset.owner)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{dataset.owner}</p>
              <p className="text-xs text-gray-400">Public table · {dataset.topic}</p>
            </div>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={onToggleBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Save dataset'}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition ${
              bookmarked
                ? 'border-rose-200 bg-rose-50 text-rose-500'
                : 'border-gray-200 bg-white text-gray-400 hover:text-gray-600'
            }`}
          >
            <Heart className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />
          </motion.button>
        </header>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
          <h2 className="max-w-xl text-2xl font-bold tracking-tight text-gray-900">
            {dataset.title}
          </h2>
          <StatusPill tone="good" label="Well processed" />
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">{dataset.summary}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {dataset.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-medium text-[#4C51BF]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="my-5 border-t border-dashed border-gray-200" />

        <p className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {dataset.rowsLabel}
        </p>
        <p className="mt-1.5 text-sm text-gray-400">
          Rows on file · {dataset.shape}
        </p>

        <div className="mt-6">
          <p className="text-right text-xs font-semibold text-rose-500">{dataset.split.marker}</p>
          <div className="mt-1.5 flex h-10 overflow-hidden rounded-full bg-gray-100">
            <div
              className="flex min-w-0 items-center px-3 text-xs font-semibold text-white"
              style={{
                width: `${dataset.split.trainShare}%`,
                backgroundImage:
                  'repeating-linear-gradient(-55deg, #34d399, #34d399 8px, #16a34a 8px, #16a34a 16px)',
              }}
            >
              <span className="truncate">{dataset.split.trainLabel}</span>
            </div>
            <div className="w-[3px] shrink-0 bg-rose-500" />
            <div className="flex min-w-0 flex-1 items-center justify-end px-3 text-xs font-medium text-gray-500">
              <span className="truncate">{dataset.split.holdoutLabel}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-gray-400">
            <span>Train</span>
            <span className="truncate font-medium text-sky-600">{dataset.split.caption}</span>
            <span>Check</span>
          </div>
        </div>

        <a
          href={getKaggleDatasetUrl(dataset.ref)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#4C8DFF] to-[#2F6FED] py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(47,111,237,0.28)] transition hover:brightness-105"
        >
          <Zap className="h-4 w-4" fill="currentColor" />
          Open dataset
        </a>

        <div className="mt-8">
          <h3 className="text-base font-semibold tracking-tight text-gray-900">How to study this</h3>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-500">
            Models to fit, statistics worth reporting, and how the same work shows up in
            interviews, papers, and practice.
          </p>

          <div className="mt-4 divide-y divide-gray-100">
            {STUDY_LENSES.map((lens) => {
              const section = dataset.sections[lens.id]
              const Icon = lensIcons[lens.id]
              const expanded = open.includes(lens.id)
              return (
                <div key={lens.id} className="py-1">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => toggle(lens.id)}
                    className="flex w-full items-start gap-3 rounded-xl py-3 text-left"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-gray-900">{lens.title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-gray-400">
                        {lens.blurb}
                      </span>
                      <span className="mt-2 inline-flex">
                        <StatusPill tone={section.tone} label={section.toneLabel} />
                      </span>
                    </span>
                    <ChevronDown
                      className={`mt-0.5 h-4 w-4 shrink-0 text-gray-300 transition ${expanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expanded && (
                    <div className="mb-3 ml-7 space-y-3">
                      {section.points.map((point) => (
                        <div key={point.title}>
                          <p className="text-sm font-medium text-gray-900">{point.title}</p>
                          <p className="mt-0.5 text-sm leading-relaxed text-gray-500">{point.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2F6FED] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next dataset
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </section>
  )
}
