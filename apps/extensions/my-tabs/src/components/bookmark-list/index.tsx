import { BookmarkIcon } from '../bookmark-icon';
import type { Bookmark } from '../../types/bookmarks';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onSelect?: (bookmark: Bookmark) => void;
}

/** 将书签配置渲染为可复用的工具链接列表。 */
export function BookmarkList({ bookmarks, onSelect }: BookmarkListProps) {
  return (
    <ul className="bookmark-list m-0 grid list-none gap-1 p-0">
      {bookmarks.map((bookmark) => (
        <li key={bookmark.id ?? bookmark.name}>
          <a
            className="bookmark-list__item flex min-h-9 items-center gap-2 whitespace-nowrap rounded-md px-2 text-foreground no-underline transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onSelect ? (event) => {
              // 组件仅上报所选书签，标签页、分组等业务动作始终交给调用方。
              event.preventDefault();
              onSelect(bookmark);
            } : undefined}
          >
            <BookmarkIcon
              icon={bookmark.icon}
              name={bookmark.name}
              tone={bookmark.iconTone}
              size="sm"
              className="shrink-0"
            />
            <span className="whitespace-nowrap text-sm font-medium leading-5">{bookmark.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
