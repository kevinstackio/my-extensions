import { DockIconView } from '../../components/dock-icon';
import { Separator } from '../../components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import type { Bookmark, BookmarkGroup, OpenBookmark } from '../../types/bookmarks';
import { BookmarkCard } from '../../components/bookmark-card';
import { BookmarkList } from '../../components/bookmark-list';
import { Popover } from '../../components/popover';

interface BookmarkToolGroupProps {
  group: BookmarkGroup;
  onOpenBookmark?: OpenBookmark;
}

/** React Dock 内的工具分组入口。 */
function BookmarkToolGroup({ group, onOpenBookmark }: BookmarkToolGroupProps) {
  // 工具入口固定使用 border-border；悬停只改变背景，避免与普通书签卡片产生不同的边框反馈。
  const trigger = (
    <button
      type="button"
      className="bookmark-card group bookmark-card--dock bookmark-dock__tool box-border h-16 w-16 flex-none rounded-[var(--radius)] border border-transparent p-0 text-foreground transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 aria-expanded:bg-accent"
      data-variant="dock"
      aria-label={`打开 ${group.name} 工具列表`}
    >
      <span className="bookmark-card__icon grid h-16 w-16 place-items-center rounded-[var(--radius)] border border-border bg-transparent transition-colors duration-[var(--duration-fast)] group-hover:bg-accent group-focus-visible:bg-accent group-aria-expanded:bg-accent">
        <DockIconView
          icon={group.icon}
          name={group.name}
        />
      </span>
    </button>
  );

  return (
    <div className="bookmark-dock__group relative flex">
      <Popover trigger={trigger}>
        <BookmarkList
          bookmarks={group.bookmarks}
          onSelect={(bookmark) => onOpenBookmark?.(group, bookmark)}
        />
      </Popover>
    </div>
  );
}

interface BookmarkDockProps {
  favorites: Bookmark[];
  components: BookmarkGroup;
  devtools?: BookmarkGroup;
  onOpenBookmark?: OpenBookmark;
}

/** React Dock，保持原有收藏区、分隔线和工具区结构。 */
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
            <TooltipContent side="top">{bookmark.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      <Separator orientation="vertical" className="mx-2 h-16" aria-hidden="true" />
      <div className="bookmark-dock__tools flex flex-nowrap gap-2">
        {groups.map((group) => (
          <BookmarkToolGroup key={group.id} group={group} onOpenBookmark={onOpenBookmark} />
        ))}
      </div>
    </nav>
  );
}
