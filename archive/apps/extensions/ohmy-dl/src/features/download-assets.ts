const DOWNLOAD_ASSET_STYLE_ID = 'ohmy-dl-asset-styles';
type DownloadAssetPath = '/icon/download.svg' | '/icon/loader.svg';

export function createDownloadAssetStyle(
  downloadUrl: string,
  loaderUrl: string,
): string {
  return `.ohmy-dl-menu {
  --ohmy-dl-icon: url(${JSON.stringify(downloadUrl)});
  --ohmy-dl-loader: url(${JSON.stringify(loaderUrl)});
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
