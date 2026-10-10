# exts

## 1. 介绍

将想法与能力延伸为实用工具，汇集浏览器扩展、应用、AI Skills 与开发工具。

本仓库使用 monorepo 逐步整合一个自用工具：官网记录使用与开发文档，桌面应用承载本机能力，浏览器扩展提供网页与新标签页入口。旧应用保留在归档中；extension 已迁入新标签页，desktop 已迁入设备媒体能力，后续功能按模块逐项整合。

## 2. 项目框架

本仓库采用 Monorepo 组织方式，在同一个 Git 仓库中维护多个可以独立开发、构建和验证的子项目。

- **Monorepo**：统一维护 website、desktop 和 extension；功能在应用内部按职责组织，不再分别维护独立产品入口。
- **pnpm Workspace**：管理工作区依赖、项目包名和根目录统一命令；子项目可以单独执行，也可以从仓库根目录调用。
- **Turborepo**：编排多个子项目的开发、构建和验证任务，并复用任务缓存。
- **目录职责**：`apps/` 放当前应用，`archive/` 保存旧源码，`packages/` 放内部复用工具，`skills/` 放本地 Skill，`docs/` 放项目管理与技术文档。

## 3. 本目录项目结构

```text
exts/
├─ apps/
│  ├─ desktop/                  # 统一桌面应用，含设备媒体模块
│  ├─ extension/                # 统一浏览器扩展，含新标签页模块
│  └─ website/                    # 官网与文档站点
├─ archive/
│  ├─ apps/                     # 旧扩展、Photos 和 Helper 源码
│  └─ .github/workflows/        # 已退役的旧发布流程
├─ packages/
│  └─ stable-extension-dev/       # 稳定开发产物工具
├─ skills/
│  └─ local-issue-commit-workflow/ # 本地 Issue 与 Commit 工作流
├─ docs/                          # 项目文档
├─ scripts/                       # 唯一版本读取、统一构建与分发入口
├─ dist/                          # 开发、正式构建与分发产物，不纳入 Git
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

## 4. 根目录命令

| 应用 | 开发 | 构建 |
|---|---|---|
| 官网 | `pnpm web:dev` | `pnpm web:build` |
| Chrome／Edge 扩展 | `pnpm ext:dev` | `pnpm ext:build` |
| macOS 桌面 | `pnpm desk:dev` | `pnpm desk:build` |

先运行 `pnpm i`。Node 24.16.0、pnpm 12.4.2；原生桌面需要 macOS 27、Xcode 27 和 xcodegen。

`pnpm build` 在 macOS 串行构建三端，开始前检查桌面工具；Windows 明确退出，仍可单独运行官网与扩展命令。开发命令保持独立。

扩展开发只加载根 `dist/dev/chrome-mv3-dev-stable/`；生产产物为 `dist/build/chrome-mv3/`。桌面开发为 `dist/dev/exts-dev.app`，正式为 `dist/build/exts.app`；官网构建为 `dist/build/exts-web/`，部署直接取该完整目录。每端仅更新自己的产物。

根 `package.json` 的 `version` 是唯一产品版本源，初始 `1.0.0`，由用户手动维护；所有应用构建通过 `scripts/version.mjs` 读取和校验，不自动升级。桌面正式与开发身份、默认数据目录独立；正式已有数据不迁移。

`pnpm release` 在 macOS 统一构建后生成根 `dist/release/` 的 ZIP 与 DMG；同版本包已存在时报错，不自动推送或发布。

构建缓存也统一放在根 `dist/.cache/`；应用内部不再生成 `dist` 或 `DerivedData`。完整命令、版本、目录与分发规则见 [构建与分发规范](docs/build-release.md)。

内部包统一使用 `@exts/*`。品牌源稿和分平台资源见 [assets/brand](assets/brand/README.md)。未迁入功能不建立空模块；归档与历史文档保留原名。
