# Monorepo 使用指南

本文说明 `my-extensions` 的目录职责、workspace 规则、依赖边界和统一命令。具体的 WXT 使用方式见 [WXT 使用指南](wxt.md)，迁移已有扩展时见 [扩展迁移到 WXT](migrations/extension-to-wxt.md)。

## 目录职责

```text
my-extensions/
├─ apps/
│  ├─ extensions/       # Chrome 和 Edge 扩展
│  ├─ helpers/          # 扩展配套程序，包括 Swift 等非 Node 项目
│  └─ website/          # 扩展配套网站
├─ packages/            # 被两个及以上项目复用的共享包
├─ docs/                # 架构、开发和迁移文档
├─ package.json         # 根命令、Node 和包管理器版本
├─ pnpm-workspace.yaml  # Node workspace 范围
└─ turbo.json           # workspace 任务关系和缓存规则
```

项目按产品归类，而不是按技术栈归类。浏览器扩展放在 `apps/extensions`，配套原生程序放在 `apps/helpers`，配套网站放在 `apps/website`。

## Workspace 规则

`pnpm-workspace.yaml` 当前匹配：

```yaml
packages:
  - apps/*/*
  - packages/*
```

- Node 项目必须包含独立的 `package.json`，否则 pnpm 和 Turbo 不会把它识别为 workspace 包。
- 包名统一使用 `@my-extensions/<项目名>`，项目名使用 kebab-case。
- 每个项目独立维护入口、依赖、构建配置和测试。
- Swift、Xcode 等非 Node 项目可以继续放在 `apps` 中，不要求为了加入目录而创建 `package.json`。
- 只有确实需要由根命令调度非 Node 项目时，才为它增加薄包装脚本或专用构建任务。

仓库级扩展开发工具位于 `packages/stable-extension-dev`，用于把 WXT 成功开发构建发布到不会被失败构建破坏的稳定目录。

检查 workspace 识别结果：

```bash
pnpm turbo ls
```

## 版本和依赖

- Node.js、pnpm、Turbo 和第三方依赖必须使用完整、精确的版本号。
- Node.js 版本由根 `package.json` 的 `engines` 和 `volta` 共同声明。
- pnpm 版本由根 `package.json` 的 `packageManager` 固定。
- 仅根项目使用的工具放在根 `devDependencies`。
- 仅某个应用使用的依赖放在该应用自己的 `package.json`。
- 两个及以上项目出现真实重复后，再考虑提取到 `packages`；不要提前创建抽象层。
- 修改依赖后必须同步提交相关 `package.json` 和根 `pnpm-lock.yaml`。

## 根命令

```bash
pnpm dev
pnpm build
pnpm test
```

这些命令通过 Turbo 调度所有具有对应脚本的 workspace 包。开发单个项目时优先使用短命令；没有短命令时使用过滤器：

```bash
pnpm --filter @my-extensions/<项目名> dev
pnpm --filter @my-extensions/<项目名> build
pnpm --filter @my-extensions/<项目名> test
```

当前 WXT 扩展已提供：

```bash
pnpm tg:dev
pnpm tg:build
pnpm tabs:dev
pnpm tabs:build
```

## 新增 Node 项目

1. 在正确的 `apps/<类型>/<项目名>` 目录中创建项目。
2. 新增独立 `package.json`，设置 `private: true` 和唯一包名。
3. 使用精确版本声明依赖。
4. 至少提供实际需要的 `dev`、`build`、`test`、`typecheck` 脚本。
5. 执行 `pnpm install` 更新根锁文件。
6. 使用 `pnpm turbo ls` 确认项目已被发现。
7. 从根目录执行构建和测试，确认 Turbo 可以正常调度。

## 共享配置边界

TG Download 与 My Tabs 均已完成 WXT 化，但暂不提取共享 WXT、TypeScript 或 Vitest 配置。两个项目的共同部分应在形成稳定重复模式后再考虑提取：

- 完全相同且会持续同步的配置可以提取到 `packages`。
- Manifest 权限、入口、页面和业务代码继续留在各自项目中。
- React 只作为视图层依赖加入需要它的扩展，不设为所有 WXT 项目的默认依赖。
