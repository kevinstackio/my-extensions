# 固定发布包名并接入官网最新下载

## 元信息

- 工作项：2026-10-11-exts-fixed-release-assets
- 项目：exts
- 类型：架构任务；调整构建分发约定，一个独立交付 Issue
- 状态：待提交
- 创建日期：2026-10-11
- 当前阶段：用户于 2026-10-11 明确要求按三笔提交到本地，表示本地阶段验收通过与提交批准；旧 v1.0.0 已删除，新发布尚未创建
- 用户批准：固定包名与 latest 直链需求已确认；2026-10-11 用户明确要求启动本 Issue、删除并重建 v1.0.0 Tag，并在询问后批准删除旧 v1.0.0 Release 及附件。授权仅涉及该版本，其他历史 Tag/Release 保留。用户已明确确认产物直接放根 release、新包暂存校验成功后替换旧包、失败保留旧包；最终代码提交前需展示范围与完整 message，GitHub 现有认证可安全复用，重发需等待本地验证与最终代码提交

## 背景

当前分发包名包含版本，官网用根版本拼接对应 Tag 的下载地址，扩展发布新版本后需要重新部署官网才能更新链接。用户希望简化为固定包名，每个 Release 只上传一份包，官网使用 GitHub latest 附件直链，不查询 API、不做附件存在或下载结果判断。

## 目标

每个正式 Release 使用固定附件名 exts-chrome.zip、exts-mac.dmg；产品内部版本与 Release Tag 保留版本号。官网链接随 GitHub Latest Release 自动转向新附件，无需因产品版本变化重新部署网站。

## 范围

- Chrome ZIP 固定命名 exts-chrome.zip，macOS DMG 固定命名 exts-mac.dmg；不再额外上传带版本号副本。
- 根 package.json 的 version 仍为唯一产品版本源；构建写入 Manifest、应用内部版本，Release Tag 使用 v<版本>，Release 标题保留版本。开发、构建和发布不自动增加或改写根版本。
- 本地直接输出 dist/release/exts-chrome.zip、exts-mac.dmg，不增加版本目录；新包在同目录 .exts-staging-<随机值> 中生成和校验，成功后替换旧包，失败保留旧包。本地允许重复构建替换，远程同版本发布仍拒绝重复；dev/build 名称与路径不改。
- 官网 Chrome 使用 https://github.com/linguio/exts/releases/latest/download/exts-chrome.zip，macOS 使用 https://github.com/linguio/exts/releases/latest/download/exts-mac.dmg。
- 两个平台按钮保持直接链接，不添加 API、预检、重试、下载状态提示或自动识别版本。
- 用户于 2026-10-11 明确追加扩展 newtab 的 tab title 与网站 title 一致：Exts — 将想法与能力延伸为实用工具；仅调整标题，不改变新标签页功能或布局。
- 用户同日明确追加扩展 Manifest description 为“将想法与能力延伸为实用工具”，替换原“我的标签页，保存和组织我喜爱的网站。”。
- 正式 Release 发布前确认其固定附件完整，并确保该 Release 为 Latest；新 Release 缺少附件时不自动回退旧版本。macOS 暂无发布包是用户明确接受的状态，不以此扩展桌面交付范围。
- 同步构建分发规范、发布说明、必要测试与网站说明；除用户本次明确批准删除并重建的 v1.0.0 Tag/Release/附件外，其他历史 Release、Tag 和附件保留，不自动重命名或覆盖。

## 排除项

- 不部署 GitHub Pages、修改 DNS 或启用 HTTPS；域名 exts.linguio.dev 上线仍是后续独立工作项。
- 除已明确批准的新标签页标题与扩展描述同步外，不修改产品功能、页面布局、品牌资源、依赖版本或其他应用模块。
- 不实现客户端自动更新、自动升版本、前端 GitHub API 或下载结果检测。
- 仅允许重建 v1.0.0，保留其他历史 Release/Tag 与用户已下载的文件；不创建测试 Release，不 force push 主分支，不以本次授权修改无关远程资源。
- 不为了让 macOS 链接当前可用而构建或发布尚未验收的桌面安装包。

