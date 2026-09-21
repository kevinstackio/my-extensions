# 撰写 X Download 开发复盘与技术文章

## 元信息

- 工作项：`2026-09-21-x-download-development-retrospective`
- 项目：`x-download`
- 类型：中型任务
- 状态：已完成
- 当前阶段：两篇文章已通过用户验收并完成最终交付
- 创建日期：2026-09-21
- 最近更新：2026-09-21

## 背景

X Download 已完成从单帖识别、macOS 菜单栏 Helper、Native Messaging、固定下载工具链，到页面媒体来源捕获、分阶段进度和临时文件清理的完整开发过程。现有 Issue、Spec、Plan 和 Commit 记录能够还原事实，但内容按实施阶段分散，不适合作为完整复盘或公开技术文章阅读。

## 目标

在 `docs/` 下分别形成一篇内部详细开发复盘和一篇面向公开阅读的技术文章，完整说明 X Download 的架构、开发时间线、中间弯路、关键技术决策、最终结果、现有限制和可复用经验。

## 范围

- 以仓库内 Issue、Commit、Spec、Plan、Git 历史和当前实现为事实来源。
- 编写内部详细复盘，保留工作项演进、失败路径、验证边界和遗留问题。
- 编写公开技术文章，以问题、架构、关键转折和工程经验为主线，减少项目管理细节。
- 两篇文章共享事实但不机械复制，分别服务于项目追溯和对外阅读。
- 校验文档链接、术语、技术描述和 Markdown 格式。

## 排除项

- 不修改 X Download 扩展、Native Host 或 Helper 业务代码。
- 不改变现有架构、协议、下载行为或测试。
- 不接入 VitePress 导航、侧边栏、主题或部署。
- 不补写尚未发生的功能、测试结果或用户验收事实。
- 不在本工作项中实现失败恢复、取消、重试或持久化任务。

## Todo

- [x] 梳理 X Download 从初始想法到最终媒体来源下载链路的时间线。
- [x] 撰写内部详细开发复盘。
- [x] 撰写面向公开阅读的技术文章。
- [x] 核对两篇文章与当前代码、历史文档和 Git 提交的一致性。
- [x] 完成 Markdown 与链接检查后交由用户验收。

## 验收标准

- 内部复盘能够按时间线解释每个主要阶段、关键决策、失败路径和验证结果。
- 公开文章无需阅读项目 Issue 也能理解扩展、Native Host、Helper、`yt-dlp` 和 FFmpeg 的职责。
- 明确记录帖子 URL 解析失败、页面媒体来源方案形成及其技术原因。
- 准确描述 `video.twimg.com`、HLS、DASH、MP4、`blob:` 和 `.m4s` 在方案中的区别。
- 最终架构、下载目录、进度状态、临时文件清理和已知限制与当前实现一致。
- 两篇文章没有把自动化验证、用户验收或环境限制混写为同一结论。

## 关联文档

- [Commit 记录](../commits/2026-09-21-x-download-development-retrospective-commit.md)
- [内部详细开发复盘](../../retrospectives/x-download-development-retrospective.md)
- [公开技术文章](../../articles/x-download-from-extension-to-helper.md)
- [页面媒体来源下载 Issue](./2026-09-21-x-download-page-media-source-issue.md)
- [仅使用页面媒体来源下载 Issue](./2026-09-21-x-download-media-source-only-download-issue.md)

## 唯一下一步

当前工作项已经完成，无后续操作。
