# exts 桌面应用

macOS 原生应用，Bundle Identifier 为 `dev.linguio.exts`，Organization Identifier 为 `dev.linguio`。

## 当前结构

- `src/app/`：ExtsApp 入口与窗口组合。
- `src/modules/media/`：设备会话、媒体索引、缩略图、选择与备份，含模块 UI。
- `src/resources/`：应用 Assets 和已确认的 AppIcon。
- `tests/modules/media/`：现有媒体纯逻辑 XCTest；`tests/scripts/`：desk 入口逻辑测试。
- `project.yml`／`exts.xcodeproj/`：工程配置；`scripts/`：原生构建入口；`dist/`：Release 产物及独立的 `dev/Exts.app` 开发启动包。

当前没有需要跨模块复用的 Swift 能力，故不创建空 shared 目录；后续功能按模块迁入，不将业务混入 app。

## 根目录命令

`pnpm desk:dev` 构建 Debug，发布完整应用到 `apps/desktop/dist/dev/Exts.app` 并打开；重新运行前先退出旧应用，避免 macOS 激活仍在运行的旧进程。`pnpm desk:build` 生成 `apps/desktop/dist/exts.app`。

需要 macOS 27、Xcode 27 和 xcodegen；非 macOS 或缺少工具时明确报错。逻辑入口检查：`node --test apps/desktop/tests/scripts/desk.test.mjs`。

旧下载目录 `~/Downloads/OhMy Photos` 与缩略图缓存 `~/Library/Application Support/OhMy Photos/Thumbnails` 保留以接续已有文件，不自动迁移或删除。新 Bundle Identifier 可能需要重新授权设备或目录。

[当前 Issue](../../docs/changes/issues/2026-10-08-repo-app-foundations-root-commands-issue.md)

## 本轮验证限制

XCTest 27 项中 25 项通过；既有 SQLiteMediaStore 分页 SQL 拼接缺少空格导致两项失败。该实现与归档一致，当前媒体界面尚未使用它；本轮未改业务。真实设备、图标及备份由用户验收。
