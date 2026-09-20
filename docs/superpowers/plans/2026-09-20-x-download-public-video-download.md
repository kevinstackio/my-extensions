# X Download Helper 视频下载执行链路 Implementation Plan

> **For agentic workers:** 本仓库禁止子代理、并行任务和阶段性 Git Commit；所有步骤串行执行，最终只申请一次交付 Commit。每个实现任务先写失败测试，再写最小生产代码。

**Goal:** 将 Helper 收到的 X 帖子地址接入串行任务、yt-dlp 解析、最高画质下载、FFmpeg 合并和桌面落盘，并完整反馈不能解析或下载的真实错误。

**Architecture:** `DownloadTaskStore` 保存 UI 可观察任务和规范化地址去重；`VideoDownloadCoordinator` 管理 FIFO 单任务执行；`VideoPostParser` 负责 yt-dlp JSON；`VideoProcessRunner` 负责固定工具参数；`VideoDownloadFileStore` 负责临时目录、命名和桌面移动。进程执行器和文件系统均可注入测试。

**Tech Stack:** Swift 6、Foundation `Process`、Observation、SwiftUI、XCTest、固定 Bundle 工具。

**Spec:** `docs/superpowers/specs/2026-09-20-x-download-public-video-download-design.md`

## Global Constraints

- 只处理 yt-dlp 能返回条目的公开 X 单帖视频；不处理图片、私密、付费或受限内容。
- 只运行 Bundle 内固定版本 yt-dlp 和 FFmpeg；不读取用户配置、不搜索 PATH、不执行 Shell，也不读取浏览器 Cookie 数据库。
- 一个帖子任务内的视频按解析顺序处理；所有帖子任务 FIFO 串行，禁止并行下载。
- 成功移动到桌面后才从内存移除；失败任务留在列表，取消/重试/恢复留给第三个 Issue。
- 不检查桌面既有文件、不维护历史去重、不主动转码、不执行真实网络自动化测试。
- 所有新增代码注释使用中文；不新增视觉、布局、焦点、指针或键盘测试。

## Review Focus

- 解析、下载和文件移动的错误必须保留真实 stderr 或结构化错误，不用成功状态掩盖失败。
- 队列必须保持单活动任务；一个任务失败后，后续等待任务仍能继续。
- 成功任务完成桌面落盘后才从内存移除；失败任务保留以便用户复制详情。

## Task 1: 扩展任务状态与地址去重测试

**Files:**
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Models/DownloadTask.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/State/DownloadTaskStore.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelperTests/DownloadTaskStoreTests.swift`

- [x] 先新增失败 XCTest：queued/parsing/downloading/merging/completed/failed 状态可表达；同一规范化地址不重复；不同任务保留 FIFO；成功移除、失败保留。
- [x] 运行目标 XCTest；执行被既有 ObservationMacros 环境错误阻断，已改用独立 Swift 6 类型检查。
- [x] 扩展状态模型和任务初始化，保持已有请求处理器的同步 enqueue API。
- [x] 让 Store 暴露由协调器更新状态的最小主线程边界，去重键改为规范化地址，不引入持久化。
- [x] 独立类型检查和协调器假进程验证通过。

## Task 2: 解析与进程参数边界

**Files:**
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Models/VideoPost.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Services/VideoPostParser.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Services/VideoProcessRunner.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelperTests/VideoPostParserTests.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelperTests/VideoProcessRunnerTests.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper.xcodeproj/project.pbxproj`

- [x] 先写失败测试：解析单条 JSON、多条 `entries`、空列表、缺少可提取 URL；校验解析参数和下载参数包含固定工具开关、最高质量、FFmpeg 目录和临时输出模板。
- [x] 运行新增 XCTest；执行被既有 ObservationMacros 环境错误阻断。
- [x] 实现可注入 `Process` 执行器；JSON 只读取 yt-dlp 返回的可提取 URL。
- [x] 实现解析调用和单视频调用，记录 stdout/stderr、退出码和输出文件候选，不拼接 Shell 字符串。
- [x] 独立 Swift 6 类型检查和注入假进程参数验证通过。

