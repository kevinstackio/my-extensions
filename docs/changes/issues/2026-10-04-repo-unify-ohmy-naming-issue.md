# 统一 OhMy 命名格式

## 元信息

- 工作项：`2026-10-04-repo-unify-ohmy-naming`
- 项目：`repo`
- 类型：架构任务
- 状态：已完成
- 当前阶段：已交付
- 创建日期：2026-10-04
- 最近更新：2026-10-04

## 背景

仓库已经使用 `ohmy-tabs`、`ohmy-dl` 和 `ohmy-photos` 作为产品路径，但现行展示文本仍混用 `OmyExts` 与 `Oh My XXX`，workspace 根包和 scope 仍使用 `omyexts` 与 `@omyexts`。这些写法不符合已经确认的三种 OhMy 命名格式，需要按使用场合统一。

## 目标

将现行仓库品牌、产品展示名称、workspace 标识和代码标识统一为 `OhMy XXXX`、`ohmy-xxxx`、`OhMyXXXXX` 三种格式，消除活动代码、配置和当前文档中的 `Omy`、`omy` 与 `Oh My` 旧写法。

## 范围

- 对外展示使用 `OhMy Exts`、`OhMy Tabs`、`OhMy DL`、`OhMy Photos`。
- 目录、包、命令、资源和其他 kebab-case 标识使用 `ohmy-xxxx`。
- 类型、模块、Target 和其他连续 PascalCase 标识使用 `OhMyXXXXX`。
- 将根包 `omyexts` 和 workspace scope `@omyexts/*` 迁移为 `ohmy-exts` 和 `@ohmy-exts/*`。
- 同步根脚本、内部依赖、WXT 配置、发布工作流、lockfile、网站和当前有效文档。
- 审查 Bundle Identifier、持久化键、消息、事件、CSS/DOM ID 与发布产物，只修改不符合本次命名规则且已纳入 Spec 的现行标识。
- X Download 只允许发生 workspace scope 的机械性变化，不改变产品名、功能、通信协议或 Helper 边界。

## 排除项

- 不修改历史 Issue、Commit、Spec、Plan、复盘或文章中的事实名称。
- 不重命名本地仓库目录或远端 GitHub 仓库。
- 不修改产品功能、权限、界面设计、数据模型或图标。
- 不升级依赖，不操作远端、Release 或商店后台。
- 不修改 X Download Helper 的 Native Messaging、Bundle、Socket 或运行行为。

## Sub-issues

### 1. 现行名称与 workspace 身份迁移

- 统一对外展示名称、根包名、workspace scope、内部依赖和当前文档。
- 同步 lockfile、构建脚本和发布工作流。

### 2. 平台与运行时标识审查

- 按 Spec 审查 Apple Bundle Identifier 和现行运行时标识。
- 对可能影响应用身份或既有数据的变化执行明确验证并记录限制。

### 3. 完整验证与用户验收

- 验证 workspace 依赖图、受影响项目构建、旧标识扫描和受保护边界。
- 停在用户实际验收，不主动提交或进入后续任务。

## 验收标准

- 当前展示文本只使用 `OhMy XXXX`，不再出现活动的 `OmyXXX` 或 `Oh My XXX`。
- 当前 kebab-case 产品和仓库标识只使用 `ohmy-xxxx`，不再出现活动的 `omyexts`、`@omyexts` 或 `omy-xxxx`。
- 当前连续 PascalCase 产品标识只使用 `OhMyXXXXX`，不再出现活动的 `OmyXXXXX`。
- 所有 workspace 包、内部依赖、根命令、工作流和 lockfile 使用一致的新 scope。
- 历史管理文档仍保留当时真实名称；X Download 与 Helper 的受保护业务边界没有发生变化。
- 受影响项目的类型检查、逻辑测试和构建通过；视觉与交互由用户在 Chrome、Edge 或 macOS 中验收。

## 关联文档

- [Commit 记录](../commits/2026-10-04-repo-unify-ohmy-naming-commit.md)
- [Spec](../../superpowers/specs/2026-10-04-repo-unify-ohmy-naming-design.md)
- [Plan](../../superpowers/plans/2026-10-04-repo-unify-ohmy-naming.md)

## 唯一下一步

无；用户已确认按拆分 Commit 方式完成本地提交。
