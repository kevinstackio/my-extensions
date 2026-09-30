# Oh My DL

## 1. 介绍

面向 Telegram Web 的 Chrome 与 Edge 扩展，通过右键菜单保存图片和视频，并在扩展中查看下载进度与历史记录。

## 2. 项目框架

- 使用 WXT 和 TypeScript 构建 Chromium 扩展。
- Content Script 负责识别 Telegram Web 中的媒体并提供下载操作。
- Popup 与后台任务共同展示下载进度、历史记录和终态任务。
- 使用 `browser.storage.local` 保存任务历史，使用浏览器 Downloads API 保存文件。
- 根目录开发、构建和检查命令：`pnpm ohmy-dl:dev`、`pnpm ohmy-dl:build`、`pnpm --filter @omyexts/ohmy-dl check`。

## 3. 本目录项目结构

```text
ohmy-dl/
├─ src/
│  ├─ assets/                    # Logo 与下载菜单图标
│  ├─ components/                # 下载菜单与 Popup 组件
│  ├─ entrypoints/               # WXT Content Script、Popup 和后台入口
│  ├─ features/                  # 下载、任务和主题业务逻辑
│  └─ types/                     # 项目类型声明
├─ tests/                        # 自动化测试
├─ package.json                  # 项目命令与依赖
└─ wxt.config.ts                 # WXT 配置
```
