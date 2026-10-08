# 建立 exts 应用结构并迁入首批功能

## 元信息

- 日期：2026-10-08；最近整理：2026-10-09
- 项目：repo
- 状态：已完成
- 当前阶段：用户于 2026-10-09 明确要求拆分提交本地，接受已展示结果与限制；本项提交应用结构和品牌入口
- 分支：dev，不在 main 开发或提交
- 批准范围：六个根命令、首批迁入与 desk 环境检查；后续明确追加整体改名 exts、两端顶层组织及三端共用图标。不包含 Git 提交
- 任务规模：同一首批功能交付涉及模块边界与应用身份，保留一个 Issue，不另拆目录整理或图标 Issue

## 背景

首批 Tabs 与 Photos 工程已经进入活动目录，但仍保留旧产品身份和分散的业务目录，交付文档及验证尚未收口。用户希望 desktop 和 extension 各自成为完整应用，后续模块有明确归属，网站、桌面和插件共享统一品牌。

## 目标

建立 exts 的统一身份与清晰模块结构，保留新标签页和设备媒体原能力，接入已确认的可爱插头图标，提供可在根目录开发与构建的三个应用。

## 范围

- 产品、网站与根包使用小写 `exts`，内部包使用 `@exts/*`；同步命令 filter、导入、Workspace、锁文件及现行说明，不升级依赖。
- desktop 工程与 scheme 为 `exts`，Swift 入口为 `ExtsApp`，Bundle Identifier 为 `dev.linguio.exts`，Organization Identifier 为 `dev.linguio`。用户明确指定优先于根规范默认前缀，配置与关联 Spec 必须一致。
- 归档 Tabs 作为 extension 的新标签页模块迁入，保留书签、Dock、标签组及稳定开发产物；Photos 作为 desktop 的设备媒体模块迁入，保留会话、索引、缩略图、选择与安全备份。
- 两端各自只有一个活动应用根，入口组合功能模块，实际跨模块复用能力进入 shared；同步源码、资源、测试、工程引用、README 和子项目规范。
- 三端接入已确认插头图案，按下表分别处理画布、透明度和格式。详细设计与资源清单分别引用 Spec 和资源 README，不在本 Issue 复制实现代码。

## 顶层组织方案（已批准）

| 职责 | desktop | extension |
|---|---|---|
| 应用入口／组合 | `src/app/` | WXT `src/entrypoints/` 与 `src/app/` |
| 首批业务模块 | `src/modules/media/` | `src/modules/newtab/` |
| 实际共享能力 | `src/shared/` | `src/shared/`，包含通用 UI 原语 |
| 应用资源 | `src/resources/` | `src/assets/` 与 `src/styles/` |
| 模块专属资源 | 有实际资源时放模块内 `resources/` | 模块内 `assets/` |
| 功能测试 | `tests/modules/media/` | `tests/modules/newtab/` |
| 工具／配置测试 | `tests/scripts/` | `tests/config/` |
| 工程与工具 | 根 project.yml、exts.xcodeproj、scripts、dist | 根 package.json、wxt.config.ts、scripts、dist |

shared 不反向依赖业务模块；模块不直接引用其他模块内部实现。保留已有领域分工，不为了目录统一重写逻辑。未迁入功能不建空目录，不添加注册框架、公共 API 或抽象守卫。

## 品牌图标与接入

已确认优化版：短双脚、圆润身体、胶囊眼睛、轻微歪头与短卷曲尾巴。唯一源稿 `assets/brand/exts.svg`，黑底白色；平台派生保留相同插头路径，只调整背景、颜色和留白，不重新生成或重绘图案。

| 平台 | 已准备资源 | 后续接入与验收 |
|---|---|---|
| macOS | `assets/brand/macos/AppIcon.appiconset/`，16／32／64／128／256／512／1024 PNG 与映射 | 接入活动 Xcode Assets 的 AppIcon，保留黑底及应用留白，由系统处理圆角；用户在 Dock／Finder 检查实际效果 |
| Icon Composer 素材 | `macos/composer-layers/` 前景／背景 SVG | 仅素材，不宣称已有 .icon 工程；本次沿用现有 AppIcon 资源集接入，不擅自改变构建体系 |
| Chrome／Edge 插件 | `assets/brand/extension/`，16／32／48／128 透明黑／白 PNG | Manifest icons 与 action 图标使用 PNG，接入既有主题切换逻辑；128px 主体最长边约 124px，用户检查浅深主题下工具栏效果 |
| VitePress 官网 | `assets/brand/website/`，透明黑／白 SVG、favicon PNG、黑底 touch PNG | 复制到 public，分别配置 themeConfig.logo.light／dark、head favicon 与 touch icon；用户检查浅深主题、导航 Logo 与浏览器标签图标 |

