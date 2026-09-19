# 本地项目管理体系设计

## 设计状态

- 对应 Issue：[`2026-09-19-repo-local-project-management`](../../changes/issues/2026-09-19-repo-local-project-management-issue.md)
- 状态：已批准
- 日期：2026-09-19

## 目标

用 Git 管理的本地文档取代外部项目管理系统，建立适合个人、顺序开发的项目管理流程。仓库文档必须能够独立表达想法、当前工作、设计、实施顺序、验收结果和提交门槛，同时避免维护两份 Spec、Plan 或验收记录。

## 信息架构

```text
docs/
├─ changes/
│  ├─ README.md
│  ├─ issues/
│  │  └─ YYYY-MM-DD-<project>-<topic>-issue.md
│  └─ commits/
│     └─ YYYY-MM-DD-<project>-<topic>-commit.md
└─ superpowers/
   ├─ specs/
   │  └─ YYYY-MM-DD-<project>-<topic>-design.md
   └─ plans/
      └─ YYYY-MM-DD-<project>-<topic>.md
```

所有相关文件共用相同前缀：

```text
YYYY-MM-DD-<project>-<topic>
```

例如：

```text
2026-09-19-repo-local-project-management-issue.md
2026-09-19-repo-local-project-management-design.md
2026-09-19-repo-local-project-management.md
2026-09-19-repo-local-project-management-commit.md
```

公共前缀是工作项标识，不再额外维护递增编号。

## 文档职责

### `changes/README.md`

工作台负责：

- 记录尚未形成正式工作项的想法。
- 显示当前唯一的活动 Issue。
- 保存后续 Issue 的顺序队列。
- 索引已经完成的 Issue。
- 记录仍在整理中的工作方式；规则稳定后可以提取为个人 Skill。

具体项目状态继续保存在仓库中。个人 Skill 只保存“如何维护这些文档”的操作方法，不复制动态想法和工作队列。

### `-issue.md`

Issue 是一次可以整体验收、整体提交和独立回滚的交付单元，负责记录：

- 背景与目标；
- 范围与排除项；
- 状态和当前阶段；
- 内部 Sub-issue；
- 预期验收标准；
- Spec、Plan 和 Commit 记录链接；
- 唯一下一步。

### `-design.md`

Spec 只在存在真实设计分歧、架构边界或兼容性决策时创建，负责记录：

- 架构与模块边界；
- 数据流和接口；
- 关键技术决策；
- 替代方案；
- 风险、兼容性和非目标。

Spec 不记录 Todo、执行进度或实际验收结果。

### Plan

Plan 只在任务包含多个实施步骤或较高风险时创建，负责记录：

- 对应 Issue 与 Sub-issue；
- 影响文件或模块；
- 依赖顺序；
- 可执行 Todo；
- 针对性测试和阶段完整验证；
- 停止点。

简单 Issue 可以把少量 Todo 直接写在 Issue 中，不创建独立 Plan。

### `-commit.md`

Commit 记录与 Issue 同时创建并保持一一对应。初始状态只保存预期交付边界和待填写栏目，实施过程中逐步补充，最终负责记录：

- 关联 Issue；
- 实际完成结果；
- 实际执行的自动化验证；
- 未验证内容和限制；
- 用户验收结果；
- 最终 Commit message；
- 最终提交批准状态。

Commit 记录不保存 Commit SHA，不复制 Plan，也不记录规划 Commit。

## Issue 与 Sub-issue 划分

主 Issue 必须同时满足：

- 产生一个明确的用户或仓库结果；
- 可以整体完成和整体验收；
- 可以放入一个最终交付 Git Commit；
- 可以独立回滚；
- 具有明确范围、排除项和完成条件。

Sub-issue 是主 Issue 内部有明确顺序的阶段，但不具有独立提交价值。它只存在于 `-issue.md` 中，不创建独立文件。

使用以下判断顺序：

1. 如果一部分即使后续永远不做也仍有独立价值，则建立新的主 Issue。
2. 如果只有完成整个主 Issue才有意义，则定义为 Sub-issue。
3. 如果只是修改文件、增加测试、删除旧代码或运行命令，则只是 Plan Todo。

一个主 Issue 通常包含 1–3 个 Sub-issue。超过 3 个时优先拆分为多个顺序主 Issue，并在 `changes/README.md` 中按同一主题组织。

## 单活动 Issue

仓库采用单线程工作模式：

- 同一时间最多有一个活动主 Issue。
- 可以随时向想法收件箱增加内容。
- 当前 Issue 的最终交付 Commit 成功前，不得把下一个 Issue 标记为活动状态。
- 不得提前修改下一个 Issue 对应的业务代码。
- 当前 Issue 验收不通过时继续处理当前 Issue。
- 当前 Issue 被取消时，必须先安全处理其未提交改动。

## 状态模型

```text
想法 → 已排队 → 规划中 → 待批准 → 实施中 → 待验收 → 待提交 → 已完成
```

特殊状态为 `已暂停` 和 `已取消`。暂停或取消不能隐式释放活动 Issue；必须先确认未提交改动已经得到安全处理。

