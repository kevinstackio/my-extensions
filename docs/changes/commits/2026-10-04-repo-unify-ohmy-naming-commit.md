# 统一 OhMy 命名格式：交付记录

## 元信息

- 工作项：`2026-10-04-repo-unify-ohmy-naming`
- 对应 Issue：[统一 OhMy 命名格式](../issues/2026-10-04-repo-unify-ohmy-naming-issue.md)
- 状态：已完成
- 用户验收：已通过
- 最终提交批准：已批准
- 创建日期：2026-10-04
- 最近更新：2026-10-05

## 预期交付边界

- 将当前展示、kebab-case 和连续 PascalCase 标识统一为三套已确认的 OhMy 格式。
- 迁移根包、workspace scope、内部依赖、lockfile、网站和当前有效文档。
- 保留历史事实名称，不改变产品功能、图标或 X Download/Helper 的业务边界。

## 实际完成内容

- 根包名、workspace scope、内部依赖、WXT 配置、发布工作流和 lockfile 已统一为 `ohmy-exts` / `@ohmy-exts/*`。
- 对外展示已统一为 `OhMy Exts`、`OhMy Tabs`、`OhMy DL`、`OhMy Photos`；连续 PascalCase 标识保持 `OhMyXXXXX`。
- OhMy Photos Bundle Identifier 已改为 `dev.kevinstack.ohmy-photos`，并同步 XcodeGen 工程。
- 当前架构、WXT、迁移、共享工具、根 README 和官网文档已同步；历史管理文档保持事实名称。

## 验证结果

- stable-extension-dev：Vitest 7/7 通过。
- OhMy Tabs：Vitest 33/33、TypeScript、WXT build 均通过。
- OhMy DL：TypeScript、WXT build、WXT zip 均通过；Vitest 因 localhost 随机端口绑定失败，固定端口重试后仍失败。
- X Download：Vitest 54/54、TypeScript、WXT build 均通过。
- Website：VitePress build 通过。
- OhMy Photos：XcodeGen、Debug xcodebuild build 通过；构建产物 Bundle Identifier 为 `dev.kevinstack.ohmy-photos`。
- 活动代码、配置和当前文档旧标识扫描无匹配；`git diff --check` 通过；X Download/Helper diff 仅包含已批准的 scope/import 变化。

## 未验证事项与限制

- `pnpm install --offline` 无输出运行超过 60 秒后停止；未产生 lockfile 版本变化，已将三个 workspace scope 键机械迁移并通过 diff 审查。
- OhMy DL Vitest 受当前环境 localhost 端口绑定限制，未完成逻辑测试验收。
- Xcode 构建出现 CoreSimulator 服务告警，但退出码为 0；未运行 XCTest、真实设备或 Finder/Dock 验收。
- 视觉、交互和扩展实际加载仍需用户在 Chrome、Edge、Website 和 macOS App 中验收。

## 用户验收

- 结果：已通过。
- 说明：用户于 2026-10-05 明确要求按拆分 Commit 方式完成本地提交，视为验收通过与提交批准。

## 最终 Commit messages

```text
chore(repo): 迁移 OhMy workspace 包标识
feat(repo): 统一 OhMy 展示名称与应用身份
docs(repo): 同步 OhMy 命名规范与工作台
```

## 最终提交批准

- 状态：已批准。
