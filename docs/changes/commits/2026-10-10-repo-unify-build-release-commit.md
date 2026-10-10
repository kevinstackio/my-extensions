# 统一构建产物、版本来源与分发入口：Commit 记录

## 对应 Issue

- [Issue](../issues/2026-10-10-repo-unify-build-release-issue.md)

## 预期交付边界

统一根构建和本地分发入口、根 dist 产物布局及唯一产品版本消费；隔离桌面开发与正式身份和数据，保持独立开发命令及正式数据兼容。不包含签名、公证或远程发布。

根产品版本已确认并写入 1.0.0，后续由用户手动维护。

## 实际交付

- 阶段一已实现根 version.mjs、build.mjs；根产品版本 1.0.0，独立构建消费同一读取逻辑，子应用不再维护产品版本。
- 网站和扩展正式产物迁到根 dist/build；公共 hook 支持将稳定开发产物发布到根 dist/dev，原默认行为保持兼容。
- 桌面源配置区分 dev.linguio.exts.dev 与 dev.linguio.exts，构建时写入根版本，分别发布 exts-dev.app 与 exts.app；新存储入口分离开发缓存、默认下载目录，正式路径保持原值。
- 已实现 release.mjs 和根 pnpm release 命令：构建后检查版本、ZIP 根 Manifest、DMG 正式应用身份与版本，生成和校验基础镜像；已有同版本包拒绝覆盖，校验通过后发布最终文件，失败清理本次暂存与创建的最终文件。
- 用户批准后将 WXT、Xcode 和 VitePress 可配置构建缓存迁往根 dist/.cache；已删除实际存在的应用内旧扩展 dist，其他旧产物目录不存在，未触碰业务数据或归档。
- 公共稳定工具 API 说明随实现提交；统一规范、根与三端 README、AGENTS.md 的文档变更拆入独立文档工作项。macOS 派生工程尚未生成，用户已允许记录限制后完成本次实现。

## 验证结果

- 最终根脚本与桌面入口 Node 测试 21 项通过；公共稳定发布 Vitest 8 项通过；扩展 Vitest 15 项通过；扩展类型检查通过。
- pnpm web:build、pnpm ext:build 均成功，根 dist/build 含 exts-web 与 chrome-mv3；根版本与扩展 Manifest 均为 1.0.0。
- 扩展构建前后网站 index.html SHA256 一致。扩展体积预算通过，产物总计 509274 字节、JS gzip 112316 字节，无源码映射。
- Windows 实际 pnpm build、pnpm release 和 pnpm desk:dev 均按约定提示 macOS 要求并返回 1；其他平台行为由入口测试覆盖。
- 新版本/调度、稳定目标及桌面版本传递测试分别观察到缺失实现失败后通过；Swift 测试已写但未执行，不声称 XCTest 通过。
- Node 测试首次被沙箱以 spawn EPERM 阻止；获得工具权限后执行成功。没有为此修改业务代码或新增依赖。
- 工作区差异与 UTF-8 文本检查、Git diff 空白检查通过；未修改依赖版本或锁文件。
- 最终网站构建首次因新增 README 指向源码根文档的相对链接被当作站内死链而失败；确认原因后改为源码仓库链接，一次重试成功，未关闭死链检查。
- 最终网站成功重建前后扩展 Manifest SHA256 一致。此前网站失败后的空值哈希比较无效，不计入证据；阶段一成功构建时的反向网站入口哈希证据仍有效。
- release 使用临时目录及系统命令替代实现验证成功发布、同版本保护、build/ZIP/DMG 失败清理；这些不是 macOS 原生 ZIP/DMG 验证。

## 未验证事项与限制

- 当前 Windows 无 Xcode/XcodeGen，project.yml 已更新；exts.xcodeproj/project.pbxproj 尚未重新生成。macOS desk 命令会首先生成工程，必须核对生成差异并完成真实构建/XCTest。
- 新 AppStoragePathsTests 及应用并存、实际内部版本、存储隔离未在 macOS 执行；既有 SQLite 分页缺陷不在本次修复范围。
- 扩展稳定目录实际由用户运行 ext:dev 产生；代理未启动 watch、dev server 或浏览器交互验收，未声称完成成功→失败→恢复实际加载。
- release 命令与 ZIP/DMG 代码已实现，但真实 macOS 产包和 DMG 挂载尚未执行，不承诺签名、公证或公开分发可用性。
- 应用内旧产物已按用户要求删除。旧开发进程必须停止并重新启动才能采用新根缓存配置，不能用旧进程继续生成旧目录。
- 网站 README 使用源码仓库链接，新的远程文档需本地记录提交并由用户另行推送后才在远程可访问；根 README 和其他应用提供当前可用的本地相对链接。

## 可复现检查与暂缓验收

1. 在 Windows 运行 pnpm web:build、pnpm ext:build，确认根 dist/build 的两个独立目录完整；根 pnpm build、pnpm desk:dev 应报 macOS 要求并退出。
2. 运行 pnpm ext:dev，在 Chrome 或 Edge 加载根 dist/dev/chrome-mv3-dev-stable，确认新标签页、书签和标签组主流程保持原行为；代理不执行这些交互。
3. 临时制造一个可撤销的扩展编译错误并保存，确认构建失败且已加载稳定产物仍可使用；撤销后保存，确认成功更新。结束后恢复源码并停止 dev 服务。
4. 在 macOS 运行 pnpm build、pnpm desk:dev，确认根 dist/build/exts.app 与 dist/dev/exts-dev.app 同时存在、可以并存运行，开发身份和根版本与输出校验一致。
5. 在两版执行开发测试下载，确认正式默认 Downloads/OhMy Photos 与开发 Downloads/Exts Dev 分开，缓存分别为 Application Support/OhMy Photos/Thumbnails 与 Exts Dev/Thumbnails；正式旧文件不迁移或删除。
6. macOS 可用后生成工程并运行原生 XCTest，传入 EXTS_BUILD_VERSION 的根版本；报告实际结果及已知 SQLite 失败。运行 pnpm release 检查真实 ZIP 根目录及 DMG 内正式应用，并再次运行确认同版本拒绝覆盖；本次已批准暂缓这些实测。
7. 打开 docs/build-release.md，从根 README、三端 README 和 AGENTS.md 核对规范链接；停止并重新启动 ext:dev 后确认临时目录位于根 dist/.cache/extension，应用内不再生成 dist。

## 实施判断

- 沿用已批准的当前会话与当前工作区实施，不创建新分支、worktree 或阶段 Commit；遵守仓库禁止子代理与并行命令规则，最终 diff 由当前代理核对。
- WXT 当前配置入口采用对象配置；生产输出通过 config:resolved hook 调整实际 outDir，outBaseDir 仅指向根扩展缓存，避免 WXT clean 触碰其他应用。
- 不复制未使用的数据库或凭据设施；SQLiteMediaStore 仍接收显式 URL，只隔离当前实际默认缓存与下载入口。
- 用户最新明确允许暂缓 macOS 实测、不等待阶段停点并完成实现与规范；所有未验证项保持真实，不将 Windows 逻辑通过等同于 macOS 用户验收。

## 用户验收

已通过：用户于 2026-10-10 查看交付及拆分方案后明确要求本地 Commit 并同步关闭 Issue；macOS 原生及浏览器整体验收未实测的限制保留。

## 最终提交批准

已批准：按已展示的实现范围和 message 本地提交，并同步结项；规范文档另行提交，不推送。

## 最终 Commit message

```text
chore(repo): 统一构建产物与版本分发

- 统一根版本、构建和分发入口及产物目录
- 隔离桌面开发身份和默认数据目录
```
