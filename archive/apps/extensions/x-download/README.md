# X Download

## 1. 介绍

X Download 是面向 X 单篇帖子的 Chromium 扩展；完整的产品介绍、安装方式和使用说明待后续补充。

## 2. 项目框架

- 使用 WXT 和 TypeScript 构建浏览器扩展。
- 通过页面媒体观察、Popup 和后台通信组织下载流程。
- 通过 Native Messaging 与 `x-download-helper` 配套应用通信。
- 根目录开发命令：`pnpm x:dev`。

## 3. 本目录项目结构

```text
x-download/
├─ src/
│  ├─ assets/                    # 扩展图标和静态资源
│  ├─ entrypoints/               # WXT 入口
│  └─ features/                  # 媒体识别、Popup 和 Native Messaging 逻辑
├─ tests/                        # 自动化测试
├─ package.json                  # 项目命令与依赖
└─ wxt.config.ts                 # WXT 配置
```
