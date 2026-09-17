import { BookmarkCard } from '../../components/bookmark-card';
import { Separator } from '../../components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import type { Bookmark, BookmarkGroup, OpenBookmark } from '../../types/bookmarks';
import { DockToolMenu } from './dock-tool-menu';

interface BookmarkDockProps {
  favorites: Bookmark[];
  components: BookmarkGroup;
  devtools?: BookmarkGroup;
  onOpenBookmark?: OpenBookmark;
}

/** React Dock，保持直接收藏、分隔线与工具菜单的固定分区结构。 */
export function BookmarkDock({ favorites, components, devtools, onOpenBookmark }: BookmarkDockProps) {
  const groups = devtools ? [components, devtools] : [components];

  return (
    <nav className="bookmark-dock fixed bottom-6 left-1/2 z-[1] flex w-max -translate-x-1/2 items-center rounded-[var(--radius)] border border-border bg-surface-raised p-2 shadow-[var(--shadow-hover)]" aria-label="固定书签">
      <div className="bookmark-dock__favorites flex flex-nowrap gap-2">
        {favorites.map((bookmark) => (
          <Tooltip key={bookmark.id}>
            <BookmarkCard
              bookmark={bookmark}
              variant="dock"
              renderAnchor={(anchor) => <TooltipTrigger asChild>{anchor}</TooltipTrigger>}
            />
            <TooltipContent side="top" align="center">{bookmark.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      <Separator orientation="vertical" className="mx-2 h-16" aria-hidden="true" />
      <div className="bookmark-dock__tools flex flex-nowrap gap-2">
        {groups.map((group) => (
          <div key={group.id} className="bookmark-dock__group relative flex">
            <DockToolMenu group={group} onOpenBookmark={onOpenBookmark} />
          </div>
        ))}
      </div>
    </nav>
  );
}
