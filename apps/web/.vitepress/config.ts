import { defineConfig } from 'vitepress'

// VitePress 站点配置
export default defineConfig({
  title: "My Extensions",
  description: "将想法与能力延伸为实用工具，汇集浏览器扩展、应用、AI Skills 与开发工具。",
  outDir: 'dist',
  themeConfig: {
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
