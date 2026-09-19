# X Download macOS 菜单栏 Helper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Repository rules prohibit subagents and intermediate commits; execute serially and stop for one final user acceptance before the final Commit.

**Goal:** 建立一个结构化的 macOS 14 菜单栏应用，用三条静态视频任务验证状态栏点击、取消行为和五秒模拟下载进度。

**Architecture:** 标准 Xcode App Target 管理应用包、资源和配置；AppKit `NSStatusItem` 统一打开 SwiftUI Popover 展示任务；应用级 `DownloadTaskStore` 使用 Swift Concurrency 管理相互独立的内存模拟任务。

**Tech Stack:** Xcode 27.0、Swift 6、SwiftUI、AppKit、Observation、XCTest、zsh。

**Spec:** `docs/superpowers/specs/2026-09-19-x-download-helper-menu-bar-design.md`

## Global Constraints

- 项目目录固定为 `apps/helpers/x-download-helper`；根 `package.json` 仅保留 `x-helper:build` 和 `x-helper:dev` 两个 Helper 入口。
- 产品名为 `X Download Helper`；Organization Identifier 为 `dev.kevinstack`；Bundle Identifier 为 `dev.kevinstack.xdownloadhelper`。
- 最低系统版本为 macOS 14；不引入第三方依赖。
- 应用必须设置 `LSUIElement = true`，不创建主窗口，不显示 Dock 图标。
- 第一版只使用静态内存数据，不访问网络、浏览器、Cookie 或桌面文件。
- 所有代码注释使用中文；只为非显然逻辑添加注释。
- 不增加视觉、布局、颜色、Popover、鼠标或截图自动化测试。
- 不执行代码签名、公证、DMG、发布、开机启动或 Git Commit。

## Review Focus

- 同一待下载任务被重复启动时，只能存在一个模拟任务；由 Task 2 的重复启动测试约束。
- 取消不存在的任务 ID 不得改变其他任务；由 Task 2 的未知 ID 测试约束。
- 多任务并行时进度与完成移除不得互相覆盖；由 Task 2 的并行模拟测试约束。
- Popover 关闭不应销毁 Store 或模拟任务；由 Task 3 的应用级持有关系和 Task 2 的独立任务测试共同约束。
- 构建产物必须保持正确 Bundle ID、最低版本和 `LSUIElement`；由 Task 1 的 App Bundle 配置脚本约束。

---

### Task 1: 建立标准 Xcode 应用骨架与可验证构建入口

**Files:**

- Modify: `.gitignore`
- Create: `apps/helpers/x-download-helper/XDownloadHelper.xcodeproj/project.pbxproj`
- Create: `apps/helpers/x-download-helper/XDownloadHelper.xcodeproj/xcshareddata/xcschemes/XDownloadHelper.xcscheme`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/App/XDownloadHelperApp.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/SupportingFiles/Info.plist`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Resources/Assets.xcassets/Contents.json`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Resources/Assets.xcassets/MenuBarIcon.imageset/Contents.json`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Resources/Assets.xcassets/MenuBarIcon.imageset/x.svg`
- Create: `apps/helpers/x-download-helper/Tests/PackagingTests/verify_app_bundle.sh`
- Create: `apps/helpers/x-download-helper/scripts/build.sh`
- Create: `apps/helpers/x-download-helper/scripts/run.sh`

**Interfaces:**

- Produces: shared Xcode scheme `XDownloadHelper`, App Target `XDownloadHelper`, Test Target `XDownloadHelperTests`。
- Produces: `scripts/build.sh` 将 DerivedData 固定到项目内 `.build`，产物为 `.build/Build/Products/Debug/X Download Helper.app`。
- Produces: `scripts/run.sh` 先构建再用 `open` 启动上述 App。

- [ ] **Step 1:** 先编写配置测试和 App Bundle 校验脚本，断言产品名、`dev.kevinstack.xdownloadhelper`、`MACOSX_DEPLOYMENT_TARGET = 14.0`、`LSUIElement = true`、可执行文件和菜单栏资源存在。
- [ ] **Step 2:** 运行 `zsh apps/helpers/x-download-helper/Tests/PackagingTests/verify_app_bundle.sh`，确认因工程和 App 尚不存在而失败。
- [ ] **Step 3:** 创建 App/Test Target、共享 Scheme、Info.plist、Asset Catalog 和最小无窗口入口；将用户提供的 X SVG 原样纳入 `MenuBarIcon.imageset`。
- [ ] **Step 4:** 创建构建与运行脚本，并在 `.gitignore` 中加入 `.build/`、`DerivedData/`、`xcuserdata/` 和 `*.xcuserstate`。
- [ ] **Step 5:** 运行 `xcodebuild -list -project apps/helpers/x-download-helper/XDownloadHelper.xcodeproj`，确认 App Target、Test Target 和共享 Scheme 均可发现。
- [ ] **Step 6:** 运行 App Bundle 校验脚本，确认本地 Debug App 构建成功且全部配置断言通过。
- [ ] **Stop point:** 只确认工程、配置、资源和无窗口 App 骨架；不启动 GUI，不进入任务列表实现。

### Task 2: 以测试驱动实现静态任务与模拟下载状态

**Files:**

