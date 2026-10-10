# Exts 产品官网实施计划

> 执行方式：本会话使用 superpowers:executing-plans 串行本地实施；按仓库规则禁止子代理、并行命令和自动 Git Commit。步骤使用复选框跟踪。

**目标：**完整替换 VitePress，交付已确认的首页、精确依赖与 根版本 Chrome/macOS 直链。

**架构：**Vite + React 静态应用；页面组合布局与下载模块，shadcn 基础 UI 保持业务无关。所有能力限于对应 Issue，部署留给后续工作项。

**技术栈：**React、TypeScript、Vite、Tailwind CSS、shadcn Radix Button、Lucide React；精确版本见设计表。

**设计：**[已批准设计](../specs/2026-10-11-website-product-homepage-design.md)

**工作项：**[Issue](../../changes/issues/2026-10-11-website-product-homepage-issue.md) · [Commit 记录](../../changes/commits/2026-10-11-website-product-homepage-commit.md)

**状态：**用户于 2026-10-11 批准并要求串行实施，现已实施与自动化验证完成，用户已确认验收通过，已批准两次本地提交。

## 全局约束

- 仅 website 重建及必要根锁文件、构建说明与工作记录；不升级其他应用、修改品牌源稿或部署。
- 沿用 Node 24.16.0、pnpm 12.4.2；全部精确依赖按 Spec，shadcn CLI 4.21.4；未批准依赖不加入。
- 网站包名 @exts/website；根 web:dev、web:build 不改用法；产物 dist/build/exts-web，缓存 dist/.cache/website。
- 文案 Exts、“将想法与能力”“延伸为实用工具”、Chrome、macOS、© 2026 Lin Gui；不加 Powered by、网址、即将推出或 Edge 支持说明。
- GitHub 链接 https://github.com/linguio/exts；两端下载按根 package.json 的 version 拼接已确定的 GitHub Tag 与附件地址，不查询 API 或判断结果。
- 代码注释中文；所有命令串行。必要安装正常执行 postinstall，不绕过；卡死立即停止，不扩大失败修复循环。
- 不新增假 DOM、截图、样式、布局或焦点交互测试；代理不执行视觉交互验收。

## 重点边界与必要验证

- 根版本是唯一来源：构建读取与校验使用已有 scripts/version.mjs，不在网站硬编码版本。
- 生产产物应包含对应根版本的 ZIP 与 DMG 直链，不包含 GitHub API 请求或旧失败提示。
- 两端均可点击；用户已知 DMG 当前不存在，不以附件存在作为网站验收条件。
- 下载成功由浏览器处理，页面不添加加载、预检、重试或结果判断。
- 仅网站 importer 变化，保留依赖与其他端构建路径不变，使用现有构建边界验证。

## 实施顺序

### 1. 建立可运行网站基础

- [x] 修改 apps/website/package.json，建立 index.html、vite.config.ts、tsconfig.json、components.json；固定批准版本，新增 typecheck 命令；按需区分应用与配置类型检查。
- [x] 建立 src/app/main.tsx、src/app/app.tsx、src/app/styles.css、src/config/site.ts、src/lib/utils.ts 和 src/components/ui/button.tsx；生成并审查真实 shadcn Radix Button，不拷贝预览模拟组件。
- [x] 更新 pnpm-lock.yaml，正常安装；先检查现有 pnpm 入口无输出的原因，如需调整版本或依赖范围则暂停说明，不绕过 postinstall。
- [x] 验证基础类型与构建入口可运行，保留必要旧资源直到新页面主路径成立；新目录不生成 dist。

### 2. 完成版本直链平台入口

- [x] Vite 配置读取根版本并定义 __EXTS_VERSION__，src/app/env.d.ts 声明构建注入类型；src/config/site.ts 分别生成 Chrome ZIP 与 macOS DMG 地址。
- [x] src/features/download/platform-downloads.tsx 通过 shadcn Button asChild 渲染两个普通链接，使用平台 SVG 与 Chrome/macOS 文字。
- [x] 按用户最新明确要求删除 Release API 请求、解析、结果判断、加载状态、错误提示及对应测试，并移除网站 Vitest 依赖；保留其他应用测试。

### 3. 完成首页与资源接入

- [x] 建立 src/components/layout/site-header.tsx、site-footer.tsx、src/pages/home/home-page.tsx；HomePage 组合页头、标语、PlatformDownloads、logo 与页脚，App 只负责页面入口。
- [x] 使用用户 googlechrome.svg、apple.svg 与真实 GitHub 品牌 SVG，放 src/assets；正式 logo 复用既有网站派生资源，保留原主体与正式外形。固定公开图标留在 public，补必要许可声明。
- [x] 按批准预览完成黑白样式、左右布局和窄屏重排；桌面标语 42px、logo 220px 为参考，不添加角标、动画或主题切换。
- [x] 配置标题、描述、favicon 与分享元信息；同域资源按 exts.linguio.dev 根路径构建，不提前添加部署 workflow 或 CNAME。

### 4. 清理被替代实现并同步说明

- [x] 删除 apps/website/.vitepress/config.ts、旧 index.md、apps/index.md、docs/index.md、toolkits/index.md 与 VitePress 网站依赖；保留仓库历史设计和归档，不删除未被替代的正式品牌资源。
- [x] 更新 apps/website/README.md、docs/build-release.md 的网站框架与路径说明；仅清除 .gitignore 中过时网站 VitePress 缓存条目。根 package.json 与 scripts/build.mjs 仅在已有入口确实无法兼容时修改并说明。

### 5. 阶段完整验证与用户验收

- [x] 串行执行 pnpm install --frozen-lockfile、pnpm --filter @exts/website typecheck、pnpm web:build、node --test tests/build-release.test.mjs；每项确认退出码与实际结果，不运行无关端全量构建。
- [x] 检查网站 index.html、引用资源与输出目录，确认仍使用既有根品牌资源且无额外平台产物清理；执行 git diff --check 并检查非目标依赖变化。
- [x] 补充 Issue 与 Commit 记录的实际交付、验证、限制、验收步骤；用户按需运行 pnpm web:dev，在 Chrome 验收排版、GitHub 链接、两端版本直链。
- [x] 停在待验收；不得自动 Git Commit、推送、部署或进入第二个 Issue。实际交付后再拟完整 Commit message，获得本地提交批准后同步终态。

## 实施前与停止点

用户审核本 Plan 并批准执行后开始。实际开发前提醒是否切换较低成本模型，未切换不阻塞批准范围内工作。执行方法已由 AGENTS.md 确定为本会话串行，不另询问子代理选项。

未预设规划 Commit；任何依赖清单、功能或构建范围变化先说明并取得批准。相同失败第二次出现停止循环并报告事实、影响与替代验证，不以临时测试工具问题修改正常业务行为。

## 执行记录

- 官方 registry Button 手工接入，使用已批准的本地 cn 工具；未执行 CLI 或添加未批准依赖。
- 使用经 SHA-512 校验的官方 pnpm 12.4.2，不修改全局 12.4.1；正常 postinstall 与最终冻结安装已验证。
- 用户明确批准改为根版本直链并开放 macOS，旧 API、错误提示、测试与网站 Vitest 依赖已删除。
- 类型检查、生产构建、生产两端直链核对通过；已有构建边界 13/13、资源与锁文件边界保持有效。DMG 存在性不作为验收要求。
- 用户已确认页面验收通过；代理未独立执行 Chrome 视觉或交互验收，未部署。
