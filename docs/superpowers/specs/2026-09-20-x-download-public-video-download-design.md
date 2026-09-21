# X Download Helper 视频下载执行链路设计

## 元信息

本 Spec 描述的帖子 URL 解析执行链路属于历史实现；后续 `2026-09-21-x-download-media-source-only-download` Issue 已明确移除该路径，当前下载只接受扩展提供的完整媒体来源。

- 工作项：`2026-09-20-x-download-public-video-download`
- 对应 Issue：[`建立 X Download Helper 视频下载执行链路`](../../changes/issues/2026-09-20-x-download-public-video-download-issue.md)
- 状态：已批准
- 日期：2026-09-20
- 目标平台：当前 Apple Silicon Mac、macOS 14 及以上
- Helper Bundle Identifier：`dev.kevinstack.xdownloadhelper`

## 目标与边界

本工作项把已打包的 yt-dlp、FFmpeg 接入 Helper 的下载执行链路。扩展继续只负责传递规范化帖子地址和 `postId`；Helper 负责排队、尝试解析、下载、合并、桌面落盘和完整失败反馈。

只覆盖 yt-dlp 能返回视频条目的公开 X 单帖。浏览器中可播放但游客解析拿不到媒体的帖子，不在本工作项内读取浏览器数据库解决；失败任务保留在当前内存列表，但不提供重试、取消或恢复操作。

## 方案选择

### 方案 A：单次 yt-dlp 调用直接下载帖子

让 yt-dlp 自己处理帖子中的所有条目，并用输出模板生成文件。实现最短，但 Helper 难以可靠地把每个视频和任务状态对应起来，也无法在临时目录中明确确认全部文件已完成后再落盘。

### 方案 B：先解析，再按条目串行下载（采用）

先执行一次 `--dump-single-json --skip-download` 得到帖子条目；随后按返回顺序为每个条目执行一次下载。每次下载使用独立的临时输出名，yt-dlp 负责选择最高可用质量并调用 FFmpeg 合并。全部条目成功后再一次性进入桌面落盘阶段。

采用原因：视频顺序、文件名、状态和失败边界都由 Helper 明确掌控，同时仍复用 yt-dlp 对 X 格式和最高质量选择的支持。

### 方案 C：从浏览器页面会话解析 X 媒体

本工作项不采用。真实 HAR 已确认目标帖子通过浏览器会话加载 DASH 分片，而 yt-dlp 游客解析无法取得媒体；浏览器侧解析需要新的扩展权限、消息字段和媒体来源模型，作为后续独立方案完善。

## 核心模型与状态

`DownloadTask` 保留规范化帖子地址、`postId`、接收时间和当前状态。状态覆盖：

- `queued`：已进入内存队列，等待前序任务完成。
- `parsing`：正在解析帖子中的视频条目。
- `downloading(index,total)`：正在下载第几个视频。
- `merging(index,total)`：yt-dlp/FFmpeg 正在完成当前视频的合并或封装。
- `completed`：全部文件已移动到桌面，随后从内存任务列表移除。
- `failed(message)`：主路径失败，保留任务和简短错误信息。

状态只由 Helper 的下载协调器更新；扩展协议不增加进度消息。

## 队列与去重

- `DownloadTaskStore` 仍是 `@MainActor` 的 UI 状态源，并注入一个下载协调器。
- 协调器只允许一个活动帖子任务；多个帖子按 FIFO 顺序处理。
- 去重键是规范化帖子地址。地址已在请求处理器中完成 X 单帖格式校验；同一地址已存在时只返回现有任务，不再启动新进程。
- 成功移动到桌面后才从内存移除；失败任务不自动移除、不自动重试。
- 不检查桌面既有文件、不维护下载历史，也不把桌面扫描结果用于去重。

## 工具调用边界

所有调用使用 `Process.executableURL` 和参数数组，不执行 Shell，不读取用户配置或系统 PATH。工具路径来自前置工作项的 `VideoToolValidator`。

解析调用的固定语义：

```text
yt-dlp
  --ignore-config --no-update --no-warnings
  --dump-single-json --skip-download
  <规范化帖子地址>
```

解析结果支持单条目和 `entries` 两种 JSON 形态；空条目视为基础失败。每个条目只接受 yt-dlp 返回的 URL（优先 `webpage_url`，其次 `original_url`，最后使用 `url` 作为媒体直链），不接受帖子元数据提供的输出路径。

单个视频下载使用：

```text
yt-dlp
  --ignore-config --no-update --no-warnings --newline
  --format "bestvideo*+bestaudio/best"
  --merge-output-format mp4
  --ffmpeg-location <Bundle 内 Tools 目录>
  --output <任务临时目录>/<顺序号>.%(ext)s
  <条目 URL>
```

不主动转码、不写入信息文件或缩略图。下载器输出仅作为过程信息；成功判断以进程退出码和临时目录中的视频结果为准。当前实现不读取 Chrome/Edge Cookie 数据库；解析失败时直接保留 yt-dlp 的 stderr，供用户选择和复制。

## 文件与桌面落盘

- 每个帖子创建唯一临时工作目录，目录只保存该任务的中间文件和最终 mp4。
- 接收任务时生成本地时间戳，基名为 `X_VIDEO_yyyyMMdd_HHmmss`。
- 单视频目标为 `X_VIDEO_yyyyMMdd_HHmmss.mp4`；多视频按解析顺序追加 `_01`、`_02` 等。
- 全部视频成功后，按顺序把临时结果移动到桌面目录。桌面已有同名文件不预检查、不覆盖；移动失败进入 `failed`。
- 成功或失败收尾都清理临时工作目录；失败不留下可被第三个 Issue 当作可恢复状态的半成品。

## 测试与验收边界

自动化测试使用注入的进程执行器和临时文件系统，不访问真实 X、不依赖网络、不下载真实视频。至少覆盖：

- 解析单条目和多条目 JSON；空条目与无 URL 失败。
- FIFO 串行执行、规范化地址去重、成功移除和失败保留。
- 最高质量/FFmpeg 参数、临时输出名和多视频目标名。
- 全部成功后才移动到桌面；进程失败、合并失败、桌面移动失败进入基础失败。
- Helper 现有请求协议和 UI 状态仍可正常更新。

不新增截图、布局尺寸、Popover、焦点、指针或键盘自动化测试；macOS Helper 实际下载和桌面结果由用户在阶段验收时确认。

## 后续工作边界

后续先完善“扩展从当前 X 页面会话取得完整媒体来源、Helper 只负责下载”的新设计，再决定消息协议和实现步骤。取消、重试、部分成功恢复和断点续传继续保留在失败恢复工作项，不在本工作项提前实现。
