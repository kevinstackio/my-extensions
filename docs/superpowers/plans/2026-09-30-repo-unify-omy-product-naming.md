# 统一 OmyExts 仓库与产品命名实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将本地仓库与当前可迁移项目统一为 OmyExts、OmyTabs、OmyDL 和 website，同时暂缓 X Download Helper 的目录与工程迁移。

**Architecture:** 先完成仓库级 workspace scope、官网目录和品牌入口，再分别迁移 OmyTabs 与 OmyDL 的目录、内部标识和测试。X Download 的业务代码与 X Download Helper 保持原路径和 Native Messaging 契约，只接受仓库 scope 的机械性更新。

**Tech Stack:** pnpm 12.4.2、Node.js 24.16.0、Turbo 2.10.12、WXT 0.21.4、TypeScript 7.0.2、Vitest 5.0.0、VitePress 2.0.0-alpha.20、Swift/Xcode（本次不改 Helper）。

**Spec:** docs/superpowers/specs/2026-09-30-repo-unify-omy-product-naming-design.md

## Global Constraints

- 根包名使用 omyexts，workspace scope 使用 @omyexts/*。
- 当前目录目标为 apps/extensions/omytabs、apps/extensions/omydl、apps/extensions/x-download、apps/helpers/x-download-helper 和 apps/website。
- extensions 不缩写；website 是唯一官网项目；desktop 只作为后续平台分类，本计划不创建。
- OmyDL 不读取旧 tg-download 存储键，不保留旧文件选择器 ID，不增加兼容读取。
- 不改 X Download Helper 的路径、Xcode 工程、Target、Native Host、Bundle Identifier、Socket、脚本或 x-helper:dev。
- 不修改历史 Issue、Commit、Spec、Plan、复盘和文章中的事实性旧名称。
- 不修改依赖版本；不重绘或改造 Logo 图案。
- 不操作 GitHub 仓库、远端、Release 后台、商店后台或推送。
- 开发阶段不执行视觉、布局、指针、真实焦点和浏览器交互自动化验收。

## Review Focus

- Workspace scope 与 importer 不完整：Task 1 必须覆盖 x-download 与 stable-extension-dev。
- 目录迁移后仍引用旧路径：Task 4 必须覆盖工作流、README、VitePress 和稳定开发工具。
- OmyDL 只改展示名：Task 3 必须覆盖存储键、文件选择器 ID、运行时消息、页面事件和 CSS/资源名。
- 发布工作流仍生成旧产物：Task 3 必须验证路径、tag、ZIP、Manifest 和 Release 文案。
- 暂缓范围被误改：Task 4 必须确认 X Download Helper 的路径、Native Host 名称、Bundle Identifier 和命令保持原值。

---

### Task 1: 迁移仓库 scope 与官网项目

**Files:**

- Rename: apps/web/ → apps/website/
- Modify: package.json, pnpm-workspace.yaml, pnpm-lock.yaml
- Modify: apps/website/package.json, README.md, index.md, .vitepress/config.ts, apps/index.md, docs/index.md
- Modify: README.md, docs/monorepo.md, docs/wxt.md, docs/migrations/extension-to-wxt.md
- Modify: packages/stable-extension-dev/package.json and README.md

**Interfaces:**

- Produces root package omyexts, @omyexts/website and @omyexts/stable-extension-dev for later tasks.
- Produces root website:dev and the workspace scope expected by later tasks.

- [ ] 移动 apps/web 到 apps/website，更新显式 workspace 入口、Turbo filter、包名和现行路径。
- [ ] 将根包名改为 omyexts，将 stable-extension-dev scope 改为 @omyexts/stable-extension-dev。
- [ ] 将官网标题、首页、Apps 页面、Docs 页面和 README 品牌改为 OmyExts，不引入 OmySite。
- [ ] 将根开发入口改为 website:dev，暂时保留 x:dev 和 x-helper:dev。
- [ ] 重新生成 pnpm-lock.yaml，只允许出现 workspace importer、路径和内部名称变化，不升级依赖。
- [ ] 验证：pnpm --filter @omyexts/website build；预期 VitePress 构建成功。

### Task 2: 迁移 OmyTabs

**Files:**

- Rename: apps/extensions/my-tabs/ → apps/extensions/omytabs/
- Modify: omytabs/package.json, README.md, AGENTS.md, wxt.config.ts
- Rename: omytabs/src/assets/logo/my-tabs-*.png → omytabs-*.png
- Modify: omytabs/src/entrypoints/newtab/index.html, main.tsx, src/utils/action-icon-theme.js and existing tests
- Modify: root package.json, root README and current OmyTabs documentation references

**Interfaces:**

- Consumes @omyexts/stable-extension-dev from Task 1.
- Produces @omyexts/omytabs and root omytabs:dev.

- [ ] 移动目录，设置包名 @omyexts/omytabs，将 tabs:dev 改为 omytabs:dev。
- [ ] 将 Manifest、工具栏、新标签页标题、错误文本、README 和 Logo 引用改为 OmyTabs/omytabs。
- [ ] 更新已有资源路径、临时目录前缀和 Manifest 断言；不新增视觉或布局测试。
- [ ] 验证：在 apps/extensions/omytabs 运行 vitest run、tsc --noEmit、wxt build，全部成功。

### Task 3: 迁移 OmyDL 与发布契约

**Files:**

- Rename: apps/extensions/tg-download/ → apps/extensions/omydl/
- Rename: .github/workflows/tg-download-draft-release.yml → .github/workflows/omydl-draft-release.yml
- Rename: omydl/src/assets/logo/tg-download-*.png → omydl-*.png
- Modify: omydl/package.json, README.md, wxt.config.ts, src/** and tests/**
- Modify: root package.json, root README and current OmyDL documentation references

**Interfaces:**

- Consumes @omyexts/stable-extension-dev from Task 1.
- Produces @omyexts/omydl, root omydl:dev and OmyDL artifact names.

- [ ] 移动目录，设置包名 @omyexts/omydl，将 tg:dev 改为 omydl:dev。
- [ ] 将 WXT、Manifest、Popup、README、Logo、CSS、DOM 和构建产物改为 OmyDL/omydl。
- [ ] 将存储键、文件选择器 ID、运行时消息、页面事件、主题消息和测试数据直接改为 omydl，不添加旧名称读取或兼容别名。
- [ ] 将发布工作流的路径、过滤器、tag、ZIP、Manifest 临时文件和 Release 文案改为 OmyDL；旧 tag 和历史 Release 不改写。
- [ ] 验证：在 apps/extensions/omydl 运行 tsc --noEmit、vitest run、wxt build、wxt zip，全部成功。
- [ ] 静态检查工作流只含当前 omydl 路径和名称，不含活动 tg-download 引用。

### Task 4: 收敛现行引用与暂缓边界

**Files:**

- Modify: README.md, docs/monorepo.md, docs/wxt.md, docs/migrations/extension-to-wxt.md
- Modify: current project README, current AGENTS.md and packages/stable-extension-dev/README.md
- Modify: .gitignore only for paths moved by Tasks 1–3
- Do not modify: apps/extensions/x-download/** business code or apps/helpers/x-download-helper/**

**Interfaces:**

- Consumes renamed paths and package names from Tasks 1–3.
- Produces a current-reference set that distinguishes active Omy names from historical records.

- [ ] 更新现行 README、Monorepo/WXT/迁移文档、官网页面和共享工具文档；历史记录保留原名称。
- [ ] 只更新实际移动项目的 ignore 路径，保留 x-download-helper 的工具路径。
- [ ] 确认 x-download 和 x-download-helper 的业务标识、Native Host、Bundle Identifier、命令与通信契约未被修改。
- [ ] 运行现行引用扫描，排除 .git、node_modules、dist、历史 docs/changes、历史 docs/superpowers、复盘和文章。
- [ ] 预期现行范围不再出现 @my-extensions、apps/web、my-tabs、tg-download、tabs:dev、tg:dev、vitepress:dev 或 My Extensions；X Helper 旧标识仅出现在明确暂缓路径。

### Task 5: 完整验证并停在用户验收

**Files:**

- Test: existing OmyTabs, OmyDL, stable-extension-dev and website checks
- Modify: Issue and Commit records with actual results only

**Interfaces:**

- Consumes all renamed paths, package names and current references from Tasks 1–4.
- Produces factual verification results and reproducible user acceptance steps.

- [ ] 运行 Tasks 1–3 的针对性检查，再运行一次完整仓库验证；出现系统内存告警或异常卡死时立即停止。
- [ ] 检查 OmyTabs、OmyDL、website 构建产物、Manifest、锁文件和 git diff --check。
- [ ] 展示变更文件、diff 摘要、实际命令结果、未验证事项和 Chrome/Edge 验收步骤。
- [ ] 停在用户验收，不自动提交、amend、推送、重命名 GitHub 或修改本地 checkout 根目录。
