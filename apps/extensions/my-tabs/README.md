# My Tabs

基于 WXT 的 Chromium 新标签页扩展，使用原生 JavaScript 和 CSS 提供书签网格、书签 Dock、Popover 以及标签组打开能力。

## 开发和验证

在仓库根目录执行：

```bash
pnpm tabs:dev
pnpm --filter @my-extensions/my-tabs typecheck
pnpm --filter @my-extensions/my-tabs test
pnpm tabs:build
```

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

## 项目结构

```text
my-tabs/
├─ src/
│  ├─ assets/          # 书签、工具和扩展图标资源
│  ├─ components/      # 书签卡片、文件夹、列表和 Popover
│  ├─ entrypoints/     # WXT 新标签页入口
│  ├─ styles/          # 通用样式
│  ├─ utils/           # 浏览器 API 和通用工具
│  └─ views/           # 新标签页视图
└─ src/test/            # node:test 行为测试
```

本项目当前不引入 React，不迁移 TypeScript，也不更换现有 `node:test` 测试框架。
