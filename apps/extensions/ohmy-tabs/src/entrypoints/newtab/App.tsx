import { useEffect } from 'react';

import { BOOKMARK_GRID, DOCK_COMPONENTS, DOCK_DEVTOOLS, DOCK_FAVORITES } from '../../constants/bookmarks';
import { BookmarkDock } from '../../views/bookmarks/bookmark-dock';
import { BookmarkGrid } from '../../views/bookmarks/bookmark-grid';
import { TooltipProvider } from '../../components/ui/tooltip';
import { openBookmarkInGroup } from '../../utils/tab.js';
import { installActionIconTheme } from '../../utils/action-icon-theme.js';
import type { Bookmark, BookmarkCollection } from '../../types/bookmarks';

/** 页面级组合入口：业务数据由 constants 提供，交互由下层视图组件负责。 */
export function App() {
  useEffect(() => {
    // 浏览器工具栏图标和新标签页 favicon 共用系统明暗偏好，只需在根组件挂载时注册一次。
    installActionIconTheme(window, document);
  }, []);

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
