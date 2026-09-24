# 修复 TG Download Vite 依赖扫描竞态

## 元信息

- 工作项：`2026-09-24-tg-download-vite-dependency-scan`
- 项目：`tg-download`
- 类型：小型任务
- 状态：已完成
- 当前阶段：配置修复、自动化验证、用户验收和最终 Git Commit 已完成
- 创建日期：2026-09-24
- 最近更新：2026-09-24

## 背景

TG Download 新增 Popup HTML 后，Vite 依赖扫描同时收集源码入口和 `dist` 生成入口。WXT 开发重建会清空 `dist/chrome-mv3-dev`，导致已被发现的 `popup.html` 在扫描期间消失，触发 `UNRESOLVED_ENTRY`。

## 目标

让 TG Download 的 Vite 依赖扫描只使用 Popup 源码 HTML 入口，不再扫描 WXT 临时或稳定生成目录。

## 范围

- 为 TG Download 配置显式的 `vite.optimizeDeps.entries`。
- 增加直接验证实际 WXT 配置结果的回归测试。
- 执行 TG Download 测试、类型检查和构建。

## 排除项

- 不改变 Popup 界面、下载逻辑或消息协议。
- 不在本 Issue 中修改 X Download、My Tabs 或其他项目。
- 不处理全仓扫描发现的其他优化项。

## Todo

- [x] 增加能够复现缺失源码扫描入口的配置测试。
- [x] 将 Vite 依赖扫描限定为 `src/entrypoints/popup/index.html`。
- [x] 完成针对性测试、全量测试、类型检查和生产构建。

## 验收标准

- 实际 WXT 配置的 `optimizeDeps.entries` 只包含 `src/entrypoints/popup/index.html`。
- Vite 不再将 `dist/chrome-mv3`、`dist/chrome-mv3-dev` 或 `dist/chrome-mv3-dev-stable` 中的 Popup 当作依赖扫描入口。
- TG Download 现有测试、类型检查和生产构建通过。

## 关联文档

- [Commit 记录](../commits/2026-09-24-tg-download-vite-dependency-scan-commit.md)

## 唯一下一步

当前 Issue 已完成，可开始下一个已批准工作项。
