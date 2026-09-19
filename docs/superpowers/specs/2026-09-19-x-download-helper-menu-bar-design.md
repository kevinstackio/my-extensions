# X Download macOS 菜单栏 Helper 架构设计

## 元信息

- 工作项：`2026-09-19-x-download-helper-menu-bar`
- 状态：已批准
- 创建日期：2026-09-19
- 最低系统版本：macOS 14
- Organization Identifier：`dev.kevinstack`
- Bundle Identifier：`dev.kevinstack.xdownloadhelper`

## 目标与定位

第一版建立一个结构清晰、可继续演进的 macOS 菜单栏 Helper。它只验证应用形态、状态栏点击、任务面板、完成通知和本地状态变化，不连接 X Download 浏览器插件，也不执行真实下载。

项目使用标准 Xcode macOS App Target。SwiftUI 负责 Popover 任务面板，AppKit 负责 `NSStatusItem` 和 Popover，UserNotifications 负责完成提示，XCTest 负责纯逻辑。

## 技术选择

- 使用 Xcode 工程管理 App Target、Test Target、资源、Bundle 配置和构建产物。
- 使用 Swift 与系统自带的 SwiftUI、AppKit、UserNotifications、Observation/XCTest，不引入第三方包。
- 使用 `NSStatusItem` 统一打开系统 `NSPopover`，不区分左右键，也不创建右键菜单。
- Popover 内容只使用简单 SwiftUI 布局，保留合理的内容边距和行间距，不设置背景、圆角、箭头或按钮颜色；Popover 的系统箭头由 AppKit 管理。
- 使用 `LSUIElement = true` 隐藏 Dock 图标。
- 使用 X 图案的 Template Image，让 macOS 自动处理菜单栏深浅色。

## 项目结构

```text
apps/helpers/x-download-helper/
├─ XDownloadHelper.xcodeproj/
├─ XDownloadHelper/
│  ├─ App/
│  │  ├─ XDownloadHelperApp.swift
│  │  └─ AppDelegate.swift
│  ├─ MenuBar/
│  │  └─ MenuBarController.swift
│  ├─ Features/Downloads/
│  │  ├─ Models/DownloadTask.swift
│  │  ├─ State/DownloadTaskStore.swift
│  │  ├─ Views/
│  │  │  ├─ DownloadListView.swift
│  │  │  └─ DownloadTaskRow.swift
│  │  └─ Notifications/
│  │     └─ DownloadCompletionNotifier.swift
│  ├─ Resources/Assets.xcassets
│  └─ SupportingFiles/Info.plist
├─ XDownloadHelperTests/
│  └─ DownloadTaskStoreTests.swift
└─ scripts/
   ├─ build.sh
   └─ run.sh
```

`App` 只管理生命周期；`MenuBar` 只管理 macOS 状态栏能力；`Features/Downloads` 聚合模型、状态、任务面板和系统通知。第一版不创建网络层、通信层、Repository、下载服务协议或未来功能占位文件。

## 应用生命周期与菜单栏

`XDownloadHelperApp` 是唯一入口，通过 `AppDelegate` 创建应用级 `DownloadTaskStore`、`DownloadCompletionNotifier` 和 `MenuBarController`。

`MenuBarController` 创建一个 `NSStatusItem` 并统一打开 Popover：

- 左右键都切换系统 `NSPopover`，内容由 `NSHostingController` 承载 `DownloadListView`。
- 任务面板右下角的“退出”按钮直接调用 `NSApplication.terminate(_:)`。
- Popover 的 `transient` 行为负责点击外部区域自动收起；关闭 Popover 后 Store 仍由应用持有，模拟下载不会停止。

应用不显示 Dock 图标，不创建主窗口，不提供设置入口，也不设置登录启动项。

## 静态任务模型

每个 `DownloadTask` 只包含当前界面需要的数据：稳定 ID、文件名、显示路径、进度和运行状态。初始 Store 写入同一帖子的三条模拟视频：

```text
X_VIDEO_20260919_142345_01.mp4
X_VIDEO_20260919_142345_02.mp4
X_VIDEO_20260919_142345_03.mp4
```

任务数据保留 `~/Desktop/<文件名>` 路径，但列表行只显示文件名，不展开路径文本；路径只作为后续真实下载阶段的任务数据，不访问文件系统。应用重启后重新生成三条初始任务，不保存任何状态。

## 状态与交互

任务只有待下载和下载中两种内存状态。

```text
待下载
├─ 一行显示文件名和系统默认“下载”“取消”按钮
├─ 下载：开始五秒模拟任务
└─ 取消：不确认，立即移除

任务面板底部
└─ 右下角显示系统默认“退出”按钮

下载中
├─ 文件名使用系统次要文本颜色
├─ 隐藏下载和取消按钮
├─ 在标题下显示系统进度条和整数百分比
└─ 完成后移除任务并发送系统通知
```

模拟下载使用 Swift Concurrency 的独立 `Task` 更新内存进度。每条任务拥有独立运行单元，因此用户可以同时启动多个任务。Store 使用可注入的等待函数控制时间：生产环境总时长固定为五秒，测试使用即时等待，不引入真实五秒延迟，也不为此建立额外协议层。

完成通知标题固定为“下载完成”，正文为文件名。通知权限由系统管理；应用处于前台时也请求显示横幅和声音。第一版不会生成成功记录、历史记录或桌面文件。

## 图标与资源

菜单栏图标沿用用户提供的 X SVG 图案，不重绘或改变路径。资源导入 Helper 自己的 Asset Catalog，并标记为 Template Image；运行时不依赖浏览器扩展目录中的文件。macOS 负责根据菜单栏外观渲染黑白颜色。

## 构建与运行

项目由 Xcode Scheme 构建。`scripts/build.sh` 和 `scripts/run.sh` 封装稳定的 `xcodebuild` 与应用启动入口，根 `package.json` 仅提供 `pnpm x-helper:build` 和 `pnpm x-helper:dev` 两个入口。

第一版只保证本机开发构建和运行，不配置开发者团队、发布签名、公证、DMG 或自动更新。生成目录和 DerivedData 必须被 Git 忽略。

## 验证策略

自动化测试只验证用户行为背后的纯逻辑和应用配置：

- 初始生成三条文件名和桌面路径正确的任务。
- 开始模拟后任务进入下载中，进度最终达到完成条件并被移除。
- 完成时产生对应任务的完成事件，供系统通知使用。
- 多任务模拟互不覆盖。
- App 构建配置包含正确 Bundle Identifier、macOS 14 最低版本和 `LSUIElement`。
- Xcode 工程能够完成 Test 和 Build。

不新增截图、像素、颜色、布局尺寸或鼠标事件自动化测试。任务面板布局、状态栏点击、外部点击收起、通知横幅和 Dock 隐藏由用户在 macOS 中实际验收。

## 后续演进边界

后续真实下载另建独立 Issue。届时浏览器仍只提交一个帖子 URL，Helper 使用固定版本的 `yt-dlp` 枚举帖子中的全部视频，并为每个视频建立独立任务；多视频文件名使用 `_01`、`_02` 顺序编号。Native Messaging、`yt-dlp`、ffmpeg、Cookie 和真实文件生命周期不属于本工作项。
