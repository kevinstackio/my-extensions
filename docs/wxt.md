# WXT 使用指南

WXT 是浏览器扩展的开发和构建框架，负责入口发现、Manifest 生成、开发监听和生产构建。它不是 React 或 Vue 的替代品；扩展可以使用原生 JavaScript、TypeScript、React 或 Vue。

本仓库当前包含 TG Download 和 My Tabs 两个 WXT 项目。WXT 只负责扩展入口、Manifest、开发监听和构建流程；是否使用 React、TypeScript 或其他视图层技术由各项目自行决定。

## 推荐目录

```text
<extension>/
├─ src/
│  ├─ assets/
│  │  ├─ icons/         # 功能图标
│  │  └─ logo/          # 扩展品牌图标
│  ├─ components/       # 可复用界面组件
│  ├─ entrypoints/      # WXT 入口
│  ├─ features/         # 业务功能
│  ├─ styles/           # 通用样式
│  ├─ utils/            # 通用方法
│  └─ views/            # 页面或视图
├─ tests/               # 自动化测试
├─ package.json
├─ tsconfig.json
├─ vitest.config.ts
└─ wxt.config.ts
```

目录按职责使用，不要求每个项目创建所有空目录。没有内容的目录可以省略。

## 配置和 Manifest

扩展名称、版本、权限、图标和公开资源统一在 `wxt.config.ts` 的 `manifest` 中声明。迁移完成后不再单独维护根级 `manifest.json`，避免两份配置不同步。

项目专属配置必须留在项目目录内，例如：

- TG Download 的 Telegram 匹配范围和内容脚本资源。
- My Tabs 的 `tabGroups` 权限和新标签页入口。

## Entrypoints

WXT 根据 `src/entrypoints` 中的文件发现扩展入口。常见入口包括：

- `background.ts`：后台 Service Worker。
- `*.content.ts`：注入网页的内容脚本。
- `popup/`、`options/`、`sidepanel/`：扩展页面。
- `newtab/`：覆盖浏览器新标签页的页面，适用于 My Tabs。

内容脚本必须明确考虑执行世界：

- 默认隔离世界适合使用扩展 API、消息通信和独立逻辑。
- `MAIN` 世界适合必须访问网页自身运行时对象的代码，但不能直接依赖隔离世界能力。
- 需要同时使用两种能力时，应拆分入口并通过明确的数据边界协作。

## 资源管理

仓库约定源码资源统一放在 `src/assets`：

```text
src/assets/
├─ icons/
└─ logo/
```

页面入口中的资源应交给 Vite/WXT 处理。Manifest 和运行时需要固定地址的资源，可以在构建配置中映射到扩展输出目录。

TG Download 不保留 `public` 源码目录，而是在 `wxt.config.ts` 中使用：

- `prepare:publicPaths`：为 `browser.runtime.getURL()` 补充类型安全的输出路径。
- `build:publicAssets`：将 `src/assets` 中的文件复制到构建产物的 `icon` 目录。

内容脚本中的相对 URL 会由目标网页解析。例如在 Telegram 页面中直接使用 `/icon/download.svg`，浏览器可能请求 Telegram 域名，而不是扩展资源。此类资源需要：

1. 在 Manifest 的 `web_accessible_resources` 中声明。
2. 使用 `browser.runtime.getURL('/icon/download.svg')` 获得扩展地址。

## 开发和构建

扩展开发模式：

```bash
pnpm tg:dev
```

My Tabs 使用：

```bash
pnpm tabs:dev
```

WXT 会监听源码变化并重新构建扩展。扩展重新加载后，已打开且匹配内容脚本的网页可能同步刷新，以便重新注入最新脚本；这是开发流程的一部分。

TG Download 生产构建：

```bash
pnpm tg:build
```

My Tabs 生产构建：

```bash
pnpm tabs:build
```

生产构建产物分别位于：

```text
apps/extensions/tg-download/dist/chrome-mv3/
apps/extensions/my-tabs/dist/chrome-mv3/
```

日常开发预览不需要每次手动运行生产构建。保持 `dev` 命令运行即可；每次开发构建完成后，接入扩展会自动输出包体积预警。准备发布、手动验证生产产物或执行严格体积校验时再运行 `build` 和 `check:bundle-size`。

### 稳定开发目录

WXT 的开发构建会重建临时输出目录，因此浏览器不得直接加载该目录。接入稳定开发产物机制的扩展，应让浏览器加载项目约定的 `*-dev-stable` 目录。

只有完整开发构建成功后，稳定目录才会更新；构建失败时继续保留上一份成功产物。该机制不改变项目原有的开发命令，也不要求额外启动常驻脚本或终端。

具体接入方式和发布规则见 [`stable-extension-dev` README](../packages/stable-extension-dev/README.md)。

## 浏览器加载

1. 打开 Chrome 或 Edge 的扩展管理页面。
2. 开启开发者模式。
3. 选择“加载已解压的扩展程序”。
4. 开发时选择 `dist/chrome-mv3-dev-stable`，生产验收时选择 `dist/chrome-mv3`。
5. 修改扩展入口或 Manifest 后，确认扩展和目标页面均加载了最新版本。

## React 的定位

React 适合 popup、options、新标签页等具有较多交互状态的扩展页面，但不是 WXT 的必选项。

- 简单内容脚本优先保持原生 TypeScript，避免增加运行时和构建复杂度。
- My Tabs 使用 React、TypeScript、Tailwind CSS v4 和按需引入的 shadcn/ui/Radix 原语；其组件边界、测试和交互约束由子项目 README 与 `AGENTS.md` 维护。
- TG Download 仍以原生 TypeScript 和内容脚本为主，不因为同仓库存在 React 项目而引入额外运行时。
- React 目录、组件状态和测试规范不作为所有 WXT 项目的强制规范，由实际使用 React 的项目单独约定。

## 测试建议

- 业务逻辑尽量写成不依赖浏览器 DOM 的纯函数。
- Manifest、入口配置和资源映射需要自动化测试。
- 浏览器 API 使用小型接口隔离，测试时替换边界，不模拟整个浏览器。
- 每次迁移必须执行项目测试、类型检查、项目构建和根级任务。
- 使用稳定开发目录的项目还必须验证成功构建、失败构建保留旧稳定产物以及恢复构建更新稳定目录。
- 自动化测试通过后，还需要在 Chrome 或 Edge 中完成核心流程验收。

## 常见问题

- 图标在源码中存在但网页不显示：检查资源是否被构建、是否声明为公开资源，以及是否使用扩展 URL。
- 开发时网页跟着刷新：通常是 WXT 为重新注入内容脚本而触发的刷新。
- Manifest 路径正确但产物缺少文件：检查资源是否由 Vite 导入，或是否通过构建钩子复制。
- 浏览器 API 方法单独传递后报错：部分方法依赖原对象上下文，传递前需要确认是否必须绑定接收者。
