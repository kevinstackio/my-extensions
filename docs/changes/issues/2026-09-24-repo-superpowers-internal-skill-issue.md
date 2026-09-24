# 制作本地 Issue 与 Commit 工作流 Skill

## 元信息

- 工作项：`2026-09-24-repo-superpowers-internal-skill`
- 项目：`repo`
- 类型：小型任务
- 状态：已完成
- 当前阶段：用户验收通过，工作流规则修正和最终 Git Commit 已完成
- 创建日期：2026-09-24
- 最近更新：2026-09-24

## 背景

内网 Agent 无法直接搜索或安装外部 Skill。用户已经自行下载官方 Superpowers，希望另行获得一项与 Superpowers 独立、同级安装的本地 Issue 与 Commit 管理工作流 Skill。

## 目标

制作一项独立、可离线导入的 `local-issue-commit-workflow` Skill，用于指导 Agent 按本仓库约定管理本地 Issue、Commit 记录、阶段验收与最终 Git Commit 批准。

## 范围

- 在仓库 `skills/local-issue-commit-workflow/` 中维护自定义 Skill 源文件。
- Skill 说明创建 Issue、Commit 记录、可选 Spec/Plan、阶段验收与最终 Git Commit 批准流程。
- 提供 Issue 和 Commit 记录模板，但不复制当前仓库的动态 Issue、队列或完成状态。
- 提供与 Codex/Superpowers 打包兼容的 `agents/openai.yaml` 元数据。
- Skill 与 Superpowers 不互相引用，可分别导入并同级使用。
- 同步修正仓库和 Skill 的验收提交规则：用户在阶段交付后明确要求本地提交时，同时表示验收通过和提交批准。

## 排除项

- 不读取、修改、合并或重新打包用户下载的 Superpowers。
- 不安装到当前用户或内网 Agent。
- 不发布到公共 Marketplace、GitHub Release 或其他外部系统。
- 不在本任务中建立自动更新机制。
- 不生成合并后的 Superpowers ZIP。
- 不执行子代理或并行 Agent 测试。

## Todo

- [x] 创建并验证 `local-issue-commit-workflow` Skill 及模板。
- [x] 验证目录结构、UTF-8、Markdown、链接和 Skill 元数据。
- [x] 整理独立导入步骤并完成用户验收。
- [x] 按验收反馈统一本地提交、验收通过和 Issue 关闭规则。

## 验收标准

- `skills/local-issue-commit-workflow/` 可独立打包和导入。
- Skill 目录包含可发现的 `SKILL.md` 和 Codex 元数据。
- Skill 不包含当前仓库的动态工作状态，只描述可迁移的流程和判断规则。
- Issue 与 Commit 模板包含必要字段，并保持 UTF-8 编码。
- Skill 的目录结构、frontmatter、Markdown、本地链接和文件清单校验通过。
- 提供与 Superpowers 分别导入、同级使用的说明。

## 关联文档

- [Commit 记录](../commits/2026-09-24-repo-superpowers-internal-skill-commit.md)

## 唯一下一步

当前 Issue 已完成，可开始下一个已批准工作项。
