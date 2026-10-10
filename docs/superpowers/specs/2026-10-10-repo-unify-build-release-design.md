# 统一构建产物、版本来源与分发入口设计

- 状态：已批准；用户于 2026-10-10 确认设计及 Windows 平台退出规则
- [Issue](../../changes/issues/2026-10-10-repo-unify-build-release-issue.md)
- [Commit 记录](../../changes/commits/2026-10-10-repo-unify-build-release-commit.md)

## 唯一版本源

根 package.json 的 version 从 1.0.0 开始，由用户手动维护。scripts/version.mjs 根据模块位置定位根文件，提供读取与校验函数及 Shell 可用的命令入口；无写入、默认值、版本升级和构建副作用。

产品版本采用三段数字格式，按 Chrome Manifest 与 macOS 接受范围共同校验；本次不支持预发布后缀。内部工具包版本和第三方依赖版本保持独立，不跟随产品版本。

为保证同一值也可用作桌面构建编号，主版本范围 1–9999、次版本和修订版本范围 0–99，禁止前导零。依据 [Chrome Manifest 版本规则](https://developer.chrome.com/docs/extensions/reference/manifest/version) 与 [Apple CFBundleVersion 规则](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/TP40009249-SW1)。

统一入口读取一次版本，将同一值传给下游构建与打包。单端直接调用时调用同一公共读取模块；如果通过进程参数传递版本，下游必须校验其与根版本一致，禁止成为可覆盖根版本的另一个来源。

扩展配置不再写死 Manifest 版本；桌面构建将版本传入营销版本和构建编号。子应用 package.json 的产品版本字段没有工具需求时删除，有强制要求时派生并核对，不能要求用户维护第二份。

## 命令与平台

scripts/build.mjs 负责平台、工具、版本预检查及三端串行构建；可导入的构建入口返回本次版本与产物路径，导入不执行命令。失败即停止，不把旧文件视为本次成功。

scripts/release.mjs 调用同一构建入口，再生成 ZIP 和 DMG。根命令仅为 pnpm build 和 pnpm release；现有独立 dev/build 命令保留。

完整 build/release 要求 macOS，非 macOS 在任何构建或产物写入前明确报错、返回非零退出码；不静默跳过 desktop，不自动降级为部分成功。Windows 保留 web:build、ext:build。本次不增加选择平台或部分 release 参数。

## 产物边界

最终输出为根 dist/dev/chrome-mv3-dev-stable、dist/dev/exts-dev.app、dist/build/exts-web、dist/build/chrome-mv3、dist/build/exts.app；网站部署只消费固定网站目录。

各应用只能清理自己的目标目录。用户补充批准 WXT 临时目录、Xcode DerivedData、VitePress 缓存分别统一到根 dist/.cache/extension、dist/.cache/desktop/DerivedData、dist/.cache/website；应用内旧产物删除，.wxt 和依赖工具目录仍保留。网站开发仍使用 dev server，路径不得随当前工作目录漂移。

公共 stable-extension-dev hook 最小支持配置目标目录，保持默认同级 -stable 行为和既有校验、暂存、替换失败恢复机制；业务项目不复制发布实现。迁移所有必要旧路径消费者，包括包体积预算脚本，旧构建目录只能在新产物验证后按明确范围处理，不触碰用户数据。

## 桌面身份和数据

正式版：dev.linguio.exts，显示名 Exts，文件 exts.app。开发版：dev.linguio.exts.dev，显示名 Exts Dev，文件 exts-dev.app。Organization Identifier 保持 dev.linguio；按 Debug/Release 配置身份，共用业务代码。

目前缩略图缓存和默认下载目录使用旧 OhMy Photos 固定路径；正式版保持兼容，开发版使用独立路径。存储位置由小型统一入口按应用身份选择，不散落构建模式判断。不创建当前未使用的数据库、设置或钥匙串设施；存在的入口才接入隔离。

数据库等显式传入路径继续支持测试与现有调用，不迁移、删除或自动导入用户数据。用户主动选择相同外部目录不在自动隔离承诺内。开发与正式并存的可观察结果在 macOS 由用户验收。

## 本地分发

ZIP 为 dist/release/exts-extension-<版本号>.zip，包根直接包含正式扩展 manifest.json。DMG 为 dist/release/exts-macos-<版本号>.dmg，包含本机架构正式 exts.app 和 Applications 安装入口，使用系统工具生成。

release 开始前检查同版本文件冲突，默认拒绝覆盖。打包先生成临时文件并校验，再发布最终文件名；失败清理本次临时文件，不损坏既有包，不报告整次成功。只在整体完成后报告统一成功，各文件不承诺跨文件原子替换。

核对根版本、Manifest、Info.plist 和文件名一致；桌面符号、缓存及扩展开发产物不进入分发包。不新增打包依赖、签名、公证、通用架构、自动更新、Git 标签或外部发布。

## 验证与停止点

以版本解析、跨工作目录定位、串行调度和失败退出、隔离路径选择、公共稳定发布边界为必要逻辑验证；复用既有测试，不测视觉或模拟浏览器交互。

阶段一执行平台可用完整检查。用户于 2026-10-10 明确允许暂缓 macOS 原生验证并继续阶段二，实现结束后在规范记录所有未验证事项。

阶段二在 Windows 完成调度、版本与文件保护检查，真实 ZIP/DMG 产包、挂载及原生身份和数据检查保留为 macOS 未验证项，不以替代工具测试冒充实测。全部实现及 [规范文档](../../build-release.md) 完成后交付，不自动提交。

未触及工作台已知 SQLite 分页缺陷，不添加未来存储抽象或依赖。若平台要求、版本格式、正式数据迁移或依赖引入超出本设计则暂停并取得范围批准。
