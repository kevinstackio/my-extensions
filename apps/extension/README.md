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

`pnpm ext:dev` 启动 WXT；Chrome／Edge 只加载根 `dist/dev/chrome-mv3-dev-stable/`，不能加载会被重建清空的根 `dist/.cache/extension/chrome-mv3-dev/` 临时目录。应用内部不再生成 dist；修改路径后停止并重新启动旧开发进程。

`pnpm ext:build` 生成根 `dist/build/chrome-mv3/`。Manifest 产品版本由根 `scripts/version.mjs` 读取根 `package.json` 的 `version`，不在子项目维护。包内 `pnpm test`、`pnpm typecheck`、`pnpm check:bundle-size` 负责逻辑与构建验证，不执行视觉或交互验收。

应用图标为透明黑／白 PNG，系统配色偏好在新标签页挂载后同步到工具栏及 favicon。用户自行检查真实浏览器主题效果；扩展 ID 或加载目录变化不保证旧存储自动继承。

`pnpm ext:release` 独立构建扩展并生成根 `dist/release/exts-chrome-<版本>.zip`，不构建网站或桌面；ZIP 解压后可在 Chrome 扩展管理页开启开发者模式并加载解压目录。根 `pnpm release` 仍用于后续完整 macOS 分发。首版通过手动 GitHub Actions 生成 `v1.0.0` Tag 和仅含 Chrome ZIP 的 Release 草稿，用户验收后公开。完整版本、产物和稳定目录规则见 [构建与分发规范](../../docs/build-release.md)。
