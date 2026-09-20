# X Download Helper 固定视频工具链设计

## 元信息

- 工作项：`2026-09-20-x-download-helper-toolchain`
- 对应 Issue：[`2026-09-20-x-download-helper-toolchain`](../../changes/issues/2026-09-20-x-download-helper-toolchain-issue.md)
- 状态：已批准
- 日期：2026-09-20
- 目标平台：当前 Apple Silicon Mac、macOS 14 及以上
- Helper Bundle Identifier：`dev.kevinstack.xdownloadhelper`

## 目标与边界

本工作项只建立可复现、可校验的本地视频工具链。完成后，Helper App Bundle 内能够直接运行固定版本 `yt-dlp` 和 `ffmpeg`，但不会访问 X、解析帖子或生成视频文件。

普通用户运行 Helper 时不需要 Homebrew、Python、Rosetta 或额外 `PATH` 配置。签名、公证、安装器、Intel Mac 和对外分发另立工作项。

## 固定版本与来源

- `yt-dlp 2026.08.19`：使用 yt-dlp GitHub 官方稳定 Release 的 `yt-dlp_macos` 资产，并以同一 Release 的 SHA-256 清单校验。
- `FFmpeg 9.0.2`：使用 FFmpeg 官方 Release 源码与官方签名/摘要作为输入，在当前 Apple Silicon Mac 上构建原生 arm64 工具。
- 不使用 `latest` URL，不使用 nightly、master、Homebrew Cellar 或第三方预编译 FFmpeg。
- 版本升级必须作为单独任务，同时更新版本清单、校验值、许可和验证结果。

选择从官方源码构建 FFmpeg，是因为 FFmpeg 官方只发布源码；其官网链接的现成 macOS 静态构建是 Intel 版本，会引入 Rosetta，不符合当前原生 Apple Silicon 边界。

## 仓库与产物布局

仓库保存工具清单、准备脚本、FFmpeg 构建参数、许可说明和校验逻辑，不提交完整第三方源码。准备后的本机工具放在 Helper 项目的受控生成目录，由 Git 忽略。

Xcode 在 Copy Bundle Resources 阶段只复制已经准备并验证的工具：

```text
XDownloadHelper.app/
└─ Contents/
   └─ Resources/
      └─ Tools/
         ├─ yt-dlp
         ├─ ffmpeg
         └─ THIRD_PARTY_NOTICES.md
```

普通 Test、Build 和运行不会联网获取工具。生成目录缺失、版本错误或架构不符时，构建应明确失败并提示先执行准备脚本，不允许退回系统工具。

## 工具准备流程

准备脚本只负责生成受控输入，不修改用户系统安装：

1. 按清单中的精确 URL 下载 yt-dlp Release 资产；FFmpeg 优先使用 `Tools/downloads/ffmpeg-9.0.2.tar.xz` 中的本地归档，不存在时才从精确 URL 下载源码归档。
2. 在解包或执行前校验固定 SHA-256；FFmpeg 源码同时保留官方签名验证入口。
3. 使用 Xcode Command Line Tools 将 FFmpeg 构建为原生 arm64 命令行工具。
4. FFmpeg 只生成 `ffmpeg` 程序，不生成 `ffplay` 或 `ffprobe`；不引入外部 GPL 编码库，也不承担转码职责。
5. 写入可执行权限，运行 `--version`，并校验版本文本和 Mach-O arm64 架构。
6. 将通过校验的工具和许可文件放入受控生成目录，供 Xcode 复制。

准备流程允许联网；日常 Xcode 构建不联网。失败时保留诊断信息，但不得用未校验的新文件覆盖上一份已通过校验的工具。

## Helper 内定位与校验

新增单一职责的工具定位边界，通过 `Bundle` 取得 `Contents/Resources/Tools`，返回 `yt-dlp` 和 `ffmpeg` 的绝对路径。它不读取环境变量，不执行 Shell，也不搜索 `/opt/homebrew`、`/usr/local` 或 `/usr/bin`。

启动工具前的检查包含：

- 文件存在且为普通文件。
- 文件具有当前进程可执行权限。
- 路径仍位于当前 Helper App Bundle 内。
- `yt-dlp --version` 等于 `2026.08.19`。
- `ffmpeg -version` 首行对应 `9.0.2`。

arm64 架构由准备脚本和 App Bundle 校验负责，运行时不再调用 `lipo` 等系统开发工具。其余检查结果使用结构化 Swift 错误表达。当前工作项不把错误接入下载任务 UI，只提供下一工作项可调用的稳定边界。

## 安全与更新边界

- Swift 使用 `Process.executableURL` 和参数数组执行工具，不拼接 Shell 命令。
- `yt-dlp` 运行时始终使用 `--ignore-config` 与 `--no-update`，不读取用户级配置，也不自更新。
- 工具路径、版本和校验值来自仓库清单，不接受扩展消息或帖子内容覆盖。
- 校验脚本只处理项目固定目录，不写入系统目录或用户可执行搜索路径。
- 第三方许可随 App Bundle 保存；本阶段不声称已完成未来对外分发所需的全部法律审查。

## 验证

- 脚本验证：校验值、下载内容或架构不符时失败；正确输入可以重复准备。
- Swift 测试：覆盖 Bundle 工具路径、缺失文件、不可执行和版本不符的结构化错误。
- 构建验证：Xcode Test、Build 成功，且不发生网络访问或工具自动更新。
- App Bundle 校验：两个工具和许可文件存在，权限正确，直接从 Bundle 路径执行可返回固定版本，FFmpeg 为 arm64。
- 不新增截图、样式、Popover、焦点、指针或键盘自动化测试。

## 后续工作边界

下一个主 Issue 才会调用工具解析公开视频、建立串行队列、下载最高画质并把文件移动到桌面。本工作项不提前创建下载服务、进度解析、任务状态或未来 UI 占位代码。
