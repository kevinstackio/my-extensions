# 将 TG Download 默认保存目录改为下载文件夹：交付记录

## 元信息

- 工作项：`2026-09-23-tg-download-default-save-directory`
- 对应 Issue：[将 TG Download 默认保存目录改为下载文件夹](../issues/2026-09-23-tg-download-default-save-directory-issue.md)
- 状态：已完成
- 用户验收：已通过
- 最终提交批准：已批准
- 创建日期：2026-09-23
- 最近更新：2026-09-23

## 预期交付边界

- 将 TG Download 系统文件保存窗口的默认目录从桌面改为系统 Downloads 目录。
- 为保存窗口设置稳定 picker ID，使用户首次选择 `TG Download` 后后续保存默认进入同一目录。
- 保留系统文件保存窗口、建议文件名和用户手动选择其他目录的能力。
- 保持现有媒体下载、取消、成功、失败和菜单反馈行为不变。
- 不新增目录设置界面、持久化配置或静默自动下载。

## 实际完成内容

- 将 `showSaveFilePicker` 的默认起始位置从 `desktop` 改为系统 `downloads`。
- 为保存窗口加入固定 `tg-download` picker ID，使用户首次选择或创建 `TG Download` 后后续保存默认沿用该目录。
- 图片和视频共用同一保存目录和 picker ID，没有增加分类子目录。

## 验证结果

- 针对性媒体保存测试：6/6 通过。
- 完整 TG Download Vitest：8 个测试文件、29 个测试全部通过。
- TypeScript 类型检查：`tsc --noEmit` 通过。
- WXT 构建：`dist/chrome-mv3` 构建成功，Manifest 和内容脚本产物存在。
- `git diff --check`：通过。

## 未验证事项与限制

- 当前会话无法在已登录 Telegram Web 和已加载扩展的真实 Chrome/Edge 环境中完成保存窗口操作；用户已确认验收方案和预期行为。
- 首次使用需要用户在系统保存窗口中创建或选择 `Downloads/TG Download`；本次实现不自动创建目录。

## 用户验收

- 结果：已通过
- 说明：用户已确认默认目录和目录记忆行为符合预期，并明确要求完成提交。

## 最终 Commit message

```text
fix(tg-download): 将默认保存目录切换为 Downloads

- 将保存窗口默认起始位置改为系统 Downloads 并记住 TG Download 目录
- 补充默认目录行为测试和本地 Docs 交付记录
```

## 最终提交批准

- 状态：已批准
- 说明：用户已确认验收通过并明确要求执行本地 Git Commit，不推送远端。
