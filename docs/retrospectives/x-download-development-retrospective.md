# X Download 开发复盘：从单帖识别到页面媒体来源下载

## 文档定位

本文是 X Download 的内部开发复盘，用于还原项目从最小浏览器扩展到 macOS 下载 Helper 的完整演进过程。它记录实际发生过的方案、失败路径、技术决策、验证证据和遗留问题；动态状态仍以 `docs/changes/` 下的 Issue 与 Commit 记录为准。

复盘范围覆盖 2026-09-19 至 2026-09-21 的主要交付，不讨论尚未实现的失败恢复、对外分发和跨平台版本。

## 最终结果

X Download 最终形成了一条只面向 Chrome、Edge 和 macOS 的本地下载链路：

```text
用户打开 X 单帖
  → 扩展主世界观察 X 自身的 fetch/XHR 响应副本
  → 从当前帖子提取完整 HLS、DASH 或 MP4 来源
  → 隔离世界按 postId、协议、域名和格式再次校验
  → Background 通过 Native Messaging 发送协议 v2 请求
  → XDownloadNativeHost Bridge 转发到用户级 Unix Domain Socket
  → X Download Helper 创建并串行执行任务
  → 内置 yt-dlp 下载媒体，内置 FFmpeg 合并或封装
  → 临时工作区完成后移动到 ~/Downloads/X Download/
```

最终方案不再让 `yt-dlp` 解析 X 帖子 URL。帖子地址只承担“当前任务属于哪篇帖子”的身份作用；真正的下载输入必须是扩展从页面会话中取得并经过两侧校验的 `video.twimg.com` 媒体来源。

## 开发时间线

| 阶段 | 结果 | 代表提交 |
| --- | --- | --- |
| 单帖识别 | 建立 WXT/TypeScript MV3 扩展，只识别并规范化 X 单帖 URL | `159260b` |
| Helper 原型 | 建立 SwiftUI + AppKit 菜单栏应用、原生 Popover 和模拟任务 | `27ebb61` |
| Helper 交互整理 | 固定任务列表结构、外部点击/Esc 收起，删除完成通知 | `e0486bd` |
| 扩展与 Helper 通信 | 建立 Native Messaging、命令行 Bridge、Unix Socket 和自动注册 | `535bc07`、`83755a4` |
| 固定工具链 | 将固定版本 `yt-dlp` 与原生 arm64 FFmpeg 放入 App Bundle | `ac52211` |
| 下载执行基础 | 建立串行队列、临时目录、合并、落盘和完整失败反馈 | `e0930de` |
| 页面媒体来源 | 扩展捕获并传递 HLS、DASH、MP4，Helper 支持直链下载 | `4af8a53`、`e69c4e8` |
| 移除错误降级 | 删除帖子 URL 解析，只接受非空 `mediaSources` | `b29452c` |
| 完善最终体验 | 增加阶段进度、总进度和临时资源清理，改用下载目录 | `e2815eb` |

## 第一阶段：先建立最小输入边界

项目没有从“下载视频”直接开始，而是先实现一个很小的扩展：用户必须打开具体的 `https://x.com/<account>/status/<id>` 页面，再点击工具栏图标。扩展只负责识别数字帖子 ID、去除查询参数和媒体尾路径，并生成规范化帖子地址。

这一阶段没有 Popup、没有 Native Messaging、没有页面 DOM 扫描，也没有任何媒体解析。它的价值是提前固定了三个重要边界：

1. 下载目标来自用户当前明确打开的单帖，而不是从时间线猜测。
2. 每次操作只产生一个帖子目标。
3. URL 解析是可独立测试的纯逻辑，不依赖浏览器运行时。

这不是为了把任务拆得更细，而是为了避免把地址识别、跨进程通信、媒体解析和文件写入一次性混在一起。后续虽然下载输入从帖子 URL 改成了媒体来源，但规范化 `postId` 和 `postUrl` 仍继续承担任务绑定、去重和安全校验职责。

## 第二阶段：先验证 macOS Helper 的产品形态

Helper 第一版同样没有真实下载。它使用标准 Xcode App Target，以 SwiftUI 绘制任务内容，以 AppKit 管理 `NSStatusItem`、`NSPopover` 和应用生命周期。`LSUIElement` 隐藏 Dock 图标，应用只驻留在菜单栏。

原型使用三条静态任务和五秒模拟进度，目的是验证：

