import type { BookmarkGridItem, OpenBookmark } from '../../types/bookmarks';
import { BookmarkCard } from '../../components/bookmark-card';
import { BookmarkFolder } from '../../components/bookmark-folder';

interface BookmarkGridProps {
  bookmarks: BookmarkGridItem[];
  onOpenBookmark?: OpenBookmark;
}

/** React 书签 Grid，只负责按配置顺序组合卡片和文件夹。 */
export function BookmarkGrid({ bookmarks, onOpenBookmark }: BookmarkGridProps) {
  return (
    <>
      {bookmarks.map((item) => item.type === 'folder' ? (
        <BookmarkFolder key={item.id} folder={item} onOpenBookmark={onOpenBookmark} />
      ) : (
        <BookmarkCard key={item.id} bookmark={item} />
      ))}
    </>
  );
}
