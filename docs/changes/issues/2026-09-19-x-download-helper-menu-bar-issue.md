# 建立 X Download macOS 菜单栏 Helper

## 元信息

- 工作项：`2026-09-19-x-download-helper-menu-bar`
- 项目：`x-download-helper`
- 类型：架构任务
- 状态：已完成
- 当前阶段：用户验收通过并已完成 Git 提交
- 创建日期：2026-09-19
- 最近更新：2026-09-19

## 背景

X Download 浏览器插件已经建立单帖 URL 识别边界。下一步先建立结构清晰的 macOS 菜单栏 Helper 骨架，用一个原生 Popover 任务面板和本地模拟下载验证应用形态；本工作项不接入插件通信或真实下载能力。

## 目标

在 `apps/helpers/x-download-helper` 中建立标准 Xcode macOS 应用。应用启动后只显示菜单栏图标；点击图标展示一个任务面板。面板包含三条静态视频任务、下载/取消操作和五秒模拟进度，右下角显示 `退出`，完成后移除任务并发送系统通知。

## 范围

- 使用标准 Xcode macOS App Target、Swift、SwiftUI、AppKit、UserNotifications 和 XCTest，不引入第三方依赖。
- 最低支持 macOS 14，应用名称为 `X Download Helper`，Bundle Identifier 为 `dev.kevinstack.xdownloadhelper`。
- 使用 `NSStatusItem` 打开系统 `NSPopover` 承载任务面板，不区分左右键；Popover 由系统在点击外部区域时自动收起。
- 通过 `LSUIElement` 隐藏 Dock 图标，不创建普通主窗口。
- 使用用户提供的 X 图案制作 macOS Template Image，由系统适配菜单栏深浅色。
- 初始化三条同一帖子的静态视频任务，文件名使用 `_01`、`_02`、`_03` 编号，任务面板只显示文件名。
- 待下载状态一行显示文件名和系统默认“下载”“取消”按钮；取消不二次确认并立即移除任务。
- 点击下载后隐藏两个按钮，在标题下显示系统进度条和百分比；模拟持续五秒，完成后从任务面板移除。
- 模拟完成时发送标题为“下载完成”、正文为文件名的 macOS 系统通知；应用在前台时同样允许显示横幅。
- 多条任务可以同时模拟下载；应用重启后恢复初始静态数据。
- 提供 Helper 自己的构建和运行脚本，可从仓库根目录调用，不增加根 `package.json` 命令。

## 排除项

- 不实现 Native Messaging、浏览器通信或任何自定义协议。
- 不集成 `yt-dlp`、ffmpeg、X 帖子解析、Cookie 或真实网络请求。
- 不创建、下载、移动或删除任何桌面文件。
- 不实现主窗口、设置页、历史记录、持久化或开机启动。
- 不处理代码签名、公证、发布更新或 Windows 版本。
- 不新增视觉、布局、鼠标交互或截图自动化测试。

## Todo

- [x] 确认第一版用户目标、交互边界和工程方向。
- [x] 审核并批准书面架构 Spec。
- [x] 编写并批准实施 Plan。
- [x] 建立标准 Xcode 工程、菜单栏生命周期和资源配置。
- [x] 实现 Popover 任务面板、五秒模拟下载和完成通知。
- [x] 完成逻辑测试、配置检查和构建。
- [x] 完成用户实际验收。

## 验收标准

- Xcode 工程能够生成可运行的 `X Download Helper.app`，Bundle Identifier 为 `dev.kevinstack.xdownloadhelper`，最低系统版本为 macOS 14。
- 应用运行时只显示菜单栏图标，不显示 Dock 图标或普通主窗口。
- 点击图标后显示系统 Popover 任务面板，左右键不做不同处理；点击面板外部区域后自动收起。
- 任务面板初始包含三条编号连续的视频文件名，内容边距为合理的 16px；待下载状态显示“下载”“取消”，右下角显示“退出”。
- 点击下载后按钮隐藏并显示进度条和百分比，约五秒后任务移除并显示包含文件名的系统下载完成通知；多任务可以并行模拟。
- 点击“退出”后应用通过系统退出动作结束。
- 自动化测试只覆盖任务命名、取消、模拟完成、完成事件和 App 配置；面板视觉、左右键行为、外部点击收起和通知横幅由用户在 macOS 中验收。
- 第一版不存在真实下载、网络、通信、持久化或桌面文件副作用。

## 关联文档

- [架构设计](../../superpowers/specs/2026-09-19-x-download-helper-menu-bar-design.md)
- [Commit 记录](../commits/2026-09-19-x-download-helper-menu-bar-commit.md)

## 下一步

用户已完成 macOS 实际验收，当前唯一下一步是审核 Commit 摘要并执行最终 Git 提交。
