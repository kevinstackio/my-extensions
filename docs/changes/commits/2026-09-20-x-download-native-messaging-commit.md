# 打通 X Download 扩展与 macOS Helper 通信：交付记录

## 元信息

- 工作项：`2026-09-20-x-download-native-messaging`
- 对应 Issue：[打通 X Download 扩展与 macOS Helper 通信](../issues/2026-09-20-x-download-native-messaging-issue.md)
- 状态：已完成
- 用户验收：通过
- 最终提交批准：已批准
- 创建日期：2026-09-20
- 最近更新：2026-09-20

## 预期交付边界

- 使用 Native Messaging Bridge 和本机 Unix Domain Socket 打通扩展与 macOS Helper。
- 点击插件图标后，由 Popup 展示连接、无效页面或未检测到 Helper 的状态。
- Helper 接收有效帖子任务后新增“已接收”记录并自动展开菜单栏 Popover。
- 提供 Chrome、Edge 本地开发注册和卸载脚本。
- 保持无真实下载、无媒体解析、无文件写入、无持久化、无系统通知和无生产分发。

## 实际完成内容

- 扩展新增版本化 Native Messaging 请求/响应协议、纯逻辑校验、后台当前标签页入队流程和 Popup 状态页。
- Helper 新增独立 `XDownloadNativeHost` Target、四字节小端帧 Bridge、Helper 启动重试、用户级 Unix Socket、任务处理和 Popover 展开。
- Helper 任务列表改为空列表起步，收到任务后以“已接收”状态展示，按 `postId` 去重并支持移除。
- 增加稳定开发 Manifest Key、Chrome/Edge Native Host 安装卸载脚本及打包校验。
- Helper 启动时自动注册或刷新两套 Host Manifest，手动脚本保留为卸载和排障后备入口。

## 验证结果

- TypeScript 类型检查通过；扩展 Vitest 5 个测试文件、30 个测试通过。
- WXT 构建通过；Native Host 独立 Xcode Target 构建通过。
- Native Host 临时目录安装/卸载脚本验证通过；`git diff --check` 通过。
- Helper 完整 XCTest 当前受本机 Xcode `ObservationMacros` 插件返回 malformed response 阻断，未将该环境错误改写为业务修复。

## 未验证事项与限制

- Chrome、Edge 与 macOS Helper 的实际端到端行为已由用户在本机验收通过。
- Helper 完整 XCTest 需在 Observation 宏插件可用的 Xcode 环境重新运行。
- 当前工作项不验证真实媒体下载、文件产物、任务恢复或生产安装流程。

## 用户验收

- 结果：通过
- 说明：用户已确认 extension 与 Helper 通信、自动注册和任务接收流程可用。

## 最终 Commit messages

```text
feat(x-download): 接入 macOS Helper 通信

- 增加 Native Messaging 协议、后台转发和 Popup 状态反馈
- 固定开发扩展 ID 并覆盖通信边界测试
```

```text
feat(x-download-helper): 接收扩展任务并自动注册 Native Host

- 增加 Native Host Bridge、Unix Socket 和已接收任务流程
- 自动注册 Chrome 与 Edge Host Manifest 并完善打包验证
- 记录端到端验收结果和交付终态
```

## 最终提交批准

- 状态：已批准
- 说明：用户已审核待提交范围、验证结果、限制与两个 Commit message，并要求 extension 与 helper 分开提交。
