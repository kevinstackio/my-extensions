# Omy Photos 最小 MVP 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. 六个任务对应六个串行 Issue 阶段；每个任务完成自动化验证后记录阶段结果，再进入下一任务。

**Goal:** 在 macOS 27 上建立一个只读 Omy Photos 原生应用，完成 USB iPhone 媒体浏览、月份选择和安全下载，达到可长期自用的最小 MVP。

**Architecture:** 使用 SwiftUI 负责呈现，ImageCaptureCore 只存在于独立设备层；SQLite 保存轻量媒体索引，缩略图保存到 Application Support 并通过 Actor 调度；选择状态和下载队列与视图解耦。每个阶段交付一条可构建、可测试的垂直能力，阶段之间通过明确的 Swift 接口衔接。

**Tech Stack:** Swift 6.4、SwiftUI、ImageCaptureCore、SQLite3、Xcode 27、macOS 27 SDK；不新增第三方依赖。

**Spec:** `docs/superpowers/specs/2026-09-30-omy-photos-design.md`

## Global Constraints

- 目标系统为 macOS 27，真机验证设备为 iOS 27 iPhone。
- Organization Identifier 为 `dev.kevinstack`，Bundle Identifier 为 `dev.kevinstack.omyphotos`。
- 应用只读、不联网、不删除或修改 iPhone 内容，不实现预览和播放。
- 所有代码注释使用中文；设备回调不能直接修改 SwiftUI 状态。
- SQLite 路径为 `~/Library/Application Support/Omy Photos/library.sqlite`，缩略图位于同目录 `Thumbnails/`。
- 默认下载目录为 `~/Downloads/Omy Photos/`；下载永不覆盖既有文件。
- 首轮参数为分页 200 条、活动缩略图窗口 80 项、缩略图 4 并发、解码缓存 64 MB、下载普通项目最多 2 并发。
- 每个阶段只能有一个活动 Issue；自动化验证通过不等同于真实设备用户验收。

## Review Focus

- 未信任、锁定、拔线和重连的回调顺序不能把设备状态错误显示为已连接；由 Task 1/2 状态机测试覆盖。
- 媒体缺少日期、大小、时长或关联标识时仍必须可索引和稳定排序；由 Task 1/3 元数据测试覆盖。
- 同步中断时不能清理旧索引或缩略图；由 Task 3 同步代次测试覆盖。
- 目标目录已有同名文件、取消或失败时不能覆盖或留下可见伪完整文件；由 Task 5 文件系统测试覆盖。
- 40 万条索引和内存压力下不能把完整数据集载入视图或解码缓存；由 Task 4/6 压力测试覆盖。

## Task 1：ImageCaptureCore 真机技术验证

**Issue:** `2026-09-30-omy-photos-image-capture-validation`

**Files:**

- Create: `apps/desktop/omy-photos/OmyPhotos.xcodeproj/project.pbxproj`
- Create: `apps/desktop/omy-photos/OmyPhotos/Probe/MediaProbe.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/Probe/ProbeEventReducer.swift`
- Create: `apps/desktop/omy-photos/OmyPhotosTests/ProbeEventReducerTests.swift`
- Create: `apps/desktop/omy-photos/scripts/build.sh`

**Interfaces:**

- Produces `ProbeEventReducer.reduce(_:) -> DeviceProbeState` 和 `MediaProbe` 的轻量元数据输出，后续 DeviceSession 只消费已验证的状态边界。

- [ ] 先写 `ProbeEventReducerTests`：覆盖发现、授权、可用、锁定、拔线、重连和未知回调；断言状态不会跳过授权或把拔线保留为可用。
- [ ] 运行 `xcodebuild test -project ... -scheme OmyPhotos -sdk macosx CODE_SIGNING_ALLOWED=NO`，确认测试因实现缺失失败。
- [ ] 实现最小诊断目标、ImageCaptureCore delegate 桥接和临时原片写入，不引入完整产品 UI。
- [ ] 重新运行测试、`scripts/build.sh`，再在真实 iPhone 上记录媒体、缩略图、原片、Live Photo、锁定、拔线和重连结果。
- [ ] 只有核心能力满足 Spec 才把 Issue 记录为可继续；否则记录 Go/No-Go 阻断并停止后续任务。

## Task 2：应用壳与设备会话

**Issue:** `2026-09-30-omy-photos-app-shell-device-session`

**Files:**

- Create: `apps/desktop/omy-photos/OmyPhotos/App/OmyPhotosApp.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/Device/DeviceSession.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/Device/DeviceAuthorizationState.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/UI/ConnectionView.swift`
- Create: `apps/desktop/omy-photos/OmyPhotosTests/DeviceSessionTests.swift`

**Interfaces:**

- Consumes Task 1 的 `DeviceProbeState` 和 ImageCaptureCore 回调边界。
- Produces `DeviceSession.state: DeviceAuthorizationState`、`start()`、`stop()` 和只读设备摘要，后续 Library 通过会话读取媒体流。

- [ ] 先写状态转移测试：未连接、未信任、同步中、可用、锁定、拔出和失败恢复。
- [ ] 运行针对性 XCTest，确认状态机接口尚不存在而失败。
- [ ] 实现 SwiftUI 壳、设备浏览器生命周期和授权说明；delegate 回调通过隔离层发布状态。
- [ ] 运行 XCTest、Debug 构建和 App Bundle 配置检查。
- [ ] 用户验收入口：启动 App、连接并信任 iPhone，确认状态提示和重新连接行为可观察。

## Task 3：本地索引与增量同步

**Issue:** `2026-09-30-omy-photos-library-index-sync`

**Files:**

