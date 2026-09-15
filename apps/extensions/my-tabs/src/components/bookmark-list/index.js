import { createElement } from 'react';
import { getExtensionAsset } from '../../utils/common.js';

/**
 * 将书签配置渲染为可复用的工具链接列表。
 *
 * @param {{bookmarks: Array<{name: string, url: string, icon: string}>, onSelect?: (bookmark: object) => void}} props 书签和选择回调。
 * @returns {import('react').ReactElement} 书签列表节点。
 */
export function BookmarkList({ bookmarks, onSelect }) {
  return createElement(
    'ul',
    { className: 'bookmark-list' },
    ...bookmarks.map((bookmark) => createElement(
      'li',
      { key: bookmark.id ?? bookmark.name },
      createElement(
        'a',
        {
          className: 'bookmark-list__item',
          href: bookmark.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          onClick: onSelect ? (event) => {
            // 组件仅上报所选书签，标签页、分组等业务动作始终交给调用方。
            event.preventDefault();
            onSelect(bookmark);
          } : undefined,
        },
        createElement('img', {
          src: getExtensionAsset(bookmark.icon),
          alt: '',
          'aria-hidden': 'true',
        }),
        createElement('span', null, bookmark.name),
      ),
    )),
  );
}

/** 兼容迁移前测试的 DOM 工厂，页面运行时由 BookmarkList 接管渲染。 */
export function createBookmarkList(document, bookmarks, onSelect) {
  const list = document.createElement('ul');
  list.className = 'bookmark-list';
  list.append(...bookmarks.map((bookmark) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const icon = document.createElement('img');
    const name = document.createElement('span');
    link.className = 'bookmark-list__item';
    link.setAttribute('href', bookmark.url);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    icon.setAttribute('src', getExtensionAsset(bookmark.icon));
    icon.setAttribute('alt', '');
    icon.setAttribute('aria-hidden', 'true');
    name.textContent = bookmark.name;
    if (onSelect) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        return onSelect(bookmark);
      });
    }
    link.append(icon, name);
    item.append(link);
    return item;
  }));
  return list;
}
