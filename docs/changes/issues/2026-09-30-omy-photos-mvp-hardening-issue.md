# 收口 Omy Photos 最小 MVP 稳定性

## 元信息

- 工作项：`2026-09-30-omy-photos-mvp-hardening`
- 项目：`omy-photos`
- 类型：中型任务
- 状态：已完成
- 当前阶段：自动化验收完成；真实 Mac+iPhone 最终验收待用户补做
- 创建日期：2026-09-30
- 最近更新：2026-09-30

## 背景

前五个阶段已经分别保存设备会话、SQLite 索引、缩略图网格和安全下载能力。最后需要补齐失败恢复、压力边界和应用主路径接线，明确哪些结果已由自动化证明，哪些必须由真实 Mac+iPhone 验收。

## 目标

完成不扩展范围的最小 MVP 收口：设备连接后能进入媒体库，媒体可分页浏览、选择并通过安全下载边界落盘；异常状态不会留下错误的可用状态或临时文件。

## 范围

- 增加大图库分页/选择压力测试和设备/下载失败恢复测试。
- 将连接窗口与空媒体库网格、选择状态、下载协调器接入同一最小入口。
- 完成完整构建、Bundle 检查、差异检查和稳定性材料。
- 更新 Spec/Plan/Issue/Commit/Workbench 的最终验收状态与限制。

## 排除项

- 不实现大图预览、视频播放、删除、上传、联网或 App Store 发布。
- 不伪造真实 iPhone、视觉滚动、Instruments 或用户操作结果。
- 不新增第七阶段或额外功能 Issue。

## Todo

- [x] 新增 40 万条选择压力测试，复用锁定/拔线状态机覆盖，并补充下载失败继续、不可用目标目录和临时文件清理测试。
- [x] 按最小改动完成设备媒体目录、月份网格、选择状态和安全下载主路径接线。
- [x] 运行 `scripts/build.sh`、`xcodebuild build-for-testing`、`git diff --check` 和 Bundle 配置检查。
- [x] 记录 XCTest 运行限制、Instruments 与真实 Mac+iPhone 最终验收步骤。

## 验收标准

- 所有前五阶段接口在同一 App 入口可构建连接；无设备时显示连接提示，有媒体时可进入网格。
- 分页、选择、缓存、下载和失败恢复测试目标可编译；完整测试运行限制被明确记录。
- Debug App Bundle 使用 `dev.kevinstack.omyphotos`、macOS 27.0，并链接 ImageCaptureCore/SQLite3。
- 自动化证据与真实设备待验收事项分开记录；未完成用户验收时不宣称长期自用 MVP 已最终通过。

## 关联文档

- [Commit 记录](../commits/2026-09-30-omy-photos-mvp-hardening-commit.md)
- [安全下载 Issue](./2026-09-30-omy-photos-safe-download-issue.md)
- [Omy Photos Spec](../../superpowers/specs/2026-09-30-omy-photos-design.md)
- [Omy Photos Plan](../../superpowers/plans/2026-09-30-omy-photos-mvp.md)

## 唯一下一步

用户回来后按真实 Mac+iPhone 验收清单完成最终设备验证；在此之前不扩展第七阶段功能。
