# 固定发布包名并接入官网最新下载：Commit 记录

## 对应 Issue

- [Issue](../issues/2026-10-11-exts-fixed-release-assets-issue.md)

## 预期交付边界

统一 ZIP、DMG 固定附件名，保持根版本、包内部版本与 Release Tag 规则；更新发布流程和官网 latest 直链，不上传版本名副本，不包含域名部署、无关历史发布修改或自动升版本；用户已明确批准单独删除旧 v1.0.0 Tag/Release/附件并以固定包名重发该版本。

## 实际交付

- 本地 ZIP/DMG 固定为根 dist/release/exts-chrome.zip、exts-mac.dmg，新包暂存生成与校验后安全替换；生成/校验失败保留旧包，部分替换失败回滚，恢复也失败时保留可诊断备份。
- Chrome 发布 workflow 上传固定文件名；官网使用固定 latest/download 直链，移除客户端下载版本注入，仍在构建时校验根产品版本。
- 扩展 newtab title 为 Exts — 将想法与能力延伸为实用工具，Manifest description 为“将想法与能力延伸为实用工具”，已进入实际新 ZIP。
- 更新相关构建规范、应用 README 与必要打包保护测试；dev/build 名称、根版本和第三方依赖不变。
- 已按用户批准删除旧 v1.0.0 本地/远程 Tag、Release 与附件并核对；新发布尚未创建，不把本地完成写成远程成功。

## 验证结果

- 先观察固定包名与恢复行为的预期失败，再完成实现；Node 打包/替换测试 19/19 通过，包括真实 ZIP 重打包替换、DMG 校验失败保留旧包、两包替换中断回滚和恢复失败保留备份。
- 稳定发布工具测试 8/8、扩展测试 15/15 通过；Vitest 使用单 worker 串行，未启动 watch、dev server 或浏览器验收。
- 固定 pnpm 12.4.2 冻结安装通过，扩展与网站类型检查通过；pnpm ext:release 一次完成实际 Chrome 构建和 ZIP 校验，pnpm web:build 通过。
- 实际 ZIP 大小 228263 字节，根 Manifest version 为 1.0.0、description 正确，newtab title 与网站一致；暂存目录已清理，未改根 version 或依赖。
- 扩展体积门禁通过：JS gzip 112364 字节、CSS gzip 4796 字节、字体 69652 字节，无 source map。
- 网站生产产物包含 Chrome/macOS 固定 latest 直链，不包含旧客户端版本注入或 API 请求；git diff --check 通过。

## 未验证事项与限制

本地已通过验证，用户实际 Chrome 加载与页面交互仍待阶段验收。未真实构建或发布 DMG，macOS 固定链接当前无附件为用户明确接受的范围；DMG 调度和两包替换保护采用文件系统测试与系统命令替代实现验证，不等于 macOS 工具实测。

新 v1.0.0 Tag/Release/固定附件尚未创建，因此 latest 链接的真实公开状态未验收。旧同版本发布已按用户批准删除；其重建需要最终代码提交、推送与 CI 完成。其他历史发布保留，没有测试 Release 或主分支 force push。

## 可复现验收

1. 检查根 dist/release/exts-chrome.zip，解压到独立目录；Chrome 打开 chrome://extensions，开启开发者模式并加载解压目录。也可重新加载根 dist/build/chrome-mv3；生产目录此阶段不写入稳定 dev 目录。
2. 确认新标签页标题为 Exts — 将想法与能力延伸为实用工具；扩展管理页描述为“将想法与能力延伸为实用工具”，Manifest 内部版本仍为 1.0.0。
3. 运行 pnpm web:dev，确认按钮顺序、黑色样式不变；检查 macOS/Chrome 链接分别为 releases/latest/download/exts-mac.dmg、exts-chrome.zip，不包含构建版本。
4. 此时新 Release 未发布，链接可暂时不可用；最终代码提交并重发后再核对 Chrome latest 链接直接下载固定名 ZIP，Release 为 Latest、Tag 对应实际构建 Commit，附件只有固定名 Chrome 包。
5. 本地安全替换及失败保留可复现：node --test tests/build-release.test.mjs tests/extension-release.test.mjs；该测试不代表真实 Windows 文件占用或实际 DMG 发布验收。

## 用户验收

本地阶段已通过：用户于 2026-10-11 在看到交付、验证与拆分范围后明确要求“可以 提交到本地”；此请求同时表示本地阶段验收通过。远程 Latest 与公开附件状态仍待重发后验证。

## 最终提交批准

已批准三笔本地提交：用户明确指定三个 Commit 并要求提交到本地；执行前已展示每笔完整 message。第三笔包括本地阶段完成与远程待重发状态更新，不提前将 Issue 写为已完成。远程授权仅覆盖重建 v1.0.0，其他历史发布保留。

## 最终 Commit message

本记录对应第三笔代码交付 Commit；前两笔为用户明确批准的文档与构建提交，不保存 Commit SHA。当前 Issue 整体尚未完成，远程结果后续准确记录：

```text
feat(exts): 同步官网最新下载与扩展品牌文案

- 将官网按钮改为固定 latest 下载直链
- 统一扩展新标签页标题与产品描述
- 移除下载版本注入并同步阶段验收记录
```
