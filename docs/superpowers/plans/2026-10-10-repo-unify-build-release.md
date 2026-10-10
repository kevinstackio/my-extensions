# 统一构建产物、版本来源与分发入口实施计划

> 执行技能：superpowers:executing-plans；本仓库禁止子代理、并行任务和自动阶段提交，全部由当前代理串行实施。

**目标：** 用唯一根版本统一三端产物及本地分发入口，并隔离桌面开发与正式身份和数据。
**架构：** 根 version 模块只读版本；build 调度应用内部工具；release 复用 build 后打包。应用配置负责身份，现有存储入口消费构建身份；公共稳定工具负责扩展发布。
**技术：** 现有 Node.js、pnpm、WXT、VitePress、Swift、XcodeGen/Xcode；ZIP/DMG 使用 macOS 系统工具，不新增依赖。
**Spec：** [已批准设计](../specs/2026-10-10-repo-unify-build-release-design.md)
**Issue：** [工作项](../../changes/issues/2026-10-10-repo-unify-build-release-issue.md)
**状态：** 已批准并完成源实现与 Windows 检查；用户补充批准根缓存迁移、旧产物删除及规范链接，macOS 实测暂缓并记录限制。

## 全局约束

- 根 package.json 的 version 初始 1.0.0，用户手动维护；公共版本模块不得写入或兜底，产品版本不影响工具包版本。
- 根 pnpm build/release 在非 macOS 启动前报错退出；web:dev、ext:dev、desk:dev 和独立 build 命令保留。
- 版本格式取三段数字且同时满足扩展和 macOS 约束；实施时核对官方格式要求，不猜测范围。
- 正式 Bundle Identifier dev.linguio.exts，开发 dev.linguio.exts.dev；正式旧路径保持兼容，禁止迁移或清理用户数据。
- 根只增加 version.mjs、build.mjs、release.mjs 三个生产脚本；中文注释、UTF-8、不新增依赖。
- 每端只清理自己的输出；同版本分发包默认不覆盖；不签名、公证、远程发布、创建 Git 标签或自动提交。

## 文件与接口

- 新增 scripts/version.mjs：readProjectVersion() -> string，Shell 执行仅输出版本；错误抛出或非零退出。
- 新增 scripts/build.mjs：buildAll() -> { version, websiteDir, extensionDir, desktopApp }；导入无构建副作用，CLI 设置退出码。
- 新增 scripts/release.mjs：releaseAll() 调用 buildAll，校验并发布本地 ZIP/DMG；CLI 设置退出码。
- 新增 tests/build-release.test.mjs：公共版本读取、根调度平台/失败行为及分发冲突等真实边界，使用 Node 内建测试与必要临时目录。
- 修改 package.json、apps/website/package.json、apps/extension/package.json 和实际受影响锁文件：根版本、命令及子应用字段；不更改依赖版本。
- 修改 apps/website/.vitepress/config.ts、apps/extension/wxt.config.ts、apps/extension/scripts/bundle-size.mjs 和必要配置测试：版本与路径消费。
- 修改 packages/stable-extension-dev/src/index.mjs、src/index.d.ts、tests/publish-stable-build.test.mjs、README.md：hook 可选 targetDir，默认行为保持兼容。
- 修改 apps/desktop/project.yml、exts.xcodeproj/project.pbxproj、scripts/desk.mjs、scripts/build.sh：构建身份、版本及输出；用 XcodeGen 生成配置，不手写派生工程。
- 新增 apps/desktop/src/modules/media/Storage/AppStoragePaths.swift 与对应 XCTest：按身份选择内部缓存和默认下载目录，不实现未使用的存储设施。
- 修改 ThumbnailDiskStore.swift、DestinationAccess.swift 的默认入口及必要现有调用；显式注入路径不变。
- 更新三端 README、desktop/AGENTS.md、工作记录和现有测试中实际使用的旧路径；不批量重写无关文档。

## 审查重点

- 不同工作目录执行时仍定位同一根版本：版本模块测试覆盖。
- 子进程传入旧版本、构建期间根版本变化：禁止生成混合版本；配置核对、release 包内核对覆盖。
- 非 macOS 根命令与构建失败：平台检查不产生文件，串行调度失败后不再启动后续任务。
- 目标路径分离及替换失败：稳定工具测试验证新目标、旧产物保留与现有 Windows 异常覆盖。
- 同版本分发冲突、残缺打包和混入 dev 文件：release 测试及 macOS 包内容检查覆盖。

## 阶段一：统一构建和桌面隔离

### 1. 唯一版本与根构建入口