## Todo

- [x] 固定路径与替换规则、书面设计与精简实施 Plan 已确认。
- [x] 调整打包流程，生成固定包名并保持内部版本、根版本与 Tag 一致。
- [x] 调整现有发布 workflow，上传固定附件名，不上传版本名副本，保留草稿审核与发布保护。
- [x] 官网切换两个固定 latest 直链，移除下载链接对网站构建版本的依赖。
- [x] 调整必要打包与失败保护测试，同步文档，执行受影响的安装、类型检查、测试与构建验证。
- [ ] 展示交付与可复现验收步骤；实际 Latest 切换在获批准的正式发布中验收，停在用户验收。

## 验收标准

- 新发布附件名称固定，同一平台仅上传一份包；包内部版本正确，Release Tag 与根版本一致。
- 修改或发布新版本不自动改写根 package.json，不改写旧 Release，也不会使已安装客户端自行更新。
- 本地重复打包在新包校验成功后替换固定目标，生成/校验失败旧包不变；替换异常能恢复旧文件或保留可诊断备份，不报告成功。远程同版本拒绝重复发布，本次 v1.0.0 重建是已明确批准的例外。
- 官网按钮直接访问两个固定 latest 链接，不访问 API，不猜测最新版本、不检测附件或下载结果。
- 新正式 Release 被设为 Latest 且包含同名附件时，固定链接转向新包；历史包仍可从对应版本页面下载。官网无需为这一切换重新部署。
- macOS 无附件时允许链接不存在，符合用户明确接受的范围，不声称已验证成功下载。
- 扩展 newtab 标签标题与网站 title 同为 Exts — 将想法与能力延伸为实用工具，最终构建产物中保持一致。
- 正式扩展 Manifest description 为“将想法与能力延伸为实用工具”。
- 必要自动化验证通过；真实附件上传、Latest 切换和用户下载与自动化验证分别记录，不把尚未执行的远程验收写成完成。

## 关联文档

- [Commit 记录](../commits/2026-10-11-exts-fixed-release-assets-commit.md)
- [前置官网 Issue](./2026-10-11-website-product-homepage-issue.md)
- [构建与分发规范](../../build-release.md)
- [GitHub 官方 latest 附件链接说明](https://docs.github.com/en/repositories/releasing-projects-on-github/linking-to-releases)
- [Spec](../../superpowers/specs/2026-10-11-exts-fixed-release-assets-design.md)
- [Plan](../../superpowers/plans/2026-10-11-exts-fixed-release-assets.md)

## 唯一下一步

按已展示范围与 message 完成三笔本地提交；之后按已批准 Plan 重发 v1.0.0，远程验证完成前不预先结项。

## 已执行远程操作

- 2026-10-11 按用户明确批准删除远程与本地 v1.0.0 Tag，核对均不存在；tg-download-v1.0.0 等其他 Tag 保留。
- 复用 Git 现有认证读取并删除对应 v1.0.0 Release 及 exts-chrome-1.0.0.zip 附件，核对 Release 不存在；凭据未显示、未写入文件。
- 新发布脚本与官网 latest 链接已在本地实现并验证；根版本不变，尚未提交或创建新 Tag/Release。

## 本地阶段验证

- 打包与替换测试 19/19、稳定发布工具 8/8、扩展 15/15 通过；扩展和网站类型检查、构建、体积门禁与冻结安装通过。
- 实际固定名 Chrome ZIP 为 228263 字节，包内版本 1.0.0、description 与 newtab title 符合要求；网站产物含两个固定 latest 直链，根版本与依赖未修改。
- 未执行用户 Chrome 视觉或交互验收，未真实构建 DMG；CI、Latest 与公开附件状态尚待最终代码提交后核验。
