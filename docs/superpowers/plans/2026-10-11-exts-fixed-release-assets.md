# 固定发布包名与官网最新下载实施计划

> 使用 superpowers:executing-plans，在本会话串行实施；禁止子代理、并行命令及自动 Commit。先交付本地阶段验收，再按用户批准重发 v1.0.0。

**目标：**固定 ZIP/DMG 名称并安全替换本地旧包，官网使用 latest 直链，重发已批准的 1.0.0 Chrome Release。

**架构：**在现有 scripts/release.mjs 中调整命名与文件发布，不增加打包依赖或新脚本层。既有 workflow 保持先检查构建、再创建 Tag/草稿，官网只更换静态链接。

**技术栈：**现有 Node 24.16.0、pnpm 12.4.2 与系统打包工具；所有其他依赖不变。

**设计：**[已批准 Spec](../specs/2026-10-11-exts-fixed-release-assets-design.md)

**工作项：**[Issue](../../changes/issues/2026-10-11-exts-fixed-release-assets-issue.md) · [Commit 记录](../../changes/commits/2026-10-11-exts-fixed-release-assets-commit.md)

**状态：**用户于 2026-10-11 批准并要求同步网站，Plan 已批准，本地阶段实现与验证完成；用户已验收本地阶段并批准三笔提交，远程步骤待代码提交。

## 全局约束

- 固定产物为 dist/release/exts-chrome.zip、exts-mac.dmg；不加版本目录，不生成版本名副本，不改 dev/build。
- 根 version 唯一且不自动修改；Manifest/App 内部版本、v<版本> Tag 与发布标题保留版本。
- 暂存目录为 dist/release/.exts-staging-<随机值>；新包校验完才替换，失败保留或恢复旧包；恢复失败保留可诊断备份，不清空 release。
- 官网只有固定 latest 直链，不加 API、预检或结果判断；保持两按钮样式与 macOS 在前的顺序。
- 扩展 title 为 Exts — 将想法与能力延伸为实用工具，description 为将想法与能力延伸为实用工具；源码已按用户要求调整。
- 当前真实发布仅 Chrome，不构建尚未验收的桌面包；真实 DMG 缺失已获用户接受。
- 仅重建 v1.0.0；旧 Tag/Release 已删除且确认，不再执行重复删除，不动其他远程历史、不 force push 主分支、不部署域名。
- 中文注释、UTF-8；不新增假 DOM、视觉交互测试、依赖或抽象层。

## 重点验证

- 固定名称在本地再次构建时：新包成功替换，ZIP 内 Manifest 根版本仍正确。
- 生成或校验失败：正式旧包逐字节不变，暂存可安全清理。
- 两包发布中第二次替换失败：已替换的第一包恢复，无旧包时不残留新包。
- 文件占用使恢复也失败：旧备份留在恢复目录，错误包含该路径，不报告成功或删除备份。
- 网站未部署新版本时：两个 href 保持固定 latest 地址，不含构建版本，也不查询 API；检查实际构建产物。

## 步骤一：固定包名与安全发布

- [x] 修改 tests/extension-release.test.mjs，保留真实 ZIP 校验，把预期文件改为 exts-chrome.zip，并将旧“重复构建拒绝”改为“成功替换”；运行定向测试，观察新行为未实现的预期失败。
- [x] 在 scripts/release.mjs 中调整 releaseExtension、releaseAll 使用固定文件名，移除本地旧包冲突前置拒绝，保留根版本一致性和 ZIP/DMG 校验；暂存统一 .exts-staging- 前缀。
- [x] 同文件定义 publishReleaseFiles(files, stagingDirectory, { rename = renameSync } = {})；files 为 source/target 对数组，调用前所有源包已校验。备份旧目标、逐个替换、失败撤销或恢复；异常恢复失败时携带 recoveryDirectory，调用者保留该目录。
- [x] 调整 tests/build-release.test.mjs 的旧本地冲突断言，复用现有文件系统测试补充替换成功、生成/校验失败保留旧包、两包中途失败回滚及恢复失败备份保留。只给系统重命名故障注入，不模拟浏览器；跑相关 Node 测试确认通过。

