---
name: local-issue-commit-workflow
description: Use when a repository manages changes through local Issue and Commit records, requires one active work item, or ties user acceptance to an explicit local Git commit request.
---

# Local Issue and Commit Workflow

## 核心原则

仓库中的适用 `AGENTS.md`、工作台和当前 Issue 是事实来源；用户最后明确批准的内容优先。本 Skill 只规定操作方法，不保存项目的动态状态。

## 先判断是否需要工作项

- 纯问答和只读调查：直接完成，不创建 Issue 或 Commit 记录。
- 准备修改文件、代码、配置、资源、测试、Git 状态或外部系统：先明确目标、范围、排除项和验收标准，并取得用户批准。
- 未找到仓库自己的工作台或规则：说明缺失，不得自行搭建项目管理体系。

## 开始修改前

1. 读取适用的 `AGENTS.md` 和 `docs/changes/README.md`。
2. 检查当前活动 Issue；有活动 Issue 时继续该工作项，不得另开新项。
3. 范围获批且没有活动 Issue 后，同时创建同名前缀的 Issue 与 Commit 记录。
4. 将新 Issue 登记为工作台中的唯一活动 Issue，然后才开始其他修改。

默认公共前缀为 `YYYY-MM-DD-<project>-<topic>`：

```text
docs/changes/issues/<前缀>-issue.md
docs/changes/commits/<前缀>-commit.md
```

创建文件时使用 [Issue 模板](assets/issue-template.md) 和 [Commit 记录模板](assets/commit-template.md)。状态、字段职责、任务规模和提交规则见 [工作流参考](references/workflow.md)。

## 实施与验收

- Issue 记录目标、范围、排除项、Todo、验收标准、状态和唯一下一步。
- Commit 记录先保持待填写，只记录预期边界；实施后再补充实际交付和验证结果。
- Todo 只有在实际完成并验证后才能勾选。
- 阶段实现和自动化验证完成后，停在用户验收，不得把测试通过表述为用户已验收。
- 用户单独明确验收通过后，把记录更新为“待提交”。

## Git Commit 硬门槛

自动化验证不能代替用户验收。用户在看到阶段交付材料后明确要求本地 Git Commit 时，该请求同时表示验收通过和提交批准。执行 `git commit` 前必须展示或已经展示：

- 待提交文件和 diff 摘要；
- 验证结果及未验证事项；
- 完整 Commit message；
- 将随提交发生的 Issue、Commit 记录和工作台终态更新。

明确的本地提交请求覆盖已展示范围内的机械性终态更新和 `git commit`。提交成功时必须同步关闭 Issue；若内容或 diff 随后发生其他变化，原批准失效；若提交失败，恢复为真实的“待提交”和“未批准”状态。

## 冲突处理

仓库规则或用户批准与本 Skill 不一致时，以仓库规则和用户最后明确批准为准，并同步当前 Issue。不得让聊天内容或本 Skill 成为唯一事实来源。
