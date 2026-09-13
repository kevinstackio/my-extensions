import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  manifest: {
    name: 'TG Download',
    version: '1.0.0',
    description: '在 Telegram Web 中右键保存图片和视频。',
    icons: {
      16: '/icon/tg-download-16.png',
      32: '/icon/tg-download-32.png',
      48: '/icon/tg-download-48.png',
      128: '/icon/tg-download-128.png',
    },
    action: {
      default_icon: {
        16: '/icon/tg-download-16.png',
        32: '/icon/tg-download-32.png',
        48: '/icon/tg-download-48.png',
        128: '/icon/tg-download-128.png',
      },
      default_title: 'TG Download',
    },
    web_accessible_resources: [
      {
        matches: ['https://web.telegram.org/*'],
        resources: ['/icon/*.svg'],
      },
    ],
  },
});
