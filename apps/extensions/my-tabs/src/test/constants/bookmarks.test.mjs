import { test } from 'vitest';
import assert from 'node:assert/strict';
import * as bookmarkConfig from '../../constants/bookmarks.ts';

const { BOOKMARK_GRID, DOCK_COMPONENTS, DOCK_DEVTOOLS, DOCK_FAVORITES } = bookmarkConfig;

// 验证 Grid 书签配置包含 EDU 文件夹和文字 SVG 入口。
test('Grid 书签配置提供 EDU 文件夹', () => {
  assert.deepEqual(BOOKMARK_GRID, [
      {
        type: 'folder',
        id: 'social-media',
        name: 'Social Media',
        items: [
          { id: 'x', name: 'X', url: 'https://x.com', icon: 'brand/x.svg', iconTone: 'adaptive' },
          { id: 'bilibili', name: 'Bilibili', url: 'https://www.bilibili.com', icon: 'brand/bilibili.svg', iconTone: 'adaptive' },
          { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com', icon: 'brand/youtube.svg', iconTone: 'adaptive' },
        ],
      },
      {
        type: 'folder',
        id: 'devops',
        name: 'DevOps',
        items: [
          { id: 'namecheap', name: 'Namecheap', url: 'https://www.namecheap.com', icon: 'brand/namecheap.svg', iconTone: 'adaptive' },
          { id: 'vercel', name: 'Vercel', url: 'https://vercel.com', icon: 'brand/vercel.svg', iconTone: 'adaptive' },
        ],
      },
      {
        type: 'folder',
        id: 'pm',
        name: 'PM',
        items: [
          { id: 'linear', name: 'Linear', url: 'https://linear.app', icon: 'brand/linear.svg', iconTone: 'adaptive' },
          { id: 'notion', name: 'Notion', url: 'https://www.notion.so', icon: 'brand/notion.svg', iconTone: 'adaptive' },
        ],
      },
      {
        type: 'folder',
        id: 'edu',
        name: 'EDU',
        blur: true,
        items: [
          { id: 'pmi', name: 'PMI', url: 'https://www.pmi.org/', icon: 'brand/text-pmi.svg', iconTone: 'adaptive' },
          { id: 'jlpt', name: 'JLPT', url: 'https://jlpt-main.neea.cn/', icon: 'brand/text-jlpt.svg', iconTone: 'adaptive' },
          { id: 'ielts', name: 'IELTS', url: 'https://ielts.neea.cn/', icon: 'brand/text-ielts.svg', iconTone: 'adaptive' },
          { id: 'chsi', name: '学信网', url: 'https://www.chsi.com.cn/', icon: 'brand/text-chsi.svg', iconTone: 'adaptive' },
        ],
      },
  ]);
});

test('Dock 收藏配置保持当前常用入口顺序', () => {
  assert.deepEqual(DOCK_FAVORITES, [
    { type: 'bookmark', id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', icon: 'brand/chatgpt.svg', iconTone: 'adaptive' },
    { type: 'bookmark', id: 'github', name: 'GitHub', url: 'https://github.com', icon: 'brand/github.svg', iconTone: 'adaptive' },
    { type: 'bookmark', id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', icon: 'brand/gmail.svg', iconTone: 'adaptive' },
  ]);
});

test('Components 聚合入口保持当前组件工具顺序', () => {
  assert.deepEqual(DOCK_COMPONENTS, {
    type: 'bookmark-group',
    id: 'components',
    name: 'Components',
    icon: 'icons/components.svg',
    iconTone: 'adaptive',
    bookmarks: [
      { type: 'bookmark', id: 'lucide', name: 'Lucide', url: 'https://lucide.dev', icon: 'tools/lucide.svg' },
      { type: 'bookmark', id: 'iconfont', name: 'Iconfont', url: 'https://www.iconfont.cn', icon: 'tools/iconfont.svg' },
      { type: 'bookmark', id: 'antd', name: 'Ant Design', url: 'https://ant.design', icon: 'tools/antd.svg' },
      { type: 'bookmark', id: 'element-ui', name: 'Element UI', url: 'https://element.eleme.io', icon: 'tools/element-ui.svg' },
      { type: 'bookmark', id: 'element-plus', name: 'Element Plus', url: 'https://element-plus.org', icon: 'tools/element-plus.svg' },
    ],
  });
});

test('DevTools 聚合入口提供翻译工具', () => {
  assert.deepEqual(DOCK_DEVTOOLS, {
    type: 'bookmark-group',
    id: 'devtools',
    name: 'DevTools',
    icon: 'icons/devtools.svg',
    iconTone: 'adaptive',
    bookmarks: [
      {
        type: 'bookmark',
        id: 'google-translate',
        name: 'Google Translate',
        url: 'https://translate.google.com/?hl=zh-cn&sl=en&tl=zh-CN&op=translate',
        icon: 'tools/google-translate.png',
      },
    ],
  });
});
