# 收口 Omy Photos 最小 MVP 稳定性：交付记录

## 元信息

- 工作项：`2026-09-30-omy-photos-mvp-hardening`
- 对应 Issue：[收口 Omy Photos 最小 MVP 稳定性](../issues/2026-09-30-omy-photos-mvp-hardening-issue.md)
- 状态：已完成
- 用户验收：自动化验收通过；真实 Mac+iPhone 最终验收待用户补做
- 最终提交批准：用户已授权每阶段自动本地提交，本次按授权执行
- 创建日期：2026-09-30
- 最近更新：2026-09-30

## 预期交付边界

- 前五阶段接口的最小主路径接线与恢复测试。
- 完整构建、Bundle 配置和测试运行限制记录。
- 真实设备最终验收清单与 MVP 是否可长期自用的明确结论。

## 实际完成内容

- 将 `DeviceSession` 的媒体目录接入月份网格，设备断开时清理媒体引用，并通过 ImageCaptureCore 传输选中原片。
- 将三态选择、下载按钮和最多 2 并发安全下载协调器接入应用入口。
- 增加 40 万条选择压力与失败恢复覆盖，包含不可用目标目录和临时文件清理边界。

## 验证结果

- `apps/desktop/omy-photos/scripts/build.sh`：通过，输出 `** BUILD SUCCEEDED **`。
- `xcodebuild build-for-testing -quiet -project apps/desktop/omy-photos/OmyPhotos.xcodeproj -scheme OmyPhotos -sdk macosx -derivedDataPath apps/desktop/omy-photos/DerivedData CODE_SIGNING_ALLOWED=NO`：通过（退出码 0）。
- `git diff --check`：通过。
- Bundle 检查通过：`dev.kevinstack.omyphotos`、`Omy Photos`、macOS `27.0`。
- XCTest 测试目标已编译；当前环境的 Xcode Test Manager worker/分布式通知限制导致 `xcodebuild test` 无法稳定取得运行期断言结果，未将其误报为通过。

## 未验证事项与限制

- 当前尚未连接真实 iPhone，不能确认最终设备、滚动、下载和异常恢复行为。
- Instruments 不能在当前代理环境中替代用户真实 Mac 性能记录。
- 当前网格未在代理环境执行视觉、布局、焦点或指针验收；缩略图和真实 ImageCaptureCore 原片传输需用户实机确认。

## 用户验收

- 结果：自动化验收通过；真实 Mac+iPhone 最终验收待用户
- 说明：用户回来后打开构建产物，连接并信任 iPhone，验证月份网格、单项/月份选择、重复文件名不覆盖、失败继续、锁定/拔线/重连和下载目录无 `.tmp` 文件。

## 最终 Commit message

feat(omyphotos): 收口最小 MVP 主路径

- 串联设备媒体目录、月份网格和三态选择
- 接入 ImageCaptureCore 安全下载与失败恢复边界
- 增加大图库选择压力、目标目录失败和临时文件清理验证

## 最终提交批准

- 状态：已批准
- 说明：用户明确要求离开期间按阶段自动验收、保存到本地并继续下一阶段；真实设备验收限制保留。
