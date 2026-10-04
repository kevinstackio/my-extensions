# 统一 OhMy 命名格式设计

## 目标与原则

仓库只保留三种 OhMy 产品命名格式，并根据使用场合选择：

| 场合 | 格式 | 示例 |
| --- | --- | --- |
| 对外展示、自然语言标题 | `OhMy XXXX` | `OhMy Exts`、`OhMy Tabs`、`OhMy Photos` |
| 目录、包、命令、资源等 kebab-case 标识 | `ohmy-xxxx` | `ohmy-exts`、`ohmy-tabs`、`ohmy-photos` |
| 类型、模块、Target 等连续 PascalCase 标识 | `OhMyXXXXX` | `OhMyExts`、`OhMyTabs`、`OhMyPhotos` |

`OmyExts`、`OmyTabs`、`OmyPhotos`、`Oh My Tabs`、`omyexts`、`@omyexts` 和 `omy-xxxx` 都不是现行合法格式。历史文档中用于描述当时事实的旧名称不受此规则追溯修改。

## 当前审查结果

活动路径已经使用 `ohmy-tabs`、`ohmy-dl` 和 `ohmy-photos`，无需再次移动产品目录。现行不一致集中在以下边界：

- 根 README 和网站仍展示 `OmyExts`。
- Tabs、DL 及当前技术文档仍展示 `Oh My Tabs`、`Oh My DL`。
- 根包仍为 `omyexts`，所有 workspace 包与内部依赖仍使用 `@omyexts/*`。
- 根脚本、OhMy DL 发布工作流、共享 WXT 工具文档和 `pnpm-lock.yaml` 仍引用旧 scope。
- OhMy Photos 的 Target、Scheme 和 Swift 模块已经使用 `OhMyPhotos`；产品目录与图标资源已使用 `ohmy-photos`。

## 迁移设计

### 展示名称

- `OmyExts` 改为 `OhMy Exts`，不使用完整单词 `Extensions`。
- `Oh My Tabs`、`Oh My DL`、`Oh My Photos` 分别改为 `OhMy Tabs`、`OhMy DL`、`OhMy Photos`。
- Manifest、HTML title、错误文本、README、网站、工作流名称和 Release 文案同步迁移。

### workspace 与包标识

- 根包名从 `omyexts` 改为 `ohmy-exts`。
- workspace scope 从 `@omyexts/*` 原子迁移为 `@ohmy-exts/*`。
- 所有 `package.json`、TypeScript import、WXT 配置、根命令、GitHub Actions 和 lockfile 在同一阶段更新，不保留旧 scope 别名。
- X Download 仅更新 package scope 和共享工具 import；不改变 `x-download` 产品标识或任何业务协议。

### 代码与平台标识

- 代码中的连续产品标识统一使用 `OhMyXXXXX`；现有 `OhMyPhotos` 保持不变。
- Apple Bundle Identifier 的产品段属于机器标识。严格套用 kebab-case 规则时，`dev.kevinstack.ohmyphotos` 应迁移为 `dev.kevinstack.ohmy-photos`。
- Bundle Identifier 变化会让 macOS 将构建产物视为不同应用身份，可能影响系统权限、偏好和既有安装识别，因此必须由用户在本 Spec 审查时明确确认；未确认前不得修改。
- 持久化键、文件选择器 ID、消息、事件和 CSS/DOM ID 先按活动源码扫描。只有实际包含旧 `Omy`、`omy` 或 `Oh My` 片段时才迁移，不因本任务重构其他命名。

## 文档边界

- 更新根 README、项目 README、当前架构指南、WXT 指南、迁移指南、网站内容和当前工作台。
- 历史 Issue、Commit、Spec、Plan、复盘和文章保持原样，即使其中出现旧名称或旧路径。
- 当前文档引用历史标题时保留标题原文，不把历史事实伪装成当前名称。

## 验证设计

- 扫描活动代码、配置、测试、工作流和当前文档，确认没有旧展示名、旧 scope 或旧活动标识。
- 检查 `pnpm-lock.yaml` importer 与 workspace package graph 使用 `@ohmy-exts/*`。
- 对 OhMy Tabs、OhMy DL 和 X Download 执行类型检查、逻辑测试与 WXT 构建；对 Website 执行 VitePress 构建。
- 如果 Bundle Identifier 获批迁移，执行 XcodeGen 和 OhMy Photos Debug 构建，并明确记录未运行的 XCTest 或真实设备验证。
- 单独审查 X Download 与 X Download Helper diff，确认除已批准的 workspace scope 外没有业务、Native Messaging、Bundle 或 Socket 变化。
- 执行 `git diff --check`、旧名称扫描和最终 diff 摘要；由用户完成 Chrome、Edge 与 macOS 的展示验收。

## 停止点

本 Spec 获得用户确认后才编写实施 Plan。Plan 获批后串行实施，并在自动化验证完成时停在用户验收，不主动创建最终 Git Commit。
