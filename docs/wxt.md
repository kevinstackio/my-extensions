# WXT 使用指南

WXT 是浏览器扩展的开发和构建框架，负责入口发现、Manifest 生成、开发监听和生产构建。它不是 React 或 Vue 的替代品；扩展可以使用原生 JavaScript、TypeScript、React 或 Vue。

本仓库当前以 TG Download 作为第一个 WXT 项目，后续迁移 My Tabs 时会在相同基础上评估 React。

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

TG Download 开发模式：

```bash
pnpm tg:dev
```

WXT 会监听源码变化并重新构建扩展。扩展重新加载后，已打开且匹配内容脚本的网页可能同步刷新，以便重新注入最新脚本；这是开发流程的一部分。

生产构建：

```bash
pnpm tg:build
```

构建产物位于：

```text
apps/extensions/tg-download/dist/chrome-mv3/
```

日常开发预览不需要每次手动运行生产构建。保持 `dev` 命令运行即可；准备发布、手动验证生产产物或检查最终体积时再执行 `build`。

### 稳定开发目录

WXT 的开发构建会先清空临时目录，因此浏览器不得直接加载：

```text
apps/extensions/tg-download/dist/chrome-mv3-dev/
```

仓库公共工具 `packages/stable-extension-dev` 已通过 `wxt.config.ts` 的 `build:done` hook 接入 `tg-download`。每次开发构建成功后，它会先校验 `manifest.json` 和 WXT 输出文件，再把完整产物发布到：

```text
apps/extensions/tg-download/dist/chrome-mv3-dev-stable/
```

浏览器应始终加载 `chrome-mv3-dev-stable`。构建失败时，公共工具不会执行发布，稳定目录继续保留上一份成功产物；恢复代码并重新构建成功后，稳定目录才会更新。开发者不需要额外启动常驻脚本或终端，继续运行 `pnpm tg:dev` 即可。

## 浏览器加载

1. 打开 Chrome 或 Edge 的扩展管理页面。
2. 开启开发者模式。
3. 选择“加载已解压的扩展程序”。
4. 开发时选择 `dist/chrome-mv3-dev-stable`，生产验收时选择 `dist/chrome-mv3`。
5. 修改扩展入口或 Manifest 后，确认扩展和目标页面均加载了最新版本。

## React 的定位

React 适合 popup、options、新标签页等具有较多交互状态的扩展页面，但不是 WXT 的必选项。

- 简单内容脚本优先保持原生 TypeScript，避免增加运行时和构建复杂度。
- My Tabs 可以在迁移 WXT 时引入 React，但应先保留现有功能和测试基线。
- React 目录、组件状态和测试规范应在 My Tabs 实际迁移后形成单独文档，不提前写成所有扩展的强制规范。

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
