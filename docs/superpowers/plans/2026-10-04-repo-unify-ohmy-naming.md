# 统一 OhMy 命名格式实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现行仓库品牌、产品展示、workspace scope、代码标识和 Apple Bundle Identifier 统一为三套已批准的 OhMy 格式。

**Architecture:** 先原子迁移 workspace 身份和依赖图，再迁移展示与平台标识，最后集中更新当前文档并执行一次完整验证。历史管理文档保持事实名称，X Download 只接受 scope 变化，所有实施串行完成且不创建中间 Commit。

**Tech Stack:** pnpm 12.4.2、Node.js 24.16.0、Turbo 2.10.12、WXT 0.21.4、TypeScript 7.0.2、Vitest 5.0.0、VitePress 2.0.0-alpha.20、XcodeGen、Swift/Xcode。

**Spec:** `docs/superpowers/specs/2026-10-04-repo-unify-ohmy-naming-design.md`

## Global Constraints

- 展示使用 `OhMy XXXX`，kebab-case 标识使用 `ohmy-xxxx`，连续 PascalCase 标识使用 `OhMyXXXXX`。
- 仓库品牌使用 `OhMy Exts` / `ohmy-exts` / `OhMyExts`，不使用完整单词 `Extensions`。
- 根包和 workspace scope 迁移为 `ohmy-exts` 与 `@ohmy-exts/*`，不保留旧 scope 别名。
- OhMy Photos Bundle Identifier 迁移为 `dev.kevinstack.ohmy-photos`。
- 历史 Issue、Commit、Spec、Plan、复盘和文章不改；当前文档引用历史标题时保留标题原文。
- X Download 仅更新 workspace scope，不改变产品名、业务逻辑、Native Messaging、Bundle、Socket 或 Helper。
- 不升级依赖，不修改功能、权限、数据模型、界面、图标或远端状态。
- 不启动子代理或并行任务；不创建中间 Git Commit，完整验证后停在用户验收。

## Review Focus

- workspace scope 原子迁移后，所有内部包必须能解析 `@ohmy-exts/stable-extension-dev`，不得残留断开的 `@omyexts` 链接。
- lockfile 只能发生 workspace importer/link 变化，不得带入第三方依赖版本变化。
- Bundle Identifier 改动必须同时进入 `project.yml` 与 XcodeGen 生成工程，构建出的 App 使用 `dev.kevinstack.ohmy-photos`。
- 活动内容不得残留 `OmyXXX`、`Oh My XXX`、`omyexts` 或 `@omyexts`，历史事实记录不得被批量改写。
- X Download 与 Helper 除已批准的 package scope/import 外不得产生业务或通信边界 diff。

---

### Task 1: 原子迁移 workspace 身份

**Files:**
- Modify: `package.json`
- Modify: `apps/extensions/ohmy-tabs/package.json`
- Modify: `apps/extensions/ohmy-tabs/wxt.config.ts`
- Modify: `apps/extensions/ohmy-dl/package.json`
- Modify: `apps/extensions/ohmy-dl/wxt.config.ts`
- Modify: `apps/extensions/x-download/package.json`
- Modify: `apps/extensions/x-download/wxt.config.ts`
- Modify: `apps/website/package.json`
- Modify: `packages/stable-extension-dev/package.json`
- Modify: `.github/workflows/ohmy-dl-draft-release.yml`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: 当前 `omyexts` 根包、`@omyexts/*` workspace 包和 `@omyexts/stable-extension-dev` 内部依赖。
- Produces: `ohmy-exts` 根包、`@ohmy-exts/*` workspace graph 和可解析的共享 WXT 工具 import。

- [x] **Step 1:** 将根包、所有 workspace package name、内部依赖、TypeScript import、根脚本 filter 和工作流 filter 原子改为 `ohmy-exts` / `@ohmy-exts/*`。
- [x] **Step 2:** 尝试运行 `pnpm install --offline`；环境无输出超过 60 秒后停止，未产生版本变化，再按精确 diff 机械更新三个 workspace scope 键。
- [x] **Step 3:** 审查 `git diff -- pnpm-lock.yaml`，确认 importer 路径不变、第三方版本不变，旧 scope 只被新 scope 替换。
- [x] **Step 4:** 运行 `./node_modules/.bin/turbo ls`，确认列出的 workspace 包全部使用 `@ohmy-exts/*`。
- [x] **Step 5:** 运行活动范围旧 scope 扫描，确认 `omyexts` 与 `@omyexts` 只存在于明确排除的历史文档。

### Task 2: 迁移展示名称与平台身份

