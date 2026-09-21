# 建立 VitePress 官网脚手架

## 元信息

- 工作项：`2026-09-21-web-vitepress-bootstrap`
- 项目：`web`
- 类型：架构任务
- 状态：已完成
- 当前阶段：实现、自动化验证和用户验收均已完成；`build:all` 中现有 WXT 包仍受共享依赖问题阻断，不影响 VitePress 独立构建
- 创建日期：2026-09-21
- 最近更新：2026-09-21

## 背景

仓库已有空的 `apps/web` 目录，但它尚未包含 `package.json`，也不匹配当前 `pnpm-workspace.yaml` 的 `apps/*/*` 规则。直接在该目录安装 VitePress 会被 pnpm 判定为向工作区根项目添加依赖。

## 目标

将 `apps/web` 建立为独立的 VitePress 官网项目，保留官方 Default Theme 官网模板，并通过 Turbo 从仓库根目录执行开发和构建命令。

## 范围

- 将 `apps/web` 纳入 pnpm workspace，使用根 `pnpm-lock.yaml`。
- 创建独立的 `@my-extensions/web` 包并启用 ESM。
- 按官方流程本地安装 VitePress，保存解析后的精确版本。
- 运行 VitePress 官方初始化器，生成 Default Theme、TypeScript 配置和官网式首页模板。
- 在根 `package.json` 提供基于 Turbo 的 `vitepress:dev` 和 `vitepress:build` 命令。
- 将 VitePress 构建产物输出到 `apps/web/dist`，复用现有 Turbo `dist/**` 缓存规则并参与 `build:all`。
- 忽略 VitePress 缓存与构建产物，并同步根 README 中的项目结构。

## 排除项

- 不编写正式官网文案或插件产品页。
- 不自定义 VitePress 主题、Vue 组件、Logo 或视觉样式。
- 不配置搜索、统计、域名、CI 或部署。
- 不将 VitePress 依赖安装到仓库根项目。
- 不增加预览命令或部署服务器配置。

## Todo

- [x] 审阅并批准 Spec。
- [x] 编写并批准实施 Plan。
- [x] 接入 pnpm workspace 并建立 `@my-extensions/web` 包。
- [x] 安装精确版本 VitePress，运行官方初始化器并添加根命令。
- [x] 完成构建、开发服务器可达性和用户本地验收。

## 验收标准

- 在仓库根目录执行 `pnpm vitepress:dev` 能启动 VitePress 开发服务器。
- 浏览器打开本地地址后能看到 VitePress Default Theme 的官网式首页模板。
- 在仓库根目录执行 `pnpm vitepress:build` 能通过 Turbo 成功生成 `apps/web/dist` 静态产物。
- 执行 `pnpm build:all` 时官网作为 workspace 项目参与统一构建。
- `package.json` 和锁文件中不出现浮动依赖版本。
- VitePress 缓存和构建产物不进入 Git。

## 关联文档

- [Commit 记录](../commits/2026-09-21-web-vitepress-bootstrap-commit.md)
- [Spec](../../superpowers/specs/2026-09-21-web-vitepress-bootstrap-design.md)
- [Plan](../../superpowers/plans/2026-09-21-web-vitepress-bootstrap.md)

## 唯一下一步

无（Issue 已完成并提交）。
