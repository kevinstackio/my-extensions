# 统一 OmyExts 仓库与产品命名：交付记录

## 元信息

- 工作项：`2026-09-30-repo-unify-omy-product-naming`
- 对应 Issue：[统一 OmyExts 仓库与产品命名](../issues/2026-09-30-repo-unify-omy-product-naming-issue.md)
- 状态：已完成
- 用户验收：已通过
- 最终提交批准：已批准
- 创建日期：2026-09-30
- 最近更新：2026-09-30

## 预期交付边界

- 将本地仓库品牌、根包名与 workspace scope 统一为 OmyExts、`omyexts` 与 `@omyexts/*`。
- 将 My Tabs 完整迁移为 OmyTabs，将 TG Download 浏览器扩展完整迁移为 OmyDL。
- 将唯一官网从 `apps/web` 迁移到 `apps/website`，使用 OmyExts 展示品牌。
- 同步根命令、资源路径、测试、构建产物、发布工作流、锁文件和现行文档引用。
- OmyDL 直接切换到新的存储键、文件选择器 ID、运行时消息和资源标识，不保留旧历史或旧文件选择器目录记忆。
- 保持 X Download 与 X Download Helper 的目录、标识、命令和通信行为不变；不实施桌面端迁移或 X 功能合并。
- 只提供 GitHub 侧切换清单，不执行仓库改名、远端配置或推送。

## 实际完成内容

- 根包名、workspace scope、官网目录与 OmyExts 现行文档已统一；当前 workspace 包为 `@omyexts/*`。
- OmyTabs 已迁移到 `apps/extensions/omytabs`，同步更新 Logo、Manifest、入口标题、包名、根命令、测试与稳定构建引用。
- OmyDL 已迁移到 `apps/extensions/omydl`，同步更新内部存储键、文件选择器 ID、运行时消息、页面事件、主题消息、样式前缀、Logo、发布 ZIP 与 GitHub Draft Release 工作流。
- X Download 仅同步 workspace scope 与稳定包引用；X Download Helper 的路径、Native Host、Bundle Identifier、命令和通信契约未修改。

## 验证结果

- 官网：`apps/website/node_modules/.bin/vitepress build apps/website` 通过。
- OmyTabs：Vitest 8 个文件/33 项通过；`tsc --noEmit` 通过；`wxt build` 通过，产物总大小 506.79 kB。
- OmyDL：Vitest 15 个文件/77 项通过；`tsc --noEmit` 通过；`wxt build` 与 `wxt zip` 通过，生成 `dist/omydl-1.0.0-chromium.zip`。
- 共享包：Vitest 1 个文件/7 项通过；Turbo workspace 列出 5 个 `@omyexts/*` 包；X Download `tsc --noEmit` 与 `wxt build` 通过。
- `git diff --check` 通过；当前引用扫描未发现活动的旧 scope、旧目录、旧根命令或旧产品展示名。

## 未验证事项与限制

- pnpm CLI 在当前本地环境中无输出挂起，因此锁文件按未升级依赖的 importer/path/internal-name 机械变化同步；验证使用各 workspace 已安装的本地可执行文件。
- 浏览器加载、扩展交互与官网视觉结果由用户验收。
- 本次不保留旧下载历史和旧文件选择器目录记忆。
- GitHub 仓库改名、远端地址、商店后台和外部平台更新由用户执行。

## 用户验收

- 结果：已通过
- 说明：用户明确要求拆分并创建本地 Git commit，视为验收通过和提交批准。

## 拆分后的 Commit message

1. `refactor(repo): 统一 workspace 与官网命名`
2. `refactor(omytabs): 迁移新标签页扩展命名`
3. `refactor(omydl): 迁移下载扩展命名与发布流程`
4. `docs(repo): 完成命名迁移交付记录`

- 前三个 commit 按仓库/官网、OmyTabs、OmyDL 功能边界拆分
- 最后一个 commit 收敛 Issue、Commit 记录和工作台的最终状态
- 保持 X Download Helper 的 Native Messaging 边界不变

## 最终提交批准

- 状态：已批准
- 说明：已按拆分后的功能边界创建本地 Git commit，未执行远端推送或 GitHub 操作。
