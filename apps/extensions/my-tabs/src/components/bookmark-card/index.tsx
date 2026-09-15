import type { MouseEventHandler, Ref } from 'react';

import type { Bookmark } from '../../types/bookmarks';
import { getExtensionAsset } from '../../utils/common.js';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  linkRef?: Ref<HTMLAnchorElement>;
}

/** 渲染一个安全地在新标签页打开目标网站的通用书签卡片。 */
export function BookmarkCard({ bookmark, onClick, linkRef }: BookmarkCardProps) {
  return (
    <a
      ref={linkRef}
      className="bookmark-card"
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`在新标签页打开 ${bookmark.name}`}
      onClick={onClick}
    >
      <span className="bookmark-card__icon">
        <img src={getExtensionAsset(bookmark.icon)} alt="" aria-hidden="true" />
      </span>
      <span className="bookmark-card__name">{bookmark.name}</span>
    </a>
  );
}
