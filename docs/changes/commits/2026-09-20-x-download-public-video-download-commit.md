# 建立 X Download Helper 视频下载执行链路：交付记录

## 元信息

- 工作项：`2026-09-20-x-download-public-video-download`
- 对应 Issue：[建立 X Download Helper 视频下载执行链路](../issues/2026-09-20-x-download-public-video-download-issue.md)
- 状态：已完成
- 用户验收：用户确认保留已完成部分并提交；新的浏览器侧解析方案另行完善
- 最终提交批准：已批准
- 创建日期：2026-09-20
- 最近更新：2026-09-21

## 预期交付边界

- 建立从帖子解析结果到视频下载、合并和桌面落盘的完整执行链路。
- 使用单任务串行队列、临时目录、时间戳文件名和内存地址去重。
- 显示真实主路径状态并移除手动下载按钮。
- 解析或下载失败时保留完整错误，不把未跑通的浏览器 Cookie 方案作为交付能力。
- 不实现完整取消、重试和失败恢复。

## 实际完成内容

- 扩展 Helper 任务状态、规范化地址去重、接收时间和失败保留行为。
- 新增 yt-dlp JSON 解析、固定参数进程执行、临时工作目录、时间戳命名和桌面移动。
- 新增 FIFO 单活动任务协调器；任务收到后自动开始，成功移除、失败保留。
- 接入 Bundle 工具校验和 Helper App 启动 wiring，任务行显示等待、解析、下载、合并、完成和失败状态；保留“移除”按钮，不增加手动下载按钮。
- 失败任务单独显示完整错误详情，支持文本选择和一键复制；同时修正多视频进度显示的索引插值。
- 插件 Native Messaging 协议未改变，仍只传递帖子地址和 `postId`。
- 补充进程、队列、去重、后台阻塞操作和多文件移动回滚等非显然边界的中文注释。

## 验证结果

- `plutil -lint apps/helpers/x-download-helper/XDownloadHelper.xcodeproj/project.pbxproj` 通过。
- `git diff --check` 通过。
- 核心模型、解析器、进程执行器、文件服务和协调器通过 Swift 6 独立类型检查。
- 临时注入假进程验证通过多条目解析、固定最高质量/FFmpeg 参数、FIFO 地址去重、状态流转和桌面落盘。
- 对帖子 `https://x.com/lvmaozhijia/status/2101536546898022893` 执行仅解析诊断，`yt-dlp` 返回退出码 `1` 和 `No video could be found in this tweet`；该 stderr 现在会在 Helper 任务行中完整显示并可复制。
- HAR 验证确认浏览器可播放的目标帖子使用 `video.twimg.com` DASH 音视频分片；当前 yt-dlp 游客解析仍返回 `No video could be found in this tweet`，因此浏览器 Cookie 探测代码不纳入本次交付。
- `xcodebuild test ...` 已运行，但被环境中的 `ObservationMacros.ObservableMacro` malformed response 阻断，未把该环境失败归因于下载业务代码。

## 未验证事项与限制

- 当前帖子尚不能由 Helper 独立解析下载；后续需要由扩展取得完整媒体来源，再交给 Helper 执行下载。
- 尚未完成扩展点击到 Helper 队列、下载和桌面结果的真实端到端验收。
- 完整 XCTest、Xcode Build 和 Helper UI 实际状态刷新仍需在 ObservationMacros 环境恢复后复验。
- 取消、重试、失败删除和断点/部分恢复仍属于后续失败恢复工作项。

## 用户验收

- 结果：通过当前收口范围
- 说明：用户确认保留已完成的下载执行基础并提交，新解析方案先完善设计再继续实现。

## 最终 Commit message

```text
feat(x-download-helper): 建立视频下载队列与失败反馈

- 串行执行帖子解析、视频下载、合并与桌面落盘
- 按规范化帖子地址去重并保留完整失败信息
- 为后续浏览器侧媒体解析保留稳定下载执行基础
```

## 最终提交批准

- 状态：已批准
- 说明：用户在审核最终文件范围、验证结果、限制和 Commit message 后明确批准提交。
