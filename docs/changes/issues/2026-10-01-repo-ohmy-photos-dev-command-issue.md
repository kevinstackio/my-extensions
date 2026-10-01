# 补充 Omy Photos 根目录开发命令

## 元信息

- 工作项：`2026-10-01-repo-ohmy-photos-dev-command`
- 项目：`repo`
- 类型：小型任务
- 状态：已完成
- 当前阶段：用户已实际启动并验收开发运行命令
- 创建日期：2026-10-01
- 最近更新：2026-10-01

## 背景

Omy Photos 已有 macOS Debug 构建脚本，但根目录 `package.json` 没有对应的 `pnpm` 入口，无法统一使用 `pnpm ohmy-photos:dev`。

## 目标

增加 `pnpm ohmy-photos:dev`，复用现有 Omy Photos 构建入口生成 Xcode 工程、构建 Debug App，并在构建成功后自动启动应用。

## 范围

- 在根目录 `package.json` 增加 `ohmy-photos:dev` 脚本。
- 建立并更新本工作项的 Issue、Commit 记录和工作台状态。
- 让现有构建脚本在成功后启动 Debug App。
- 验证脚本配置、构建入口和启动步骤。

## 排除项

- 不修改 Omy Photos Swift/Xcode 业务代码。
- 不改变现有 `apps/desktop/ohmy-photos/scripts/build.sh` 行为。
- 不恢复或调整当前已有的其他根目录脚本删除改动。

## Todo

- [x] 创建 Issue 与对应 Commit 记录，并登记为当前活动 Issue。
- [x] 增加 `ohmy-photos:dev` 根命令，指向现有构建脚本。
- [x] 完成配置断言、脚本语法检查和差异检查。
- [x] 增加构建成功后的 `OhMyPhotos.app` 启动步骤。
- [x] 完成实际 Debug 构建并确认应用启动。
- [x] 完成用户验收并取得明确本地提交批准。

## 验收标准

- `pnpm ohmy-photos:dev` 能解析到 `zsh apps/desktop/ohmy-photos/scripts/build.sh`。
- 构建成功后自动打开 `DerivedData/Build/Products/Debug/OhMyPhotos.app`；构建失败时不启动应用。
- 工作台、Issue 和 Commit 记录准确反映验证结果，并在提交前保持待验收状态。

## 关联文档

- [Commit 记录](../commits/2026-10-01-repo-ohmy-photos-dev-command-commit.md)
- [Omy Photos 构建脚本](../../../apps/desktop/ohmy-photos/scripts/build.sh)

## 唯一下一步

无；本 Issue 已完成并进入最终交付 Commit。
