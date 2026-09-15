export interface Bookmark {
  type?: 'bookmark';
  id: string;
  name: string;
  url: string;
  icon: string;
}

export interface BookmarkFolder {
  type: 'folder';
  id: string;
  name: string;
  items: Bookmark[];
  blur?: boolean;
}

export interface BookmarkGroup {
  type: 'bookmark-group';
  id: string;
  name: string;
  icon: string;
  bookmarks: Bookmark[];
}

export type BookmarkGridItem = Bookmark | BookmarkFolder;
export type BookmarkCollection = BookmarkFolder | BookmarkGroup;
export type OpenBookmark = (collection: BookmarkCollection, bookmark: Bookmark) => void;