- 菜单栏图标是否适合作为常驻入口；
- 原生 Popover 是否能容纳多行任务、按钮和进度；
- SwiftUI 状态是否能在 Popover 收起后继续运行；
- 空状态、六行固定高度、内部滚动和退出按钮是否符合使用习惯。

交互随后又经历一次收敛：不区分左右键，不使用 `NSMenu` 承载复杂任务行，保留一个 transient `NSPopover`；点击外部区域或按 Esc 收起。最初加入的下载完成通知后来被删除，因为任务列表本身已经是主要反馈面，通知不属于当时真正需要的能力。

这一步留下的关键经验是：菜单栏工具不等于菜单。只要内容包含文件名、操作按钮、失败详情和进度条，`NSPopover` 比 `NSMenu` 更适合，而且应优先保持 macOS 原生控件和默认视觉。

## 第三阶段：把浏览器和常驻应用解耦

扩展和 Helper 不能直接互相调用。Chrome/Edge 的 Native Messaging 面向的是读写标准输入输出的一次性本地进程，而菜单栏 Helper 是长期运行的 GUI App。如果让同一个 App 同时承担浏览器协议和 UI 生命周期，浏览器启动、连接关闭、日志输出和菜单栏状态会互相耦合。

最终采用了独立 Bridge：

```text
Extension Background
  → browser.runtime.sendNativeMessage
  → XDownloadNativeHost（一次性命令行进程）
  → ~/Library/Application Support/XDownloadHelper/helper.sock
  → X Download Helper（长期运行的菜单栏 App）
```

Bridge 只负责 Native Messaging 帧、扩展来源校验、Helper 启动、Socket 转发和响应回写。Helper 启动后在 Main Actor 上接收本机请求并更新任务 Store。Bridge 不保存任务，也不参与下载。

Helper 会把 Native Host Manifest 写入当前用户的 Chrome 和 Edge 配置目录。Manifest 指向 App Bundle 内的 Bridge，并限制固定开发扩展 Origin。这样本机调试时 Helper 路径变化可以被自动刷新，不需要用户每次手工注册。

这一阶段定义的 v1 请求只包含 `postId` 和规范化 `postUrl`。成功响应只表示“任务已经进入 Helper 内存”，不表示视频已解析或下载完成。这种语义区分避免了插件 Popup 把“已接收”误写成“下载成功”。

## 第四阶段：固定工具链，而不是依赖用户环境

真实下载需要 `yt-dlp` 和 FFmpeg。项目没有搜索 Homebrew、Python 或系统 `PATH`，而是把固定版本工具放入 Helper App Bundle：

- `yt-dlp 2026.08.19`
- `FFmpeg 9.0.2`

FFmpeg 使用当前 Apple Silicon Mac 构建为原生 arm64 工具。准备脚本负责固定 URL、SHA-256、架构和版本校验；普通 Xcode 构建和应用运行不联网，也不自动更新工具。

运行时通过 `Bundle` 解析绝对路径，检查文件存在、可执行、仍位于 App Bundle 内，并读取版本输出。所有进程调用使用 `Process.executableURL` 和参数数组，不经过 Shell；`yt-dlp` 固定使用 `--ignore-config` 和 `--no-update`，避免读取用户配置或自更新。

这个选择增加了 App 体积和工具准备成本，但换来了可复现性：同一份 Helper 不会因为不同机器的 Homebrew、Python 或 PATH 状态产生不同结果。

## 第五阶段：下载执行链路建立了，但入口失败了

Helper 最初按“帖子 URL → `yt-dlp` 解析 → 条目下载”的思路实现下载：

1. 用 `--dump-single-json --skip-download` 解析帖子；
2. 按返回顺序处理单视频或多视频条目；
3. 使用 `bestvideo*+bestaudio/best` 下载最高可用质量；
4. 由内置 FFmpeg 合并为 MP4；
5. 全部成功后从临时目录移动到桌面；
6. 失败时保留任务和完整 stderr。

队列、进程执行、临时目录、多文件移动回滚和失败反馈都能够验证。然而真实目标帖子暴露了核心问题：浏览器中视频可以正常播放，`yt-dlp` 的游客解析却返回：

```text
No video could be found in this tweet
```

这意味着下载执行器本身已经成立，但“由 Helper 独立解析帖子”不是可靠入口。继续优化队列或 UI 不会解决媒体来源缺失。

### 为什么没有继续读取浏览器 Cookie

