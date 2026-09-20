# X Download Helper 固定视频工具链 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. 本仓库禁止子代理、并行任务和阶段性 Git Commit；所有步骤串行执行，最终只申请一次交付 Commit。

**Goal:** 将固定版本的 `yt-dlp` 与原生 arm64 `ffmpeg` 打包进 Helper，并提供可验证的 Bundle 内工具路径。

**Architecture:** 准备脚本按固定 URL 和 SHA-256 生成 Git 忽略的本地工具，Xcode 将其复制到 `Contents/Resources/Tools`。Swift 只从当前 App Bundle 定位并校验版本，不搜索系统路径；工具准备、打包和运行时检查保持独立。

**Tech Stack:** zsh、SHA-256、FFmpeg configure/make、Xcode project、Swift `Foundation.Process`、XCTest

**Spec:** `docs/superpowers/specs/2026-09-20-x-download-helper-toolchain-design.md`

## Global Constraints

- 只支持当前 Apple Silicon Mac 与 macOS 14 及以上。
- 固定 `yt-dlp 2026.08.19`，`yt-dlp_macos` SHA-256 为 `0f192b7ec147ab6288885d6351d9ab67367640029b4377576ef46dd79cf7b202`。
- 固定 `FFmpeg 9.0.2`，官方源码归档 SHA-256 为 `8c3850283eb25fa026482078a04051e0be17347b09ef81a0849bec15a96e002e`。
- 普通 Test、Build 和运行不联网，不使用 Homebrew、Python、Rosetta 或系统 `PATH`。
- Swift 只用 `Process.executableURL` 与参数数组执行工具；所有新增代码注释使用中文。
- 不实现帖子解析、真实下载、任务状态、UI、自动更新、签名或分发。
- 每个任务只形成验证停点，不执行 Git Commit；最终 Commit message 使用 Issue 已批准文本。

## Review Focus

- 官方资产内容与固定 SHA-256 不符时，准备流程必须失败并保留上一份有效工具。
- 只存在 x86_64 FFmpeg 时，准备或 Bundle 校验必须拒绝，不能依赖 Rosetta。
- 本地工具缺失时，普通构建必须明确失败，不能联网补齐或回退系统工具。
- Bundle 外的同名可执行文件不能被 Swift 定位器接受。
- 工具退出非零、输出空白或版本不符时，Swift 必须返回结构化错误。

---

### Task 1: 固定工具清单与可重复准备脚本

**Files:**
- Create: `apps/helpers/x-download-helper/Tools/toolchain.env`
- Create: `apps/helpers/x-download-helper/Tools/THIRD_PARTY_NOTICES.md`
- Create: `apps/helpers/x-download-helper/VendorTools/README.md`
- Create: `apps/helpers/x-download-helper/scripts/prepare-video-tools.sh`
- Create: `apps/helpers/x-download-helper/Tests/PackagingTests/verify_video_tool_preparation.sh`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `VendorTools/yt-dlp`、`VendorTools/ffmpeg`；二者均为可执行文件，且只有所有校验通过后才替换旧产物。

- [x] **Step 1:** 先写脚本行为测试，使用临时目录覆盖正确校验、错误 SHA-256、错误版本、仅 x86_64 FFmpeg 和失败时保留旧产物。
- [x] **Step 2:** 运行 `zsh apps/helpers/x-download-helper/Tests/PackagingTests/verify_video_tool_preparation.sh`，确认因准备脚本尚不存在而失败。
- [x] **Step 3:** 写入精确 URL、版本和上述 SHA-256；实现优先读取 `Tools/downloads/ffmpeg-9.0.2.tar.xz`、缺失时才下载到 `mktemp -d`，并完成校验、FFmpeg arm64 构建、版本检查和最终替换。FFmpeg configure 至少使用：
  ```text
  --arch=arm64 --target-os=darwin --disable-doc --disable-debug --disable-ffplay --disable-ffprobe --disable-autodetect
  --disable-everything --enable-protocol=file --enable-demuxer=mov,mpegts
  --enable-muxer=mp4 --enable-parser=aac,h264,hevc
  --enable-bsf=aac_adtstoasc,h264_mp4toannexb,hevc_mp4toannexb
  ```
- [x] **Step 4:** 将 `VendorTools/yt-dlp`、`VendorTools/ffmpeg` 加入 `.gitignore`，在 README 记录准备命令，在许可文件记录 yt-dlp Release 与 FFmpeg 9.0.2 来源和许可边界。
- [x] **Step 5:** 重跑脚本行为测试；再执行 `zsh apps/helpers/x-download-helper/scripts/prepare-video-tools.sh`，确认生成工具版本正确且 `lipo -archs VendorTools/ffmpeg` 包含 `arm64`。

