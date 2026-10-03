import { defineConfig } from 'vitepress'

// VitePress 站点配置
export default defineConfig({
  title: "OmyExts",
  description: "将想法与能力延伸为实用工具，汇集浏览器扩展、应用、AI Skills 与开发工具。",
  outDir: 'dist',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/ohmy-exts.svg', media: '(prefers-color-scheme: light)' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/ohmy-exts-light.svg', media: '(prefers-color-scheme: dark)' }],
    ['link', { rel: 'apple-touch-icon', href: '/ohmy-exts-180.png' }]
  ],
  themeConfig: {
    logo: {
      light: '/ohmy-exts.svg',
      dark: '/ohmy-exts-light.svg'
    },
    // VitePress 默认主题配置
    nav: [
      { text: '首页', link: '/' },
      { text: 'Apps', link: '/apps/' },
      { text: 'Toolkits', link: '/toolkits/' },
      { text: 'Docs', link: '/docs/' }
    ],

    sidebar: [
      {
        text: '内容入口',
        items: [
          { text: 'Apps', link: '/apps/' },
          { text: 'Toolkits', link: '/toolkits/' },
          { text: 'Docs', link: '/docs/' }
        ]
      }
    ]
  }
})
