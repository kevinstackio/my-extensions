import { useRef, useState, type MouseEvent } from 'react';

import type { BookmarkFolder as BookmarkFolderData, OpenBookmark } from '../../types/bookmarks';
import { getExtensionAsset } from '../../utils/common.js';
import { BookmarkCard } from '../bookmark-card';

interface BookmarkFolderProps {
  folder: BookmarkFolderData;
  onOpenBookmark?: OpenBookmark;
}

/** 渲染以紧凑图标预览呈现的书签文件夹。 */
export function BookmarkFolder({ folder, onOpenBookmark }: BookmarkFolderProps) {
  const [isBlurred, setIsBlurred] = useState(folder.blur === true);
  const firstBookmarkRef = useRef<HTMLAnchorElement>(null);

  function reveal(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsBlurred(false);
    firstBookmarkRef.current?.focus();
  }

  return (
    <section
      className={isBlurred ? 'bookmark-folder bookmark-folder--blurred' : 'bookmark-folder'}
      aria-label={folder.name}
    >
      <div className="bookmark-folder__preview">
        {folder.items.map((bookmark, index) => (
          <BookmarkCard
            key={bookmark.id ?? `${folder.name}-${bookmark.name}`}
            bookmark={bookmark}
            linkRef={index === 0 ? firstBookmarkRef : undefined}
            onClick={(event) => {
              // 保留链接语义，但由扩展创建标签以便将其加入对应分组。
              event.preventDefault();
              onOpenBookmark?.(folder, bookmark);
            }}
          />
        ))}
        {Array.from({ length: Math.max(0, 4 - folder.items.length) }, (_, index) => (
          <span key={`placeholder-${index}`} className="bookmark-folder__placeholder" aria-hidden="true" />
        ))}
        {folder.blur === true ? (
          <button
            type="button"
            className={isBlurred
              ? 'bookmark-folder__blur'
              : 'bookmark-folder__blur bookmark-folder__blur--hidden'}
            aria-label={`点击显示 ${folder.name} 书签`}
            onClick={reveal}
          >
            <img src={getExtensionAsset('icons/brush-cleaning.svg')} alt="" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <span className="bookmark-folder__name">{folder.name}</span>
    </section>
  );
}