### Task 2: 将固定工具打包进 Helper App Bundle

**Files:**
- Modify: `apps/helpers/x-download-helper/XDownloadHelper.xcodeproj/project.pbxproj`
- Modify: `apps/helpers/x-download-helper/scripts/build.sh`
- Create: `apps/helpers/x-download-helper/scripts/verify_app_bundle.sh`

**Interfaces:**
- Consumes: `VendorTools/yt-dlp`、`VendorTools/ffmpeg`、`Tools/THIRD_PARTY_NOTICES.md`。
- Produces: `X Download Helper.app/Contents/Resources/Tools/{yt-dlp,ffmpeg,THIRD_PARTY_NOTICES.md}`。

- [x] **Step 1:** 编写 Bundle 验证脚本，要求三个文件存在，两个工具可执行、版本精确、FFmpeg 包含 arm64；先运行并确认当前 Bundle 因缺少 `Tools` 失败。
- [x] **Step 2:** 在 Xcode 工程增加 “Embed Video Tools” Copy Files 阶段，目标为 `Contents/Resources/Tools`；输入只引用固定 VendorTools 文件和许可文件。
- [x] **Step 3:** 让 `scripts/build.sh` 在调用 `xcodebuild` 前只检查本地工具是否齐全，不下载、不编译、不回退系统路径；缺失时提示执行准备脚本。
- [x] **Step 4:** 运行 `zsh apps/helpers/x-download-helper/scripts/verify_app_bundle.sh`，确认 Bundle 路径、权限、版本和 arm64 校验全部通过。

### Task 3: 增加 Bundle 内工具定位与版本检查

**Files:**
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Tools/VideoToolPaths.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelper/Features/Downloads/Tools/VideoToolValidator.swift`
- Create: `apps/helpers/x-download-helper/XDownloadHelperTests/VideoToolValidatorTests.swift`
- Modify: `apps/helpers/x-download-helper/XDownloadHelper.xcodeproj/project.pbxproj`

**Interfaces:**
- Produces: `struct VideoToolPaths { let ytDLP: URL; let ffmpeg: URL }`；`protocol VideoToolValidating { func validatedTools(in bundleURL: URL) throws -> VideoToolPaths }`；`struct VideoToolValidator: VideoToolValidating`。
- Injects: `typealias VideoToolProcess = (_ executable: URL, _ arguments: [String]) throws -> (status: Int32, stdout: String, stderr: String)`。
- Errors: `VideoToolError.missing(String)`、`.notExecutable(String)`、`.outsideBundle(String)`、`.launchFailed(String)`、`.versionMismatch(tool: String, expected: String, actual: String)`。

- [x] **Step 1:** 写 XCTest，覆盖正确 Bundle、文件缺失、不可执行、Bundle 外路径、非零退出、空输出和两个版本不匹配。
- [x] **Step 2:** 运行 `xcodebuild test -project apps/helpers/x-download-helper/XDownloadHelper.xcodeproj -scheme XDownloadHelper -derivedDataPath apps/helpers/x-download-helper/.build CODE_SIGNING_ALLOWED=NO`，先确认因类型尚不存在而失败；最终授权环境测试通过。
- [x] **Step 3:** 实现最小定位器与可注入进程执行闭包；版本参数固定为 `yt-dlp --ignore-config --no-update --version` 和 `ffmpeg -version`，不读取环境变量、不执行 Shell。
- [x] **Step 4:** 重跑 XCTest；确认成功返回两个 Bundle 内绝对路径，全部失败分支返回约定错误。

### Task 4: 完整验证与阶段验收

**Files:**
- Modify: `docs/changes/issues/2026-09-20-x-download-helper-toolchain-issue.md`
- Modify: `docs/changes/commits/2026-09-20-x-download-helper-toolchain-commit.md`

- [x] **Step 1:** 串行运行准备脚本行为测试、Swift XCTest、`scripts/build.sh`、Bundle 验证和 `git diff --check`；同一失败只允许一次定位和一次修复重试。
- [x] **Step 2:** 检查 `git status --short` 与完整 diff，确认没有第三方源码、生成工具、真实视频下载代码或后续 Issue 内容进入交付。
- [x] **Step 3:** 更新 Issue Todo 和 Commit 记录，只填写实际完成、实际验证与未验证限制，状态停在“待验收”。
- [x] **Step 4:** 向用户展示 App Bundle 中两个工具的路径、版本、架构和复现命令；等待用户验收，不提交 Git Commit，也不启动第二个 Issue。
