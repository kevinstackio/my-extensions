# 建立 TG Download GitHub 草稿发布流程

## 元信息

- 工作项：`2026-09-26-tg-download-github-draft-release`
- 项目：`tg-download`
- 类型：构建与发布流程任务
- 状态：已完成
- 当前阶段：已完成；GitHub Actions 真实运行与 Chrome/Edge 加载验收需在推送后由用户执行
- 创建日期：2026-09-26
- 最近更新：2026-09-27

## 背景

TG Download 已有项目级 `check` 和 `package` 命令，但尚无 GitHub 发布自动化。普通代码合入 `main` 不应生成发布包；准备发布时，由 TG Download 项目版本号的升级触发打包，并留给用户决定草稿何时公开。

当前本地 `main` 与 `dev` 的 TG Download 版本均为 `1.0.0`。此前 `dev` 上未提交的 `0.9.0` 改动已由用户恢复；首包版本基线为 `1.0.0`。

## 目标

让 TG Download 的版本升级在合入 `main` 后自动产生对应提交的 Git Tag、可供 Chrome/Edge 共用的 ZIP，以及附有该 ZIP 的 GitHub 草稿 Release。用户检查草稿后自行决定是否公开发布。

## 范围

- 以 TG Download 的 `package.json` 为唯一版本来源，移除 WXT Manifest 中重复写死的版本。
- 将 `wxt zip` 的文件名定为 `tg-download-<版本>-chromium.zip`，Chrome 和 Edge 共用一个包。
- 新增 TG Download 专用的 `.github/workflows/tg-download-draft-release.yml`；仅在 `main` 的 TG Download `package.json` 发生变更时进入自动发布判断，再比较实际版本变化。
- 版本升高且未发布时，运行现有 `check`、`package`，核对 ZIP 内 Manifest 版本与文件完整性；通过后为该构建提交创建 `tg-download-v<版本>` Tag 和附带 ZIP 的草稿 Release。
- 版本相同跳过发布；降版、无效版本、同名 Tag 指向其他提交时失败，不移动已有 Tag。重跑应识别已有草稿或部分完成状态，避免重复发布并补齐缺失附件。
- 为现有 `main` 的首包 `1.0.0` 提供一次性手动触发入口；工作流首次合入 `main` 且版本不变时不自动创建草稿。草稿只预填版本标题、简短说明和 ZIP 附件，不新增 Release 正文模板。
- 更新本 Issue、对应 Commit 记录及工作台状态，记录实际验证结果与用户验收情况。

## 排除项

- 不自动公开发布 GitHub Release；用户在 GitHub 上检查后自行发布草稿。
- 不接入 Chrome Web Store、Edge Add-ons 或其他插件市场。
- 不新增根目录 `publish` 命令、项目级脚本目录、Edge 专用构建包或第三方发布服务。
- 不修改扩展业务逻辑、权限、图标、网站或 Helper。
- 不调整首包版本号；首包以现有 `main` 的 `1.0.0` 为准。
- 不自动推送本地分支或提交。

## Todo

- [x] 确认 `dev` 上的未提交 `0.9.0` 已由用户处理，且首包仍使用 `1.0.0`。
- [x] 调整 TG Download 版本来源与 ZIP 文件名。
- [x] 建立仅由版本升级生成 Tag、ZIP 和草稿 Release 的工作流，并处理首次触发与失败重跑。
- [x] 验证版本判断、配置、构建包内容和工作流语法；记录 GitHub 端仍待验证的部分。
- [x] 用户已验收阶段交付并批准创建本地 Git Commit。

## 验收标准

- 普通代码合入 `main`、或 TG Download `package.json` 改动但版本不变时，不打包、不创建 Tag 或草稿。
- TG Download 版本高于已有发布版本并合入 `main` 时，检查与打包成功后只产生一个对应该提交的 `tg-download-v<版本>` Tag、一个草稿 Release 和一个 `tg-download-<版本>-chromium.zip` 附件。
- ZIP 内的 Manifest 版本与项目版本一致，产物可分别供用户在 Chrome、Edge 加载验收。
- 降版、无效版本或同名 Tag 指向其他提交时明确失败；失败重跑不覆盖已有 Tag，也不创建重复草稿。
- 首包 `1.0.0` 可以单独手动触发；仅合入工作流、或合并结果相对 `main` 仍为 `1.0.0` 时不会自动生成首包。
- Release 保持草稿，用户可编辑正文并决定何时公开；不要求商店账号或商店密钥。
- 根目录命令、现有 TG Download 项目命令和其他项目保持原样。

## 关联文档

- [Commit 记录](../commits/2026-09-26-tg-download-github-draft-release-commit.md)

## 唯一下步

无。推送到 GitHub 后再执行真实 Actions、草稿 Release 以及 Chrome/Edge 加载验收。
