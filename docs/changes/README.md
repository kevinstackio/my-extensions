# 项目改造工作台

本目录是仓库项目管理的统一入口。这里保存想法、当前唯一活动 Issue、后续队列和已完成索引；具体目标与状态以对应 Issue 为准。

## 目录结构

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

同一工作项的 Issue、Commit 记录、Spec 和 Plan 使用相同的 `YYYY-MM-DD-<project>-<topic>` 前缀关联，不维护递增编号或 Commit SHA。

## 文档职责

- Issue：唯一任务事实来源，记录目标、范围、排除项、Todo 或 Sub-issues、预期验收标准、状态和下一步。
- Commit 记录：与 Issue 同时创建并一一对应，记录实际交付、验证、用户验收和最终 Commit message。
- Spec：只在存在真实设计分歧、架构边界或兼容性决策时创建。
- Plan：只在包含多个实施步骤、依赖关系或较高风险时创建。
- 工作台：只负责想法、当前 Issue、队列和完成索引，不复制 Issue 内容。

个人 Skill 可以维护“如何操作这套流程”，但不得复制仓库里的动态状态。

## 工作规则

- 同一时间最多只有一个活动 Issue。
- 除纯问答和只读调查外，任何准备修改仓库的独立工作都先建立 Issue 和 Commit 记录。
- 创建 Issue 时必须同步创建同名前缀的 Commit 记录；只要有 Issue，就必须有 Commit 记录。
- 一个 Issue 对应一个可整体验收、独立回滚的结果和一个最终交付 Git Commit。
- Sub-issue 只在 Issue 内部定义实施阶段，不创建独立文件，也不单独提交。
- 简单任务直接在 Issue 中维护 3–6 个 Todo，不强制创建 Spec 或 Plan。
- 当前 Issue 的最终交付 Commit 成功前，不开启下一个 Issue；临时想法先写入收件箱。
- 自动化验证、用户验收和 Git Commit 批准是三个独立步骤。
- 用户验收通过后只能进入提交准备；展示最终文件、diff 和 Commit message 并再次取得批准后，才能执行 `git commit`。

## 状态

```text
想法 → 已排队 → 规划中 → 待批准 → 实施中 → 待验收 → 待提交 → 已完成
```

还可以使用 `已暂停` 或 `已取消`。暂停、取消或提交失败时，必须先安全处理当前未提交改动，不能直接开启下一个 Issue。

## 日常用法

### 临时小调整

1. 从想法或用户需求创建一份 Issue 和一份待填写 Commit 记录。
2. 在 Issue 中写清范围、排除项、3–6 个 Todo 和验收标准。
3. 用户批准后实施并完成必要验证。
4. 用户验收通过后完善 Commit 记录。
5. 展示最终 diff 和 Commit message，等待用户批准 Git Commit。
6. 最终审批请求同时列出将两份文档和工作台切换为完成状态的机械性更新；批准后执行这些更新并提交，提交失败则恢复原状态。

### 复杂改造

1. 创建 Issue 和 Commit 记录。
2. 需要设计决策时编写 Spec；需要多步骤执行时编写 Plan。
3. 用户分别批准设计、Plan 和可选的规划 Commit。
4. 串行实施、验证并停在用户验收。
5. 验收通过后完成 Commit 记录，再单独申请最终 Git Commit 批准。

## 想法收件箱

想法只表示可能开展的方向，不代表已经批准创建 Issue 或开始实施。

当前没有其他想法。

## 当前 Issue

当前没有活动 Issue。

## Issue 队列

1. [完善 X Download 视频下载失败恢复](./issues/2026-09-20-x-download-download-recovery-issue.md)
   - [Commit 记录](./commits/2026-09-20-x-download-download-recovery-commit.md)

## 已完成

- [让 X Download 使用页面媒体源下载视频](./issues/2026-09-21-x-download-page-media-source-issue.md)
  - [Commit 记录](./commits/2026-09-21-x-download-page-media-source-commit.md)
  - [Spec](../superpowers/specs/2026-09-21-x-download-page-media-source-design.md)
  - [Plan](../superpowers/plans/2026-09-21-x-download-page-media-source.md)
- [建立 X Download Helper 视频下载执行链路](./issues/2026-09-20-x-download-public-video-download-issue.md)
  - [Commit 记录](./commits/2026-09-20-x-download-public-video-download-commit.md)
  - [Spec](../superpowers/specs/2026-09-20-x-download-public-video-download-design.md)
  - [Plan](../superpowers/plans/2026-09-20-x-download-public-video-download.md)
- [打包 X Download Helper 固定视频工具链](./issues/2026-09-20-x-download-helper-toolchain-issue.md)
  - [Commit 记录](./commits/2026-09-20-x-download-helper-toolchain-commit.md)
- [打通 X Download 扩展与 macOS Helper 通信](./issues/2026-09-20-x-download-native-messaging-issue.md)
  - [Commit 记录](./commits/2026-09-20-x-download-native-messaging-commit.md)
- [完善 X Download Helper 任务列表与 Popover 收起](./issues/2026-09-20-x-download-helper-task-list-feedback-issue.md)
  - [Commit 记录](./commits/2026-09-20-x-download-helper-task-list-feedback-commit.md)
- [建立 X Download macOS 菜单栏 Helper](./issues/2026-09-19-x-download-helper-menu-bar-issue.md)
  - [Commit 记录](./commits/2026-09-19-x-download-helper-menu-bar-commit.md)
- [建立本地项目管理体系](./issues/2026-09-19-repo-local-project-management-issue.md)
  - [Commit 记录](./commits/2026-09-19-repo-local-project-management-commit.md)
- [建立 X 单帖链接识别插件](./issues/2026-09-19-x-download-post-url-issue.md)
  - [Commit 记录](./commits/2026-09-19-x-download-post-url-commit.md)
