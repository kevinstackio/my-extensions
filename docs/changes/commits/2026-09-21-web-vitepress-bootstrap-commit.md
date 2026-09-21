# 建立 VitePress 官网脚手架：交付记录

## 元信息

- 工作项：`2026-09-21-web-vitepress-bootstrap`
- 对应 Issue：[建立 VitePress 官网脚手架](../issues/2026-09-21-web-vitepress-bootstrap-issue.md)
- 状态：已完成
- 用户验收：已通过
- 最终提交批准：已批准
- 创建日期：2026-09-21
- 最近更新：2026-09-21

## 预期交付边界

- `apps/web` 成为 pnpm workspace 中的独立 VitePress 项目。
- 使用 VitePress 官方初始化器生成 Default Theme 官网模板和 TypeScript 配置。
- 仓库根目录提供基于 Turbo 的开发和构建命令，官网参与 `build:all`。
- VitePress 依赖使用精确版本，构建产物输出到不进入 Git 的 `apps/web/dist`。

## 实际完成内容

- 建立 `@my-extensions/web` workspace 包，安装 VitePress `2.0.0-alpha.20`。
- 使用官方初始化器生成 Default Theme 首页、Markdown 示例和 TypeScript `config.ts`。
- 将构建输出设为 `apps/web/dist`，并在根目录提供 Turbo `vitepress:dev` 和 `vitepress:build`。
- 同步 workspace、README 和忽略规则。

## 验证结果

- `pnpm vitepress:build`：Turbo 范围内 1 个任务成功，生成 `apps/web/dist/index.html`。
- `pnpm vitepress:dev`：本地 HTTP 请求返回 200，验证后已关闭进程。
- `git check-ignore` 验证 `dist` 和 `.vitepress/cache` 均被忽略；`git diff --check` 通过。
- `pnpm build:all`：VitePress 任务成功，但现有三个 WXT 包因共享安装缺少 `@aklinker1/rollup-plugin-visualizer` 而失败。

## 未验证事项与限制

- `pnpm build:all` 仍受现有 WXT 包缺少 `@aklinker1/rollup-plugin-visualizer` 阻断，本次未修改其他扩展依赖。
- 页面视觉与交互已由用户在本地确认可接受。
- 正式官网内容、视觉定制和部署不在本次交付范围内。

## 用户验收

- 结果：通过
- 说明：用户确认根命令、官网式模板和当前限制符合预期。

## 最终 Commit message

- `docs(web): 记录 VitePress 规划与验收`
- 本次交付按用户要求拆分为三段提交，前两段分别交付 workspace/Turbo 接入与官网模板，第三段交付项目文档。

## 最终提交批准

- 状态：已批准
- 说明：用户明确要求直接提交并完结 Issue。
