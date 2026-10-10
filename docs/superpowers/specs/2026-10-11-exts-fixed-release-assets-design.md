# 固定发布包名与官网最新下载设计

- 日期：2026-10-11
- [Issue](../../changes/issues/2026-10-11-exts-fixed-release-assets-issue.md)
- [Commit 记录](../../changes/commits/2026-10-11-exts-fixed-release-assets-commit.md)
- 状态：用户于 2026-10-11 在设计交付后要求继续，书面设计已批准；本地实现与验证完成，用户已确认本地阶段并批准三笔提交；远程重发未执行
- [Plan](../plans/2026-10-11-exts-fixed-release-assets.md)：已批准

## 分发名称与版本

正式本地产物固定为 dist/release/exts-chrome.zip、dist/release/exts-mac.dmg，不增加版本目录、不生成带版本号副本。根 package.json 的 version 仍为唯一产品版本源，包内部 Manifest/App 版本与 v<版本> Tag 保留版本；不自动升版本。

dev/build 命令、目录与产物名称保持原状。用户明确要求扩展 newtab 标题为 Exts — 将想法与能力延伸为实用工具，Manifest description 为“将想法与能力延伸为实用工具”；这两项源码已调整，随本工作项构建验证。

## 本地安全替换

本地允许再次打包同版本，也允许新版本替换固定路径；远程同版本发布仍拒绝重复。本地旧包不是远程已发布附件，不用旧的本地路径冲突阻止正常构建。

在 dist/release 内创建 .exts-staging-<随机值> 暂存目录，与最终文件保持同一文件系统。新包只在暂存目录生成；完成 ZIP/DMG 格式与内部版本校验后才发布。打包或校验失败时清理本次暂存，最终旧包不变。

发布前在暂存目录保留需被替换的旧文件备份，使用同盘重命名逐个替换最终文件。完整 release 的两包全部校验后再开始替换；任一步替换失败时撤销本次新文件并恢复本次已替换的旧文件。只处理本次两个固定目标，不清空 release 或删除无关历史本地包。

单个重命名可以原子替换，两包不声称具有操作系统级整体原子性。若系统文件占用等错误同时阻止回滚，必须保留旧包备份与可诊断路径，不把它当作普通暂存清理，不报告成功。暂存目录不是长期构建 cache，正常完成或可安全清理的失败结束后删除。

## 官网与发布

官网保持现有两个按钮、图标与样式，仅将 href 改成以下固定链接，并移除下载链接所需的客户端版本注入：

- https://github.com/linguio/exts/releases/latest/download/exts-chrome.zip
- https://github.com/linguio/exts/releases/latest/download/exts-mac.dmg

构建仍校验根产品版本，不影响既有一致性检查。页面不查询 API、不预检、不判断下载结果，不追加加载或失败提示。新正式 Release 设为 Latest 且含固定附件时，官网无需重部署。macOS 暂无包为用户接受的状态，此工作项不构建或发布未验收桌面包。

现有 Chrome 发布 workflow 继续先验证和构建，再创建指向实际构建 Commit 的 Tag 与草稿，只上传 exts-chrome.zip，不上传带版本名副本；保留同名 Release 与不匹配 Tag 的冲突保护，更新安装说明。正式发布时明确设置 Latest，确认对应固定附件完整。

## 本次 v1.0.0 重建边界

用户已明确批准删除并重建旧 v1.0.0 Tag/Release/附件；删除已完成并核对，其他历史 Tag/Release 保留，Git 现有认证可复用，凭据不输出或保存。

完成本地实现、必要验证与用户阶段验收后，先按批准范围提交最终代码，再推送该明确提交并从它构建新 1.0.0 Chrome 包；创建同 Commit 的 v1.0.0 和 Release，上传固定附件并设为 Latest。用户已要求重发，授权只覆盖此次 1.0.0 发布；代码 Commit 前仍需展示文件范围与完整 message，不 force push 主分支，不部署网站域名。

## 验证与停止点

调整既有 Node 打包测试，覆盖固定文件名、真实 ZIP 内部版本、本地重复构建成功替换、生成/校验失败旧包不变，以及两包替换异常后的恢复；不新增假 DOM、截图或组件结构测试。

阶段完成串行运行受影响根测试、扩展测试/类型检查/生产构建/体积检查、网站类型检查与构建。实际本地 Chrome ZIP 只构建一次用于验收；完整 desktop/DMG 流程通过已有模拟与必要文件替换测试验证，不扩展真实桌面验收范围。CI 为最终发布 Commit 执行自身检查和构建，不重复构建同一未变化的本地阶段。

网站视觉与浏览器交互由用户验收；代码实现完成先停在阶段验收，不自动 Git Commit。正式发布只在已批准重发范围内执行，真实上传与 Latest 链接状态单独核验。新旧版本切换没有获批的第二个产品版本，不创建测试 Release 来演示切换。

## 官方依据

- [GitHub latest 附件链接](https://docs.github.com/en/repositories/releasing-projects-on-github/linking-to-releases)
- [现有构建分发规范](../../build-release.md)
