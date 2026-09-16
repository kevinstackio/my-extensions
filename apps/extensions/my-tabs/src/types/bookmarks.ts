/** 图标颜色策略：品牌图标保留原色，单色 SVG 才允许跟随主题反转。 */
export type IconTone = 'original' | 'adaptive';

/** 书签图标的展示尺寸，尺寸由卡片所在区域决定。 */
export type IconSize = 'sm' | 'md' | 'wide';

/** 页面中可以直接打开的外链书签。 */
export interface Bookmark {
  type?: 'bookmark';
  id: string;
  name: string;
  url: string;
  icon: string;
  iconTone?: IconTone;
  iconSize?: IconSize;
}

/** 首页 Grid 使用的书签文件夹；文件夹本身不代表一个外链。 */
export interface BookmarkFolder {
  type: 'folder';
  id: string;
  name: string;
  items: Bookmark[];
  blur?: boolean;
}

/** Dock 使用的聚合入口，点击后通过浮层展示内部书签。 */
export interface BookmarkGroup {
  type: 'bookmark-group';
  id: string;
  name: string;
  icon: string;
  iconTone?: IconTone;
  iconSize?: IconSize;
  bookmarks: Bookmark[];
}

// Grid 同时承载普通书签和文件夹，集合类型统一两种分组的打开回调签名。
export type BookmarkGridItem = Bookmark | BookmarkFolder;
export type BookmarkCollection = BookmarkFolder | BookmarkGroup;
export type OpenBookmark = (collection: BookmarkCollection, bookmark: Bookmark) => void;
