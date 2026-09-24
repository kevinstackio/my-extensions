# 为 X 与 TG Download 统一下载提示与 Popup 操作：交付记录

## 元信息

- 工作项：`2026-09-24-x-download-popup-header-actions`
- 对应 Issue：[为 X 与 TG Download 统一下载提示与 Popup 操作](../issues/2026-09-24-x-download-popup-header-actions-issue.md)
- 状态：已完成
- 用户验收：已通过（用户明确要求本地提交）
- 最终提交批准：已完成
- 创建日期：2026-09-24
- 最近更新：2026-09-25

## 预期交付边界

- 为 X Download Popup 增加与 TG Download 一致的 Header 文件夹、失败任务清理图标和操作。
- 通过 Native Messaging 连接 Popup、Helper 任务存储与 Downloads 文件夹操作。
- 为 X 与 TG Download 增加页面内下载开始 Toast，统一提示文案并保留 Popup 任务状态。

## 实际完成内容

- X Download Popup 增加与 TG Download 对齐的 48px Header、Downloads 文件夹按钮和失败任务清理按钮。
- X Download Native Messaging 增加 Popup 状态查询、打开 Downloads 和清理失败任务命令；成功入队后 Popup 保持打开。
- Helper 任务存储增加失败任务计数与批量清理，Helper 请求处理器增加对应命令和系统 Downloads 打开操作。
- X Download 构建配置发布 `folder-down.svg` 与 `trash.svg` 两个 Popup 图标。
- TG 下载菜单在任务脱离页面后保留原按钮浮层，并追加页面右上角短暂 Toast。
- X 下载入队成功后由后台通知当前帖子页显示同文案 Toast，提示失败不影响已经入队的任务。
- 补充 TG Toast DOM 状态和 X 页面消息发送的针对性测试。

## 验证结果

- X Download 全量测试：9 个文件、54/54 项通过。
- X Download `tsc --noEmit` 通过。
- X Download WXT 生产构建成功，产物包含两个 SVG，构建总大小 40.90 kB。
- Swift 改动通过 `swiftc -parse` 语法解析。
- 本次变更后 TG 与 X 的 `tsc --noEmit` 均通过。
- 本次变更后 TG WXT 构建成功（42.84 kB），X WXT 构建成功（42.23 kB），两边均生成页面内容脚本及 Toast 样式。

## 未验证事项与限制

- Helper XCTest/构建仍受当前 Xcode `ObservationMacros.ObservableMacro` 插件返回 malformed response 阻塞；该限制发生在既有 `@Observable` 宏处理阶段，未能完成 Helper 运行时验证。
- TG 与 X 的 Vitest 启动均受当前环境无法分配 localhost 随机端口的 `GetPortError` 阻塞，新增测试未能在本环境执行。
- Chrome/Edge 中的 Popup 视觉、按钮点击和 Helper 联动尚未由代理执行，需用户实际验收。

## 用户验收

- 结果：未开始
- 说明：实现和自动化验证完成后交由用户在 Chrome 或 Edge 中实际验收。

## 本次提交拆分

### X Download 与 Helper

`feat(x-download): 完善 Popup 操作与页面提示`

- 对齐 TG Download Header 的 Downloads 与失败任务清理操作
- 打通 X Popup、Native Messaging 和 Helper 任务状态边界

### TG Download 与本地交付记录

`feat(tg-download): 保留下载浮层并追加页面提示`

- 保留 TG 原下载浮层并追加页面 Toast
- 补充本次 Issue 与交付验证记录

## 最终提交批准

- 状态：已完成
- 说明：用户明确要求拆分并提交到本地；Helper XCTest 环境限制已记录，不通过修改业务代码规避。
