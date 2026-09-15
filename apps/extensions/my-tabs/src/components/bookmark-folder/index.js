import { createElement, useRef, useState } from 'react';
import { getExtensionAsset } from '../../utils/common.js';
import { BookmarkCard, createBookmarkCard } from '../bookmark-card/index.js';

/**
 * 渲染以紧凑图标预览呈现的书签文件夹。
 *
 * @param {{folder: {name: string, items: Array<object>, blur?: boolean}, onOpenBookmark?: (folder: object, bookmark: object) => void}} props 文件夹配置和打开回调。
 * @returns {import('react').ReactElement} 文件夹节点。
 */
export function BookmarkFolder({ folder, onOpenBookmark }) {
  const [isBlurred, setIsBlurred] = useState(folder.blur === true);
  const firstBookmarkRef = useRef(null);

  function reveal(event) {
    event.preventDefault();
    event.stopPropagation();
    setIsBlurred(false);
    firstBookmarkRef.current?.focus();
  }

  return createElement(
    'section',
    {
      className: isBlurred ? 'bookmark-folder bookmark-folder--blurred' : 'bookmark-folder',
      'aria-label': folder.name,
    },
    createElement(
      'div',
      { className: 'bookmark-folder__preview' },
      ...folder.items.map((bookmark, index) => createElement(BookmarkCard, {
        key: bookmark.id ?? `${folder.name}-${bookmark.name}`,
        bookmark,
        linkRef: index === 0 ? firstBookmarkRef : undefined,
        onClick: (event) => {
          // 保留链接语义，但由扩展创建标签以便将其加入对应分组。
          event.preventDefault();
          onOpenBookmark?.(folder, bookmark);
        },
      })),
      ...Array.from({ length: Math.max(0, 4 - folder.items.length) }, (_, index) => createElement('span', {
        key: `placeholder-${index}`,
        className: 'bookmark-folder__placeholder',
        'aria-hidden': 'true',
      })),
      folder.blur === true ? createElement(
        'button',
        {
          type: 'button',
          className: isBlurred ? 'bookmark-folder__blur' : 'bookmark-folder__blur bookmark-folder__blur--hidden',
          'aria-label': `点击显示 ${folder.name} 书签`,
          onClick: reveal,
        },
        createElement('img', {
          src: getExtensionAsset('icons/brush-cleaning.svg'),
          alt: '',
          'aria-hidden': 'true',
        }),
      ) : null,
    ),
    createElement('span', { className: 'bookmark-folder__name' }, folder.name),
  );
}

/** 兼容迁移前测试的 DOM 工厂，页面运行时由 BookmarkFolder 接管渲染。 */
export function createBookmarkFolder(document, folder, onOpenBookmark) {
  const element = document.createElement('section');
  const preview = document.createElement('div');
  const name = document.createElement('span');
  const blurButton = folder.blur === true ? document.createElement('button') : null;
  let isBlurred = folder.blur === true;

  element.className = 'bookmark-folder';
  element.setAttribute('aria-label', folder.name);
  preview.className = 'bookmark-folder__preview';
  let firstBookmark = null;
  preview.append(...folder.items.map((bookmark) => {
    const item = createBookmarkCard(document, bookmark);
    firstBookmark ??= item;
    item.addEventListener('click', (event) => {
      event.preventDefault();
      onOpenBookmark(folder, bookmark);
    });
    return item;
  }));
  preview.append(...Array.from({ length: Math.max(0, 4 - folder.items.length) }, () => {
    const placeholder = document.createElement('span');
    placeholder.className = 'bookmark-folder__placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    return placeholder;
  }));
  if (blurButton) {
    const blurIcon = document.createElement('img');
    blurButton.className = 'bookmark-folder__blur';
    blurButton.setAttribute('type', 'button');
    blurButton.setAttribute('aria-label', `点击显示 ${folder.name} 书签`);
    blurIcon.setAttribute('src', getExtensionAsset('icons/brush-cleaning.svg'));
    blurIcon.setAttribute('alt', '');
    blurIcon.setAttribute('aria-hidden', 'true');
    blurButton.append(blurIcon);
    blurButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation?.();
      isBlurred = false;
      element.className = 'bookmark-folder';
      blurButton.className = 'bookmark-folder__blur bookmark-folder__blur--hidden';
      firstBookmark?.focus();
    });
    preview.append(blurButton);
  }
  if (isBlurred) element.className = 'bookmark-folder bookmark-folder--blurred';
  name.className = 'bookmark-folder__name';
  name.textContent = folder.name;
  element.append(preview, name);
  return element;
}
