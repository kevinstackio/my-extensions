# OhMy Exts

## 1. 介绍

将想法与能力延伸为实用工具，汇集浏览器扩展、应用、AI Skills 与开发工具。

本仓库使用 monorepo 逐步整合一个自用工具：官网记录使用与开发文档，桌面应用承载本机能力，浏览器扩展提供网页与新标签页入口。旧应用已归档，desktop 与 extension 当前仅预留目录，尚未迁入功能。

## 2. 项目框架

本仓库采用 Monorepo 组织方式，在同一个 Git 仓库中维护多个可以独立开发、构建和验证的子项目。

- **Monorepo**：统一维护 website、desktop 和 extension；功能在应用内部按职责组织，不再分别维护独立产品入口。
- **pnpm Workspace**：管理工作区依赖、项目包名和根目录统一命令；子项目可以单独执行，也可以从仓库根目录调用。
- **Turborepo**：编排多个子项目的开发、构建和验证任务，并复用任务缓存。
- **目录职责**：`apps/` 放当前应用及预留位置，`archive/` 保存旧源码，`packages/` 放内部复用工具，`skills/` 放本地 Skill，`docs/` 放项目管理与技术文档。

## 3. 本目录项目结构

```text
ohmy-exts/
├─ apps/
│  ├─ desktop/                  # 统一桌面应用预留位置
│  ├─ extension/                # 统一浏览器扩展预留位置
│  └─ website/                    # 官网与文档站点
├─ archive/
│  ├─ apps/                     # 旧扩展、Photos 和 Helper 源码
│  └─ .github/workflows/        # 已退役的旧发布流程
├─ packages/
│  └─ stable-extension-dev/       # 稳定开发产物工具
├─ skills/
│  └─ local-issue-commit-workflow/ # 本地 Issue 与 Commit 工作流
├─ docs/                          # 项目文档
├─ AGENTS.md                      # 仓库协作规范
├─ LICENSE                        # 开源许可证
├─ package.json                   # 根目录命令
├─ pnpm-workspace.yaml            # pnpm 工作区配置
└─ turbo.json                     # Turborepo 配置
```

当前入口：

- [Desktop](apps/desktop/README.md)
- [Extension](apps/extension/README.md)
- [Website](apps/website/README.md)
- [旧应用归档与迁移说明](archive/README.md)

## 4. 当前可用命令

- 官网开发：`pnpm website:dev`。
- 官网构建：`pnpm --filter @ohmy-exts/website build`。
- 公共稳定发布工具测试：`pnpm --filter @ohmy-exts/stable-extension-dev test`。

旧应用的根开发与打包命令已退役。新 desktop 与 extension 尚无开发、构建或发布命令；后续功能迁入时再增加。
