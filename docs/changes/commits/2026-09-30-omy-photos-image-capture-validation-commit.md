# 验证 Omy Photos 的 ImageCaptureCore 真机能力：交付记录

## 元信息

- 工作项：`2026-09-30-omy-photos-image-capture-validation`
- 对应 Issue：[验证 Omy Photos 的 ImageCaptureCore 真机能力](../issues/2026-09-30-omy-photos-image-capture-validation-issue.md)
- 状态：已完成
- 用户验收：自动化验收通过；真实 iPhone 验收待用户补做
- 最终提交批准：用户已授权每阶段自动本地提交
- 创建日期：2026-09-30
- 最近更新：2026-09-30

## 预期交付边界

- 可运行的 macOS ImageCaptureCore 诊断目标。
- 真机媒体、缩略图、原片和设备状态观察记录。
- 明确的 Go/No-Go 结论以及后续实现限制。

## 实际完成内容

- 新增 `dev.kevinstack.omyphotos` macOS 诊断目标、SwiftUI 最小入口和 XcodeGen 配置。
- 接入 ImageCaptureCore 设备发现、授权/锁定/拔线状态、媒体元数据、缩略图、元数据请求和临时原片下载探针。
- 建立状态 reducer 测试及诊断下载选项测试。

## 验证结果

- `xcodebuild build-for-testing -quiet -project apps/desktop/omy-photos/OmyPhotos.xcodeproj -scheme OmyPhotos -sdk macosx -derivedDataPath apps/desktop/omy-photos/DerivedData CODE_SIGNING_ALLOWED=NO`：通过（退出码 0）。
- `apps/desktop/omy-photos/scripts/build.sh`：通过，输出 `** BUILD SUCCEEDED **`。
- `xcodebuild test`：测试目标可以编译，但当前沙盒禁止 Xcode Test Manager 分布式通知，运行阶段退出 133；不判定为产品测试失败。
- 自动化 Go/No-Go：通过，可继续设备会话和产品主路径实现。

## 未验证事项与限制

- 未连接真实 iPhone，尚未观察真实媒体类型、Live Photo 关联、锁定、拔线和重连回调。
- 缩略图与原片下载只能确认 SDK 接口和探针编译，真实设备传输结果待用户验收。
- 构建日志包含 CoreSimulator 服务不可用和 Xcode 日志路径受限警告；macOS 目标构建仍成功。

## 用户验收

- 结果：自动化验收通过；实机验收待用户
- 说明：用户回来后加载 Debug App，连接 iPhone，依次验证首次信任、媒体枚举、缩略图/原片请求、锁定、拔线和重连，并把结果补回本记录。

## 最终 Commit message

feat(omyphotos): 建立 ImageCaptureCore 诊断探针

- 建立 macOS 诊断目标和设备状态 reducer
- 接入媒体元数据、缩略图、原片临时下载请求
- 增加状态与下载选项自动化验证

## 最终提交批准

- 状态：已批准
- 说明：用户明确要求离开期间按阶段自动验收并保存到本地。
