# OmyExts

## 1. 介绍

将想法与能力延伸为实用工具，汇集浏览器扩展、应用、AI Skills 与开发工具。

本仓库使用 monorepo 组织多个相互独立的浏览器扩展、原生配套应用和官网文档。每个可独立开发的目录都有自己的 README，具体说明以对应目录为准。

## 2. 项目框架

本仓库采用 Monorepo 组织方式，在同一个 Git 仓库中维护多个可以独立开发、构建和验证的子项目。

- **Monorepo**：统一维护浏览器扩展、原生配套应用和官网文档，同时保留各子项目自己的源码、依赖、命令和 README。
- **pnpm Workspace**：管理工作区依赖、项目包名和根目录统一命令；子项目可以单独执行，也可以从仓库根目录调用。
- **Turborepo**：编排多个子项目的开发、构建和验证任务，并复用任务缓存。
- **目录职责**：`apps/` 放可运行的应用项目，`packages/` 放可复用开发包，`skills/` 放本地 Skill，`docs/` 放项目管理与技术文档。

## 3. 本目录项目结构

```text
omyexts/
├─ .github/workflows/             # GitHub Actions 工作流
├─ apps/
│  ├─ extensions/
│  │  ├─ ohmy-tabs/               # Oh My Tabs 浏览器扩展
│  │  ├─ ohmy-dl/                 # Oh My DL 浏览器扩展
│  │  └─ x-download/              # X Download 浏览器扩展
│  ├─ helpers/
│  │  └─ x-download-helper/       # X Download macOS 配套应用
│  └─ website/                    # 官网与文档站点
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

子项目 README：

- [Oh My Tabs](apps/extensions/ohmy-tabs/README.md)
- [Oh My DL](apps/extensions/ohmy-dl/README.md)
- [X Download](apps/extensions/x-download/README.md)
- [X Download Helper](apps/helpers/x-download-helper/README.md)
- [Website](apps/website/README.md)
