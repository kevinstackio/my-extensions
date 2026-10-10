# exts 桌面应用

macOS 原生应用，正式 Bundle Identifier 为 `dev.linguio.exts`，开发为 `dev.linguio.exts.dev`，Organization Identifier 为 `dev.linguio`。

## 当前结构

- `src/app/`：ExtsApp 入口与窗口组合。
- `src/modules/media/`：设备会话、媒体索引、缩略图、选择与备份，含模块 UI。
- `src/resources/`：应用 Assets 和已确认的 AppIcon。
- `tests/modules/media/`：现有媒体纯逻辑 XCTest；`tests/scripts/`：desk 入口逻辑测试。
- `project.yml`／`exts.xcodeproj/`：工程配置；`scripts/`：原生构建入口；编译缓存集中到根 `dist/.cache/desktop/DerivedData/`。最终应用发布到仓库根 `dist/`。

当前没有需要跨模块复用的 Swift 能力，故不创建空 shared 目录；后续功能按模块迁入，不将业务混入 app。

## 根目录命令

`pnpm desk:dev` 构建 Debug，发布完整应用到根 `dist/dev/exts-dev.app` 并打开；重新运行前先退出旧开发应用，避免 macOS 激活仍在运行的旧进程。`pnpm desk:build` 生成根 `dist/build/exts.app`。两种模式都从根 `package.json` 读取产品版本，构建入口会用 XcodeGen 重新生成工程。

需要 macOS 27、Xcode 27 和 xcodegen；非 macOS 或缺少工具时明确报错。逻辑入口检查：`node --test apps/desktop/tests/scripts/desk.test.mjs`。

正式版保留下载目录 `~/Downloads/OhMy Photos` 与缩略图缓存 `~/Library/Application Support/OhMy Photos/Thumbnails`；开发版分别使用 `~/Downloads/Exts Dev` 和 `~/Library/Application Support/Exts Dev/Thumbnails`。不自动迁移或删除已有文件。不同 Bundle Identifier 的配置独立，开发版可能需要重新授权设备或目录；用户主动选择同一外部目录不保证隔离。

[当前 Issue](../../docs/changes/issues/2026-10-10-repo-unify-build-release-issue.md)

根 `pnpm release` 生成本地正式 DMG；开发只使用 `.app`。完整版本、产物及数据隔离规则见 [构建与分发规范](../../docs/build-release.md)。

## 本轮验证限制

XCTest 27 项中 25 项通过；既有 SQLiteMediaStore 分页 SQL 拼接缺少空格导致两项失败。该实现与归档一致，当前媒体界面尚未使用它；本轮未改业务。真实设备、图标及备份由用户验收。
