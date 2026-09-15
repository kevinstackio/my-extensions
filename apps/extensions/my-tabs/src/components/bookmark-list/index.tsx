import type { Bookmark } from '../../types/bookmarks';
import { getExtensionAsset } from '../../utils/common.js';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onSelect?: (bookmark: Bookmark) => void;
}

/** 将书签配置渲染为可复用的工具链接列表。 */
export function BookmarkList({ bookmarks, onSelect }: BookmarkListProps) {
  return (
    <ul className="bookmark-list">
      {bookmarks.map((bookmark) => (
        <li key={bookmark.id ?? bookmark.name}>
          <a
            className="bookmark-list__item"
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onSelect ? (event) => {
              // 组件仅上报所选书签，标签页、分组等业务动作始终交给调用方。
              event.preventDefault();
              onSelect(bookmark);
            } : undefined}
          >
            <img src={getExtensionAsset(bookmark.icon)} alt="" aria-hidden="true" />
            <span>{bookmark.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
