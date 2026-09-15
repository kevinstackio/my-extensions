import { createElement } from 'react';
import { getExtensionAsset } from '../../utils/common.js';

/**
 * 渲染一个安全地在新标签页打开目标网站的通用书签卡片。
 *
 * @param {{bookmark: {name: string, url: string, icon: string}, onClick?: (event: Event) => void, linkRef?: object}} props 书签及交互属性。
 * @returns {import('react').ReactElement} 书签链接节点。
 */
export function BookmarkCard({ bookmark, onClick, linkRef }) {
  return createElement(
    'a',
    {
      ref: linkRef,
      className: 'bookmark-card',
      href: bookmark.url,
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': `在新标签页打开 ${bookmark.name}`,
      onClick,
    },
    createElement(
      'span',
      { className: 'bookmark-card__icon' },
      createElement('img', {
        src: getExtensionAsset(bookmark.icon),
        alt: '',
        'aria-hidden': 'true',
      }),
    ),
    createElement('span', { className: 'bookmark-card__name' }, bookmark.name),
  );
}

/**
 * 保留迁移期间既有单元测试使用的 DOM 工厂；运行时入口不再调用该函数。
 */
export function createBookmarkCard(document, bookmark) {
  const card = document.createElement('a');
  const iconContainer = document.createElement('span');
  const icon = document.createElement('img');
  const name = document.createElement('span');

  card.className = 'bookmark-card';
  card.setAttribute('href', bookmark.url);
  card.setAttribute('target', '_blank');
  card.setAttribute('rel', 'noopener noreferrer');
  card.setAttribute('aria-label', `在新标签页打开 ${bookmark.name}`);
  iconContainer.className = 'bookmark-card__icon';
  icon.setAttribute('src', getExtensionAsset(bookmark.icon));
  icon.setAttribute('alt', '');
  icon.setAttribute('aria-hidden', 'true');
  name.className = 'bookmark-card__name';
  name.textContent = bookmark.name;
  iconContainer.append(icon);
  card.append(iconContainer, name);
  return card;
}
