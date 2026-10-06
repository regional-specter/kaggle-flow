import { useCallback, useEffect, useState } from 'react'
import type { AppTab } from '../types/kaggle'

const VALID_TABS: AppTab[] = ['discover', 'study', 'bookmarked', 'settings']

function parseTabFromUrl(): AppTab {
  const tab = new URLSearchParams(window.location.search).get('tab')
  if (tab && VALID_TABS.includes(tab as AppTab)) {
    return tab as AppTab
  }
  return 'discover'
}

function buildUrl(tab: AppTab): string {
  const params = new URLSearchParams(window.location.search)
  if (tab === 'discover') {
    params.delete('tab')
  } else {
    params.set('tab', tab)
  }
  const search = params.toString()
  return `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
}

export function useAppTab(): [AppTab, (tab: AppTab) => void] {
  const [activeTab, setActiveTabState] = useState<AppTab>(parseTabFromUrl)

  const setActiveTab = useCallback((tab: AppTab) => {
    setActiveTabState(tab)
    window.history.pushState({ tab }, '', buildUrl(tab))
  }, [])

  useEffect(() => {
    const onPopState = () => setActiveTabState(parseTabFromUrl())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return [activeTab, setActiveTab]
}