曾考虑让 Helper 读取 Chrome/Edge Cookie 数据库，或者把浏览器 Cookie 传给 `yt-dlp`。这条路线被撤回，原因包括：

- macOS 隐私权限可能阻止本机进程读取浏览器数据；
- Chrome 和 Edge 存在多个 Profile，无法稳定猜测当前页面属于哪个 Profile；
- Cookie 解密、浏览器版本和存储结构会增加新的脆弱依赖；
- 将登录凭据带入 Native Messaging 协议会显著扩大安全边界。

最终原则变成：利用页面已经拥有的会话取得媒体信息，但不导出 Cookie、Authorization、完整响应或浏览器 Profile 数据。

## 第六阶段：`blob:` 和 `.m4s` 不是答案

排查页面和 HAR 时可以看到两类容易误判的地址。

### `blob:` 地址

页面 `<video>` 元素常显示 `blob:https://x.com/...`。它不是网络上的视频文件，而是浏览器页面进程内对 MediaSource 或内存对象的引用。这个地址离开当前页面就失效，不能传给 Helper 下载。

### `.m4s` 分片

HAR 中能够看到 `video.twimg.com` 上的 DASH 音视频 `.m4s` 请求，但单个分片只包含一段时间范围，通常还区分音频和视频轨。复制某个分片不能得到完整视频，盲目拼接还需要处理初始化段、时间轴和清单关系。

真正适合作为跨进程下载入口的是：

- DASH manifest：`.mpd`
- HLS master/media playlist：`.m3u8`
- 完整 MP4 variant：`.mp4`

因此插件的目标不是读取 DOM 中的 `src`，也不是收集所有分片，而是从 X 页面已经取得的接口响应中找到完整媒体描述。

## 第七阶段：把解析职责移回浏览器页面

扩展新增了两个协作但隔离的 content script。

### 页面主世界观察器

观察器在 `document_start` 进入 MAIN world，包装页面的 `fetch` 与 XHR。它只读取候选 X API/GraphQL 响应的副本：`fetch` 使用 `response.clone()`，XHR 在加载完成后读取允许的响应类型。原始请求、响应和页面行为不被修改。

解析器按当前 `postId` 在嵌套响应中寻找 `rest_id`，读取视频或动图的 `video_info.variants`，并按以下优先级选择每个媒体的一个完整来源：

```text
DASH > HLS > 最高码率 MP4
```

它不依赖单个 GraphQL 操作哈希，但仍依赖 X 响应中能够识别的媒体结构。

### 隔离世界桥与内存缓存

MAIN world 的数据不能直接信任。隔离世界桥重新检查：

- 捕获结果必须绑定当前页面的 `postId`；
- URL 必须使用 HTTPS；
- 主机必须严格等于 `video.twimg.com`；
- 类型只允许 HLS、DASH 或 MP4；
- 拒绝图片、`blob:` 和孤立 `.m4s`；
- 同一个 `mediaId` 不能重复。

通过校验的来源只保存在页面内存中。X 使用 SPA 路由，桥会在地址变化时清理旧帖子缓存；后台查询时还会再次校验当前 `postId`，避免把上一条帖子的来源发给下一条帖子。

用户点击插件后，Background 最多等待三秒获取当前来源。如果没有完整来源，Popup 显示“未获取到可下载的视频来源”，不联系 Helper，也不创建一个注定失败的任务。

## 第八阶段：从兼容降级到单一路径

页面媒体来源的第一版升级到协议 v2，同时保留 v1 和“媒体来源为空时让 Helper 再解析帖子”的兼容路径。这个选择降低了改造风险，却保留了一个已经被真实验证失败的分支。

后续验证确认：`yt-dlp` 解析帖子 URL 不是可用降级能力。继续保留它会产生三个问题：

1. 同一次点击可能走两条完全不同的下载路径；
2. 用户看到的失败来自一个已知不可用的旧方案；
3. Helper 仍同时承担帖子解析和媒体下载，职责没有真正收敛。

最终删除了 v1、空来源兼容、`VideoPost`、`VideoPostParser` 及相关测试。扩展、Native Host 和 Helper 统一只接受协议 v2 的非空 `mediaSources`。`yt-dlp` 仍然保留，但角色从“解析 X 帖子”变成了“下载插件提供的媒体 URL，并调用 FFmpeg 合并或封装”。

这次调整是整个项目最重要的架构转折：不是放弃 `yt-dlp`，而是把它放回更可靠、更单一的职责里。

## 当前架构与职责

### 浏览器扩展

