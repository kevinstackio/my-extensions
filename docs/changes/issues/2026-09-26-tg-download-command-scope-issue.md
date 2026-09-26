# 收敛 TG Download 与根目录命令职责

## 元信息

- 工作项：`2026-09-26-tg-download-command-scope`
- 项目：`tg-download`
- 类型：小型任务
- 状态：已完成
- 当前阶段：用户已验收并完成本地 Git Commit
- 创建日期：2026-09-26
- 最近更新：2026-09-26

## 背景

根目录目前同时提供各项目的开发和构建快捷命令，项目自身也保留了相同职责的脚本，导致命令入口重复。TG Download 还没有统一的检查和发布包命令。

## 目标

让根目录只承担跨项目开发入口，TG Download 在项目目录内提供职责清晰且最少的日常命令，为后续 GitHub Release 自动化保留可复现的项目级打包入口。

## 范围

- 根目录保留 `dev:all` 及各项目的 `*:dev` 快捷命令。
- 根目录移除各项目的 `build` 快捷命令。
- TG Download 保留 `dev`、`build`、`postinstall`，增加 `check` 和 `package`。
- `check` 串行执行 TypeScript 类型检查与 Vitest 测试。
- `package` 调用 WXT 生成生产发布包。
- 更新本 Issue、Commit 记录和工作台当前 Issue 状态。

## 排除项

- 不修改 X Download Helper 的脚本、Xcode 工程或验证流程。
- 不修改 VitePress 项目脚本或网站内容。
- 不创建 GitHub Actions、Tag、Release 或插件市场发布流程。
- 不修改扩展业务代码、Manifest 权限、版本号或测试用例。
- 不删除 WXT `postinstall` 生命周期脚本。

## Todo

- [x] 更新根目录脚本，只保留开发入口。
- [x] 更新 TG Download 项目脚本，增加 `check` 与 `package`。
- [x] 检查 JSON、脚本映射和文档状态，完成必要的自动化验证。
- [x] 用户验收通过并创建本地 Git Commit。

## 验收标准

- 根目录只剩开发相关脚本，不再提供 `tabs:build`、`tg:build`、`x:build`、`x-helper:build` 或 `vitepress:build`。
- TG Download 项目提供 `dev`、`check`、`build`、`package` 和 `postinstall`。
- `postinstall` 仍执行 `wxt prepare`，安装依赖后可生成 WXT TypeScript 配置。
- `check` 的命令链包含 `tsc --noEmit` 和 `vitest run`。
- `package` 的命令为 `wxt zip`，不新增商店发布命令。
- 不涉及 Helper、VitePress 和业务代码变更。

## 关联文档

- [Commit 记录](../commits/2026-09-26-tg-download-command-scope-commit.md)

## 唯一下步

当前交付已完成；后续如需 GitHub Release 自动化，另行创建新的 Issue。
