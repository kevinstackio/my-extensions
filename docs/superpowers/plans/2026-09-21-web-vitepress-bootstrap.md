# VitePress 官网脚手架 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 `apps/web` 建立可运行的 VitePress Default Theme 官网模板，并通过 Turbo 提供根目录开发和构建命令。

**Architecture:** `apps/web` 是独立 pnpm workspace 包，自己声明 VitePress 和 `dev`/`build` 脚本。根 `package.json` 只通过 Turbo filter 调度该包，因此它也会参与现有 `build:all` 任务。VitePress 产物输出到 `apps/web/dist`，复用 Turbo 现有输出缓存规则。

**Tech Stack:** Node.js `24.16.0`, pnpm `12.4.2`, Turbo `2.10.12`, VitePress `@next` 标签解析后的精确版本，TypeScript，VitePress Default Theme。

**Spec:** `docs/superpowers/specs/2026-09-21-web-vitepress-bootstrap-design.md`

## Global Constraints

- 只保留根命令 `vitepress:dev` 和 `vitepress:build`，不生成 `preview`。
- 使用 `pnpm add -D --save-exact vitepress@next`，`package.json` 不保留 `next`、`^`、`~` 或版本范围。
- `apps/web` 必须显式加入 `pnpm-workspace.yaml`。
- VitePress 配置必须使用 `outDir: 'dist'`，输出为 `apps/web/dist`。
- 不接入部署、搜索、统计、自定义主题或正式插件文案。
- 自动化验证后停在用户验收，提交需等待用户明确批准。

## Review Focus

- Workspace 匹配：`apps/web` 不应再触发 `ERR_PNPM_ADDING_TO_ROOT`；在 Task 1 用 `pnpm --filter @my-extensions/web ...` 验证。
- 版本固定：安装后 `package.json` 和锁文件中必须是具体版本；在 Task 1 检查依赖声明。
- 初始化范围：生成结果必须在 `apps/web` 根目录，且只保留 `dev`/`build`；在 Task 2 检查文件和 scripts。
- Turbo 产物：构建必须生成 `apps/web/dist/index.html`，不应生成并依赖 `.vitepress/dist`；在 Task 3 检查。
- 生成物跟踪：`dist` 和 `.vitepress/cache` 必须被 Git 忽略；在 Task 4 用 `git check-ignore` 验证。

---

### Task 1: 建立 workspace 包并安装 VitePress

**Files:**
- Modify: `pnpm-workspace.yaml`
- Create: `apps/web/package.json`
- Modify: `pnpm-lock.yaml` (by pnpm)

- [x] **Step 1: 加入 workspace 匹配**

  在 `pnpm-workspace.yaml` 的 `packages` 中加入 `apps/web`，保留现有 `apps/*/*` 和 `packages/*`。

- [x] **Step 2: 创建子项目 package.json**

  创建 `apps/web/package.json`：

  ```json
  {"name":"@my-extensions/web","private":true,"version":"0.0.0","type":"module","scripts":{"dev":"vitepress dev","build":"vitepress build"}}
  ```

- [x] **Step 3: 安装精确版本依赖**

  在仓库根目录运行 `pnpm --filter @my-extensions/web add -D --save-exact vitepress@next`，确认它只更新 `apps/web/package.json` 和根 `pnpm-lock.yaml`。

### Task 2: 用官方初始化器生成站点模板

**Files:**
- Create: `apps/web/.vitepress/config.ts`
- Create: `apps/web/index.md`
- Create: `apps/web/api-examples.md`
- Create: `apps/web/markdown-examples.md`
- Modify: `apps/web/package.json`
- Modify: `.gitignore`
- Modify: `README.md`

- [x] **Step 1: 运行初始化器**

  在 `apps/web` 运行 `pnpm exec vitepress init`。选择配置和 Markdown 源目录都是 `./`，标题 `My Extensions`，描述 `浏览器扩展的统一官网与文档中心`，`Default Theme`，TypeScript 选“是”，添加 npm scripts 选“否”。

- [x] **Step 2: 收敛子项目 scripts 与输出目录**

  确认 `apps/web/package.json` 只保留 `dev: "vitepress dev"` 和 `build: "vitepress build"`；在 `.vitepress/config.ts` 中保留生成配置并加入 `outDir: 'dist'`。

- [x] **Step 3: 忽略生成物并更新结构说明**

  在根 `.gitignore` 中加入 `apps/web/.vitepress/cache/`；确认已有 `dist/` 会忽略 `apps/web/dist`；将根 `README.md` 的网站目录说明与 `apps/web` 同步。

### Task 3: 加入 Turbo 根命令

**Files:**
- Modify: `package.json`

- [x] **Step 1: 增加根调度脚本**

  在根 `package.json` 的 `scripts` 中加入：

  ```json
  {"vitepress:dev":"turbo run dev --filter=@my-extensions/web","vitepress:build":"turbo run build --filter=@my-extensions/web"}
  ```

- [x] **Step 2: 确认 Turbo 输出匹配**

  不修改根 `turbo.json`；由于 `outDir: 'dist'` 与现有 `outputs: ["dist/**"]` 一致，`pnpm vitepress:build` 应将 `apps/web/dist` 记为构建输出。

### Task 4: 执行完整验证并完成用户验收

**Files:**
- Verify: `apps/web/dist/index.html`
- Verify: `package.json`, `apps/web/package.json`, `pnpm-lock.yaml`, `.gitignore`

- [x] **Step 1: 执行实例化构建**

  运行 `pnpm vitepress:build`，预期退出码为 `0`，并存在 `apps/web/dist/index.html`。

- [x] **Step 2: 执行 monorepo 构建**

  运行 `pnpm build:all`，预期 VitePress 包被 Turbo 调度且其他 workspace 构建不被影响。

- [x] **Step 3: 验证开发服务器**

  短暂运行 `pnpm vitepress:dev`，用 HTTP 请求确认本地服务器可访问后立即停止进程。

- [x] **Step 4: 验证生成物不进 Git**

  运行 `git check-ignore -v apps/web/dist/index.html apps/web/.vitepress/cache`，确认返回根 `.gitignore` 规则；再运行 `git diff --check`。

- [x] **Step 5: 完成用户验收**

  已向用户说明根命令、预期页面和限制，用户确认官网模板可接受并批准提交。
