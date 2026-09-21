# VitePress 官网脚手架设计

## 元信息

- 工作项：`2026-09-21-web-vitepress-bootstrap`
- 对应 Issue：[建立 VitePress 官网脚手架](../../changes/issues/2026-09-21-web-vitepress-bootstrap-issue.md)
- 状态：已批准
- 创建日期：2026-09-21
- 最近更新：2026-09-21

## 目标与成功标准

`apps/web` 将作为 `my-extensions` 的独立官网项目。首个阶段只建立可运行、可构建的 VitePress 基线，保留官方 Default Theme 生成的官网式首页模板，不开始正式内容和视觉设计。

成功时，用户可以从仓库根目录通过 Turbo 运行开发和构建命令，而 VitePress 依赖仍由 `apps/web` 独立声明。

## 选定方案

使用“官方初始化器 + pnpm workspace 集成”：

- 不使用 `pnpm add -Dw`，避免将网站依赖写入根项目。
- 不手工仿造初始化模板，以 VitePress 当前官方生成结果为基线。
- 复用仓库现有 Turbo `dev` 和 `build` 任务，官网不建立第二套调度流程。
- 不为首个阶段增加自定义主题、Vue 组件或部署配置。

## 项目边界

```text
apps/web/
├─ .vitepress/
│  └─ config.ts
├─ index.md
├─ api-examples.md
├─ markdown-examples.md
└─ package.json
```

`apps/web` 同时是 npm 包边界和 VitePress 站点根目录。Markdown 文件位于该目录，`.vitepress` 只保存站点配置、缓存和构建产物。

## workspace 与依赖

- `pnpm-workspace.yaml` 显式增加 `apps/web`，不放宽为所有 `apps/*`。
- 包名为 `@my-extensions/web`，设置 `private: true` 和 `type: module`。
- 按用户指定的 `vitepress@next` 标签安装，但使用 `--save-exact` 将当时解析到的具体版本写入 `apps/web/package.json` 和根锁文件。
- VitePress 依赖保留在 `apps/web` 内，根项目只提供调度脚本。
- 首阶段不显式添加 Vue；只有后续自定义 Vue 组件或 API 时才另行评估。

## 官方初始化器选项

在 `apps/web` 内运行 `pnpm exec vitepress init`，使用以下输入：

- 配置位置：当前目录 `./`。
- Markdown 源文件位置：当前目录 `./`。
- Site title：`My Extensions`。
- Site description：`浏览器扩展的统一官网与文档中心`。
- Theme：`Default Theme`。
- TypeScript：是。
- 添加 package scripts：否；初始化后手工只增加 `dev` 和 `build`，不生成 `preview`。

官方 TypeScript 初始化器生成 `.vitepress/config.ts`；该文件在 ESM 包中直接使用。如实际初始化器问题文案发生变化，只能做等价选择；若需要改变目录、主题或生成范围，则暂停并向用户说明。

## 根目录命令

根 `package.json` 增加：

```json
{
  "vitepress:dev": "turbo run dev --filter=@my-extensions/web",
  "vitepress:build": "turbo run build --filter=@my-extensions/web"
}
```

网站子项目的 `dev` 和 `build` 脚本负责 VitePress 参数，根项目只通过 Turbo filter 调度。由于官网是 workspace 包并声明了 `build`，它同时参与现有 `pnpm build:all`。

## Turbo 构建产物

根 `turbo.json` 已将 `dist/**` 定义为 `build` 任务输出。VitePress 默认输出 `.vitepress/dist`，因此在 `.vitepress/config.ts` 中设置 `outDir: 'dist'`，使产物位于 `apps/web/dist`。

`apps/web/dist` 只是构建产物：它匹配根 `.gitignore` 的 `dist/` 规则，会被 Turbo 缓存，但不进入 Git。这个调整不改变 Default Theme 或页面内容。

## 生成物与失败处理

- `.vitepress/cache` 和 `dist` 不进入 Git。
- 依赖安装或初始化失败时不继续追加手工文件，先保留诊断信息并停止。
- 初始化器生成结果与官方文档预期不符时，不为了让构建通过而扩大成自定义站点实现。
- 开发服务器验证完成后必须关闭，不留长期后台进程。

## 验证与用户验收

自动化验证仅覆盖配置、构建和服务可达性：

- 检查 workspace 能解析 `@my-extensions/web`。
- 执行 `pnpm vitepress:build`，确认 Turbo 调度成功、退出码为 `0` 且产物位于 `apps/web/dist`。
- 在阶段完成时执行一次 `pnpm build:all`，确认官网参与统一构建且不影响其他 workspace 项目。
- 短暂启动 `pnpm vitepress:dev`，确认 Turbo 调度与本地 HTTP 访问成功后立即关闭。
- 执行 `git diff --check` 并确认缓存、构建产物未被 Git 追踪。

页面视觉与交互不做自动化验收。用户最终在 Chrome 或 Edge 中执行根命令，确认能看到 VitePress Default Theme 官网模板。

## 实施停止点

Spec 批准后编写不超过 120 行的实施 Plan。Plan 批准后再修改 workspace、安装依赖和运行初始化器。自动化验证完成后停在用户验收，不自动创建 Git Commit。
