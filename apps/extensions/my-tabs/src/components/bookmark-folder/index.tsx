import { useRef, useState, type MouseEvent } from 'react';

import type { BookmarkFolder as BookmarkFolderData, OpenBookmark } from '../../types/bookmarks';
import { cn } from '../../lib/utils';
import { BookmarkCard } from '../bookmark-card';
import { BookmarkIcon } from '../bookmark-icon';

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
      className={cn(
        'bookmark-folder grid justify-self-start self-start gap-3',
        isBlurred && 'bookmark-folder--blurred',
      )}
      aria-label={folder.name}
    >
      <div className="bookmark-folder__preview relative grid grid-cols-[repeat(2,4rem)] gap-4 box-border rounded-[var(--radius)] border border-border bg-card p-4">
        {folder.items.map((bookmark, index) => (
          <BookmarkCard
            key={bookmark.id ?? `${folder.name}-${bookmark.name}`}
            bookmark={bookmark}
            variant="preview"
            linkRef={index === 0 ? firstBookmarkRef : undefined}
            onClick={(event) => {
              // 保留链接语义，但由扩展创建标签以便将其加入对应分组。
              event.preventDefault();
              onOpenBookmark?.(folder, bookmark);
            }}
          />
        ))}
        {Array.from({ length: Math.max(0, 4 - folder.items.length) }, (_, index) => (
          <span
            key={`placeholder-${index}`}
            className="bookmark-folder__placeholder box-border h-16 w-16"
            aria-hidden="true"
          />
        ))}
        {folder.blur === true ? (
          <button
            type="button"
            className={cn(
              'bookmark-folder__blur absolute inset-0 z-[1] grid place-items-center rounded-[var(--radius)] border-0 bg-overlay text-inherit backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-safe:hover:shadow-[var(--shadow-hover)] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
              !isBlurred && 'bookmark-folder__blur--hidden hidden',
            )}
            aria-label={`点击显示 ${folder.name} 书签`}
            onClick={reveal}
          >
            <BookmarkIcon
              icon="icons/brush-cleaning.svg"
              name={`${folder.name} 遮罩`}
              tone="adaptive"
              size="md"
              className="h-7 w-7 motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.08] motion-safe:focus-visible:-translate-y-0.5 motion-safe:focus-visible:scale-[1.08]"
            />
          </button>
        ) : null}
      </div>
      <span className="bookmark-folder__name max-w-full justify-self-center overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold leading-5">
        {folder.name}
      </span>
    </section>
  );
}
