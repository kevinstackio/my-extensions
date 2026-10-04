# OhMy Exts Website

## 1. 介绍

这是 OhMy Exts 的官网与文档站点，用于展示 Apps、Toolkits 和 Docs 内容。

## 2. 项目框架

- 使用 VitePress 构建静态站点。
- `.vitepress/config.ts` 负责站点配置、导航和主题设置。
- `apps/` 展示应用项目，`toolkits/` 展示工具包，`docs/` 展示文档内容。
- 根目录开发和构建命令：`pnpm website:dev`、`pnpm --filter @ohmy-exts/website build`。

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
