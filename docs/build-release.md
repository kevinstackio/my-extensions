# 构建、版本与本地分发规范

三端产品共用根版本，开发命令保持独立；最终产物及可配置的构建缓存统一生成在仓库根 dist。本文是命令、产物路径和版本消费规则的维护入口，动态实施及验收状态以 [Issue](changes/issues/2026-10-10-repo-unify-build-release-issue.md) 为准。

## 唯一产品版本

只手动修改根 package.json 的 version，初始版本为 1.0.0。scripts/version.mjs 是所有需要产品版本的步骤共用的读取与校验入口，不改写文件、不自动升级、不从环境变量、子应用、Git 标签或默认值获取替代版本。

版本必须为三段数字，主版本范围 1–9999，次版本和修订版本范围 0–99；无前导零和预发布后缀。同一值用于扩展 Manifest、桌面营销版本、桌面构建编号及 ZIP/DMG 文件名。内部工具包和第三方依赖版本独立维护，不参与产品版本同步。

```sh
node scripts/version.mjs
```

成功只输出根版本；读取或校验失败返回非零退出码。统一构建捕获本次版本，再让下游核对根版本一致，防止构建期间修改版本导致混合产物。传递的 EXTS_BUILD_VERSION 只用于一致性检查，不能覆盖根版本。

## 根命令

| 命令 | 用途 | 支持平台 |
|---|---|---|
| pnpm web:dev | 网站开发服务 | Windows、macOS |
| pnpm ext:dev | 扩展开发服务及稳定开发产物 | Windows、macOS |
| pnpm desk:dev | 构建并打开独立桌面开发应用 | macOS |
| pnpm web:build | 单独构建网站 | Windows、macOS |
| pnpm ext:build | 单独构建正式扩展 | Windows、macOS |
| pnpm ext:release | 独立构建并校验 Chrome 扩展 ZIP | Windows、macOS、Linux |
| pnpm desk:build | 单独构建正式桌面应用 | macOS |
| pnpm build | 串行构建 website、extension、desktop | macOS |
| pnpm release | 完整构建后生成本地 ZIP、DMG | macOS |

没有统一 dev 命令。非 macOS 的根 build/release 和 desktop dev/build 在启动构建前明确报错并退出，不静默跳过桌面。根 release 不自动提交、打 Git 标签、推送、部署或上传发布。

根 scripts/ 只维护 version.mjs、build.mjs、release.mjs；根入口负责公共规则和调度，应用内部脚本负责各端实现，不为小型辅助函数继续拆文件。

## 根 dist 布局

```text
dist/
├─ .cache/
│  ├─ extension/chrome-mv3-dev/
│  ├─ desktop/DerivedData/
│  └─ website/
├─ dev/
│  ├─ chrome-mv3-dev-stable/
│  └─ exts-dev.app/
├─ build/
│  ├─ exts-web/
│  ├─ chrome-mv3/
│  └─ exts.app/
└─ release/
   ├─ exts-chrome-<版本号>.zip
   └─ exts-mac-<版本号>.dmg
```

- 应用内部不再生成 dist 或 DerivedData；dist 不纳入 Git。每端仅清理、更新自己的目标，禁止清空公共 dist、dev、build 或 release。
- 网站和正式扩展直接输出到根 build，没有一份应用内部的正式副本。
- 扩展临时重建输出在根 .cache/extension，成功后由公共稳定发布 hook 更新根 dev 稳定目录。两份目录分别用于构建和加载，不能合并；失败保留上一份稳定版本。
- 桌面在根 .cache/desktop/DerivedData 编译，完整 .app 校验后发布到根 dev 或 build。桌面编译缓存、符号产物不复制到最终目录。
- 网站开发不生成单独的 dev 分发目录。React 网站使用 Vite 构建，Vite 缓存放在根 dist/.cache/website/vite，生产产物仍为根 dist/build/exts-web。
- .wxt 类型目录、node_modules 及工具在依赖目录内部的缓存仍按工具约定保留；它们不是浏览器加载、运行、部署或分发的产物。
- 调整输出位置后，应停止并重新启动此前的开发命令，避免旧进程继续使用旧配置；扩展应重新加载新的稳定目录。

## 网站自动部署

```text
工作目录：仓库根
构建命令：pnpm web:build
发布目录：dist/build/exts-web
```

部署完整目录，包括 index.html 和资源。固定路径不带版本号，不要求部署平台构建桌面或扩展。配置这些值即可；本规范不创建外部部署服务。

## 桌面身份与数据

