# My Tabs

基于 WXT 的 Chromium 新标签页扩展，使用 React、Tailwind CSS v4 和 shadcn/ui 原语提供书签网格、书签 Dock、Popover 以及标签组打开能力。页面入口为 `src/entrypoints/newtab/main.tsx`，组件按现有 DOM、CSS 和无障碍语义迁移。

## 项目结构

```text
my-tabs/
├─ src/
│  ├─ assets/          # 书签、工具和扩展图标资源
│  ├─ components/      # 书签卡片、文件夹、列表和 Popover
│  ├─ entrypoints/     # WXT 新标签页入口
│  ├─ styles/          # Tailwind 入口、Design Tokens、主题与全局样式
│  ├─ lib/             # shadcn/ui 共用工具
│  ├─ types/           # 书签领域的共享类型
│  ├─ utils/           # 浏览器 API 和通用工具
│  └─ views/           # 新标签页视图
└─ src/test/            # Vitest 行为测试
```

## 设计系统

- `src/styles/index.css` 是唯一 Tailwind CSS 入口，集中声明 shadcn/ui 语义 Token、明暗主题、动效和全局字体。
- 组件优先复用 shadcn/ui 原语与 Tailwind 语义类；只有图标色调、尺寸和业务布局等稳定差异才保留局部组件 API。
- Geist Sans Variable 1.7.2 作为本地字体资源，来源、许可证和 SHA-256 记录在 `src/assets/fonts/`。
- 图标默认保持原始 SVG；标记为 `adaptive` 的单色 SVG 使用系统明暗主题转换为黑/白，不复制第二套 SVG。
- 主题跟随系统 `prefers-color-scheme`，Popover、Dock 和卡片使用同一组表面、边框、阴影和焦点 Token。

## 开发和验证

在仓库根目录执行：

```bash
pnpm tabs:dev
pnpm tabs:build
```

组件与设计系统验证：

```bash
pnpm --filter @my-extensions/my-tabs typecheck
pnpm --filter @my-extensions/my-tabs test
pnpm --filter @my-extensions/my-tabs check:bundle-size
```

`check:bundle-size` 使用 `bundle-budget.json` 的生产基线，约束 JS gzip、CSS gzip 和 Geist 字体体积；字体只允许一个 WOFF2 产物。

`pnpm tabs:dev` 启动的每次 WXT 开发构建完成后都会自动执行包体积预警。预警只记录超预算项目，不会阻断开发重建；生产构建仍使用 `check:bundle-size` 严格校验。

开发时浏览器必须加载稳定开发目录：

```text
apps/extensions/my-tabs/dist/chrome-mv3-dev-stable/
```

WXT 的临时开发目录会在构建过程中被重建，不能直接作为浏览器加载目录。只有构建成功后，稳定目录才会更新；构建失败时会保留上一份成功产物。

生产构建目录为：

```text
apps/extensions/my-tabs/dist/chrome-mv3/
```

## 浏览器加载

1. 在 Chrome 或 Edge 打开扩展管理页面并启用开发者模式。
2. 选择“加载已解压的扩展程序”。
3. 开发验证选择 `dist/chrome-mv3-dev-stable/`。
4. 生产验证选择 `dist/chrome-mv3/`。
5. 修改入口或 Manifest 后，等待构建成功，再重新加载扩展。