- [x] 先针对根版本读取、非法/缺失版本、跨目录定位和 Windows 零写入退出补充失败测试；运行 node --test tests/build-release.test.mjs 确认预期失败。
- [x] 核对平台版本格式，写入根 version 1.0.0；实现 version 与 build 脚本及根 build 命令。所有下游消费同一版本，独立入口调用公共读取逻辑。
- [x] 删除不必要的子应用产品版本字段；若工具强制要求第二字段则只派生，不能让用户手工维护；依赖和工具包版本保持原值。
- [x] 重跑上述针对性测试，确认非 macOS 完整构建在任何产物操作前失败。

### 2. 根产物路径与稳定发布

- [x] 在现有稳定工具测试中先覆盖自定义 targetDir、校验失败保留原目标及默认路径兼容；运行 pnpm --filter @exts/stable-extension-dev test 确认新增行为预期失败。
- [x] 实现最小 targetDir 支持；网站输出根 dist/build/exts-web，扩展生产根 dist/build/chrome-mv3、开发临时目录迁到根 dist/.cache/extension，稳定目标根 dist/dev/chrome-mv3-dev-stable。
- [x] 将扩展 Manifest 版本改为公共模块读取；同步包体积检查及真实路径消费者。各应用仅替换自己的目录。
- [x] 针对性重跑稳定工具测试及扩展版本/路径配置检查，不启动浏览器交互或长期 dev 服务。

### 3. 桌面构建身份和数据隔离

- [ ] 先在 AppStoragePathsTests.swift 验证两身份路径分离、正式旧目录兼容；现有 desk.test.mjs 覆盖非 macOS dev/build 明确退出和必要构建参数。
- [x] 实现小型 AppStoragePaths；正式保留 OhMy Photos 缓存及下载路径，开发使用独立路径，接入现有默认入口，不改显式测试路径或添加新数据库设施。
- [x] 更新 Debug/Release Bundle Identifier、显示名、营销版本/构建编号、固定输出；开发成功后发布 exts-dev.app 并打开，正式生成 exts.app。
- [ ] 在 macOS 通过 xcodegen generate 更新派生工程；缺少 macOS 时保留源配置并如实阻塞相关完成标记，不伪造构建通过。
- [x] 同步 desktop 规范和三端说明，覆盖独立构建以及 website 部署目录，不创建外部部署配置。

### 4. 一次阶段完整验证与验收

- [x] 运行 node --test tests/build-release.test.mjs apps/desktop/tests/scripts/desk.test.mjs；pnpm --filter @exts/stable-extension-dev test；pnpm --filter @exts/extension test、typecheck、check:bundle-size，全部串行且阶段只完整执行一次。
- [ ] Windows 单独运行 pnpm web:build、pnpm ext:build；macOS 用 pnpm build 完成三端真实构建，核对根版本、Manifest、Info.plist 及网站资源。
- [ ] macOS 在生成工程后执行 xcodebuild test -project apps/desktop/exts.xcodeproj -scheme exts -destination 'platform=macOS' EXTS_BUILD_VERSION=<根版本> CODE_SIGNING_ALLOWED=NO；已知 SQLite 分页失败只记录影响，不扩大修复范围。
- [ ] 用户在 macOS 验收两 app 并存、数据分离，并在 Chrome/Edge 加载稳定目录验收成功→失败→恢复；列出实际结果与限制，用户已允许暂缓 macOS 实测并继续实现；此项保持未验证。

## 阶段二：本地分发

### 5. release 与包内容验证

- [x] 先补失败测试：同版本存在时不构建/覆盖、build 失败不打包、打包失败不产生残缺最终文件；运行根脚本测试确认预期失败。
- [x] 实现 release.mjs 和根 release 命令；平台/冲突预检查后调用 buildAll，以系统 ZIP 工具压缩正式扩展目录内容，以 hdiutil 生成含正式 app 和 Applications 链接的基础 DMG。
- [x] 校验 ZIP/DMG 中实际版本与本次根版本一致，再发布最终名称；失败只清理本次暂存，不处理旧包，不自动上传或提交。
- [x] 针对性根脚本测试通过后执行一次完整根逻辑检查和 Windows release 平台退出验证；真实 macOS release 保留为未验证，不额外重复构建。
- [ ] macOS 检查 ZIP 根 Manifest、挂载 DMG 核对正式 app 身份和版本后卸载；再次 release 验证同版本冲突提前退出，不覆盖旧包。
- [x] 更新实际交付记录，交付最终用户验收，展示未验证事项；不进入 Git 提交，等用户明确批准。

## 停止与提交

所有命令串行，同一失败最多一次定位与一次重试；系统内存告警立即停止。必要新依赖、数据迁移、版本不兼容或范围变化先请求批准。只对应一个最终交付 Commit，阶段内不提交；最终批准前展示实际 diff、验证结果、限制、完整 Commit message 和随提交更新的终态字段。

补充批准：所有可配置构建缓存统一到根 dist/.cache，旧应用内产物清理；规范入口为 docs/build-release.md，并从根 README、三端 README 和 AGENTS.md 链接。macOS 未执行项目保留未勾选，最终本地提交仍需用户明确批准。
