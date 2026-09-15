import type { Bookmark, BookmarkGroup, OpenBookmark } from '../../types/bookmarks';
import { BookmarkCard } from '../../components/bookmark-card';
import { BookmarkList } from '../../components/bookmark-list';
import { Popover } from '../../components/popover';
import { getExtensionAsset } from '../../utils/common.js';

interface BookmarkToolGroupProps {
  group: BookmarkGroup;
  onOpenBookmark?: OpenBookmark;
}

/** React Dock 内的工具分组入口。 */
function BookmarkToolGroup({ group, onOpenBookmark }: BookmarkToolGroupProps) {
  const trigger = (
    <button
      type="button"
      className="bookmark-card bookmark-dock__tool"
      aria-label={`打开 ${group.name} 工具列表`}
    >
      <span className="bookmark-card__icon">
        <img src={getExtensionAsset(group.icon)} alt="" aria-hidden="true" />
      </span>
    </button>
  );

  return (
    <div className="bookmark-dock__group">
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
    <nav className="bookmark-dock" aria-label="固定书签">
      <div className="bookmark-dock__favorites">
        {favorites.map((bookmark) => <BookmarkCard key={bookmark.id} bookmark={bookmark} />)}
      </div>
      <span className="bookmark-dock__divider" aria-hidden="true" />
      <div className="bookmark-dock__tools">
        {groups.map((group) => (
          <BookmarkToolGroup key={group.id} group={group} onOpenBookmark={onOpenBookmark} />
        ))}
      </div>
    </nav>
  );
}
