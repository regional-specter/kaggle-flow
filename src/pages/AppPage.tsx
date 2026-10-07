import { AnimatePresence } from 'framer-motion'
import { AppLayout } from '../components/layout/AppLayout'
import { NavBar } from '../components/layout/NavBar'
import { PageTransition } from '../components/ui/PageTransition'
import { useAppTab } from '../hooks/useAppTab'
import { useBookmarks } from '../hooks/useBookmarks'
import { useCredentials } from '../hooks/useCredentials'
import { useGeminiKey } from '../hooks/useGeminiKey'
import { BookmarkedView } from '../views/BookmarkedView'
import { DiscoverFeed } from '../views/DiscoverFeed'
import { SettingsView } from '../views/SettingsView'
import { StudyView } from '../views/StudyView'

export function AppPage() {
  const [activeTab, setActiveTab] = useAppTab()
  const { credentials, saveCredentials, clearCredentials, hasCredentials } =
    useCredentials()
  const { geminiKey, hasGeminiKey, saveGeminiKey, clearGeminiKey } = useGeminiKey()
  const { bookmarks, bookmarkedDatasets, isBookmarked, toggleBookmark } =
    useBookmarks()

  return (
    <AppLayout
      navbar={
        <NavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          bookmarkCount={bookmarks.length}
        />
      }
    >
      <AnimatePresence mode="wait">
        {activeTab === 'discover' && (
          <PageTransition tabKey="discover">
            <DiscoverFeed
              credentials={credentials}
              hasCredentials={hasCredentials}
              isBookmarked={isBookmarked}
              onToggleBookmark={toggleBookmark}
              onGoToSettings={() => setActiveTab('settings')}
            />
          </PageTransition>
        )}

        {activeTab === 'study' && (
          <PageTransition tabKey="study">
            <StudyView
              geminiKey={geminiKey}
              hasGeminiKey={hasGeminiKey}
              onGoToSettings={() => setActiveTab('settings')}
              isBookmarked={isBookmarked}
              onToggleBookmark={toggleBookmark}
            />
          </PageTransition>
        )}

        {activeTab === 'bookmarked' && (
          <PageTransition tabKey="bookmarked">
            <BookmarkedView
              datasets={bookmarkedDatasets}
              isBookmarked={isBookmarked}
              onToggleBookmark={toggleBookmark}
              onGoToDiscover={() => setActiveTab('discover')}
            />
          </PageTransition>
        )}

        {activeTab === 'settings' && (
          <PageTransition tabKey="settings">
            <SettingsView
              credentials={credentials}
              hasCredentials={hasCredentials}
              onSave={saveCredentials}
              onClear={clearCredentials}
              geminiKey={geminiKey}
              hasGeminiKey={hasGeminiKey}
              onSaveGemini={saveGeminiKey}
              onClearGemini={clearGeminiKey}
            />
          </PageTransition>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
