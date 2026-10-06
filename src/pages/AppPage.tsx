import { AnimatePresence } from 'framer-motion'
import { AppLayout } from '../components/layout/AppLayout'
import { NavBar } from '../components/layout/NavBar'
import { PageTransition } from '../components/ui/PageTransition'
import { useAppTab } from '../hooks/useAppTab'
import { useBookmarks } from '../hooks/useBookmarks'
import { useCredentials } from '../hooks/useCredentials'
import { BookmarkedView } from '../views/BookmarkedView'
import { DiscoverFeed } from '../views/DiscoverFeed'
import { SettingsView } from '../views/SettingsView'
import { StudyView } from '../views/StudyView'

export function AppPage() {
  const [activeTab, setActiveTab] = useAppTab()
  const { credentials, saveCredentials, clearCredentials, hasCredentials } =
    useCredentials()
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
            />
          </PageTransition>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
