# 修复 TG Download Vite 依赖扫描竞态：交付记录

## 元信息

- 工作项：`2026-09-24-tg-download-vite-dependency-scan`
- 对应 Issue：[修复 TG Download Vite 依赖扫描竞态](../issues/2026-09-24-tg-download-vite-dependency-scan-issue.md)
- 状态：已完成
- 用户验收：已通过
- 最终提交批准：已批准
- 创建日期：2026-09-24
- 最近更新：2026-09-24

## 预期交付边界

- 仅限定 TG Download 的 Vite 依赖扫描入口并补充配置回归测试。
- 不改变 Popup 、下载流程或其他扩展项目。

## 实际完成内容

- 在 TG Download WXT 配置中将 Vite 依赖扫描限定为 `src/entrypoints/popup/index.html`。
- 增加直接读取实际配置结果的回归测试，先确认缺失配置时失败，再确认修复后通过。

## 验证结果

- 失败验证：配置测试在修复前收到 `undefined`，1 项失败、5 项通过。
- 针对性验证：`tests/manifest.test.ts` 6/6 通过。
- 全量测试：14 个测试文件、68/68 项通过。
- 类型检查：`tsc --noEmit` 通过。
- 生产构建：WXT 0.21.4 构建成功，产物总大小 42.40 kB。
- 开发模式：WXT dev 启动成功，5 个入口在 186 ms 内构建，稳定产物发布成功，未再出现 `UNRESOLVED_ENTRY`，验证后已主动停止服务。

## 未验证事项与限制

- 本变更仅影响构建工具配置，不涉及视觉或交互，无需新的 Chrome/Edge 视觉验收。
- 首次通过 `pnpm` 包装命令运行测试时包装器卡住，已终止残留进程；改用项目已安装的 Vitest 二进制后验证正常。

## 用户验收

- 结果：已通过
- 说明：用户在查看阶段交付和验证结果后明确要求本地提交。

## 最终 Commit message

fix(tg-download): 修复 Vite 依赖扫描竞态

- 将依赖扫描限定为 Popup 源码入口
- 增加实际 WXT 配置回归验证

## 最终提交批准

- 状态：已批准
- 说明：用户明确要求本地提交，同时表示验收通过和提交批准。
