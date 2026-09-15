import { createElement, Fragment } from 'react';
import { BookmarkCard } from '../../components/bookmark-card/index.js';
import { BookmarkFolder } from '../../components/bookmark-folder/index.js';
import { createBookmarkCard } from '../../components/bookmark-card/index.js';
import { createBookmarkFolder } from '../../components/bookmark-folder/index.js';
import { openBookmarkInGroup } from '../../utils/tab.js';

/**
 * 将首页书签配置按顺序渲染到独立 Grid 容器。
 *
 * @param {Document} document 用于创建书签与文件夹节点的页面文档。
 * @param {HTMLElement} container 接收书签 Grid 内容的容器节点。
 * @param {Array<object>} bookmarks 书签或书签文件夹的配置列表。
 * @returns {void}
 */
export function renderBookmarkGrid(document, container, bookmarks) {
  container.className = 'bookmarks';
  container.append(...bookmarks.map((item) => (
    item.type === 'folder'
      ? createBookmarkFolder(
        document,
        item,
        // 文件夹内每个书签独立打开，并以文件夹名称定位 Chrome 标签组。
        (folder, bookmark) => openBookmarkInGroup(chrome, folder, bookmark),
      )
      : createBookmarkCard(document, item)
  )));
}

/**
 * React 书签 Grid，只负责按配置顺序组合卡片和文件夹。
 *
 * @param {{bookmarks: Array<object>, onOpenBookmark?: (folder: object, bookmark: object) => void}} props Grid 配置和文件夹打开回调。
 * @returns {import('react').ReactElement} Grid 子节点集合。
 */
export function BookmarkGrid({ bookmarks, onOpenBookmark }) {
  return createElement(
    Fragment,
    null,
    ...bookmarks.map((item) => item.type === 'folder'
      ? createElement(BookmarkFolder, {
        key: item.id,
        folder: item,
        onOpenBookmark,
      })
      : createElement(BookmarkCard, {
        key: item.id,
        bookmark: item,
      })),
  );
}
