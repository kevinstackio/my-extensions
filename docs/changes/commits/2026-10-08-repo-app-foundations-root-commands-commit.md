# 建立 exts 应用结构并迁入首批功能的 Commit 记录

## 关联 Issue

- [建立 exts 应用结构并迁入首批功能](../issues/2026-10-08-repo-app-foundations-root-commands-issue.md)

## 预期交付边界

统一 exts 身份、desktop／extension 模块组织、首批媒体／新标签页能力、三端图标与六个根命令。安装原生依赖修复按用户最终要求拆为独立 fix，本 Issue 按用户明确要求分为 desktop、extension 和官网／仓库三份提交，本记录对应最终收口，不包含安装 fix 的锁记录变更，保持依赖版本与归档，不包含远程操作。

## 实际交付

- 产品／网站／根包及 @exts 内部包引用统一，desktop 工程和 scheme 为 exts，Bundle Identifier 为 dev.linguio.exts；根规范与应用说明同步。
- 设备媒体归入 desktop modules/media，新标签页归入 extension modules/newtab；应用组合、共享能力、资源和测试职责分开。保留行为测试，移除根规范禁止的样式／布局以及过度源码断言测试，改为必要配置资源及图标分派验证。
- 已确认插头角色的原生 SVG、参考稿、分平台资源与预览保留；AppIcon、扩展黑白 PNG 及 VitePress SVG／favicon／touch 已实际接入。旧活动工程与被替代图标移除，归档不改。
- 内部包命名对应的锁文件引用随应用结构更新；Oxide 原生依赖修复由独立安装 Issue／fix 承接。

## 验证结果

- 正常 pnpm install、WXT prepare、冻结锁文件安装通过；未验证无缓存全新安装或其他平台安装。
- 扩展 15 项测试、类型检查、生产构建与体积检查通过；公共稳定发布工具 7 项、desk Node 入口 8 项测试通过。
- 一次 WXT 内部 serve 构建成功发布 chrome-mv3-dev-stable，无浏览器或长期服务器。官网构建通过。
- macOS Release 构建通过，Debug 在 XCTest 流程中构建成功并实际运行；两个产物 plist、可执行文件与 AppIcon 完整。
- XCTest 27 项中 25 项通过、2 项 SQLite 分页失败，未宣称原生测试全绿。已定位为归档既有 SQL 拼接空格缺失，源码与归档一致，当前 UI 尚未调用该存储。
- Manifest 与资源、锁定版本保留、归档无 diff、模块边界及文档／diff 已核对。

## 未验证事项与限制

真实 Chrome／Edge、官网主题、Dock／Finder、Mac＋iPhone 浏览与备份，以及稳定目录成功→失败→恢复实际加载均待用户验收。SQLite 两项失败作为既有非当前 UI 路径缺陷记录后续；原生闭包／并发警告保留。未新增 iOS、PWA、签名、公证或部署。

## 用户验收与提交批准

- 用户验收：已通过，2026-10-09 看到交付结果与限制后明确要求拆分提交本地。
- 最终提交批准：已批准，仅本地，不推送。
- 状态：已完成。
- 已按用户要求同步本 Issue、对应记录与工作台终态；Git 提交失败时恢复待提交／待批准。

## 用户批准的拆分

共四份：安装 fix 由对应独立记录承接；本 Issue 分为桌面、扩展及官网／仓库三份。前三份保持构建引用自洽，工作台与本记录的完成终态随第四份收口。本记录不保存 Commit SHA。

## 最终 Commit message

```text
chore(repo): 统一官网与仓库品牌资料

- 接入官网浅深 SVG 与统一 exts 命名
- 整理品牌源稿说明和工作台及验收记录
```