## 步骤二：发布 workflow 与官网链接

- [x] 修改 .github/workflows/exts-chrome-release.yml 的产物路径为 dist/release/exts-chrome.zip，更新发布安装说明；保留冻结安装、全部门禁、同版本冲突保护与草稿流程，不添加重复附件或自动覆盖。
- [x] 修改 apps/website/src/config/site.ts 为已批准的两个 latest/download 固定 URL；移除 vite.config.ts 中下载所需 __EXTS_VERSION__ 注入与 src/app/env.d.ts，保留 readProjectVersion() 根版本校验。
- [x] 扩展 title/description 源文件已调整，核对生产新标签页与 Manifest；不改变其他入口或功能。
- [x] 更新 docs/build-release.md、apps/website/README.md、apps/extension/README.md 中实际涉及的名称、替换规则与下载说明；历史规范与其他 Issue 不批量重写。

## 步骤三：一次阶段完整验证与本地验收

- [x] 串行运行冻结安装、node --test tests/build-release.test.mjs tests/extension-release.test.mjs、稳定发布工具测试、扩展测试/类型检查；Vitest 使用单 worker，不启动 watch。
- [x] 运行 pnpm ext:release 一次，包含正式扩展构建和 ZIP 校验；核对 exts-chrome.zip 的 Manifest version、description 与 newtab title，并运行现有 bundle-size 门禁。
- [x] 运行网站 typecheck 与 pnpm web:build；核对生产两端 latest 链接，根 version 未变、非目标依赖未变、git diff --check 通过。
- [x] 更新实际交付和限制，交付用户：加载生产扩展目录或解压 ZIP 验收标题/描述，官网按钮地址符合固定链接。真实 Latest 尚无新发布，不能把当前失效链接写成上线成功。
- [x] 停在用户验收，展示文件范围、diff 摘要和完整最终 Commit message；未经本地提交批准不提交、不推送或重发。

## 步骤四：最终 Commit 后重建 v1.0.0

- [ ] 用户批准最终 Commit 后，将 Issue/Commit 记录切到准确的“本地已交付、远程重发中”，提交仅展示范围；实际远程验收未完成时不预先结项。提交失败恢复待提交/待批准。
- [ ] 按已批准重发范围推送该最终 Commit，确认远程 main 与构建提交一致；不 force push。通过现有 workflow_dispatch 从该提交运行发布流程，使用 Git 现有认证，不显示或保存凭据。
- [ ] 等待 CI 门禁通过，确认 v1.0.0 指向实际构建 Commit，草稿只有固定名 Chrome ZIP；核对包内版本、描述、title 后公开并设置 Latest。
- [ ] 验证 latest/download/exts-chrome.zip 直链、正式 Release 与附件；不验证或发布不存在的 macOS 包。记录实际远程结果，结项文档的额外本地提交需另行展示批准，不静默 amend 已提交历史。

## 停止与资源限制

执行前提醒用户是否切换较低成本模型，未切换不阻塞批准范围。每个同类失败最多一次原因定位与一次修复重试；第二次仍失败则停止该路径、记录影响和替代验证。内存告警立即停止全部进程。保持串行，CI 长等待期间及时汇报有意义的变化。

## 执行记录

- 本地门禁：Node 打包/替换 19/19、稳定发布 8/8、扩展 15/15，类型检查、冻结安装、Chrome 打包和预算、网站构建通过。
- 实际 ZIP 为 exts-chrome.zip，内部版本 1.0.0，标题与描述符合用户要求；正式网站含固定 latest 链接。无依赖或根版本变更。
- 暂存与两包恢复通过真实文件系统和必要重命名故障注入验证；真实 Windows 文件占用和 DMG 未实机验收。
- 用户已验收本地阶段并批准三笔提交，步骤四的代码提交待执行；新 Tag/Release 未创建。