- Create: `apps/desktop/omy-photos/OmyPhotos/Library/MediaItem.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/Library/MediaGrouping.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/Library/SQLiteMediaStore.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/Library/MediaIndexer.swift`
- Create: `apps/desktop/omy-photos/OmyPhotosTests/MediaGroupingTests.swift`
- Create: `apps/desktop/omy-photos/OmyPhotosTests/SQLiteMediaStoreTests.swift`

**Interfaces:**

- Consumes `DeviceSession` 的媒体元数据流。
- Produces `MediaItem`、`MediaGrouping.monthKey`、`SQLiteMediaStore.page(after:limit:)` 和 `MediaIndexer.sync(generation:)`。

- [ ] 先写日期优先级、未知日期、稳定排序、月份键和分页测试，并写同步中断不清理的测试。
- [ ] 运行测试确认 SQLite Store 和分组实现缺失导致失败。
- [ ] 实现 SQLite schema、索引、200 条分页、同步代次、变化检测和完成后的失效清理。
- [ ] 运行全部 Omy Photos XCTest，并用合成记录验证 40 万条索引分页不把全量数据载入内存。

## Task 4：缩略图与网格浏览

**Issue:** `2026-09-30-omy-photos-thumbnail-grid`

**Files:**

- Create: `apps/desktop/omy-photos/OmyPhotos/Thumbnails/ThumbnailDiskStore.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/Thumbnails/ThumbnailScheduler.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/Thumbnails/DecodedImageCache.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/UI/LibraryView.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/UI/MonthSectionView.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/UI/MediaGridItemView.swift`
- Create: `apps/desktop/omy-photos/OmyPhotosTests/ThumbnailSchedulerTests.swift`

**Interfaces:**

- Consumes `SQLiteMediaStore.page` 和 `MediaIndexer` 的可见项目。
- Produces `ThumbnailScheduler.request(visibleIDs:prefetchIDs:)`、磁盘命中结果和有界解码缓存，供 UI 只读取可见窗口。

- [ ] 先写优先级、4 并发、取消低优先级预取、磁盘复用和 64 MB 缓存上限测试。
- [ ] 运行测试确认调度器和缓存实现缺失导致失败。
- [ ] 实现缩略图落盘、可见窗口队列、快速滚动占位和按月份网格。
- [ ] 运行 XCTest、构建和合成滚动调度压力测试；视觉、焦点和布局由用户实机验收。

## Task 5：选择与安全下载

**Issue:** `2026-09-30-omy-photos-safe-download`

**Files:**

- Create: `apps/desktop/omy-photos/OmyPhotos/Selection/SelectionStore.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/Downloads/FilenameResolver.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/Downloads/DownloadCoordinator.swift`
- Create: `apps/desktop/omy-photos/OmyPhotos/Downloads/DestinationAccess.swift`
- Create: `apps/desktop/omy-photos/OmyPhotosTests/SelectionStoreTests.swift`
- Create: `apps/desktop/omy-photos/OmyPhotosTests/FilenameResolverTests.swift`
- Create: `apps/desktop/omy-photos/OmyPhotosTests/DownloadCoordinatorTests.swift`

**Interfaces:**

- Consumes `MediaItem`、Live Photo 关联信息和 ImageCaptureCore 原片传输接口。
- Produces `SelectionStore` 的单项/月三态操作和 `DownloadCoordinator.enqueue(items:destination:)`。

- [ ] 先写三态选择、同名序号、临时文件清理、原子重命名、失败继续和最多 2 并发测试。
- [ ] 运行测试确认选择、文件名和下载协调器实现缺失导致失败。
- [ ] 实现默认目录、自定义安全作用域书签、Live Photo 关联文件和当前会话重试。
- [ ] 运行 XCTest、构建和临时目录实际文件验收，确认没有覆盖或可见半文件。
- [ ] 用户实机验收照片、视频、同名文件、取消、失败重试和 Live Photo 下载。

## Task 6：稳定性与 MVP 总验收

**Issue:** `2026-09-30-omy-photos-mvp-hardening`

**Files:**

- Create: `apps/desktop/omy-photos/OmyPhotosTests/LargeLibraryStressTests.swift`
- Create: `apps/desktop/omy-photos/OmyPhotosTests/FailureRecoveryTests.swift`
- Modify: `apps/desktop/omy-photos/OmyPhotos/Device/DeviceSession.swift`
- Modify: `apps/desktop/omy-photos/OmyPhotos/Downloads/DownloadCoordinator.swift`
- Modify: `apps/desktop/omy-photos/OmyPhotos/Thumbnails/DecodedImageCache.swift`
- Modify: Issue/Commit/Workbench records for final MVP acceptance.

**Interfaces:**

- Consumes前五个 Task 的稳定接口；不增加新的用户功能范围。
- Produces稳定性指标、异常恢复结果和 MVP 最终验收材料。

- [ ] 先写 40 万条分页/选择压力测试，以及锁定、拔线、权限失效、空间不足和退出恢复测试。
- [ ] 运行压力测试确认边界失败，再按最小改动修复。
- [ ] 运行完整 XCTest、`xcodebuild build`、`git diff --check`，使用 Instruments 记录内存峰值。
- [ ] 用户在真实 Mac+iPhone 上完成从信任、浏览、选择、下载到异常恢复的最终验收。
- [ ] 只有自动化和用户验收均完成，才把第 6 个 Issue 标记为已完成并提交最终 MVP 记录。

## 执行停止点

- Task 1 的真机 Go/No-Go 失败时停止，不继续创建后续产品实现。
- 任一阶段核心自动化验证连续两次以同一原因失败时停止并记录环境限制。
- 用户实机验收未完成时，可以继续做纯逻辑和构建工作，但不得宣称对应用户行为已验收。
