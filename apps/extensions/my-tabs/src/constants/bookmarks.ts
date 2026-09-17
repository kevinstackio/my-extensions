import type { Bookmark, BookmarkGridItem, BookmarkGroup } from '../types/bookmarks';

// 书签配置按页面区域直接导出，避免调用方依赖聚合对象。
// 首页 Grid 只消费文件夹和普通书签，不包含底部 Dock 的内容。
export const BOOKMARK_GRID: BookmarkGridItem[] = [
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
];

// Dock 收藏区只保存直接可点击的常用书签。
export const DOCK_FAVORITES: Bookmark[] = [
  { type: 'bookmark', id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', icon: 'brand/chatgpt.svg', iconTone: 'adaptive' },
  { type: 'bookmark', id: 'github', name: 'GitHub', url: 'https://github.com', icon: 'brand/github.svg', iconTone: 'adaptive' },
  { type: 'bookmark', id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', icon: 'brand/gmail.svg', iconTone: 'adaptive' },
];

// Components 与 DevTools 都是 Dock 内的聚合入口，内部书签按各自名称加入标签组。
export const DOCK_COMPONENTS: BookmarkGroup = {
  type: 'bookmark-group',
  id: 'components',
  name: 'Components',
  icon: { kind: 'ui', name: 'blocks' },
  bookmarks: [
    { type: 'bookmark', id: 'lucide', name: 'Lucide', url: 'https://lucide.dev', icon: 'tools/lucide.svg' },
    { type: 'bookmark', id: 'iconfont', name: 'Iconfont', url: 'https://www.iconfont.cn', icon: 'tools/iconfont.svg' },
    { type: 'bookmark', id: 'antd', name: 'Ant Design', url: 'https://ant.design', icon: 'tools/antd.svg' },
    { type: 'bookmark', id: 'element-ui', name: 'Element UI', url: 'https://element.eleme.io', icon: 'tools/element-ui.svg' },
    { type: 'bookmark', id: 'element-plus', name: 'Element Plus', url: 'https://element-plus.org', icon: 'tools/element-plus.svg' },
  ],
};

// DevTools 卡片与其内部工具列表必须保持同一配置，供后续 Popover 直接消费。
export const DOCK_DEVTOOLS: BookmarkGroup = {
  type: 'bookmark-group',
  id: 'devtools',
  name: 'DevTools',
  icon: { kind: 'ui', name: 'wrench' },
  bookmarks: [
    {
      type: 'bookmark',
      id: 'google-translate',
      name: 'Google Translate',
      url: 'https://translate.google.com/?hl=zh-cn&sl=en&tl=zh-CN&op=translate',
      icon: 'tools/google-translate.png',
    },
  ],
};
