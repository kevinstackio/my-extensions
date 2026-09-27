# 删除根目录聚合开发与构建命令

## 元信息

- 工作项：`2026-09-28-repo-remove-aggregate-commands`
- 项目：`repo`
- 类型：小型任务
- 状态：已完成
- 当前阶段：用户已验收并批准本地 Git Commit
- 创建日期：2026-09-28
- 最近更新：2026-09-28

## 背景

根目录的 `dev:all` 在并发启动多个长期开发服务时会因为单个任务失败而终止整组任务，用户日常开发已改用各项目独立命令。现行 `docs/monorepo.md` 仍介绍 `dev:all` 和 `build:all`，其中 `build:all` 已不是根目录脚本。

## 目标

删除根目录聚合开发命令，并移除现行文档中对 `dev:all`、`build:all` 及其聚合入口的介绍，保留各项目独立开发、构建和测试命令。

## 范围

- 从根 `package.json` 删除 `dev:all`。
- 从 `docs/monorepo.md` 删除 `dev:all`、`build:all` 和聚合命令说明，改为说明根目录不提供聚合开发/构建入口。
- 保留 `tabs:dev`、`tg:dev`、`x:dev`、`vitepress:dev` 和各项目自身命令。
- 更新本 Issue、Commit 记录和工作台状态。

## 排除项

- 不修改扩展业务代码、端口配置、依赖、构建工具或测试实现。
- 不修改根 `README.md` 中未涉及聚合命令的项目介绍。
- 不修改历史 Issue、Commit、Spec 或 Plan 中的既有事实记录。
- 不修改 `build` 任务本身或各项目的构建脚本。

## Todo

- [x] 删除根 `package.json` 的 `dev:all`。
- [x] 清理 `docs/monorepo.md` 的聚合开发与构建命令说明。
- [x] 检查现行文档和脚本引用，执行 JSON、文档引用及 diff 校验。
- [x] 用户验收通过并批准本地 Git Commit。

## 验收标准

- 根 `package.json` 不再包含 `dev:all` 或其他根目录聚合开发命令。
- 根 `package.json` 不包含 `build:all`；现行文档也不再把它作为可用命令介绍（该脚本原本已不存在）。
- `tabs:dev`、`tg:dev`、`x:dev`、`vitepress:dev` 及各项目自身命令保持不变。
- 根 `README.md`、历史项目记录和业务代码无非目标改动。
- JSON 解析、现行引用扫描和 `git diff --check` 通过。

## 关联文档

- [Commit 记录](../commits/2026-09-28-repo-remove-aggregate-commands-commit.md)

## 唯一下步

本地 Git Commit 已完成；后续远端推送和 `main` 合并按用户明确指示执行。
