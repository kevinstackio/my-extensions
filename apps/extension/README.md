# exts 浏览器扩展

统一 Chrome／Edge 扩展，首批模块为新标签页，保留书签、Dock 和标签组功能。

## 目录职责

- `src/entrypoints/`：WXT 入口；`src/app/`：应用组合和图标配色适配。
- `src/modules/newtab/`：书签数据、类型、业务组件、视图、标签组逻辑及品牌／工具资源。
- `src/shared/ui/`：通用 UI 原语；`src/shared/lib/`：共用工具；`src/shared/browser/`：扩展资源地址工具。
- `src/assets/`：应用图标与公共字体；`src/styles/`：全局样式。
- `tests/modules/newtab/`：数据与标签组行为；`tests/config/`：图标分派、配置资源与体积边界。
- 根 `wxt.config.ts`、`scripts/`、`package.json`：构建与应用配置。

入口组合模块，shared 不导入业务模块。后续功能有独立模块，不预建占位目录。

## 根目录用法

`pnpm ext:dev` 启动 WXT；Chrome／Edge 只加载 `apps/extension/dist/chrome-mv3-dev-stable/`，不能加载会被重建清空的临时目录。

`pnpm ext:build` 生成生产产物 `apps/extension/dist/chrome-mv3/`。包内 `pnpm test`、`pnpm typecheck`、`pnpm check:bundle-size` 负责逻辑与构建验证，不执行视觉或交互验收。

应用图标为透明黑／白 PNG，系统配色偏好在新标签页挂载后同步到工具栏及 favicon。用户自行检查真实浏览器主题效果；扩展 ID 或加载目录变化不保证旧存储自动继承。
