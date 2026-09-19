# X Download 扩展与 macOS Helper 通信 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Repository rules prohibit subagents, parallel commands, intermediate commits and visual interaction automation; execute serially and stop for user acceptance before the single final Commit.

**Goal:** 用户点击 X Download 工具栏图标后，扩展通过 Native Messaging 和本机 Unix Domain Socket 将有效 X 单帖任务交给 macOS Helper，Helper 自动启动、接收去重任务并展开菜单栏列表。

**Architecture:** WXT Popup 负责状态反馈，Background 复用现有帖子 URL 解析并发起一次性 Native Messaging 请求；独立 Swift 命令行 Bridge 处理浏览器帧、启动 Helper 并转发到用户级 Unix Domain Socket；Helper 在 Main Actor 更新内存任务和菜单栏 Popover。通信层不解析媒体、不执行下载、不持久化任务。

**Tech Stack:** Node.js `24.16.0`、pnpm `12.4.2`、WXT `0.21.4`、TypeScript `7.0.2`、Vitest `5.0.0`、Xcode 27、Swift 6、SwiftUI、AppKit、Observation、XCTest、zsh。

**Spec:** `docs/superpowers/specs/2026-09-20-x-download-native-messaging-design.md`

## Global Constraints

- 扩展目录固定为 `apps/extensions/x-download`，Helper 目录固定为 `apps/helpers/x-download-helper`。
- 目标浏览器是 Chrome 和 Edge；浏览器只加载 WXT 稳定开发目录 `dist/chrome-mv3-dev-stable`。
- 最低系统版本为 macOS 14；Organization Identifier 为 `dev.kevinstack`。
- Helper Bundle Identifier 为 `dev.kevinstack.xdownloadhelper`；Native Host Bundle Identifier 和 Host Name 均为 `dev.kevinstack.xdownloadhelper.nativehost`。
- 不新增第三方依赖；所有依赖保持现有精确版本。
- 只支持当前开发者 Mac 的本地注册，不实现签名、公证、DMG、商店发布或生产安装器。
- 不接入 yt-dlp、ffmpeg、X API、Cookie、网络下载、文件写入、任务持久化或系统通知。
- Popup 不提供安装引导、安装步骤、下载链接或“重新检测”；唯一入口保持工具栏图标。
- 所有代码注释使用中文，只解释非显然的协议、生命周期和安全边界。
- 不新增视觉、布局、Popover、Popup、焦点、指针、键盘或截图自动化测试。
- 所有命令串行执行；不得启动子代理、并行任务、长期 watch 进程或执行中间 Git Commit。

## Review Focus

- Native Messaging 输入可能分段到达或声明错误长度；Task 2 的帧测试必须证明读取逻辑能处理短读、截断、超限和多字节 UTF-8。
- Host 已注册但 Helper 尚未完成启动；Task 2 的连接测试必须证明限定时间内重试，超时稳定返回 `HELPER_START_TIMEOUT`。
- 失效 Socket 文件可能残留；Task 3 的 Server 测试必须证明只清理不可连接的当前用户 Socket，不覆盖活跃监听器。
- 相同帖子可能连续或并发到达；Task 3 的 Store 测试必须证明 Main Actor 下只保留一个 `postId`，并返回同一任务 ID。
- Popup 可能在请求中被关闭；Task 4 的 Background 测试必须证明请求生命周期不依赖 Popup 存活，Helper 已接收的任务不会撤销。

---

### Task 1: 固化跨语言协议与扩展侧纯逻辑

**Files:**

- Create: `apps/extensions/x-download/src/features/native-messaging/protocol.ts`
- Create: `apps/extensions/x-download/src/features/native-messaging/client.ts`
- Create: `apps/extensions/x-download/src/features/native-messaging/popup-state.ts`
- Create: `apps/extensions/x-download/tests/native-messaging.test.ts`
- Create: `apps/extensions/x-download/tests/popup-state.test.ts`

**Interfaces:**

- Produces: `NATIVE_HOST_NAME = 'dev.kevinstack.xdownloadhelper.nativehost'` and `PROTOCOL_VERSION = 1`。
- Produces: `createEnqueueRequest(target: XPostTarget, requestId: string): EnqueueRequest`。
- Produces: `parseNativeResponse(value: unknown, requestId: string): EnqueueResult`，只接受匹配版本、请求 ID 和响应联合类型。
- Produces: `classifyNativeFailure(error: unknown): 'helperMissing' | 'connectionFailed'`。
- Produces: `PopupState = 'checking' | 'invalidPage' | 'helperMissing' | 'connectionFailed' | 'accepted'`。

