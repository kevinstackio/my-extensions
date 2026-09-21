# 改为仅使用页面媒体来源下载 X 视频：交付记录

## 元信息

- 工作项：`2026-09-21-x-download-media-source-only-download`
- 对应 Issue：[改为仅使用页面媒体来源下载 X 视频](../issues/2026-09-21-x-download-media-source-only-download-issue.md)
- 状态：已完成
- 用户验收：已通过
- 最终提交批准：已批准
- 创建日期：2026-09-21
- 最近更新：2026-09-21

## 预期交付边界

- 移除 `yt-dlp` 解析 X 帖子 URL 的降级路径，只接受扩展解析出的完整页面媒体来源。
- 保留 `yt-dlp` 与 FFmpeg 作为媒体下载、音视频合并和 MP4 封装工具。
- 为接收、准备、视频下载、音频下载、合并和保存过程提供步骤状态、步骤进度与阶段式任务总进度。
- 将完成文件固定保存到 `~/Downloads/X Download/`，未完成资源只存在于可清理的临时任务目录。
- 不包含取消、失败重试、失败删除、多视频部分失败恢复或工具链替换。

## 实际完成内容

- 扩展、Native Host 和 Helper 统一只接受协议 v2 的非空 `mediaSources`，未取得页面媒体来源时不发送任务。
- 删除 Helper 端 X 帖子 URL 解析模型、服务、入口与测试；`yt-dlp` 仅接收扩展提供的完整媒体来源。
- 增加准备、视频下载、音频下载、合并、保存和完成/失败状态，任务行显示当前步骤进度与阶段式总进度。
- 完成文件移动到 `~/Downloads/X Download/`，临时任务目录隔离并在成功、失败及 Helper 启动时清理，同名文件自动生成不覆盖的新名称。
- 同步 Issue、Spec 与历史文档中的旧 URL 解析降级描述。
- 为插件页面捕获、媒体缓存、Native Messaging 边界，以及 Helper 下载、进度和临时文件生命周期补充中文责任注释。

## 提交拆分

本次按用户批准拆分为三个连续提交，分别对应来源边界、Helper 下载执行链路和项目文档；三者合并后构成当前 Issue 的完整交付。

## 验证结果

- `apps/extensions/x-download`：Vitest 45 个测试通过。
- `apps/extensions/x-download`：TypeScript `tsc --noEmit` 通过。
- `apps/extensions/x-download`：`wxt build` 通过，生成 Chrome MV3 构建产物。
- `XDownloadNativeHost`：`xcodebuild` Debug 构建通过。
- 变更后的核心 Swift 下载文件：`swiftc -typecheck` 通过；`git diff --check` 通过。
- 用户已确认 Chrome、Edge 与 macOS Helper 的完整下载流程验收通过。

## 未验证事项与限制

- `XDownloadHelper` 完整 XCTest/Xcode 构建仍受当前环境的 `ObservationMacros.ObservableMacro` `swift-plugin-server produced malformed response` 限制，未将该环境问题误改为业务代码。
- 阶段式总进度按视频、音频、合并等阶段计算，不代表精确总字节百分比。

## 用户验收

- 结果：通过
- 说明：用户已确认页面媒体解析、Helper 下载、进度展示和文件落盘符合当前验收要求。

## Commit messages

```text
feat(x-download): 改为仅使用页面媒体来源下载

- 收紧插件、Native Host 和 Helper 的媒体来源协议边界
- 移除帖子 URL 解析降级及其旧模型和测试
```

```text
feat(x-download): 增加 Helper 分阶段进度与临时文件清理

- 增加视频、音频、合并、保存状态和任务总进度
- 将成品固定保存到 X Download 目录并清理临时工作区
```

```text
docs(x-download): 整理页面媒体下载交付记录

- 记录三提交交付边界和当前验收状态
- 标记旧帖子 URL 解析设计已被替代
```

## 最终提交批准

- 状态：已批准
- 说明：用户已批准三个交付提交，并在功能验收通过后单独批准终态文档收口提交。
