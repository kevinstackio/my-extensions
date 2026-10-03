# 建立 Omy Photos 应用壳与设备会话

## 元信息

- 工作项：`2026-09-30-omy-photos-app-shell-device-session`
- 项目：`omy-photos`
- 类型：中型任务
- 状态：已完成
- 当前阶段：自动化验收完成；真实 iPhone 会话验收待用户补做
- 创建日期：2026-09-30
- 最近更新：2026-09-30

## 背景

第 1 阶段已经确认 ImageCaptureCore 的 macOS 27 SDK 接口可编译。现在需要把设备发现、信任、锁定、同步、拔出和失败恢复收敛为可供后续媒体库消费的会话接口，避免 SwiftUI 直接持有 ImageCaptureCore delegate 状态。

## 目标

建立可观察的 SwiftUI 应用壳和单设备会话对象，为后续 SQLite 索引提供稳定的设备状态与媒体来源入口。

## 范围

- 建立 `DeviceAuthorizationState` 状态模型和状态转移规则。
- 建立 `DeviceSession`，管理 `ICDeviceBrowser`、当前 iPhone 会话和只读设备摘要。
- 提供连接状态、授权提示、锁定和重新连接的最小窗口视图。
- 保留 ImageCaptureCore 的设备层边界，不在视图层直接调用 delegate。

## 排除项

- 不建立 SQLite 正式索引、缩略图缓存或下载队列。
- 不实现媒体网格、月份选择或真实下载按钮。
- 不宣称未连接真实 iPhone 时的视觉与交互验收已经通过。

## Todo

- [x] 先写状态转移测试，覆盖未连接、未信任、同步中、可用、锁定、拔出和失败恢复。
- [x] 实现会话对象、设备生命周期和 SwiftUI 连接视图。
- [x] 运行测试目标编译、Debug 构建和 Bundle 配置检查。
- [x] 记录真实 iPhone 连接、信任、锁定、拔出和重连的待验收步骤。

## 验收标准

- `DeviceSession.state` 能稳定表达设备生命周期，并在拔出后不保留可用状态。
- App 启动后可以展示当前连接状态和下一步授权提示。
- Xcode 27 / macOS 27 SDK 下 App 与测试目标可构建。
- 所有未连接真实 iPhone 的事项明确记录为待用户验收；不把自动化结果写成实机通过。

## 关联文档

- [Commit 记录](../commits/2026-09-30-omy-photos-app-shell-device-session-commit.md)
- [ImageCaptureCore 阶段 Issue](./2026-09-30-omy-photos-image-capture-validation-issue.md)
- [Omy Photos Spec](../../superpowers/specs/2026-09-30-omy-photos-design.md)
- [Omy Photos Plan](../../superpowers/plans/2026-09-30-omy-photos-mvp.md)

## 唯一下一步

本阶段已提交本地；下一步建立 SQLite 媒体索引 Issue。真实 iPhone 会话结果必须在最终 MVP 前补回 Commit 记录。
