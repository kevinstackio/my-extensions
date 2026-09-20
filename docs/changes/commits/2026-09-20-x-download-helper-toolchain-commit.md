# 打包 X Download Helper 固定视频工具链：交付记录

## 元信息

- 工作项：`2026-09-20-x-download-helper-toolchain`
- 对应 Issue：[打包 X Download Helper 固定视频工具链](../issues/2026-09-20-x-download-helper-toolchain-issue.md)
- 状态：已完成
- 用户验收：通过
- 最终提交批准：已批准
- 创建日期：2026-09-20
- 最近更新：2026-09-20

## 预期交付边界

- 将固定版本的 `yt-dlp` 与 `ffmpeg` 打包进 Helper App Bundle。
- 增加应用内工具路径解析、可执行性检查和版本校验。
- 验证 Helper 构建产物不依赖 Homebrew、Python 或系统 `PATH`。
- 不实现真实媒体解析、下载、任务状态或界面调整。

## 实际完成内容

- 增加固定版本清单、官方下载来源、SHA-256 校验和第三方许可说明；FFmpeg 优先读取本地官方归档。
- 增加工具准备脚本与 fixture 行为测试，覆盖本地归档优先、摘要、版本、架构失败及旧产物保留。
- 生成并校验真实 `yt-dlp 2026.08.19` 与原生 arm64 `ffmpeg 9.0.2`，接入 App Bundle 的 `Contents/Resources/Tools`。
- 增加 `VideoToolPaths`、`VideoToolValidator` 与 8 个失败/成功分支 XCTest，不搜索系统 PATH。

## 验证结果

- `zsh apps/helpers/x-download-helper/Tests/PackagingTests/verify_video_tool_preparation.sh` 通过。
- 真实准备脚本通过，`yt-dlp --ignore-config --no-update --version` 输出 `2026.08.19`，`ffmpeg -version` 输出 `9.0.2`，`lipo -archs` 输出 `arm64`。
- 授权环境下 `zsh apps/helpers/x-download-helper/scripts/build.sh` 构建成功，工具复制到 `Contents/Resources/Tools`。
- 授权环境下 `xcodebuild test ... CODE_SIGNING_ALLOWED=NO` 通过，21 个测试零失败。
- `zsh apps/helpers/x-download-helper/scripts/verify_app_bundle.sh` 通过。

## 未验证事项与限制

- 普通沙箱直接执行 `yt-dlp` 会因 `semctl` 权限限制失败；授权环境版本校验和 Bundle 验证均通过，属于当前执行环境限制。
- 用户已确认桌面环境验收无问题；本阶段不新增视觉或交互自动化测试。

## 用户验收

- 结果：未开始
- 说明：待阶段实现和自动化验证完成后由用户确认。

## 最终 Commit message

```text
build(x-download-helper): 打包固定版本视频下载工具链

- 将固定版本的 yt-dlp 与 ffmpeg 打包进 Helper App Bundle
- 增加应用内工具路径解析、可执行性检查和版本校验
- 验证 Helper 构建产物不依赖 Homebrew、Python 或系统 PATH
```

## 最终提交批准

- 状态：未申请
- 说明：用户验收通过后，另行展示最终文件、diff、验证结果与 Commit message。
