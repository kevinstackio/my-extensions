# 建立 TG Download GitHub 草稿发布流程：交付记录

## 元信息

- 工作项：`2026-09-26-tg-download-github-draft-release`
- 对应 Issue：[建立 TG Download GitHub 草稿发布流程](../issues/2026-09-26-tg-download-github-draft-release-issue.md)
- 状态：已完成
- 用户验收：已通过（用户明确要求本地提交）
- 最终提交批准：已批准
- 创建日期：2026-09-26
- 最近更新：2026-09-27

## 预期交付边界

- TG Download 版本来源与 Chrome/Edge 共用 ZIP 命名。
- 基于 TG Download 版本升级创建 Git Tag、ZIP 附件和 GitHub 草稿 Release 的专用工作流。
- 不自动公开 Release，不接入插件市场，不改变其他项目命令或扩展业务逻辑。

## 实际完成内容

- WXT 移除重复写死的 Manifest 版本，改由 TG Download `package.json` 提供版本，并将 ZIP 命名为 `tg-download-<版本>-chromium.zip`。
- 新增 `.github/workflows/tg-download-draft-release.yml`：`main` 上版本升级自动处理，首包和重试支持手动触发。
- 工作流在打包成功后核对 ZIP Manifest，创建或复用对应 Tag 和草稿 Release；已公开 Release 或 Tag 指向其他提交时拒绝覆盖。
- 保留 Chrome/Edge 共用一个 ZIP，不新增商店发布或根目录发布命令。

## 验证结果

- `wxt zip` 通过，生成 `dist/tg-download-1.0.0-chromium.zip`。
- ZIP 内 Manifest 版本与 `package.json` 均为 `1.0.0`。
- TypeScript 检查通过。
- GitHub Actions YAML 可由 Ruby YAML 解析。
- 工作流版本判断步骤手动触发模拟结果为 `should_release=true`；`main` 同版本合并模拟结果为 `should_release=false`。
- `git diff --check` 通过。

## 未验证事项与限制

- 当前环境运行 `pnpm --filter @my-extensions/tg-download package` 无输出并被终止；直接运行等价的 WXT 可执行文件成功。这是本地 pnpm 启动环境限制。
- 当前环境 Vitest 因无法为 localhost 获取随机端口而在启动阶段失败，未能完成测试执行。
- 尚未推送到 GitHub，因此尚未执行真实的 Actions、Tag 创建、草稿 Release 创建和 Chrome/Edge 加载验收。

## 用户验收

- 结果：已通过
- 说明：用户已查看阶段交付结果并明确要求提交到本地。

## 最终 Commit message

`ci(tg-download): 建立版本发布草稿自动化`

## 最终提交批准

- 状态：已批准
- 说明：用户明确要求创建本地 Git Commit；不推送远端。
