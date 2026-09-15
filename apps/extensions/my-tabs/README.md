# My Tabs

基于 WXT 的 Chromium 新标签页扩展，使用 React 和 CSS 提供书签网格、书签 Dock、Popover 以及标签组打开能力。页面入口为 `src/entrypoints/newtab/main.tsx`，组件按现有 DOM、CSS 和无障碍语义迁移。

## 开发和验证

在仓库根目录执行：

```bash
pnpm tabs:dev
pnpm --filter @my-extensions/my-tabs typecheck
pnpm --filter @my-extensions/my-tabs test
pnpm tabs:build
```

依赖版本固定为 React `19.3.0`、React DOM `19.3.0`、WXT React 模块 `1.2.2`；不引入 shadcn、Tailwind、Recharts 或 React Router。

开发时浏览器必须加载稳定开发目录：

```text
apps/extensions/my-tabs/dist/chrome-mv3-dev-stable/
```

WXT 的临时开发目录会在构建过程中被重建，不能直接作为浏览器加载目录。只有构建成功后，稳定目录才会更新；构建失败时会保留上一份成功产物。

生产构建目录为：

```text
apps/extensions/my-tabs/dist/chrome-mv3/
```

当前生产构建共 36 个文件、290.55 kB（其中 React 页面 chunk 约 227.73 kB）。相较 React 升级后的 284.01 KiB 基线，文件数不变、主 chunk 基本不变；相较迁移前约 70.2 KiB 的基线，体积差异主要来自 React 运行时与模块化组件代码。

## 浏览器加载

1. 在 Chrome 或 Edge 打开扩展管理页面并启用开发者模式。
2. 选择“加载已解压的扩展程序”。
3. 开发验证选择 `dist/chrome-mv3-dev-stable/`。
4. 生产验证选择 `dist/chrome-mv3/`。
5. 修改入口或 Manifest 后，等待构建成功，再重新加载扩展。

## 项目结构

```text
my-tabs/
├─ src/
│  ├─ assets/          # 书签、工具和扩展图标资源
│  ├─ components/      # 书签卡片、文件夹、列表和 Popover
│  ├─ entrypoints/     # WXT 新标签页入口
│  ├─ styles/          # 通用样式
│  ├─ types/           # 书签领域的共享类型
│  ├─ utils/           # 浏览器 API 和通用工具
│  └─ views/           # 新标签页视图
└─ src/test/            # Vitest 行为测试
```

测试通过 Vitest 在 DOM 环境中直接渲染 TSX 组件，覆盖书签卡片、文件夹遮罩、Popover 语义、视图组合和标签组打开逻辑；不再保留原生 DOM 兼容实现。当前共 41 项测试。生产构建产物以 `dist/chrome-mv3/` 为准，开发构建必须加载 `dist/chrome-mv3-dev-stable/`。
