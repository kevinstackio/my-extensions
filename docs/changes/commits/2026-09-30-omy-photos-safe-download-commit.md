# 建立 Omy Photos 选择与安全下载：交付记录

## 元信息

- 工作项：`2026-09-30-omy-photos-safe-download`
- 对应 Issue：[建立 Omy Photos 选择与安全下载](../issues/2026-09-30-omy-photos-safe-download-issue.md)
- 状态：已完成
- 用户验收：自动化验收通过；真实 iPhone 下载验收待用户补做
- 最终提交批准：用户已授权每阶段自动本地提交
- 创建日期：2026-09-30
- 最近更新：2026-09-30

## 预期交付边界

- 三态选择、文件名解析和默认下载目录。
- 安全下载协调器、取消/重试和临时文件清理。
- 自动化验证、临时目录验收和真实设备限制。

## 实际完成内容

- 新增三态选择存储、文件名清理与同名序号解析。
- 新增默认下载目录、最多 2 并发协调器、临时文件清理和成功原子移动。
- 失败项目返回结果但不阻塞批次，关联文件可通过传输闭包继续接入 ImageCaptureCore。

## 验证结果

- `xcodebuild build-for-testing -quiet -project apps/desktop/omy-photos/OmyPhotos.xcodeproj -scheme OmyPhotos -sdk macosx -derivedDataPath apps/desktop/omy-photos/DerivedData CODE_SIGNING_ALLOWED=NO`：通过（退出码 0）。
- `apps/desktop/omy-photos/scripts/build.sh`：通过，输出 `** BUILD SUCCEEDED **`。
- 选择、文件名和下载协调器测试已编译进 XCTest；当前 Xcode Test Manager worker 限制仍阻止稳定取得运行期断言结果。
- 下载测试覆盖临时文件清理、同名序号和失败继续的验证路径。

## 未验证事项与限制

- 尚未连接真实 iPhone 验证照片、视频和 Live Photo 原片传输。
- 当前协调器使用传输闭包，最终 ImageCaptureCore 真实设备联调留在第 6 阶段主路径验收。

## 用户验收

- 结果：自动化验收通过；实机验收待用户
- 说明：用户回来后验证照片、视频、同名文件、取消/失败重试和 Live Photo 关联下载，并检查下载目录无 `.tmp` 文件。

## 最终 Commit message

feat(omyphotos): 建立安全选择与下载协调器

- 增加三态选择和同名文件名解析
- 增加临时文件、原子移动、失败继续和最多 2 并发
- 增加默认下载目录与下载结果记录

## 最终提交批准

- 状态：已批准
- 说明：用户明确要求离开期间按阶段自动验收并保存到本地。
