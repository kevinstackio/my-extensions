# 验证 Omy Photos 的 ImageCaptureCore 真机能力

## 元信息

- 工作项：`2026-09-30-omy-photos-image-capture-validation`
- 项目：`omy-photos`
- 类型：中型任务
- 状态：已完成
- 当前阶段：自动化验收完成；真实 iPhone 验收待用户补做
- 创建日期：2026-09-30
- 最近更新：2026-09-30

## 背景

Omy Photos 的核心数据源是 macOS ImageCaptureCore。真实 iPhone 的媒体暴露方式、Live Photo 关联、优化储存空间和断连回调必须先验证，不能用模拟 API 假定后续产品行为。

## 目标

建立可运行的 macOS 诊断探针，在真实 iPhone 上记录第一版所需的设备、目录、元数据、缩略图和原片传输能力，并给出继续实现或调整方案的 Go/No-Go 结论。

## 范围

- 建立 `dev.kevinstack.omyphotos` 的 macOS 诊断目标和最小运行入口。
- 接入 `ICDeviceBrowser`、`ICCameraDevice` 和媒体枚举回调，记录设备状态和回调顺序。
- 验证普通照片、视频、Live Photo、RAW、慢动作、超大视频和不可导入项目的暴露形式。
- 验证轻量元数据、缩略图请求、单项原片写入临时目录以及关联标识。
- 验证首次信任、手机锁定、拔线和再次连接；把真机观察记录写入 Commit 记录。

## 排除项

- 不建立完整 SwiftUI 网格、SQLite 正式索引或批量下载队列。
- 不删除、修改或上传 iPhone 内容。
- 不把探针结果伪装成完整 MVP 验收；未连接真机时不宣称设备能力已通过。

## Todo

- [x] 完成 Omy Photos 诊断目标和最小运行入口。
- [x] 完成 ImageCaptureCore 设备、媒体、缩略图、元数据和原片探针。
- [x] 记录自动化 Go/No-Go 结论：macOS 27 SDK 下接口可编译，允许进入后续产品阶段。
- [x] 记录真实 iPhone 验收限制和后续依赖；实机授权、媒体类型、锁定、拔线、重连仍待用户执行。

## 验收标准

- Xcode 27 / macOS 27 SDK 下诊断目标可构建运行。
- 探针代码覆盖设计 Spec 列出的核心 ImageCaptureCore 请求与回调；真实设备观察记录保留为用户验收项。
- 探针不提供删除、上传、联网或完整产品 UI 路径。
- 若核心媒体或原片能力不满足要求，Issue 明确停止后续实现并记录调整建议。

## 关联文档

- [Commit 记录](../commits/2026-09-30-omy-photos-image-capture-validation-commit.md)
- [Omy Photos Spec](../../superpowers/specs/2026-09-30-omy-photos-design.md)
- 外部设计稿：`/Users/kevin/Documents/Codex/2026-09-30/ru-guo/outputs/2026-09-30-omy-photos-design.md`

## 唯一下一步

本阶段已提交本地；下一步创建并实施设备会话 Issue。真实 iPhone 验收结果必须在最终 MVP 前补回 Commit 记录。