**Files:**
- Modify: `README.md`
- Modify: `.github/workflows/ohmy-dl-draft-release.yml`
- Modify: `apps/extensions/ohmy-tabs/AGENTS.md`
- Modify: `apps/extensions/ohmy-tabs/README.md`
- Modify: `apps/extensions/ohmy-tabs/src/entrypoints/newtab/index.html`
- Modify: `apps/extensions/ohmy-tabs/src/entrypoints/newtab/main.tsx`
- Modify: `apps/extensions/ohmy-tabs/src/test/manifest.test.mjs`
- Modify: `apps/extensions/ohmy-tabs/wxt.config.ts`
- Modify: `apps/extensions/ohmy-dl/README.md`
- Modify: `apps/extensions/ohmy-dl/src/entrypoints/popup/index.html`
- Modify: `apps/extensions/ohmy-dl/src/features/download/download-media.ts`
- Modify: `apps/extensions/ohmy-dl/wxt.config.ts`
- Modify: `apps/website/.vitepress/config.ts`
- Modify: `apps/website/README.md`
- Modify: `apps/website/apps/index.md`
- Modify: `apps/website/docs/index.md`
- Modify: `apps/website/index.md`
- Modify: `apps/desktop/ohmy-photos/project.yml`
- Regenerate: `apps/desktop/ohmy-photos/OhMyPhotos.xcodeproj/project.pbxproj`

**Interfaces:**
- Consumes: Spec 中批准的四组名称映射和 `dev.kevinstack.ohmyphotos` 旧 Bundle Identifier。
- Produces: `OhMy Exts/Tabs/DL/Photos` 展示文本、`OhMyXXXXX` 连续标识和 `dev.kevinstack.ohmy-photos` App 身份。

- [x] **Step 1:** 更新所有活动展示文本和对应测试断言，确保 `OmyXXX` 与 `Oh My XXX` 均迁移为 `OhMy XXXX`。
- [x] **Step 2:** 将 `project.yml` Bundle Identifier 改为 `dev.kevinstack.ohmy-photos`，运行 `xcodegen generate` 同步已跟踪工程。
- [x] **Step 3:** 扫描活动源码中的持久化键、文件选择器 ID、消息、事件和 CSS/DOM ID；只迁移实际含旧命名片段的标识，不重构无关名称。
- [x] **Step 4:** 在 `apps/extensions/ohmy-tabs` 运行 `./node_modules/.bin/vitest run src/test/manifest.test.mjs`，确认展示名为 `OhMy Tabs` 且图标、权限和入口行为不变。
- [x] **Step 5:** 在 `apps/desktop/ohmy-photos` 运行 `xcodebuild -showBuildSettings -project OhMyPhotos.xcodeproj -scheme OhMyPhotos`，确认 `PRODUCT_BUNDLE_IDENTIFIER = dev.kevinstack.ohmy-photos`。

### Task 3: 更新当前文档并完整验证

**Files:**
- Modify: `docs/migrations/extension-to-wxt.md`
- Modify: `docs/monorepo.md`
- Modify: `docs/wxt.md`
- Modify: `packages/stable-extension-dev/README.md`
- Modify: `docs/changes/issues/2026-10-04-repo-unify-ohmy-naming-issue.md`
- Modify: `docs/changes/commits/2026-10-04-repo-unify-ohmy-naming-commit.md`
- Modify: `docs/changes/README.md`

**Interfaces:**
- Consumes: Tasks 1–2 完成的 package graph、展示名称和平台身份。
- Produces: 与实现一致的当前文档、验证记录和可供用户验收的单一工作区 diff。

- [x] **Step 1:** 更新当前架构、WXT、迁移和共享工具文档；保留历史索引标题与历史管理文件原文。
- [x] **Step 2:** 在 `packages/stable-extension-dev` 运行 `./node_modules/.bin/vitest run`。
- [x] **Step 3:** 在 `apps/extensions/ohmy-tabs` 依次运行 `./node_modules/.bin/vitest run`、`./node_modules/.bin/tsc --noEmit`、`./node_modules/.bin/wxt build`。
- [x] **Step 4:** 在 `apps/extensions/ohmy-dl` 依次运行 `./node_modules/.bin/tsc --noEmit`、`./node_modules/.bin/vitest run`、`./node_modules/.bin/wxt build`、`./node_modules/.bin/wxt zip`。
- [x] **Step 5:** 在 `apps/extensions/x-download` 依次运行 `./node_modules/.bin/vitest run`、`./node_modules/.bin/tsc --noEmit`、`./node_modules/.bin/wxt build`。
- [x] **Step 6:** 在 `apps/website` 运行 `./node_modules/.bin/vitepress build`；在 `apps/desktop/ohmy-photos` 运行 `xcodegen generate` 和不启动 App 的 Debug `xcodebuild build`，分别记录结果，不把构建表述为 XCTest 或真实设备验收。
- [x] **Step 7:** 执行活动旧名称扫描、`git diff --check`、lockfile 审查和 `git diff -- apps/extensions/x-download apps/helpers/x-download-helper` 受保护边界审查。
- [x] **Step 8:** 将 Issue Todo 与 Commit 记录更新为实际结果，展示待验收文件和 diff 摘要，停在用户对 Chrome、Edge、Website 与 macOS App 的实际验收。