- `post-url.ts`：识别和规范化当前 X 单帖。
- `page-observer.ts`：在 MAIN world 观察候选接口响应副本。
- `extract.ts`：绑定 `postId`，选择完整媒体来源。
- `media-bridge.content.ts`：在隔离世界校验、缓存并响应后台查询。
- `background-communication.ts`：等待来源，构造 v2 请求并映射 Popup 状态。
- `protocol.ts`：保证 `mediaSources` 必填且非空。

Manifest 的主要权限是 `activeTab` 与 `nativeMessaging`；媒体观察脚本只运行在 `x.com` 和 `www.x.com`。

### Native Host

- 浏览器每次请求启动一次命令行 Bridge；
- Bridge 校验扩展 Origin 和协议版本；
- Helper 未运行时从自身相对路径启动 App；
- 通过用户级 Unix Domain Socket 转发请求；
- 只向 stdout 写 Native Messaging 帧，诊断不污染协议输出。

### macOS Helper

- AppKit 管理菜单栏图标、Popover 和应用生命周期；
- SwiftUI 展示任务列表、状态、失败详情和进度；
- `DownloadTaskStore` 是 Main Actor 上的 UI 状态源；
- `VideoDownloadCoordinator` 串行执行帖子任务和多视频来源；
- `VideoProcessRunner` 调用 Bundle 内固定版本工具；
- `VideoDownloadFileStore` 管理临时工作区、最终命名和移动。

## 状态、进度与文件生命周期

当前任务状态包括：

```text
等待中 → 准备中
       → 下载视频
       → 下载音频
       → 合并音视频
       → 保存到下载目录
       → 完成 / 失败
```

`yt-dlp --progress-template` 输出驱动视频和音频步骤进度；`[Merger] Merging formats` 触发合并阶段。合并通常没有稳定的字节百分比，因此只可靠表达开始与结束。

总进度不是精确总字节，而是阶段式估算。每个媒体内部按视频 40%、音频 40%、合并 20% 计算，再结合当前媒体序号形成不倒退的任务总进度。这个设计优先保证用户能理解当前阶段，而不是显示一个看似精确但来源不可靠的百分比。

文件生命周期遵循“临时区完成，最终目录只收成品”：

```text
系统临时目录/x-download/<task UUID>/
  ├─ 下载分片
  ├─ 音视频流
  ├─ .part
  └─ 合并结果

全部成功
  → ~/Downloads/X Download/X_VIDEO_yyyyMMdd_HHmmss.mp4
```

同名文件使用 `-1`、`-2` 递增，不覆盖现有文件。成功、失败和可控异常都会清理任务目录；Helper 启动时还会清理上次崩溃、强制退出或断电留下的专属临时目录。

## 验证策略与环境限制

验证被分成不同层级，避免把一种证据误写成另一种结论：

- TypeScript/Vitest 覆盖 URL 识别、媒体提取、缓存、协议、无来源不发送任务等纯逻辑；最终为 8 个测试文件、45 个测试。
- `tsc --noEmit` 与 `wxt build` 验证扩展类型和构建产物。
- Swift 测试和注入的进程/文件系统覆盖协议、队列、来源校验、工具参数、进度、命名和清理。
- `XDownloadNativeHost` Debug 构建验证 Bridge。
- 核心 Swift 下载文件使用独立 `swiftc -typecheck` 验证。
- Chrome、Edge 与 macOS Helper 的真实流程由用户实际验收。

当前环境曾多次出现：

```text
ObservationMacros.ObservableMacro ...
swift-plugin-server produced malformed response
```

它是 Xcode/沙箱中的宏插件环境限制，不是已经证明的下载业务错误。处理方式是保留限制、使用其他编译和行为证据，而不是修改正常的 `@Observable` 业务模型去迎合异常环境。

## 走过的弯路

### 1. 把帖子 URL 当成稳定下载入口

这是最主要的弯路。它在架构上很诱人：插件只传一个 URL，复杂解析全部交给 `yt-dlp`。真实 X 登录态和游客接口的差异证明，这种简洁建立在不可靠前提上。

### 2. 把 Cookie 当成自然补丁

Cookie 似乎能让 Helper 获得登录态，但会引入浏览器 Profile、系统隐私权限、凭据传输和长期兼容问题。最终没有把高敏感数据塞进协议，而是让解析留在已经拥有会话的页面。

### 3. 看到 `blob:` 或 `.m4s` 就以为找到了视频

