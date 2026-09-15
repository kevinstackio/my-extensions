import { useEffect } from 'react';

import { BOOKMARK_GRID, DOCK_COMPONENTS, DOCK_DEVTOOLS, DOCK_FAVORITES } from '../../constants/bookmarks';
import { BookmarkDock } from '../../views/bookmarks/bookmark-dock';
import { BookmarkGrid } from '../../views/bookmarks/bookmark-grid';
import { openBookmarkInGroup } from '../../utils/tab.js';
import { installActionIconTheme } from '../../utils/action-icon-theme.js';
import type { Bookmark, BookmarkCollection } from '../../types/bookmarks';

export function App() {
  useEffect(() => {
    installActionIconTheme(window, document);
  }, []);

  const onOpenBookmark = (folder: BookmarkCollection, bookmark: Bookmark) => {
    void openBookmarkInGroup(window.chrome, folder, bookmark);
  };

  return (
    <>
      <main className="bookmarks-page">
        <section className="bookmarks" data-bookmarks aria-label="常用书签">
          <BookmarkGrid bookmarks={BOOKMARK_GRID} onOpenBookmark={onOpenBookmark} />
        </section>
      </main>
      <aside data-bookmark-dock aria-label="固定书签">
        <BookmarkDock
          favorites={DOCK_FAVORITES}
          components={DOCK_COMPONENTS}
          devtools={DOCK_DEVTOOLS}
          onOpenBookmark={onOpenBookmark}
        />
      </aside>
    </>
  );
}