黑底批准适用于品牌、macOS 与 touch 画布，插件／官网导航使用透明背景。当前仅包含现有 macOS 应用，不新增 iOS 工程或 PWA 功能。

## 六个根命令

| 命令 | 预期结果 |
|---|---|
| `pnpm web:dev` | 启动 VitePress，输出可访问的官网地址 |
| `pnpm web:build` | 按现有 outDir 生成静态产物，交付报告写明实际路径 |
| `pnpm ext:dev` | WXT 开发产物发布至 `apps/extension/dist/<browser>-mv3-dev-stable/` |
| `pnpm ext:build` | 生成可加载的扩展生产产物，报告实际路径 |
| `pnpm desk:dev` | 在 Mac 构建 Debug 后打开 exts，不要求新增 watcher |
| `pnpm desk:build` | 生成 `apps/desktop/dist/exts.app`，不自动打开 |

desk 根入口由 Node 判断平台，非 macOS 明确报错并非零退出；Mac 检查 xcodebuild／xcodegen 后分派原生脚本，透传失败退出码。保留对应入口纯逻辑覆盖。

## 数据与排除项

- 默认下载、缓存与已有用户文件保持，不自动迁移、清理或覆盖。新 Bundle Identifier 的系统授权及扩展加载路径变化对 ID／存储的影响必须报告，不宣称自动继承。
- 归档源码与历史文档保留旧名称；活动运行和构建不依赖 archive。本机目录已经是 exts，不再搬迁。远程仓库改名与 remote 修改不自动执行。
- 不迁入 TG、X 或 Helper，不新增跨端通信、任务中心、页面重设计、依赖升级、假 DOM、视觉交互测试、签名、公证、DMG、CI、部署、提交、合并或推送。

## Todo

- [x] 确认两端目录方案，按已批准边界同步 Spec 与简短 Plan。
- [x] 整理已确认图案的原生 SVG 与分平台资源，完成规格检查及资源说明。
- [x] 完成活动命名与模块整理，保留已有核心行为和必要纯逻辑测试。
- [x] 接入三端图标与六个根命令，同步构建配置和使用说明。
- [x] 完成约定自动化验证，记录安装故障影响、实际产物与未验证事项。
- [x] 已交付可复现验收步骤，用户明确要求拆分并提交本地，验收与提交批准已取得。

## 实际交付与自动化结果

