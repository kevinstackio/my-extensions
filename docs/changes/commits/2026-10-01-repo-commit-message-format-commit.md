# 补充本地 Commit 正文换行规范：交付记录

## 元信息

- 工作项：`2026-10-01-repo-commit-message-format`
- 对应 Issue：[补充本地 Commit 正文换行规范](../issues/2026-10-01-repo-commit-message-format-issue.md)
- 状态：已完成
- 用户验收：用户已确认通过
- 最终提交批准：用户已明确批准本地提交
- 创建日期：2026-10-01
- 最近更新：2026-10-01

## 预期交付边界

- 在根目录规范和本地工作流 Skill 中补充真实换行规则。
- 保留现有 Conventional Commits 约束，不修改历史提交。

## 实际完成内容

- `AGENTS.md` 增加真实 LF 换行规则，禁止把字面量 `\n` 写入 Commit 正文。
- `skills/local-issue-commit-workflow/SKILL.md` 增加多个 `-m`、`-F` 和提交后检查建议。
- 保留现有 Conventional Commits 类型、scope、标题和正文条数规则，不修改历史 Commit。

## 验证结果

- `git diff --check`：通过。
- 文档静态检查：确认两个规范来源均包含真实换行约束和可执行提交方式。

## 未验证事项与限制

- 用户已确认规范变更并要求提交到本地 Git。

## 用户验收

- 结果：通过。

## 最终 Commit message

`docs(repo): 补充 Commit 正文换行规范`

## 最终提交批准

- 状态：已批准并已提交本地 Git。
