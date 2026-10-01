# 统一 OhMy Photos 显示名称与本地目录

## 元信息

- 工作项：`2026-10-01-ohmy-photos-product-naming-storage`
- 项目：`ohmy-photos`
- 类型：小型任务
- 状态：已完成
- 当前阶段：用户验收通过并批准本地提交
- 创建日期：2026-10-01
- 最近更新：2026-10-01

## 背景

应用当前混用 `Oh My Photos` 与 `OhMyPhotos`。用户确认产品显示名称应把 `OhMy` 作为一个单词，统一使用 `OhMy Photos`；本地下载和缓存目录也应使用相同名称。

## 目标

统一应用可见名称与后续新建的本地目录名称，同时保留现有目录和文件，不执行隐式迁移或删除。

## 范围

- 将窗口标题、连接页标题和 App 显示名统一为 `OhMy Photos`。
- 将后续下载目录统一为 `~/Downloads/OhMy Photos`。
- 将后续应用支持与缩略图目录统一为 `~/Library/Application Support/OhMy Photos`。
- 现有 `Oh My Photos` 目录保持原状，不自动移动、合并、覆盖或删除其中内容。
- 更新对应 Issue、Commit 记录和工作台状态。

## 排除项

- 不修改 Target、Scheme、Swift 模块名、仓库目录或 `dev.kevinstack.ohmyphotos` Bundle Identifier。
- 不实现旧目录数据迁移或清理工具。
- 不调整图库布局、缩略图链路或下载行为。

## Todo

- [x] 先补充名称和目录解析的针对性验证。
- [x] 统一应用显示名称和默认本地目录。
- [x] 验证项目生成、Debug 构建、Bundle 显示名和目录配置。
- [x] 停在用户验收，取得明确本地提交请求并完成终态记录。

## 验收标准

- 窗口标题、连接页和 App Bundle 显示 `OhMy Photos`。
- 新下载写入 `~/Downloads/OhMy Photos`，新缓存写入 `~/Library/Application Support/OhMy Photos`。
- 原有 `Oh My Photos` 目录和内容不被自动修改。
- Target、Scheme、仓库目录和 Bundle Identifier 保持不变。

## 关联文档

- [Commit 记录](../commits/2026-10-01-ohmy-photos-product-naming-storage-commit.md)
- [后续媒体备份与缩略图 Issue](./2026-10-01-ohmy-photos-media-backup-thumbnails-issue.md)

## 唯一下一步

无；本 Issue 已完成并进入最终交付 Commit。