- 产品／根包与官网显示 exts，内部包为 @exts/*；desktop 工程、scheme 与产物为 exts，Debug／Release 实际 plist 均为 `dev.linguio.exts`。
- desktop 媒体代码归入 modules/media，extension 新标签页归入 modules/newtab，共享 UI／工具与应用组合分开；测试随职责迁移。没有实际共享 Swift 能力，故未建立空 shared 目录。
- 三端实际配置已接入批准图标：编译产物含 AppIcon.icns，扩展有透明黑白 PNG，官网产物有浅深 SVG 与 touch PNG。图案视觉与真实主题效果仍待用户验收。
- 复现原安装失败；使用 pnpm 12.4.2 的 `install --lockfile-only --fix-lockfile` 补回 13 个缺失原生包记录及 optionalDependencies，原有锁定包版本均保留。正常安装、WXT prepare 与修复后的冻结安装通过。
- 扩展：5 个文件、15 项测试通过；类型检查、生产构建与体积检查通过。公共稳定发布工具：7 项测试通过。WXT 内部单次 serve 构建成功发布稳定目录，未启动浏览器／watch／dev server。
- desk 入口：8 项测试通过。Release 根命令构建通过；Debug 在 XCTest 流程中构建并运行。XCTest 共 27 项，25 项通过，2 项 SQLite 分页失败；不称全量原生测试通过。
- 官网构建通过。Manifest、关键资源、可执行文件、AppIcon、Bundle Identifier、锁版本、归档无 diff、文档及 diff 检查通过。

## 已有问题与未验证事项

SQLiteMediaStore.page 的多行基础 SQL 与 ORDER BY／WHERE 拼接缺空格，首次查询成为 `FROM mediaORDER BY`，导致两项分页测试失败。已核对该实现与归档文件 SHA-256 完全一致，非本轮迁移引入；当前 app 入口／媒体界面没有使用 SQLiteMediaStore／MediaIndexer。这不阻塞当前界面主路径，记录在工作台收件箱，不擅自改业务或反复运行测试。

原生构建保留归档代码的闭包／并发捕获警告；未扩大为并发重构。用户需实际验证官网、Chrome／Edge 和 Mac＋iPhone；未验证无缓存全新安装、Windows／Linux 原生包安装、签名／公证及真实设备流程。单次内部开发构建不代替长期 WXT dev 热更新或浏览器成功→失败→恢复验收。

## 本阶段用户验收步骤

1. 根目录运行 `pnpm i`：正常完成且 WXT prepare 不再出现 native binding 错误。检查两端 README 和模块目录，确认后续功能有清楚归属。
2. 运行 `pnpm web:dev`，打开输出地址：标题 exts、导航 Logo 与 favicon 正常；切换官网明暗主题观察同构黑白 SVG。favicon 按系统配色，不能把它与站点手动主题混为一项。
3. 运行 `pnpm ext:dev`，在 Chrome／Edge 加载 `apps/extension/dist/chrome-mv3-dev-stable/`：新标签页显示既有书签和 Dock，链接及标签组功能正常，明暗偏好切换后图标可见。不要加载临时 chrome-mv3-dev。
4. 验证稳定发布：成功重建后临时制造一个编译错误，确认构建失败时稳定目录仍能加载上一版；恢复该改动后，确认成功重建再次更新稳定产物。该真实浏览器流程由用户执行，代理未宣称完成。
5. 运行 `pnpm desk:dev` 或打开 `apps/desktop/dist/exts.app`：应用名与 Dock／Finder 图标正确；连接 iPhone，检查媒体浏览、缩略图、选择、备份、拔线提示与同名文件不覆盖，必要时重新授予系统权限。
6. 确认旧下载与缓存文件仍保留；阅读上述 SQLite 两项失败和未验证限制，再反馈本阶段是否通过。未通过时继续当前 Issue，不自动提交。

## 验证与验收标准

- 活动产品显示 exts，内部包和使用方一致；desktop 使用指定 Bundle Identifier，配置与 Spec 一致，旧产品名仅保留于历史来源或明确兼容路径。
- 入口、业务模块、共享能力、资源、测试与工具归属明确；没有未来功能空目录或依赖归档的运行入口。
- 三端使用同一批准图案和各端正确格式；AppIcon 映射完整，Manifest 不引用 SVG，官网有透明浅深 SVG；不改图案细节。
- 六个命令符合表中结果，不能仅退出成功；扩展完成必要逻辑测试、类型检查、生产构建与已有体积检查，官网完成构建，公共稳定发布工具既有边界有效。
- desk 入口逻辑、Debug／Release 构建及现有媒体纯逻辑覆盖实际执行或明确报告环境限制；已有数据不被清理。
- 用户在 Chrome／Edge 加载稳定目录，检查图标、书签、Dock、标签组和成功→失败→恢复成功的重建结果；网站检查浅深主题与 favicon；Mac 检查 AppIcon、启动、设备媒体浏览和备份、拔线提示、同名文件不覆盖。
- 最终交付说明记录操作步骤、实际产物和限制；自动化通过不等于用户验收，不推送远端或自动进入下一项迁移。

## 最终拆分与验收记录

2026-10-09 用户在看到阶段交付、验收步骤及 SQLite 两项失败限制后，明确要求“拆分下 commit 提交到本地”。该请求同时表示验收通过与本地提交批准，并覆盖此前把安装修复合并处理的安排。

[安装修复 Issue](2026-10-08-repo-pnpm-native-install-issue.md)恢复为独立 fix，仅提交锁记录修复与对应文档；用户随后明确指定共四份 Commit：安装修复独立 fix，desktop 身份／媒体模块、extension 身份／新标签页模块和官网／仓库品牌资料分别提交；本 Issue 覆盖后三份，这是用户对默认一份最终交付 Commit 的明确例外。两份均保留用户已知限制，不推送。

## 关联文档

- [Commit 记录](../commits/2026-10-08-repo-app-foundations-root-commands-commit.md)
- [设计记录](../../superpowers/specs/2026-10-08-repo-app-foundations-root-commands-design.md)
- [实施 Plan](../../superpowers/plans/2026-10-08-repo-app-foundations-root-commands.md)
- [资源说明与图标验收步骤](../../../assets/brand/README.md)
- [工作台](../README.md)

## 唯一下一步

本地提交成功后本项收口；SQLite 已有缺陷继续保留在工作台收件箱，后续处理须由用户明确指定。本项不推送远端。
