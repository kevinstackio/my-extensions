# 修复 TG Download 草稿发布工作流运行失败：交付记录

## 元信息

- 工作项：`2026-09-27-tg-download-draft-release-fix`
- 对应 Issue：[修复 TG Download 草稿发布工作流运行失败](../issues/2026-09-27-tg-download-draft-release-fix-issue.md)
- 状态：已完成
- 用户验收：已通过（用户明确要求提交到本地并合并到 `main`）
- 最终提交批准：已批准
- 创建日期：2026-09-27
- 最近更新：2026-09-27

## 预期交付边界

- 修复版本未升级时 pnpm 缓存收尾导致的工作流失败。
- 升级 pnpm Action 的 Node 运行时并修正 ZIP 校验脚本参数。
- 保持原有版本发布和草稿 Release 行为不变。

## 实际完成内容

- 将 `pnpm/action-setup` 升级到 `v6.1.0`，继续使用精确的 pnpm `12.4.2`。
- 移除 `actions/setup-node` 的 `cache: pnpm`，避免版本未升级跳过安装时在收尾阶段保存不存在的 store。
- 修正 ZIP 校验脚本的 `process.argv.slice(2)` 参数读取。

## 验证结果

- 旧配置的缓存检查和 ZIP 参数检查均按预期失败，修复后均通过。
- 工作流 YAML 可由 Ruby 解析，Action 版本、Node 版本、缓存配置和参数偏移检查通过。
- `git diff --check` 通过。

## 未验证事项与限制

- 尚未重新运行 GitHub Actions；真实 runner 的跳过路径和 Node 24 Action 日志需推送后验证。
- 尚未执行版本升级后的真实 Tag、草稿 Release 和 Chrome/Edge 加载验收。

## 用户验收

- 结果：已通过
- 说明：用户明确要求提交到本地并合并到 `main`。

## 最终 Commit message

`ci(tg-download): 修复草稿发布工作流失败`

## 最终提交批准

- 状态：已批准
- 说明：用户批准创建本地 Git Commit 并合并到本地 `main`；不推送远端。