| 项目 | 开发版 | 正式版 |
|---|---|---|
| 文件 | exts-dev.app | exts.app |
| 展示名 | Exts Dev | Exts |
| Bundle Identifier | dev.linguio.exts.dev | dev.linguio.exts |
| 默认下载目录 | ~/Downloads/Exts Dev | ~/Downloads/OhMy Photos |
| 缩略图缓存目录 | ~/Library/Application Support/Exts Dev/Thumbnails | ~/Library/Application Support/OhMy Photos/Thumbnails |

两种模式共用代码，Organization Identifier 为 dev.linguio。正式目录保留旧路径，不自动迁移、复制或删除用户数据；用户主动选择相同外部目录不保证隔离。当前未使用的数据库和凭据设施不预建，后续新增时须接入同样身份边界。

project.yml 是原生配置入口，desk 命令先用 XcodeGen 生成工程再构建并传入根版本；不要依赖尚未重新生成的旧工程直接验证新身份。桌面 dev 构建后打开应用，不提供源码自动热更新。

## 分发包

附件统一使用产品名、平台和根版本：exts-chrome-<版本>.zip、exts-mac-<版本>.dmg；Tag 使用 v<版本>，Release 标题使用 Exts <版本>。首版 1.0.0 只发布 Chrome 扩展，不构建或发布 desktop。

pnpm ext:release 独立构建扩展，检查 Manifest 版本、新标签页入口及图标资源，生成 ZIP 并校验后发布到根 dist/release。同版本文件已存在时拒绝覆盖。Windows 使用系统 PowerShell/.NET ZIP，Linux/macOS 使用 zip/unzip；此命令不构建网站或桌面，不创建 Tag 或上传。

手动流程 .github/workflows/exts-chrome-release.yml 仅允许 main，执行冻结安装、发布脚本与稳定目录测试、扩展测试、类型检查、构建打包与体积检查。全部通过后创建指向本次构建提交的 v<版本> Tag 与 Release 草稿，只上传 Chrome ZIP。已有 Release 拒绝覆盖，已有 Tag 指向不同提交时失败；失败草稿需人工检查，不自动删除或覆盖。

首次运行需先提交并推送 workflow 到 main，再从 Actions 手动运行。下载草稿 ZIP 后由用户解压并在 Chrome/Edge 扩展管理页加载验收；公开 Release 后核实附件下载地址。草稿和成功打包都不等于公开发布成功，GitHub 自动生成的 Source code ZIP 不是扩展安装包。

pnpm release 先检查版本、平台、工具与同版本文件冲突，再调用统一 build。正式扩展 ZIP 根层直接包含 manifest.json；DMG 含正式 exts.app 和 Applications 安装入口，使用系统 zip、unzip、ditto、hdiutil 等工具生成和校验，不引入打包依赖。

同版本 ZIP 或 DMG 任一已存在时，开始前报错，不覆盖旧包。构建或校验失败不报告成功，临时文件清理，本次失败的包不留下正式名称。成功发布最终文件名时再次防止覆盖；不同版本的旧包保留。

.app 是可运行的应用，.dmg 是分发容器。当前 DMG 使用本机构建架构，未做 Apple 分发签名、公证、通用架构或自动更新；生成本地镜像不等同于具备完整公开分发条件。

## 验证与当前限制

- 逻辑检查：node --test tests/build-release.test.mjs apps/desktop/tests/scripts/desk.test.mjs。
- 稳定工具：pnpm --filter @exts/stable-extension-dev test。
- 扩展：pnpm --filter @exts/extension test、typecheck、check:bundle-size；先运行 ext:build 再检查体积。
- Chrome/Edge 实际加载根稳定目录，成功→编译失败保留→恢复成功由用户验收；代理不执行视觉、布局或交互验收。
- macOS 真实 XcodeGen/Xcode 构建、XCTest、双应用并存与数据隔离、真实 ZIP/DMG 生成及挂载尚未实测。用户已允许本次实现继续并记录这些限制；系统命令替代测试只验证调度和文件保护。
- macOS 可用后运行 pnpm build、pnpm desk:dev、pnpm release，核对两 app 的身份、版本、数据路径及两包内容。原生测试需传入 EXTS_BUILD_VERSION 的根版本，既有 SQLite 分页失败仍不在本次修复范围。

相关入口：[根 README](../README.md)、[desktop](../apps/desktop/README.md)、[extension](../apps/extension/README.md)、[website](../apps/website/README.md)、[Issue](changes/issues/2026-10-10-repo-unify-build-release-issue.md)、[Commit 记录](changes/commits/2026-10-10-repo-unify-build-release-commit.md)。