- Create: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Models/DownloadTask.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/State/DownloadTaskStore.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelperTests/DownloadTaskStoreTests.swift`

**Interfaces:**

- Produces: `enum DownloadTaskState: Equatable { case ready, downloading }`。
- Produces: `struct DownloadTask: Identifiable, Equatable`，字段为 `id`、`fileName`、`displayPath`、`progress`、`state`。
- Produces: `@MainActor @Observable final class DownloadTaskStore`。
- Produces: `typealias Delay = @Sendable (Duration) async throws -> Void`，仅作为时间测试缝隙，不新增协议层。
- Produces: `init(tasks: [DownloadTask] = DownloadTask.samples, delay: @escaping Delay = liveDelay)`，测试可注入即时等待。
- Produces: `func cancel(id: UUID)` 和 `@discardableResult func startDownload(id: UUID) -> Task<Void, Never>?`。

- [ ] **Step 1:** 编写失败测试，覆盖三条 `_01`～`_03` 初始任务、桌面显示路径、取消现有任务、取消未知 ID、重复启动保护、五秒等价步进完成移除和多任务并行互不覆盖。
- [ ] **Step 2:** 运行 `xcodebuild test -project apps/helpers/x-download-helper/XDownloadHelper.xcodeproj -scheme XDownloadHelper -destination 'platform=macOS' -derivedDataPath apps/helpers/x-download-helper/.build CODE_SIGNING_ALLOWED=NO -only-testing:XDownloadHelperTests/DownloadTaskStoreTests`，确认因类型尚不存在而失败。
- [ ] **Step 3:** 实现最小模型与 Store；生产延迟总计五秒，测试通过注入的即时等待完成，不建立协议、Service 或持久化层。
- [ ] **Step 4:** 重跑针对性测试，确认全部状态逻辑通过且测试不真实等待五秒。
- [ ] **Stop point:** Store 能独立完成全部状态行为；尚未接入 SwiftUI 或菜单栏控制器。

### Task 3: 接入统一 Popover 任务面板和完成通知

**Files:**

- Create: `apps/helpers/x-download-helper/XDownloadHelper/App/AppDelegate.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/MenuBar/MenuBarController.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Notifications/DownloadCompletionNotifier.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper/App/XDownloadHelperApp.swift`

**Interfaces:**

- Consumes: application-scoped `DownloadTaskStore` from Task 2。
- Produces: `AppDelegate` owns one完成通知器，并创建应用级 Store 与 `MenuBarController`。
- Produces: `MenuBarController.init(store: DownloadTaskStore)` and `start()`；左右键都显示 `NSPopover` 任务面板，不创建右键菜单。
- Produces: 模拟完成后移除任务面板中的任务，并发送文件名对应的系统通知。

- [ ] **Step 1:** 实现 `AppDelegate` 的应用级所有权，并让 SwiftUI App 只提供无窗口生命周期 Scene。
- [ ] **Step 2:** 实现 `NSStatusItem`、Template Image 和统一打开的系统 `NSPopover`；点击外部区域由 Popover 自动收起。
- [ ] **Step 3:** 使用简单 SwiftUI 任务面板：保留合理内边距，待下载显示文件名和默认下载/取消按钮，下载中显示系统进度条和百分比，右下角显示“退出”，完成后移除并发送系统通知。
- [ ] **Step 4:** 运行 Task 2 的针对性测试，确认视图接入未改变状态语义。
- [ ] **Step 5:** 运行 `zsh apps/helpers/x-download-helper/scripts/build.sh`，确认完整应用编译通过。
- [ ] **Stop point:** 不由代理执行视觉或鼠标验收；进入完整自动化验证。

### Task 4: 完整验证、文档回填与用户验收停止点

**Files:**

- Modify: `docs/changes/issues/2026-09-19-x-download-helper-menu-bar-issue.md`
- Modify: `docs/changes/commits/2026-09-19-x-download-helper-menu-bar-commit.md`

**Interfaces:**

- Consumes: Task 1～3 的完整 App、测试和构建脚本。
- Produces: 可供用户加载运行的 Debug App 路径和可复现验收步骤。

- [ ] **Step 1:** 运行完整 XCTest：`xcodebuild test -project apps/helpers/x-download-helper/XDownloadHelper.xcodeproj -scheme XDownloadHelper -destination 'platform=macOS' -derivedDataPath apps/helpers/x-download-helper/.build CODE_SIGNING_ALLOWED=NO`。
- [ ] **Step 2:** 运行 `zsh apps/helpers/x-download-helper/Tests/PackagingTests/verify_app_bundle.sh`，验证 App Bundle、Bundle ID、最低系统版本、`LSUIElement`、可执行文件和菜单栏资源。
- [ ] **Step 3:** 运行 `git diff --check`，检查待交付文件且确认 `.build`、DerivedData 和用户 Xcode 状态未进入 Git。
- [ ] **Step 4:** 回填 Issue Todo、Commit 记录的实际完成内容、验证结果和限制，状态停在“待验收”。
- [ ] **Step 5:** 向用户提供从仓库根目录运行 `pnpm x-helper:dev` 的验收步骤，覆盖 Dock、统一 Popover、外部点击收起、退出、取消、并行进度和完成通知。
- [ ] **Stop point:** 等待用户实际验收；不执行 Git Commit，不开始 Native Messaging 或真实下载工作。
