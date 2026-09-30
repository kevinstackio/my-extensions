# Oh My 产品命名迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 OmyTabs、OmyDL 和 Omy Photos 完整迁移为 Oh My 产品命名，同时保持 X Download 及 X Download Helper 不变。

**Architecture:** 按产品边界串行重命名目录、包名、内部标识和构建产物，再收敛 workspace 与现行文档引用。迁移不建立旧名称兼容层；历史管理文档保留事实名称，X Download 相关业务和通信边界保持原样。

**Tech Stack:** pnpm 12.4.2、Node.js 24.16.0、Turbo 2.10.12、WXT 0.21.4、TypeScript 7.0.2、Vitest 5.0.0、XcodeGen、Swift/Xcode。

**Spec:** `docs/superpowers/specs/2026-09-30-repo-rename-ohmy-products-design.md`

## Global Constraints

- 产品目录使用 `ohmy-tabs`、`ohmy-dl`、`ohmy-photos`；workspace scope 保持 `@omyexts`。
- 展示名称使用 `Oh My Tabs`、`Oh My DL`、`Oh My Photos`。
- 包名、脚本、资源、CSS/DOM、消息、存储键、发布产物和 Bundle 使用新标识，不保留旧别名或读取路径。
- Oh My Photos Bundle Identifier 使用 `dev.kevinstack.ohmyphotos`，Xcode 工程、Scheme、Target 和 Swift 模块使用 `OhMyPhotos`。
- 不修改 X Download、X Download Helper 的目录、协议、Native Host、Bundle Identifier 或命令。
- 不升级依赖版本，不重绘 Logo，不操作远端仓库、商店或 Release 后台。
- 历史 Issue、Commit、Spec、Plan、复盘和文章保留旧名称事实；只更新当前有效引用。
- 开发阶段不执行视觉、布局、指针、真实焦点和真实设备自动化验收。

## Review Focus

- 目录移动后仍有旧路径：Task 4 的活动引用扫描必须排除历史记录并覆盖 workspace、文档、工作流和脚本。
- OmyDL 内部标识残留：Task 2 必须同时覆盖存储键、文件选择器 ID、runtime message、页面事件、主题消息、CSS/DOM 和测试。
- Omy Photos 工程模块断链：Task 3 必须同时更新 XcodeGen、工程引用、Swift 模块导入、测试 Target 和 Bundle 配置。
- 资源重命名遗漏：Task 1/2 必须验证图标、入口 HTML、Manifest、WXT public assets 和稳定产物路径一致。
- 暂缓范围被误改：Task 4 必须确认 X Download 和 X Download Helper 的业务文件、Native Messaging 标识和命令没有变化。

---

### Task 1: 迁移 Oh My Tabs

**Files:**

- Rename: `apps/extensions/omytabs/` → `apps/extensions/ohmy-tabs/`
- Rename: `ohmy-tabs/src/assets/logo/omytabs-*.png` → `ohmy-tabs-*.png`
- Modify: `apps/extensions/ohmy-tabs/package.json`, `README.md`, `wxt.config.ts`
- Modify: `apps/extensions/ohmy-tabs/src/entrypoints/newtab/index.html`, `main.tsx`, `src/utils/action-icon-theme.js`, `src/test/**`
- Modify: root `package.json` and current OmyTabs documentation references

**Interfaces:**

- Consumes: `@omyexts/stable-extension-dev` and the existing OmyTabs WXT source tree.
- Produces: `@omyexts/ohmy-tabs`, `ohmy-tabs:dev`, `ohmy-tabs:build` and a stable WXT output rooted at the new directory.

- [x] 移动项目目录和 Logo 文件，更新 package name、README 项目树、WXT source/output 路径以及 `ohmy-tabs:dev`、`ohmy-tabs:build` 根命令。
- [x] 将 Manifest、入口标题、错误文本、图标路径、临时目录前缀、资源路径和测试断言改为 `Oh My Tabs` / `ohmy-tabs`。
- [x] 运行本地 `tsc`、Vitest 和 WXT build；pnpm 包装命令挂起限制已记录。
- [x] 检查生成 Manifest 和四种图标；稳定开发目录仅由 `wxt serve` 发布，按执行裁决记录。

### Task 2: 迁移 Oh My DL 与发布契约

**Files:**

- Rename: `apps/extensions/omydl/` → `apps/extensions/ohmy-dl/`
- Rename: `ohmy-dl/src/assets/logo/omydl-*.png` → `ohmy-dl-*.png`
- Rename: `.github/workflows/omydl-draft-release.yml` → `.github/workflows/ohmy-dl-draft-release.yml`
- Modify: `apps/extensions/ohmy-dl/package.json`, `README.md`, `wxt.config.ts`, `src/**`, `tests/**`
- Modify: root `package.json`, root README and current OmyDL documentation references

**Interfaces:**

- Consumes: `@omyexts/stable-extension-dev` and the existing OmyDL download flow.
- Produces: `@omyexts/ohmy-dl`, `ohmy-dl:dev`, `ohmy-dl:build`, `ohmy-dl:package` and Oh My DL release artifacts.

