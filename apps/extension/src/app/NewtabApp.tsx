import { BOOKMARK_GRID, DOCK_COMPONENTS, DOCK_DEVTOOLS, DOCK_FAVORITES } from '../modules/newtab/constants/bookmarks';
import { BookmarkDock } from '../modules/newtab/views/bookmarks/bookmark-dock';
import { BookmarkGrid } from '../modules/newtab/views/bookmarks/bookmark-grid';
import { TooltipProvider } from '../shared/ui/tooltip';
import { openBookmarkInGroup } from '../modules/newtab/utils/tab.js';
import type { Bookmark, BookmarkCollection } from '../modules/newtab/types/bookmarks';

/** 页面级组合入口：业务数据由 constants 提供，交互由下层视图组件负责。 */
export function App() {
  const onOpenBookmark = (folder: BookmarkCollection, bookmark: Bookmark) => {
    void openBookmarkInGroup(window.chrome, folder, bookmark);
  };

  return (
    <TooltipProvider>
      <main className="bookmarks-page min-h-screen box-border p-6">
        <section className="bookmarks flex flex-wrap items-start gap-6" data-bookmarks aria-label="常用书签">
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
    </TooltipProvider>
  );
}
