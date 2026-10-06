import { motion } from 'framer-motion'
import { Bookmark, Compass, Database, Settings, Sparkles } from 'lucide-react'
import type { AppTab } from '../../types/kaggle'
import { springTransition } from '../../utils/motion'

const tabs: { id: AppTab; label: string; shortLabel: string; icon: typeof Compass }[] = [
  { id: 'discover', label: 'Discover Feed', shortLabel: 'Discover', icon: Compass },
  { id: 'study', label: 'Study', shortLabel: 'Study', icon: Sparkles },
  { id: 'bookmarked', label: 'Bookmarked', shortLabel: 'Saved', icon: Bookmark },
  { id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
]

interface NavBarProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  bookmarkCount: number
}

function TabButton({
  id,
  label,
  shortLabel,
  icon: Icon,
  active,
  bookmarkCount,
  onClick,
  layoutId = 'nav-pill',
}: {
  id: AppTab
  label: string
  shortLabel: string
  icon: typeof Compass
  active: boolean
  bookmarkCount: number
  onClick: () => void
  layoutId?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-xs font-medium transition-colors sm:flex-none sm:flex-row sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
        active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-gray-100"
          transition={springTransition}
        />
      )}
      <span className="relative flex items-center gap-1.5">
        <Icon className="h-4 w-4" />
        <span className="hidden md:inline">{label}</span>
        <span className="md:hidden">{shortLabel}</span>
        {id === 'bookmarked' && bookmarkCount > 0 && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {bookmarkCount}
          </span>
        )}
      </span>
    </button>
  )
}

export function NavBar({ activeTab, onTabChange, bookmarkCount }: NavBarProps) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-[#F8F9FA]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <motion.div
            className="flex min-w-0 items-center gap-2.5 sm:gap-3"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Database className="h-6 w-6 shrink-0 text-[#00D06F] sm:h-7 sm:w-7" strokeWidth={2.5} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-gray-900">
                KaggleFlow
              </p>
              <p className="hidden text-xs text-gray-500 sm:block">
                Dataset exploration
              </p>
            </div>
          </motion.div>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 rounded-2xl border border-gray-100 bg-white/80 p-1 shadow-card sm:flex"
          >
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                {...tab}
                active={activeTab === tab.id}
                bookmarkCount={bookmarkCount}
                onClick={() => onTabChange(tab.id)}
              />
            ))}
          </nav>
        </div>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/95 px-3 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:hidden"
      >
        <div className="mx-auto flex max-w-lg items-center gap-1">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              {...tab}
              active={activeTab === tab.id}
              bookmarkCount={bookmarkCount}
              onClick={() => onTabChange(tab.id)}
              layoutId="mobile-nav-pill"
            />
          ))}
        </div>
      </nav>
    </>
  )
}
