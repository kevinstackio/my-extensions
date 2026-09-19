# 建立本地项目管理体系

## 元信息

- 工作项：`2026-09-19-repo-local-project-management`
- 项目：`repo`
- 类型：架构
- 状态：已完成
- 当前阶段：最终交付
- 创建日期：2026-09-19
- 最近更新：2026-09-19

## 背景

本仓库改用 Git 管理的本地文档记录想法、工作项、设计、实施计划、验收结果和阶段提交。

改造前的 `AGENTS.md` 依赖外部项目管理系统，`docs/project-change-documentation.md` 与最终讨论结果也不一致，`docs/superpowers/` 仍被 Git Ignore。需要通过一次独立改造统一这些规则。

## 目标

建立一套适合个人顺序开发的本地项目管理流程，使代理和用户能够从仓库文档中确定：当前正在做什么、为什么做、按什么顺序实施、怎样验收，以及何时允许创建最终 Git Commit。

## 范围

- 建立 `docs/changes/README.md` 工作台。
- 使用扁平的 `issues/` 和 `commits/` 目录保存工作项与交付记录。
- 保留 `docs/superpowers/specs/` 和 `docs/superpowers/plans/` 作为正式设计与计划位置，并纳入 Git 管理。
- 使用公共文件名前缀关联 Issue、Spec、Plan 和 Commit 记录。
- 重写根 `AGENTS.md` 中的项目管理、阶段验收和提交规则。
- 将插件级规则中的外部 Issue 术语改为本地工作项术语。
- 移除当前正式规则中对外部项目管理系统的依赖。
- 清理与当前代码或最终流程冲突的历史文档。
- 更新仍具有长期价值但内容已经过时的技术文档。

## 排除项

- 不改写旧 Git Commit。
- 不在本次改造中创建个人 Skill；只保证仓库结构以后适合被 Skill 操作。
- 不引入自动生成索引、优先级、标签、负责人或截止日期系统。

## Sub-issues

### 1. 固化本地文档结构

- 状态：已完成
- 依赖：无
- 交付结果：建立工作台、Issue、Commit、Spec 和 Plan 的职责与关联方式。
- 验收标准：目录没有重复事实来源，命名可以稳定关联同一工作项。

### 2. 重写仓库工作流规则

- 状态：已完成
- 依赖：Sub-issue 1
- 交付结果：`AGENTS.md` 以本地文档为唯一项目管理方案，并适配 Superpowers。
- 验收标准：现行规则不再要求外部项目管理系统，批准、验收和 Commit 门槛清楚。

### 3. 清理冲突文档并验证流程

- 状态：已完成
- 依赖：Sub-issue 2
- 交付结果：移除冲突历史文档，更新长期技术说明，检查正式文档结构、链接和 Git Ignore 状态。
- 验收标准：文档链接有效，`git diff --check` 通过，正式目录可用于下一个真实 Issue。

## 验收标准

- `docs/changes/README.md` 能显示想法、当前唯一 Issue、队列和完成记录。
- 一个主 Issue 只使用一份 `-issue.md` 和一份 `-commit.md`。
- Sub-issue 只存在于主 Issue 内部。
- Issue、Spec、Plan 和 Commit 记录使用相同公共前缀并互相链接。
- Issue 与 Commit 记录在工作项开始时同步创建，并始终一一对应。
- Issue 记录预期验收标准，Commit 记录实际验证和用户验收结果。
- Spec 和 Plan 不复制到 `changes/`。
- 当前 Issue 的交付 Commit 完成前不能开启下一个 Issue。
- Plan 批准、规划 Commit 批准、用户验收和最终 Commit 批准是相互独立的用户授权。
- `docs/superpowers/` 纳入 Git 管理。
- 仓库现行工作流不再依赖外部项目管理系统。
- 不修改业务代码。

## 文档

- [正式设计](../../superpowers/specs/2026-09-19-repo-local-project-management-design.md)
- [实施计划](../../superpowers/plans/2026-09-19-repo-local-project-management.md)
- [Commit 记录](../commits/2026-09-19-repo-local-project-management-commit.md)

## 下一步

本 Issue 已由用户验收并批准最终提交。后续独立需求创建新的 Issue 和 Commit 记录。
