# 统一 WXT HTML 入口扫描保护

## 元信息

- 工作项：`2026-09-24-repo-wxt-entry-scan-safety`
- 项目：`repo`
- 类型：小型任务
- 状态：已完成
- 当前阶段：X Download 配置修复、My Tabs 测试整理、双项目验证和本地提交已完成
- 创建日期：2026-09-24
- 最近更新：2026-09-24

## 背景

X Download 与 My Tabs 都拥有 WXT HTML 源码入口和稳定开发产物。X Download 尚未限定 Vite 依赖扫描入口，存在与 TG Download 相同的生成目录竞态；My Tabs 已有正确配置，但回归测试只匹配源码文本。

## 目标

让剩余的 WXT HTML 入口扩展都使用明确的源码扫描入口，并通过实际配置结果验证这一边界。

## 范围

- 为 X Download 配置 `src/entrypoints/popup/index.html` 作为唯一 Vite 依赖扫描入口。
- 为 X Download 增加直接验证实际 WXT 配置结果的回归测试。
- 将 My Tabs 的依赖扫描测试从源码文本匹配改为实际配置结果验证。
- 删除 My Tabs 中匹配 `AGENTS.md` 文案的过时测试。

## 排除项

- 不改变任何扩展的 UI、业务逻辑、Manifest 权限或稳定发布工具。
- 不增加根目录聚合命令，不清理本地构建缓存。
- 不包含 X Download Popup 按钮功能。

## Todo

- [x] 先增加 X Download 失败配置测试，再实施最小配置修复。
- [x] 将 My Tabs 扫描入口测试改为实际配置结果，并删除过时的根规则文案匹配测试。
- [x] 串行执行 X Download 和 My Tabs 的测试、类型检查与构建。

## 验收标准

- X Download 的 `optimizeDeps.entries` 只包含 `src/entrypoints/popup/index.html`。
- My Tabs 测试直接断言实际配置返回的 `src/entrypoints/newtab/index.html`，不再用正则匹配实现文本。
- X Download 和 My Tabs 的现有测试、类型检查和生产构建通过。

## 关联文档

- [Commit 记录](../commits/2026-09-24-repo-wxt-entry-scan-safety-commit.md)

## 唯一下一步

无。用户已验收并批准本地提交。
