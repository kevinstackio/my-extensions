import { getExtensionAsset } from './common.js';

const ICON_SIZES = [16, 32, 48, 128];

const actionIconPaths = Object.fromEntries(
  ['dark', 'light'].map((theme) => [
    theme,
    Object.fromEntries(
      ICON_SIZES.map((size) => [size, getExtensionAsset(`logo/my-tabs-${theme}-${size}.png`, { relative: true })]),
    ),
  ]),
);

/** 根据系统配色偏好更新浏览器工具栏与标签页图标。 */
export function installActionIconTheme(window, document) {
  if (typeof window?.matchMedia !== 'function') return;

  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const updateActionIcon = () => {
    const theme = colorScheme.matches ? 'light' : 'dark';
    const favicon = document?.querySelector('link[rel="icon"]');

    if (typeof globalThis.chrome?.action?.setIcon === 'function') {
      globalThis.chrome.action.setIcon({ path: actionIconPaths[theme] });
    }

    if (favicon) {
      favicon.setAttribute('href', getExtensionAsset(`logo/my-tabs-${theme}-16.png`));
    }
  };

  updateActionIcon();
  if (typeof colorScheme.addEventListener === 'function') {
    colorScheme.addEventListener('change', updateActionIcon);
  } else if (typeof colorScheme.addListener === 'function') {
    colorScheme.addListener(updateActionIcon);
  }
}
