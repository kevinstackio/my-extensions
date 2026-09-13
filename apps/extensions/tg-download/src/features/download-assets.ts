const DOWNLOAD_ASSET_STYLE_ID = 'tg-download-asset-styles';
type DownloadAssetPath = '/icon/download.svg' | '/icon/loader.svg';

export function createDownloadAssetStyle(
  downloadUrl: string,
  loaderUrl: string,
): string {
  return `.tg-download-menu {
  --tg-download-icon: url(${JSON.stringify(downloadUrl)});
  --tg-download-loader: url(${JSON.stringify(loaderUrl)});
}`;
}

export function installDownloadAssetStyles(
  document: Document,
  getURL: (path: DownloadAssetPath) => string,
): void {
  if (document.getElementById(DOWNLOAD_ASSET_STYLE_ID)) return;

  const root = document.head ?? document.documentElement;
  if (!root) return;

  const style = document.createElement('style');
  style.id = DOWNLOAD_ASSET_STYLE_ID;
  style.textContent = createDownloadAssetStyle(
    getURL('/icon/download.svg'),
    getURL('/icon/loader.svg'),
  );
  root.append(style);
}