## Task 3: 临时目录、命名和桌面落盘

**Files:**
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Services/VideoDownloadFileStore.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelperTests/VideoDownloadFileStoreTests.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper.xcodeproj/project.pbxproj`

- [x] 先写失败 XCTest：创建任务临时目录；单视频和多视频命名；只接受生成的 mp4；全部成功后移动到桌面；移动失败返回结构化错误且不覆盖既有文件。
- [x] 运行新增 XCTest；执行被既有 ObservationMacros 环境错误阻断。
- [x] 实现 `FileManager` 注入、任务时间戳基名和顺序号命名；不扫描桌面、不预检查同名文件。
- [x] 实现临时目录清理和成功移动；失败只返回错误，不构造恢复队列。
- [x] 独立 Swift 6 类型检查和临时目录假进程验证通过。

## Task 4: 串行协调器和 Store/App 接入

**Files:**
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Services/VideoDownloadCoordinator.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelperTests/VideoDownloadCoordinatorTests.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/State/DownloadTaskStore.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/App/AppDelegate.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper.xcodeproj/project.pbxproj`

- [x] 先写失败 XCTest：单任务自动启动；多任务 FIFO；同一地址不启动第二次；状态按解析/下载/合并/完成推进；任一失败停止当前任务并保留失败状态，后续任务继续。
- [x] 运行新增 XCTest；执行被既有 ObservationMacros 环境错误阻断。
- [x] 实现单活动任务协调器，使用异步任务执行进程但将状态回写主 Actor；成功后调用文件服务并从 Store 移除。
- [x] 在 AppDelegate 组装 Bundle 工具校验、进程执行器、解析器、文件服务和协调器；Helper 启动后无需额外用户动作。
- [x] 独立协调器假进程验证 FIFO 和成功落盘通过。

## Task 5: UI 状态和请求路径

**Files:**
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Views/DownloadTaskRow.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/State/DownloadTaskStore.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelperTests/HelperRequestHandlerTests.swift`

- [x] 先补失败测试：请求成功后任务立即进入 queued，重复请求返回 existing；状态文本覆盖主路径和基础失败。
- [x] 更新行视图显示状态和失败信息；保持现有“移除”按钮作为列表清理入口，不增加手动“下载”按钮。
- [x] 确认 `HelperRequestHandler` 只传递任务，不承担下载逻辑，重复请求只展开现有 Popover。
- [x] 完成静态检查；请求处理器 XCTest 仍受 ObservationMacros 环境错误阻断。

## Task 6: 完整验证与阶段验收

**Files:**
- Modify: `docs/changes/issues/2026-09-20-x-download-public-video-download-issue.md`
- Modify: `docs/changes/commits/2026-09-20-x-download-public-video-download-commit.md`

- [x] 串行运行新增 XCTest、现有 Helper XCTest、`xcodebuild build`、`git diff --check`；Xcode 验证被既有 ObservationMacros 插件错误阻断。
- [x] 检查参数中没有 Cookie、系统工具路径、Shell 拼接或并行进程；检查生成产物未进入 Git。
- [x] 记录真实帖子解析失败和 HAR 媒体分片证据，按用户决定保留已完成执行基础。
- [x] 更新 Issue/Commit 记录为实际收口结果，等待最终 Git Commit 审核。

## 方案调整记录：撤回 Chrome/Edge Cookie 探测

曾尝试通过 `--cookies-from-browser chrome|edge` 让 Helper 借用登录态。真实诊断确认默认浏览器数据库不可访问，而游客解析仍无法识别目标帖子；继续保留该实现会把未经端到端验证的能力混入交付。

本次提交移除浏览器来源模型、参数注入及对应假进程测试，只保留已经验证的下载执行链路。后续设计改为优先评估扩展从当前 X 页面会话取得完整媒体来源，再交给 Helper 下载，不在本 Plan 中提前定义协议或实现细节。
