import type { CuratedDataset } from '../../types/curator'
import { tableSize } from '../../data/curatedDatasets'

function SignalBars({ filled }: { filled: number }) {
  return (
    <div className="flex gap-[3px]" aria-hidden>
      {Array.from({ length: 8 }, (_, index) => (
        <span
          key={index}
          className={`h-5 w-1.5 rounded-[2px] ${index < filled ? 'bg-[#3B82F6]' : 'bg-white/10'}`}
        />
      ))}
    </div>
  )
}

export function StatsRail({ dataset }: { dataset: CuratedDataset }) {
  const rows = [
    ['Interviews', dataset.signal.interview],
    ['Research', dataset.signal.research],
    ['Applied', dataset.signal.applied],
  ] as const

  return (
    <aside className="rounded-[28px] bg-[#1C1C1E] p-5 text-white shadow-card">
      <p className="text-lg font-semibold tracking-tight">Stats</p>
      <p className="mt-5 text-sm text-gray-400">Rows</p>
      <p className="mt-1 text-4xl font-bold tracking-tight">{dataset.rowsLabel}</p>
      <p className="mt-1 text-sm font-medium leading-snug text-emerald-400">{dataset.fileNote}</p>

      <div className="mt-5 rounded-2xl bg-white/10 px-4 py-3.5">
        <p className="text-2xl font-semibold tracking-tight">{dataset.shape}</p>
        <p className="mt-0.5 text-xs text-gray-400">{dataset.topic}</p>
      </div>

      <div className="mt-3 rounded-2xl bg-white px-4 py-3.5 text-gray-900">
        <p className="text-lg font-semibold tracking-tight">{tableSize(dataset.rows)}</p>
        <p className="mt-0.5 text-xs text-gray-500">for a simple model</p>
      </div>

      <p className="mt-6 text-sm font-medium">Signal</p>
      <div className="mt-3 space-y-3">
        {rows.map(([label, filled]) => (
          <div key={label}>
            <p className="mb-1.5 text-[11px] text-gray-400">{label}</p>
            <SignalBars filled={filled} />
          </div>
        ))}
      </div>
    </aside>
  )
}