## 验收职责

Issue 与 Commit 都包含验收信息，但不重复职责：

- Issue 使用未来时描述“怎样才算完成”。
- Commit 使用过去时记录“实际验证了什么、用户是否确认通过”。

自动化验证通过不等于用户验收通过。用户明确表示验收通过后，才允许把已有 Commit 记录更新为待提交并进入最终提交准备。

## 两类 Git Commit

复杂 Issue 可以产生两类 Git Commit。没有独立 Spec 和 Plan 的简单 Issue 只创建最终交付 Commit，其少量 Todo 随 Issue 一起进入最终交付 Commit。

### 规划 Commit

规划 Commit 是可选项，用于保存已经批准的 Issue、Spec 和 Plan，使实施依据受到 Git 保护。Plan 获得批准不自动授权规划 Commit；只有用户明确要求并批准后才能创建。

### 最终交付 Commit

最终交付 Commit 保存实现、测试、完成状态和 `-commit.md`。一个 Issue 只对应一个最终交付 Commit；`-commit.md` 也只对应这个最终交付 Commit。

用户验收通过只允许进入提交准备阶段，不等于允许执行 `git commit`。最终提交前必须展示：

- 完成内容；
- 自动化验证结果；
- 未验证内容和限制；
- 用户验收结果；
- `git status`；
- 准备提交的文件；
- 最终 diff 摘要；
- 完整 Commit message。

只有用户明确批准最终提交后才能执行。除下一段列出的机械性终态更新外，如果批准后文件或 diff 发生变化，原批准失效，必须重新展示并审批。

最终审批请求可以提前列出随提交执行的机械性终态更新，包括把批准状态改为“已批准”，以及把 Issue、Commit 记录和工作台改为“已完成”。用户批准后只允许执行这些已列明的字段更新；其他变化仍会使批准失效。Git Commit 失败时必须恢复为“待提交”和“待批准”。

## Issue 开始条件

- 上一个 Issue 的最终交付 Commit 已成功创建。
- 当前工作区没有混入其他 Issue 的改动。
- 对应 Issue 和待填写 Commit 记录已经同步创建。
- Issue 已明确目标、范围、排除项和验收标准。
- 必要的 Spec 已经批准。
- 必要的 Plan 已经批准。
- 如果用户要求创建规划 Commit，该 Commit 已经由用户批准并成功创建。
- `changes/README.md` 已将其设为唯一活动 Issue。

## Issue 完成条件

- Plan Todo 已完成。
- 自动化验证已经实际执行。
- 未验证内容和限制已经说明。
- 用户明确确认验收通过。
- 与 Issue 同时创建的 `-commit.md` 已补全实际结果并保持正确关联。
- 最终文件和 diff 已检查。
- 完整 Commit message 已展示。
- 用户明确批准最终提交。
- Issue、Commit 记录和 `changes/README.md` 的终态更新已纳入最终交付内容。
- 最终交付 Git Commit 已成功创建；只有此时上述“已完成”状态才成为仓库事实。

## 范围变化与异常处理

- 不改变用户目标的小调整可以更新当前 Plan。
- 改变设计或批准范围时，必须暂停实施，先更新 Issue、Spec 和 Plan 并重新批准。
- 新增独立用户结果时，将其放回想法收件箱，不扩大当前 Issue。
- 用户验收不通过时继续修改当前 Issue，不进入 Commit 阶段。
- Commit 创建失败时保持“待提交”，不得开启下一个 Issue。
- 已完成 Issue、Commit 记录和 Plan 原则上冻结；新的开发范围建立新 Issue。

## Superpowers 接入

Superpowers 提供工作方法，仓库规则决定正式产物、批准门槛和执行限制：

- `brainstorming` 的正式结果写入 `docs/superpowers/specs/`。
- `writing-plans` 的结果写入 `docs/superpowers/plans/`。
- `executing-plans` 串行执行当前 Plan。
- 不启动子代理或并行任务。
- 不自动创建规划 Commit 或最终交付 Commit。
- 测试、浏览器验收和停止点继续服从仓库 `AGENTS.md`。

`docs/superpowers/` 必须纳入 Git 管理。Superpowers 默认行为与仓库规则冲突时，以 `AGENTS.md`、当前 Issue 和用户最后批准的内容为准。

## 迁移边界

实施本设计时：

- 重写当前正式项目管理规则，移除对外部项目管理系统的依赖。
- 修改仍在生效的插件级外部 Issue 表述。
- 删除与最终结构冲突的旧项目变更方案、迁移历史和已失效决策记录。
- 更新仍具有长期价值但内容已经过时的项目技术文档。
- 移除 `.gitignore` 中的 `/docs/superpowers/`。
- 不修改仓库外部配置或数据。
- 不改写 Git 历史。

## 非目标

- 不支持多个并行活动 Issue。
- 不实现自动状态同步或索引生成。
- 不引入外部项目管理服务。
- 不建立优先级、标签、负责人和截止日期体系。
- 不创建 Sub-issue 文件。
- 不保存 Commit SHA。
- 不在本次改造中创建个人 Skill。