- [x] **Step 1:** 编写失败测试，固定 `task.enqueue` 请求字段、`created`/`existing` 成功响应、六个 Spec 错误码、版本不符、请求 ID 不符、未知形状和 Host 缺失错误映射。
- [x] **Step 2:** 运行扩展针对性测试，确认先因模块不存在失败，再在实现后通过。
- [x] **Step 3:** 实现最小协议类型、运行时响应校验和 Popup 状态映射；协议模块不得导入浏览器 API，Client 通过注入的发送函数保持可测试。
- [x] **Step 4:** 重跑 Task 1 测试，确认所有成功和拒绝分支通过。
- [x] **Step 5:** 运行扩展 typecheck，确认类型定义没有宽泛 `any` 或未处理联合分支。
- [ ] **Stop point:** 只完成扩展侧纯协议逻辑；不声明权限、不创建 Popup、不调用真实 Native Messaging。

### Task 2: 建立可测试的 Native Host Bridge 与 App Bundle 打包

**Files:**

- Modify: `apps/helpers/x-download-helper/XDownloadHelper.xcodeproj/project.pbxproj`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper.xcodeproj/xcshareddata/xcschemes/XDownloadHelper.xcscheme`
- Create: `apps/helpers/x-download-helper/Shared/Communication/NativeMessage.swift`
- Create: `apps/helpers/x-download-helper/Shared/Communication/LocalSocketLocation.swift`
- Create: `apps/helpers/x-download-helper/XDownloadNativeHost/main.swift`
- Create: `apps/helpers/x-download-helper/XDownloadNativeHost/NativeMessagingFrameIO.swift`
- Create: `apps/helpers/x-download-helper/XDownloadNativeHost/HelperConnection.swift`
- Create: `apps/helpers/x-download-helper/XDownloadNativeHost/HelperLauncher.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelperTests/NativeMessagingFrameIOTests.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelperTests/NativeHostBridgeTests.swift`
- Modify: `apps/helpers/x-download-helper/Tests/PackagingTests/verify_app_bundle.sh`

**Interfaces:**

- Produces: shared `NativeMessageRequest`、`NativeMessageResponse`、`NativeMessageErrorCode` Codable types matching Task 1 wire keys exactly。
- Produces: `NativeMessagingFrameReader.readMessage(from: FileHandle, maximumBytes: Int) throws -> Data` and `NativeMessagingFrameWriter.writeMessage(_:to:) throws`。
- Produces: `HelperConnection.send(_:socketURL:timeout:) async throws -> NativeMessageResponse`。
- Produces: `HelperLauncher.launchHelper(relativeToHostExecutable:) throws`，只定位同一 App Bundle，不搜索任意应用路径。
- Produces: Xcode Target `XDownloadNativeHost`，产物位于 `X Download Helper.app/Contents/Helpers/x-download-native-host`。

- [x] **Step 1:** 扩展 App Bundle 配置测试，先断言 Native Host Target、`dev.kevinstack.xdownloadhelper.nativehost`、嵌入路径和可执行权限；运行现有打包脚本确认新增断言失败。
- [x] **Step 2:** 编写帧失败测试，覆盖分段读取、空消息、截断长度、超过项目上限、UTF-8 字节长度和 writer 的小端长度前缀。
- [ ] **Step 3:** 编写 Bridge 失败测试，使用临时 Unix Socket 替身覆盖成功转发、Helper 启动后重试、连接超时、非法 Origin、Helper 无响应和 `stderr`/`stdout` 边界。
- [ ] **Step 4:** 运行 `xcodebuild test -project apps/helpers/x-download-helper/XDownloadHelper.xcodeproj -scheme XDownloadHelper -destination 'platform=macOS' -derivedDataPath apps/helpers/x-download-helper/.build CODE_SIGNING_ALLOWED=NO -only-testing:XDownloadHelperTests/NativeMessagingFrameIOTests -only-testing:XDownloadHelperTests/NativeHostBridgeTests`，确认测试因实现缺失而失败。
- [x] **Step 5:** 创建 Command Line Tool Target、共享协议和最小 Bridge；Host 每次只读取一条消息、返回一条响应并退出，任何日志只写 `stderr`。
- [ ] **Step 6:** 重跑 Task 2 针对性 XCTest，确认帧、来源、启动、转发和超时分支全部通过。
- [x] **Step 7:** 运行 Native Host Target 构建和注册脚本校验；完整 App Bundle XCTest 受本机 Observation 宏环境阻断。
- [ ] **Stop point:** Bridge 能和测试 Socket 往返；尚未修改 Helper Store、菜单栏或浏览器 Manifest。

### Task 3: 接入 Helper Socket、已接收任务和 Popover 展开

**Files:**

- Create: `apps/helpers/x-download-helper/XDownloadHelper/Communication/HelperSocketServer.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Communication/HelperRequestHandler.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/App/AppDelegate.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/MenuBar/MenuBarController.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Models/DownloadTask.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/State/DownloadTaskStore.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Views/DownloadTaskRow.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelperTests/DownloadTaskStoreTests.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelperTests/HelperRequestHandlerTests.swift`

**Interfaces:**

- Produces: `DownloadTaskState.received` and task fields `id`、`postId`、`postURL`、`state`；删除静态文件名、路径、进度和模拟等待职责。
- Produces: `@MainActor func enqueue(postId: String, postURL: URL) -> EnqueueResult`，返回 `created` 或 `existing` 及稳定任务 ID。
- Produces: `HelperRequestHandler.handle(_:) async -> NativeMessageResponse`，在进入 Store 前重新验证版本、类型、URL 和帖子 ID。
- Produces: `HelperSocketServer.start()` and `stop()`，只监听当前用户专属 Socket。
- Produces: `MenuBarController.showPopover()`，状态栏完成初始化后可由通信处理器安全调用。

- [x] **Step 1:** 重写 Store 失败测试，固定空初始列表、首次入队、重复 `postId` 返回同一 ID、不同帖子独立、移除和连续入队行为；删除只服务于五秒模拟下载的旧测试。
- [ ] **Step 2:** 编写 Handler 失败测试，覆盖合法请求、非法版本、未知类型、非 HTTPS、非 X 主机、非单帖路径、非数字 ID、URL/`postId` 不一致和 Popover 展开回调。
- [ ] **Step 3:** 编写 Server 生命周期测试，覆盖用户目录创建、权限、失效 Socket 清理、活跃 Socket 不覆盖、请求完成后关闭连接和停止时释放 Socket。
- [ ] **Step 4:** 运行 Helper 针对性 XCTest，确认因新接口和 Server 尚不存在而失败。
- [x] **Step 5:** 实现最小已接收任务、Store 去重、请求处理、Socket 生命周期和应用级所有权；所有 Store 变化与 Popover 调用切回 Main Actor。
- [x] **Step 6:** 调整任务行，只展示帖子标识、规范化 URL 或“已接收”状态及移除操作；不保留下载按钮、进度条、文件名或模拟下载入口。
- [ ] **Step 7:** 重跑 Task 3 针对性 XCTest，确认任务、校验、Socket 和回调行为全部通过。
- [ ] **Step 8:** 运行 `zsh apps/helpers/x-download-helper/scripts/build.sh`，确认完整 Helper 与内嵌 Bridge 编译成功。
- [ ] **Stop point:** 可通过测试客户端向运行中的 Helper 入队并展开 Popover；尚未接入真实扩展或写入浏览器 Host Manifest。

### Task 4: 接入插件 Popup、真实 Native Messaging 和本地注册脚本

**Files:**

- Modify: `apps/extensions/x-download/src/entrypoints/background.ts`
- Create: `apps/extensions/x-download/src/entrypoints/popup/index.html`
- Create: `apps/extensions/x-download/src/entrypoints/popup/main.ts`
- Create: `apps/extensions/x-download/src/entrypoints/popup/style.css`
- Modify: `apps/extensions/x-download/wxt.config.ts`
- Create: `apps/extensions/x-download/tests/background-native-messaging.test.ts`
- Create: `apps/helpers/x-download-helper/NativeMessaging/dev.kevinstack.xdownloadhelper.nativehost.json.template`
- Create: `apps/helpers/x-download-helper/scripts/install-native-host.sh`
- Create: `apps/helpers/x-download-helper/scripts/uninstall-native-host.sh`
- Create: `apps/helpers/x-download-helper/Tests/PackagingTests/verify_native_host_installation.sh`

**Interfaces:**

- Consumes: Task 1 的协议 Client、Task 2 的 Host Name 和内嵌 Bridge、Task 3 的 Helper IPC。
- Produces: Popup → Background 消息 `{ type: 'enqueue-current-tab' }` and response `{ state: PopupState }`。
- Produces: Background 使用 `browser.tabs.query({ active: true, currentWindow: true })` 取得当前标签页；`activeTab` 保持为唯一页面访问权限。
- Produces: Background 中一次性 `browser.runtime.sendNativeMessage(NATIVE_HOST_NAME, request)` 调用；请求不依赖 Popup 持续存活。
- Produces: 固定开发 Manifest Key 与确定的本地 Extension Origin，仅用于开发构建。
- Produces: `install-native-host.sh` 和 `uninstall-native-host.sh`，默认处理 Chrome、Edge 当前用户 Host Manifest，测试时接受显式临时目标根目录。

- [ ] **Step 1:** 编写 Background 失败测试，覆盖活动标签页缺失、有效页面发送一次请求、无效页面不调用 Native Messaging、Host 缺失、连接失败、成功关闭状态和 Popup 在响应前消失仍完成请求。
- [ ] **Step 2:** 编写本地注册脚本失败测试，覆盖模板替换、App/Bridge 缺失拒绝、绝对路径、Host Name、`stdio`、唯一开发 Origin、Chrome/Edge 两处写入和卸载只删除本项目 Manifest。
- [ ] **Step 3:** 运行扩展针对性测试和 `verify_native_host_installation.sh`，确认因 Popup、权限和脚本尚不存在而失败。
- [ ] **Step 4:** 为本地开发生成一次固定公钥，只将公钥写入 WXT Manifest `key`，不得将私钥或临时密钥文件纳入仓库；记录由该公钥确定的开发 Origin 供 Host Manifest 使用。
- [x] **Step 5:** 用 Popup 发出的 `enqueue-current-tab` 消息替换现有 `browser.action.onClicked` 帖子触发链；Background 查询活动标签页后调用现有解析器和一次性 Native Messaging Client，同时保留主题消息并使用可判别消息类型隔离两条路径。
- [x] **Step 6:** 实现无框架 Popup：初始显示连接中；按已批准文案显示无效页面、未检测到 Helper 或连接失败；成功响应调用 `window.close()`。
- [x] **Step 7:** 实现 Host Manifest 模板、Helper 启动时自动注册/刷新、手动卸载脚本；注册失败不阻断 Helper 主界面启动。
- [x] **Step 8:** 重跑 Task 4 测试、扩展 typecheck 和 WXT build，确认生成 Manifest 含 `nativeMessaging`、固定 Key 和 Popup 入口。
- [x] **Step 9:** 运行注册脚本打包测试，确认临时 Chrome/Edge 目录的安装与卸载结果完全符合预期，不触碰真实浏览器目录。
- [ ] **Stop point:** 自动化和构建证明完整接口已接通；不由代理操作 Chrome/Edge 或判断 Popup、Popover 视觉效果。

### Task 5: 完整验证、文档回填与用户端到端验收停止点

**Files:**

- Modify: `docs/changes/issues/2026-09-20-x-download-native-messaging-issue.md`
- Modify: `docs/changes/commits/2026-09-20-x-download-native-messaging-commit.md`

**Interfaces:**

- Consumes: Task 1～4 的协议、Bridge、Helper、Popup、注册脚本和测试。
- Produces: 可复现的 Chrome、Edge、Helper 本地验收步骤和待验收交付记录。

- [ ] **Step 1:** 运行扩展完整验证：`pnpm --filter @my-extensions/x-download test`、`pnpm --filter @my-extensions/x-download typecheck`、`pnpm --filter @my-extensions/x-download build`。
- [ ] **Step 2:** 运行 Helper 完整 XCTest：`xcodebuild test -project apps/helpers/x-download-helper/XDownloadHelper.xcodeproj -scheme XDownloadHelper -destination 'platform=macOS' -derivedDataPath apps/helpers/x-download-helper/.build CODE_SIGNING_ALLOWED=NO`。
- [ ] **Step 3:** 运行 `zsh apps/helpers/x-download-helper/Tests/PackagingTests/verify_app_bundle.sh` 和 `zsh apps/helpers/x-download-helper/Tests/PackagingTests/verify_native_host_installation.sh`。
- [ ] **Step 4:** 运行 `git diff --check`，检查全部待交付文件，并确认 `.build`、WXT 临时产物、Native Host Manifest 实机副本、私钥和浏览器用户配置未进入 Git。
- [ ] **Step 5:** 回填 Issue Sub-issues、Commit 记录的实际完成内容、验证结果和限制，状态停在“待验收”。
- [ ] **Step 6:** 提供用户实际验收步骤：先验证 Host 未注册和无效页面文案，再运行注册脚本；分别在 Chrome、Edge 加载 `dist/chrome-mv3-dev-stable`，验证 Helper 自动启动、任务出现、Popover 展开、同帖去重和异帖新增。
- [ ] **Stop point:** 等待用户实际验收；不执行 Git Commit，不开始真实下载、持久化、安装引导或 Windows 工作。
