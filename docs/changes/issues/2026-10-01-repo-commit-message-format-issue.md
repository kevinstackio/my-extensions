# 补充本地 Commit 正文换行规范

## 元信息

- 工作项：`2026-10-01-repo-commit-message-format`
- 项目：`repo`
- 类型：小型任务
- 状态：已完成
- 当前阶段：用户验收通过，已提交本地 Git
- 创建日期：2026-10-01
- 最近更新：2026-10-01

## 背景

现有本地 Commit 规范规定了 Conventional Commits 格式和正文内容，但没有明确正文必须使用真实换行，导致部分提交把字面量 `\n` 写入 Git Commit message。

## 目标

补充可执行的 Commit 正文换行规则，避免后续提交出现不可渲染的字面量 `\n`。

## 范围

- 更新根目录 `AGENTS.md` 的 Git Commit 规范。
- 更新 `skills/local-issue-commit-workflow/SKILL.md` 的提交硬门槛说明。
- 明确真实 LF 换行与 `\n` 字面量的区别，并给出安全的提交方式。

## 排除项

- 不修改已有 Git Commit 历史或 Commit SHA。
- 不修改现有 Issue、Commit 记录的正文格式。
- 不改变 Conventional Commits 的类型、scope 或标题规则。

## Todo

- [x] 在 `AGENTS.md` 补充正文换行规则。
- [x] 在本地工作流 Skill 补充同一规则和提交方式。
- [x] 检查文档差异与规则表述一致性。
- [x] 用户验收通过并完成本地 Git Commit。

## 验收标准

- 两个规范来源都明确要求使用真实换行，不得写入字面量 `\n`。
- 两个规范来源都给出使用多个 `-m` 或 `-F` 生成多行正文的可执行建议。
- 不修改历史 Git Commit，文档差异检查通过。

## 关联文档

- [Commit 记录](../commits/2026-10-01-repo-commit-message-format-commit.md)

## 唯一下一步

已完成规范更新与本地提交；无需后续步骤。
