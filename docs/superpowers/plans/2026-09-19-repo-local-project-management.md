# 本地项目管理体系实施计划

## 关联文档

- Issue：[建立本地项目管理体系](../../changes/issues/2026-09-19-repo-local-project-management-issue.md)
- Spec：[本地项目管理体系设计](../specs/2026-09-19-repo-local-project-management-design.md)
- Commit 记录：[交付记录](../../changes/commits/2026-09-19-repo-local-project-management-commit.md)
- 状态：已完成

## 目标

将仓库中仍在生效的项目管理与技术文档统一到本地 Issue、Commit 记录、Spec 和 Plan 模型，并删除会误导后续工作的失效历史说明。

## 实施步骤

### 1. 固化项目管理规则

- 更新根 `AGENTS.md`，移除外部项目管理依赖并写入单活动 Issue、Issue/Commit 一一对应、验收与最终提交双重批准规则。
- 完善 `docs/changes/README.md` 的工作台、状态和日常用法。
- 同步当前 Issue、Spec 和 Commit 记录。
- 从 `.gitignore` 中移除 `/docs/superpowers/`。

### 2. 清理冲突历史

- 删除旧项目变更目录方案和 My Tabs 迁移历史。
- 删除已经失效的 Popover 迁移决策和空的 TG Download 子项目规则。
- 删除 `docs/superpowers/` 中已经完成且仍使用旧编号的历史 Spec 与 Plan。

### 3. 同步长期文档

- 在根 README 中增加本地项目管理入口。
- 更新 WXT 文档中的 My Tabs React 现状。
- 将 My Tabs 迁移提示改成可复用的迁移经验。
- 更新 My Tabs README 和子项目规则中的 DropdownMenu、Tooltip、资源目录和验收描述。

### 4. 验证并停止在用户验收

- 检查 Issue 与 Commit 记录是否一一对应。
- 检查仓库正式文档是否仍依赖外部项目管理系统或旧 Popover 迁移状态。
- 检查 Markdown 代码块、相对链接、空白错误和 Git Ignore 状态。
- 更新当前 Issue、Commit 记录和工作台到“待验收”。
- 展示最终 diff、验证结果和建议 Commit message，不执行 Git Commit。

## 停止点

文档验证完成后必须等待用户验收。只有用户明确验收通过，才能完善最终 Commit message；只有用户再次批准最终提交，才能执行 `git commit`。
