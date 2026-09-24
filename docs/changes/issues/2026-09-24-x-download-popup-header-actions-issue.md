# 为 X 与 TG Download 统一下载提示与 Popup 操作

## 元信息

- 工作项：`2026-09-24-x-download-popup-header-actions`
- 项目：`download`
- 类型：中型任务
- 状态：待验收
- 当前阶段：X Popup Header、扩展协议、Helper 任务清理和 X/TG 页面 Toast 已实现；两边类型检查与构建通过，Vitest 和 Helper XCTest 受环境限制
- 创建日期：2026-09-24
- 最近更新：2026-09-24

## 背景

X Download 当前 Popup 只有入队结果状态，缺少 TG Download Popup Header 右侧的下载目录和失败任务操作。X Download 的失败任务由 macOS Helper 持有，扩展侧不能直接复用 TG Download 的标签页消息，需要沿现有 Native Messaging 边界增加受控命令。两边在下载开始后还需要统一显示页面内的短暂提示，避免用户只能依赖按钮浮层或 Popup 判断是否已入队。

## 目标

让 X Download Popup Header 右侧提供与 TG Download 一致的两个图标及功能：打开 Downloads 文件夹、清理失败任务；同时让 X 与 TG Download 在下载入队后都在原页面显示“已开始下载，可在扩展中查看进度”的短暂 Toast，并保留两边现有媒体检测、保存和任务入队流程。

## 范围

- 复用 TG Download 的 Header 结构、两个 SVG 图标、按钮尺寸和禁用语义。
- 扩展 X Download 与 Helper 的 Native Messaging 操作协议，支持查询失败任务、打开 Downloads 文件夹和清理失败任务。
- Popup 保留标题与状态内容；入队成功后不再自动关闭，使 Header 操作可用。
- X 与 TG 页面在下载开始后追加页面 Toast，原有下载浮层和 Popup 任务状态继续保留；Toast 自动淡出。
- 增加与协议、任务清理和 Popup 状态对应的自动化验证。

## 排除项

- 不改变 X Download 的媒体来源捕获、视频下载流程、任务重试或取消行为。
- 不新增下载历史、持久化队列、系统通知、设置页或跨平台 Helper 能力。
- 不把页面 Toast 扩展为系统通知、跨标签页广播或下载完成提醒。
- 不在开发阶段执行浏览器视觉验收；Chrome/Edge 加载与 Popup 交互由用户验收。

## Todo

- [x] 为 X Download Native Messaging 增加失败任务查询、打开 Downloads 和清理失败任务命令，并保持现有入队协议兼容。
- [x] 将 TG Download 的两个 SVG 图标和 Header 交互移植到 X Download Popup，按失败任务状态启用或禁用垃圾桶按钮。
- [x] 在 Helper 任务存储中实现打开 Downloads 与清理失败任务，并补齐协议和 Helper 单元测试。
- [ ] 在本次页面 Toast 范围变更后重新完成 X/TG 全量测试、类型检查、生产构建和必要语法解析。
- [x] 为 X 与 TG 页面接入统一文案的页面 Toast，并保留下载开始后的原按钮浮层提示。
- [x] 补充两边页面提示消息链路的针对性自动化验证；当前测试运行受本地随机端口限制，需在可用环境复跑。
- [ ] 在 ObservationMacros 可用的 Xcode 环境中完成 Helper XCTest 与可运行构建验证。

## 验收标准

- X Download Popup Header 右侧显示文件夹和垃圾桶两个图标，尺寸、间距、深色模式处理与 TG Download 一致。
- 文件夹按钮打开系统 Downloads 文件夹；垃圾桶按钮仅在存在失败任务时可用，点击后清理 Helper 中的失败任务并刷新禁用状态。
- 入队成功后 Popup 保持打开并继续显示现有状态内容；媒体来源不足、无效页面和 Helper 失败状态不改变原有文案。
- X 与 TG 在下载成功入队后，发起下载的页面显示短暂 Toast；原下载按钮浮层和 Popup 状态仍可见，页面不可注入时不影响入队结果和 Popup 状态。
- X/TG 类型检查和生产构建通过；两边全量测试需在可分配 localhost 端口的环境复跑，Helper 在正常 Xcode 环境完成 XCTest 与可运行构建后，且不引入未批准的其他行为。

## 关联文档

- [Commit 记录](../commits/2026-09-24-x-download-popup-header-actions-commit.md)

## 唯一下一步

用户加载 X 与 TG Download 构建产物，分别在 X 帖子和 Telegram 媒体页面触发下载，验收页面 Toast、Popup 状态、Header 两个按钮及原有状态流程；Helper XCTest 需在 ObservationMacros 可用环境中复验。
