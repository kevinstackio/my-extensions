import { cva, type VariantProps } from 'class-variance-authority';
import type { MouseEventHandler, Ref } from 'react';

import { BookmarkIcon } from '../bookmark-icon';
import type { Bookmark } from '../../types/bookmarks';
import { cn } from '../../lib/utils';

// 同一张卡片服务首页 Grid、Dock 和浮层预览，差异集中在 variant 而不是复制组件。
const bookmarkCardVariants = cva(
  'bookmark-card group box-border grid justify-items-center gap-2 text-foreground no-underline outline-none',
  {
  variants: {
    variant: {
      grid: 'h-[104px] w-[88px]',
      dock: 'h-16 w-16 flex-none [&_.bookmark-card__name]:hidden',
      preview: 'h-16 w-16 [&_.bookmark-card__name]:hidden',
    },
  },
  defaultVariants: {
    variant: 'grid',
  },
  },
);

interface BookmarkCardProps extends VariantProps<typeof bookmarkCardVariants> {
  bookmark: Bookmark;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  linkRef?: Ref<HTMLAnchorElement>;
}

/** 渲染一个安全地在新标签页打开目标网站的通用书签卡片。 */
export function BookmarkCard({ bookmark, onClick, linkRef, variant = 'grid' }: BookmarkCardProps) {
  return (
    <a
      ref={linkRef}
      className={bookmarkCardVariants({ variant })}
      data-variant={variant}
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`在新标签页打开 ${bookmark.name}`}
      onClick={onClick}
    >
      <span
        className={cn(
          'bookmark-card__icon grid h-16 w-16 place-items-center rounded-[var(--radius)] border border-border bg-card transition-[border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-safe:group-hover:-translate-y-0.5 motion-safe:group-focus-visible:-translate-y-0.5 motion-safe:group-hover:shadow-[var(--shadow-hover)] motion-safe:group-focus-visible:shadow-[var(--shadow-hover)] group-focus-visible:outline-2 group-focus-visible:outline-ring group-focus-visible:outline-offset-2',
          variant === 'dock' && 'bookmark-card__icon--dock',
          variant === 'preview' && 'bookmark-card__icon--preview',
        )}
      >
        <BookmarkIcon
          icon={bookmark.icon}
          name={bookmark.name}
          tone={bookmark.iconTone}
          size={bookmark.iconSize}
          className="motion-safe:group-hover:scale-[1.06] motion-safe:group-focus-visible:scale-[1.06]"
        />
      </span>
      <span className="bookmark-card__name max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold leading-5">
        {bookmark.name}
      </span>
    </a>
  );
}
