# 建立 Omy Photos 本地媒体索引与增量同步

## 元信息

- 工作项：`2026-09-30-omy-photos-library-index-sync`
- 项目：`omy-photos`
- 类型：中型任务
- 状态：已完成
- 当前阶段：自动化验收完成；真实 iPhone 增量同步验收待用户补做
- 创建日期：2026-09-30
- 最近更新：2026-09-30

## 背景

设备会话已经有稳定的连接状态，但大图库不能由 SwiftUI 直接持有 ImageCaptureCore 的全量对象。需要把轻量元数据持久化到本地 SQLite，并通过分页和同步代次控制内存与断线恢复。

## 目标

建立可分页、可增量更新、可在同步中断后继续的本地媒体索引，为缩略图网格提供稳定的 `MediaItem` 流。

## 范围

- 定义 `MediaItem` 轻量字段、日期优先级和稳定排序。
- 实现月份键与未知日期分组。
- 实现 SQLite schema、唯一媒体标识、分页查询和同步代次。
- 实现同步完成后的失效记录清理；中断时保留上一份有效索引。

## 排除项

- 不写入缩略图二进制、不实现 UI 网格或下载队列。
- 不保存永久下载状态，不计算 SHA-256，不做内容去重。
- 不把未连接真实 iPhone 的分页结果写成实机大图库验收。

## Todo

- [x] 先写日期优先级、未知日期、稳定排序、月份键、分页和中断同步测试。
- [x] 实现 SQLite 媒体存储与增量索引器。
- [x] 增加 40 万条合成记录分页测试，断言单页最多返回 200 条。
- [x] 记录真实 iPhone 增量同步与断线恢复的待验收步骤。

## 验收标准

- 缺少拍摄日期时仍能用可预测的修改日期或未知分组稳定排序。
- `page(after:limit:)` 只返回请求页，默认页大小为 200。
- 同步未完成时不清理上一代记录；同步完成后才删除失效代次。
- Xcode 27 / macOS 27 SDK 下应用与测试目标可构建。
- 40 万条合成记录只请求一页时返回 200 条，不要求把全量结果交给调用方。

## 关联文档

- [Commit 记录](../commits/2026-09-30-omy-photos-library-index-sync-commit.md)
- [设备会话 Issue](./2026-09-30-omy-photos-app-shell-device-session-issue.md)
- [Omy Photos Spec](../../superpowers/specs/2026-09-30-omy-photos-design.md)
- [Omy Photos Plan](../../superpowers/plans/2026-09-30-omy-photos-mvp.md)

## 唯一下一步

先用失败测试固定媒体日期、排序、分页和同步代次边界，再实现 SQLite 存储。
