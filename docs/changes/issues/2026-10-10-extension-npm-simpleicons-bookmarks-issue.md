# 添加 npm 与 Simple Icons 书签

## 元信息

- 工作项：2026-10-10-extension-npm-simpleicons-bookmarks
- 项目：extension
- 类型：小型任务
- 状态：已完成
- 创建日期：2026-10-10
- 当前阶段：用户已确认验收通过并批准本地最终提交
- 用户批准：用户要求 npm 加入 DevOps，Simple Icons 加入底部 Dock 的 Components；已批准创建本 Issue 与配套 Commit 记录，并明确要求继续实施

## 背景

用户已在新标签页 assets/brand 中新增 npm.svg 和 simpleicons.svg，现有书签配置尚未接入这两个资源。

## 目标

在 DevOps 文件夹中提供 npm 入口，在底部 Dock 的 Components 菜单中提供 Simple Icons 入口，分别打开用户指定的官网。

## 范围

- 在 BOOKMARK_GRID 的 DevOps items 中加入 npm，地址 https://www.npmjs.com/，图标 brand/npm.svg。
- 在 DOCK_COMPONENTS 的 bookmarks 末尾加入 Simple Icons，地址 https://simpleicons.org/，图标 brand/simpleicons.svg。
- 使用用户新增的 SVG，沿用现有书签渲染与交互方式，并登记到构建资源清单。
- 同步本 Issue、Commit 记录和工作台。

## 排除项

- 不重绘、移动或转换用户提供的 SVG，不调整 Dock 布局或交互。
- 不修改其他书签、依赖、桌面、官网或发布流程。
- 不执行浏览器视觉与交互验收，不自动提交或推送。

## Todo

- [x] 核对两份 SVG 与现有书签图标接入方式。
- [x] 将 npm 与 Simple Icons 加入指定分类并配置官网地址。
- [x] 执行必要的配置、类型检查和构建验证，记录实际结果。
- [x] 展示变更并交付用户在 Chrome/Edge 验收。

## 验收标准

- DevOps 文件夹包含 npm，打开 https://www.npmjs.com/。
- 底部 Dock 的 Components 菜单最后一项为 Simple Icons，打开 https://simpleicons.org/。
- 两个入口使用用户提供的对应 SVG，其他书签和分类保持原有行为。
- 配置、类型检查与构建通过；视觉与交互以用户实际加载验收为准。

## 关联文档

- [Commit 记录](../commits/2026-10-10-extension-npm-simpleicons-bookmarks-commit.md)
- [构建与分发规范](../../build-release.md)

## 唯一下一步

无；用户已验收通过并批准本地最终提交。