- [x] 移动目录和 Logo 文件，更新 package name、`ohmy-dl:dev`、`ohmy-dl:build`、`ohmy-dl:package` 根命令、WXT outDir、ZIP 模板和 README。
- [x] 将 Manifest、Popup、菜单、主题、runtime message、页面事件、CSS/DOM、测试数据和错误文本改为 `Oh My DL` / `ohmy-dl`。
- [x] 将下载历史键、文件选择器 ID 和运行时协议直接切换到新前缀，不增加旧键读取或兼容别名。
- [x] 将工作流路径、workspace filter、tag、ZIP、Manifest 临时文件、Release 标题和说明改为 Oh My DL；旧 tag 和历史 Release 不改写。
- [x] 运行本地 `tsc`、WXT build、WXT zip，并检查 ZIP Manifest 与文件名；Vitest 因 localhost 端口绑定限制未能收集测试，已记录裁决。

### Task 3: 迁移 Oh My Photos macOS 工程

**Files:**

- Rename: `apps/desktop/omy-photos/` → `apps/desktop/ohmy-photos/`
- Rename: `OmyPhotos.xcodeproj/` → `OhMyPhotos.xcodeproj/`
- Rename: `OmyPhotos/` → `OhMyPhotos/`; `OmyPhotosTests/` → `OhMyPhotosTests/`
- Rename: Swift source/test filenames containing `OmyPhotos` to `OhMyPhotos`
- Modify: `project.yml`, XcodeGen project references, Swift imports, app titles, paths and the active migration records

**Interfaces:**

- Consumes: the existing ImageCaptureCore, SQLite, SwiftUI and MVP source tree.
- Produces: `OhMyPhotos` scheme/target, `dev.kevinstack.ohmyphotos` Bundle, and the new `apps/desktop/ohmy-photos` build output.

- [x] 移动目录、工程、源文件和测试文件，更新 XcodeGen source groups、Target、Scheme、module imports 和 test target。
- [x] 将应用标题、Bundle display name、Bundle Identifier、Application Support 路径、缩略图路径和默认下载目录改为 `Oh My Photos` / `ohmyphotos`。
- [x] 保持 ImageCaptureCore、SQLite、权限、MVP 主路径和测试行为不变，不增加新功能。
- [x] 运行 `xcodegen generate`、`scripts/build.sh`、`xcodebuild build-for-testing`，使用 `plutil` 检查 Bundle 标识；XCTest 运行限制按实际结果记录。

### Task 4: 收敛 workspace 与现行引用

**Files:**

- Modify: root `package.json`, `pnpm-lock.yaml`, `README.md`, `docs/monorepo.md`, `docs/wxt.md`, `docs/migrations/extension-to-wxt.md`
- Modify: current project README and current `AGENTS.md` examples when they reference active paths
- Modify: `docs/changes/README.md`, current Issue/Commit/Spec/Plan records
- Do not modify: `docs/changes/` historical records, completed historical Specs/Plans, `apps/extensions/x-download/**`, `apps/helpers/x-download-helper/**`

**Interfaces:**

- Consumes: all three renamed projects and their new package/script names.
- Produces: a current-reference set with no active Omy product path or identifier left behind.

- [x] 更新 `pnpm-lock.yaml` importer 路径，确认只发生 workspace importer 路径变化，不升级依赖。
- [x] 更新根 README、Monorepo/WXT/迁移文档、稳定开发工具引用和工作台当前 Issue；历史文档保持事实名称。
- [x] 扫描活动源码、配置、测试、工作流和文档，确认没有 `omydl`、`omytabs`、`omy-photos`、旧包名、旧命令或旧活动路径残留。
- [x] 单独扫描 X Download 与 X Download Helper 的 diff，确认其业务代码、Native Messaging、Bundle、Socket 和命令没有变化。

### Task 5: 完整验证与用户验收材料

**Files:**

- Test: existing Oh My Tabs, Oh My DL, stable-extension-dev and Oh My Photos checks
- Modify: `docs/changes/issues/2026-09-30-repo-rename-ohmy-products-issue.md`
- Modify: `docs/changes/commits/2026-09-30-repo-rename-ohmy-products-commit.md`
- Modify: `docs/changes/README.md`

**Interfaces:**

- Consumes: Tasks 1–4 的新路径、包名、构建产物和活动引用。
- Produces: 可复现的自动化验证结果、用户验收步骤和最终本地 Commit 审核材料。

- [x] 按 Task 1–4 的命令执行一次完整验证；出现系统内存告警、卡死或相同原因第二次失败时立即停止。
- [x] 检查 Oh My Tabs、Oh My DL 和 Oh My Photos 的产物、Manifest/Bundle、锁文件、工作流静态路径和 `git diff --check`。
- [x] 更新 Issue/Commit/Workbench 的实际状态，只记录真实运行结果、未验证事项和外部系统待办。
- [x] 准备变更文件、diff 摘要、完整 Commit message 和 Chrome/Edge/macOS/iPhone 用户验收步骤，停在用户验收。
- [x] 用户明确批准后，把 Issue、Commit 记录和 Workbench 切换为已完成并创建一个最终本地 Commit；不推送远端。
