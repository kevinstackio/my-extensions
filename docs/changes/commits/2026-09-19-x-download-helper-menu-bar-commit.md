# 建立 X Download macOS 菜单栏 Helper：交付记录

## 元信息

- 工作项：`2026-09-19-x-download-helper-menu-bar`
- 对应 Issue：[建立 X Download macOS 菜单栏 Helper](../issues/2026-09-19-x-download-helper-menu-bar-issue.md)
- 状态：已提交
- 用户验收：通过
- 最终提交批准：已批准
- 创建日期：2026-09-19
- 最近更新：2026-09-19

## 预期交付边界

- 新建结构化的标准 Xcode macOS 菜单栏应用。
- 实现三条静态任务、Popover 下载面板、五秒模拟下载和完成通知。
- 保持无真实下载、无通信、无持久化和无桌面文件副作用。
- 补充 macOS 组织标识、项目文档、逻辑测试和本地构建入口。

## 实际完成内容

- 建立标准 Xcode macOS 14 菜单栏 App、共享 Scheme、Info.plist、Asset Catalog 和根目录可调用的构建/运行脚本。
- 使用 `dev.kevinstack.xdownloadhelper` 与用户提供的 X SVG Template Image，应用通过 `LSUIElement` 保持菜单栏形态。
- 实现应用级 Store、三条静态桌面视频任务、取消、重复启动保护、五秒等价模拟、并行下载、完成事件和任务移除。
- 点击图标统一使用系统 `NSPopover` 承载 SwiftUI 任务面板，不区分左右键；面板右下角提供“退出”。
- 任务面板保留默认下载/取消按钮，下载中显示进度条和百分比；不设置自定义背景、圆角或按钮颜色。
- 模拟完成后通过 macOS 系统通知显示“下载完成”和对应文件名，前台运行时也允许显示横幅。
- 根 `package.json` 提供 `pnpm x-helper:build` 和 `pnpm x-helper:dev` 两个 Helper 入口。
- 在 `AGENTS.md` 增加 macOS 标识规范和规划模型/实现模型切换提示规范。

## 验证结果

- 完整 XCTest：6 个 `DownloadTaskStoreTests` 全部通过，0 failures。
- App Bundle 契约验证通过：产品名、Bundle Identifier、最低 macOS 版本 14.0、`LSUIElement`、可执行文件和 `Assets.car` 均符合要求。
- `scripts/build.sh` Debug 构建成功。
- `git diff --check` 通过；`.build`、DerivedData 和 Xcode 用户状态未进入 Git 状态。

## 未验证事项与限制

- 尚未由代理执行 macOS 视觉、布局、状态栏点击和 Dock 行为验证，需用户在本机实际运行确认。
- 当前仍是静态模拟版本，不包含浏览器通信、Native Messaging、yt-dlp、ffmpeg、网络、文件写入或持久化。

## 用户验收

- 结果：未开始
- 说明：自动化验证已完成，等待用户按下列步骤验收。

### macOS 实际验收步骤

1. 在仓库根目录运行 `zsh apps/helpers/x-download-helper/scripts/run.sh`。
2. 确认应用不出现在 Dock，只在菜单栏出现 X 图标；切换系统浅色/深色外观后确认图标由系统模板色适配。
3. 左键点击图标，确认系统 Popover 中出现三条 `_01`、`_02`、`_03` 任务，每行显示文件名和默认“下载”“取消”按钮。
4. 点击一条“下载”，确认按钮隐藏、标题变为系统次要文本颜色并出现进度条和百分比；约五秒后任务移除，并出现正文为文件名的“下载完成”系统通知。
5. 同时启动另外两条，确认可以并行推进；点击“取消”确认任务立即移除且无二次确认。
6. 点击面板右下角“退出”，确认应用正常退出；点击面板外部区域，确认 Popover 自动收起。

## 最终 Commit message

`feat(x-download-helper): 建立菜单栏下载助手原型`

- 建立 macOS 菜单栏 Helper 与静态视频任务模拟
- 接入 Popover 任务面板、完成通知和系统退出操作

## 最终提交批准

- 状态：已批准
- 说明：用户已批准执行最终 Git Commit。