`blob:` 只在页面进程内有效；`.m4s` 只是媒体分片。它们是排查线索，不是可靠跨进程输入。

### 4. 保留一个已经失效的降级路径

页面来源第一版保留 URL 解析作为降级，造成双路径和不真实的错误恢复预期。后续删除旧路径后，扩展和 Helper 的职责反而更清晰。

### 5. 把工具环境错误和业务失败混在一起

如果只看 Xcode 最后的失败摘要，很容易把 `ObservationMacros` 环境问题误判为下载模型错误。项目后来明确区分自动化、构建环境限制和用户验收。

## 当前限制

最终主路径已经通过用户验收，但仍有明确边界：

- X 的响应结构变化可能使页面媒体提取失效。
- `video.twimg.com` URL 可能带短期签名，长时间排队后可能过期。
- 总进度是阶段估算，合并阶段没有真实连续百分比。
- “移除”任务不等于终止正在运行的 `yt-dlp`/FFmpeg 进程。
- 工具启动校验失败时，当前 UI 错误反馈仍可进一步完善。
- 多视频最终移动采用尽力回滚，极端文件系统错误下仍可能出现部分结果。
- Native Host 目前绑定本机开发扩展 ID，尚未完成生产分发配置。
- 没有暂停、取消、自动重试、断点续传、任务历史和持久化队列。
- 仅支持 Chrome、Edge 和当前 Apple Silicon macOS 开发环境。

这些限制不是隐藏的“以后再说”，而是后续失败恢复和产品化工作必须面对的输入。

## 最重要的经验

### 先验证输入，再优化执行器

队列、进度、合并和文件系统都可以实现得很完整，但如果下载器拿不到真实媒体来源，整个主路径仍然不成立。最有效的转折不是继续修改 `yt-dlp` 参数，而是重新定义输入边界。

### 会话应该留在拥有它的地方

浏览器页面已经拥有访问 X 内容所需的上下文。扩展只提取最小媒体描述，Helper 不读取 Cookie；这比复制整个认证环境更小、更安全，也更容易测试。

### 跨进程边界必须重复校验

MAIN world、隔离世界、Background、Native Host 和 Helper 之间没有任何一层可以天然信任上一层。帖子 ID、协议版本、URL、域名、格式和数组非空都需要在合适的边界再次确认。

### 临时文件策略是功能的一部分

下载器不能只考虑“成功文件放哪里”。未完成资源放在哪里、失败后谁清理、崩溃后如何收尾，直接决定用户的下载目录会不会变成垃圾场。

### 自动化通过、用户验收和 Git 提交是三件事

自动化验证证明代码边界；真实浏览器和 Helper 验收证明用户流程；Git Commit 批准决定是否写入历史。三者不能互相替代，也不能因为代码已经提交就倒推用户一定完成了验收。

## 结论

X Download 最终不是一个“给 `yt-dlp` 套壳”的项目。它真正解决的是如何在浏览器会话、本地跨进程通信、固定媒体工具链和 macOS 原生界面之间建立清楚、可验证的责任边界。

项目最初从一个单帖 URL 识别函数开始，途中建立了 Helper、Bridge、Socket、工具链和队列，也经历了帖子解析失败、Cookie 方案撤回、`blob:` 与分片误区以及降级路径删除。最后得到的方案更窄，却更真实：插件负责取得当前页面已经拥有的媒体来源，Helper 负责可靠地下载、合并、反馈和清理。

这条主路径已经完成。下一阶段的重点不应重新扩大解析范围，而应围绕失败恢复、取消语义、来源过期和产品化分发展开。

## 主要事实来源

- [建立 X 单帖链接识别插件](../changes/issues/2026-09-19-x-download-post-url-issue.md)
- [建立 X Download macOS 菜单栏 Helper](../changes/issues/2026-09-19-x-download-helper-menu-bar-issue.md)
- [打通扩展与 macOS Helper 通信](../changes/issues/2026-09-20-x-download-native-messaging-issue.md)
- [打包固定视频工具链](../changes/issues/2026-09-20-x-download-helper-toolchain-issue.md)
- [建立视频下载执行链路](../changes/issues/2026-09-20-x-download-public-video-download-issue.md)
- [使用页面媒体源下载视频](../changes/issues/2026-09-21-x-download-page-media-source-issue.md)
- [改为仅使用页面媒体来源下载](../changes/issues/2026-09-21-x-download-media-source-only-download-issue.md)
