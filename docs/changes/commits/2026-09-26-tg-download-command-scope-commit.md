# 收敛 TG Download 与根目录命令职责：交付记录

## 元信息

- 工作项：`2026-09-26-tg-download-command-scope`
- 对应 Issue：[收敛 TG Download 与根目录命令职责](../issues/2026-09-26-tg-download-command-scope-issue.md)
- 状态：已提交
- 用户验收：已通过
- 最终提交批准：已批准
- 创建日期：2026-09-26
- 最近更新：2026-09-26

## 预期交付边界

- 根目录只保留各项目开发入口。
- TG Download 提供 `dev`、`check`、`build`、`package` 和 `postinstall`。
- 不修改 Helper、VitePress、扩展业务代码和发布 workflow。

## 实际完成内容

- 根目录移除各项目构建快捷命令，仅保留跨项目开发入口。
- TG Download 脚本收敛为 `dev`、`check`、`build`、`package` 和 `postinstall`。
- 保留 `postinstall: wxt prepare`，新增 `check: tsc --noEmit && vitest run` 与 `package: wxt zip`。

## 验证结果

- 两个 `package.json` 通过 JSON 解析检查。
- 根目录与 TG Download 脚本契约检查通过。
- TG Download TypeScript 检查通过。
- TG Download `wxt build` 通过，`dist/chrome-mv3/manifest.json` 与稳定产物 manifest 均存在。
- TG Download `wxt zip` 通过，生成 `dist/my-extensionstg-download-1.0.0-chrome.zip`。
- `git diff --check` 通过。

## 未验证事项与限制

- 通过 `pnpm --filter @my-extensions/tg-download check` 启动时无输出并被终止；直接运行项目可执行文件时，TypeScript 检查通过，但 Vitest 因当前环境无法为 localhost 获取随机端口而在启动阶段失败。这是环境限制，不是本次脚本调整引入的业务失败。
- 未进行 Chrome/Edge 加载和视觉交互验收，等待用户按仓库规范实际验收。
- 未创建 GitHub Actions、Tag、Release，也未推送远端。

## 用户验收

- 结果：通过
- 说明：用户明确要求“提交”，按仓库规范视为验收通过并批准本地 Git Commit。

## 最终 Commit message

`chore(tg-download): 收敛项目与根目录命令职责`

## 最终提交批准

- 状态：已批准并已提交
- 说明：仅提交本 Issue、Commit 记录、工作台状态及命令配置变更；未推送远端。
