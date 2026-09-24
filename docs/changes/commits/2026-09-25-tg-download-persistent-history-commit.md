# 保留 TG Download 下载历史列表：交付记录

## 元信息

- 工作项：`2026-09-25-tg-download-persistent-history`
- 对应 Issue：[保留 TG Download 下载历史列表](../issues/2026-09-25-tg-download-persistent-history-issue.md)
- 状态：已完成
- 用户验收：已通过
- 最终提交批准：已批准
- 创建日期：2026-09-25
- 最近更新：2026-09-25

## 预期交付边界

- TG Download 使用 `browser.storage.local` 保存下载历史。
- Popup 展示下载中、已完成和失败任务，浏览器启动后仍能读取历史。
- 保持现有 Toast、保存流程、主题图标和文件夹入口。

## 实际完成内容

- 后台使用 `browser.storage.local` 保存任务快照，Popup 通过统一历史快照读取，不再依赖当前 Telegram 标签页。
- Popup 按加入时间倒叙展示，清理按钮只移除已完成和失败记录，下载中的任务保持不变。
- 成功任务保留为 `completed`，失败任务保留为 `failed`，浏览器启动时将遗留的 `downloading` 标记为 `interrupted` 失败。
- Popup 增加下载中、完成和失败的进度条与状态颜色区分；清空操作同步移除持久化的完成/失败记录和页面终态任务，不影响正在下载的任务。

## 验证结果

- TG `tsc --noEmit` 通过。
- 去除 WXT Vitest 插件端口依赖后，15 个测试文件、77 个测试通过。
- TG WXT 生产构建成功，构建总大小 54.18 kB。
- 生产构建已同步到 `dist/chrome-mv3-dev-stable`，Manifest 包含 `storage` 权限。
- `git diff --check` 通过。

## 未验证事项与限制

- 原始 `./node_modules/.bin/vitest run` 仍受当前环境无法分配 localhost 随机端口的 `GetPortError` 阻塞；未将该环境限制改写为业务代码。
- 用户通过明确的本地提交请求确认本阶段验收和提交批准；浏览器视觉细节仍以加载稳定产物后的实际表现为准。

## 用户验收

- 结果：已通过
- 说明：下载历史持久化、倒序列表、终态清理和状态颜色已纳入本次交付；稳定产物路径保持不变。

## 最终 Commit message

- `feat(tg-download): 持久化下载历史列表`
- `docs(tg-download): 补全下载历史交付记录`

## 最终提交批准

- 状态：已批准
- 说明：用户明确要求补全注释并拆分提交，本次提交范围已完成。
