# 修复 TG Download 草稿发布工作流运行失败

## 元信息

- 工作项：`2026-09-27-tg-download-draft-release-fix`
- 项目：`tg-download`
- 类型：构建与发布流程修复
- 状态：已完成
- 当前阶段：已完成；本地验证通过，真实 GitHub Actions 复跑需在本地合并结果推送后执行
- 创建日期：2026-09-27
- 最近更新：2026-09-27

## 背景

TG Download 发布工作流在版本未升级时会跳过依赖安装，但 `setup-node` 仍配置了 pnpm 缓存，任务收尾阶段因 pnpm store 不存在而失败。同时，旧版 `pnpm/action-setup` 触发 Node 20 弃用警告；真正发布路径的 ZIP 校验脚本还存在 Node 参数偏移问题。

## 目标

让版本未升级的工作流正常跳过并成功结束，消除 Action Node 20 运行时警告，并确保手动发布路径可以正确读取 ZIP 内的 Manifest。

## 范围

- 升级 `pnpm/action-setup` 到支持 Node 24 的精确版本，并保持 pnpm 版本为 `12.4.2`。
- 移除不适用于跳过路径的 `setup-node` pnpm 缓存配置。
- 修正 ZIP 校验脚本读取 Node 参数的偏移。
- 补充针对版本不发布路径、Action 版本和 ZIP 校验参数的验证记录。

## 排除项

- 不改变版本比较、Tag、草稿 Release、ZIP 命名或发布权限设计。
- 不修改扩展业务逻辑、Manifest 权限、商店发布流程或其他项目工作流。
- 不在本地伪造 GitHub Actions、Tag 或 Release 的真实运行结果。

## Todo

- [x] 修正工作流缓存配置、pnpm Action 版本和 ZIP 校验参数。
- [x] 验证 YAML、版本未升级路径和 ZIP Manifest 校验路径。
- [x] 用户已验收修复结果并批准创建本地 Git Commit、合并到 `main`。

## 验收标准

- TG Download 版本未升级时，工作流跳过安装、检查、打包和 Release 操作，并以成功状态结束，不再出现 pnpm store 缓存路径错误。
- 工作流不再使用声明 Node 20 的 `pnpm/action-setup` 版本。
- ZIP 校验脚本读取到正确的 Manifest 路径和期望版本，不再把 `-` 当作文件路径。
- 版本升级和手动触发的原有 Tag、草稿 Release 与 ZIP 流程保持不变。

## 关联文档

- [Commit 记录](../commits/2026-09-27-tg-download-draft-release-fix-commit.md)

## 唯一下步

无。推送本地 `main` 后重新运行 GitHub Actions，确认跳过路径和真实发布路径。
