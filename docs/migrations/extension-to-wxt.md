# 扩展迁移到 WXT

本文是一份可复用的迁移清单，用于将已有 Chrome/Edge 扩展接入 `my-extensions` monorepo 并迁移到 WXT。它不是 TG Download 的代码副本，也不强制使用 React。

## 项目信息

迁移开始前填写：

```text
项目目录：apps/extensions/<project-name>
Workspace 包名：@my-extensions/<project-name>
扩展显示名称：<display-name>
扩展类型：content script / newtab / popup / options / mixed
目标浏览器：Chrome / Edge
是否引入 React：是 / 否 / 本阶段不处理
是否迁移 TypeScript：是 / 否 / 分阶段处理
测试框架：现有框架 / Vitest
```

## 阶段一：建立迁移基线

- [ ] 记录现有 Manifest 版本、权限、入口和匹配范围。
- [ ] 列出所有 HTML、JavaScript、CSS、图片和字体资源。
- [ ] 运行现有自动化测试并记录结果。
- [ ] 在 Chrome 或 Edge 中加载原项目，确认核心流程正常。
- [ ] 明确本次迁移是否包含 React、TypeScript 和测试框架转换。
- [ ] 将迁移范围之外的重构推迟到后续任务。

## 阶段二：接入 Workspace

- [ ] 新增项目级 `package.json`。
- [ ] 设置唯一包名 `@my-extensions/<project-name>`。
- [ ] 设置 `private: true`。
- [ ] 使用完整、精确的依赖版本。
- [ ] 提供需要的 `dev`、`build`、`test`、`typecheck` 和 `postinstall` 脚本。
- [ ] 执行 `pnpm install` 更新根 `pnpm-lock.yaml`。
- [ ] 执行 `pnpm turbo ls`，确认项目被识别。

## 阶段三：建立 WXT 外壳

- [ ] 新增 `wxt.config.ts`。
- [ ] 新增或调整 `tsconfig.json`。
- [ ] 按实际测试方案新增测试配置。
- [ ] 将 Manifest 字段迁移到 `wxt.config.ts`。
- [ ] 确认扩展名称、版本、权限、图标和浏览器覆盖页面保持一致。
- [ ] 删除重复的 Manifest 配置前，先确认 WXT 生成结果完整。

## 阶段四：迁移入口

- [ ] 将后台脚本迁移为 `src/entrypoints/background.*`。
- [ ] 将内容脚本迁移为 `src/entrypoints/*.content.*`。
- [ ] 将 popup、options、sidepanel 或 newtab 页面迁移到对应入口目录。
- [ ] 为内容脚本确认 `matches`、`runAt` 和执行世界。
- [ ] 确认页面入口引用的脚本和样式由 WXT/Vite 处理。
- [ ] 将入口中的业务逻辑拆到 `features`、`components` 或 `utils`，避免入口文件承担全部职责。

## 阶段五：迁移资源

- [ ] 将功能图标整理到 `src/assets/icons`。
- [ ] 将扩展品牌图标整理到 `src/assets/logo`。
- [ ] 保留项目需要的其他资源分类，例如 `brand`、`tools` 或 `fonts`。
- [ ] 检查 HTML、CSS、Manifest 和脚本中的旧路径。
- [ ] 固定输出路径的资源通过 WXT 配置映射到构建产物。
- [ ] 网页中的扩展资源使用 `browser.runtime.getURL()`。
- [ ] 内容脚本需要访问的资源加入 `web_accessible_resources`。
- [ ] 构建后检查资源是否实际存在于 `dist`。

## 阶段六：保留和调整测试

- [ ] 迁移前的行为测试不得删除。
- [ ] 更新因目录和入口变化而失效的测试路径。
- [ ] 为 Manifest、入口和资源映射补充测试。
- [ ] 为迁移中发现的缺陷先增加回归测试，再修复实现。
- [ ] 测试框架转换和业务迁移尽量分开执行。
- [ ] 确认测试不会依赖被忽略的构建目录或本机绝对路径。

## 阶段七：接入根命令

- [ ] 根据使用频率决定是否增加 `<简称>:dev` 和 `<简称>:build`。
- [ ] 从根目录执行过滤命令，确认子项目可以独立运行。
- [ ] 执行根 `pnpm test` 和 `pnpm build`，确认 Turbo 可以调度新项目。
- [ ] 检查 `turbo.json` 的输出目录与实际构建产物一致。

## 阶段八：浏览器验收

- [ ] 使用开发产物加载扩展并验证热更新流程。
- [ ] 使用生产产物重新加载扩展。
- [ ] 验证所有入口页面可以打开。
- [ ] 验证权限申请与迁移前一致。
- [ ] 验证图标、样式、图片和字体均可加载。
- [ ] 验证核心用户流程与迁移前一致。
- [ ] 检查浏览器控制台和扩展 Service Worker 是否存在错误。

## 验证命令

将 `<package-name>` 替换为实际 workspace 包名：

```bash
pnpm --filter <package-name> test
pnpm --filter <package-name> typecheck
pnpm --filter <package-name> build
pnpm test
pnpm build
pnpm turbo ls
```

## My Tabs 迁移提示

My Tabs 当前属于新标签页扩展，迁移时需要额外关注：

- `chrome_url_overrides.newtab` 对应的 WXT newtab 页面入口。
- `tabGroups` 权限以及相关浏览器 API 行为。
- `src/assets/brand`、`icons`、`logo` 和 `tools` 已有分类，应尽量保留。
- 现有 `node:test` 测试先作为迁移基线，不要因为采用 WXT 直接删除。
- 是否转换 TypeScript、是否改用 Vitest、是否引入 React，应作为可独立验收的步骤。
- 引入 React 后必须验证书签卡片、Popover、新标签页布局和标签组操作没有行为回归。

## 完成标准

只有同时满足以下条件，单个扩展才算完成迁移：

- pnpm 和 Turbo 能识别并调度项目。
- 开发模式和生产构建均可运行。
- Manifest、入口、权限和资源完整。
- 原有自动化测试保留并通过。
- 根级测试和构建通过。
- Chrome 或 Edge 实际加载与核心流程验收通过。
- 项目 README 和专属 AGENTS 规则已同步更新。
