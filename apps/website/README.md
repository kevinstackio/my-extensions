# exts Website

## 1. 介绍

这是 exts 的官网与文档站点，用于展示 Apps、Toolkits 和 Docs 内容。

## 2. 项目框架

- 使用 VitePress 构建静态站点。
- `.vitepress/config.ts` 负责站点配置、导航和主题设置。
- `apps/` 展示应用项目，`toolkits/` 展示工具包，`docs/` 展示文档内容。
- 根目录开发和构建命令：`pnpm web:dev`、`pnpm web:build`。

## 3. 本目录项目结构

```text
website/
├─ .vitepress/
│  └─ config.ts                  # VitePress 配置
├─ apps/
│  └─ index.md                   # Apps 页面
├─ toolkits/
│  └─ index.md                   # Toolkits 页面
├─ docs/
│  └─ index.md                   # Docs 页面
├─ index.md                      # 首页
└─ package.json                  # 站点命令与依赖
```

图标位于 public：导航与 favicon 固定使用 exts.svg，touch 图标使用同源黑底白色 PNG，不随主题切换。主体与生成规范维护在 assets/brand/；构建产物为 apps/website/dist/。
