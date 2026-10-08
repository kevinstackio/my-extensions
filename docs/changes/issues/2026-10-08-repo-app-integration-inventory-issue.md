# 梳理现有功能与统一应用结构

## 元信息

- 日期：2026-10-08
- 项目：repo
- 状态：已完成
- 当前阶段：用户验收与本地提交已批准，本阶段交付结束
- 任务规模：小型文档任务
- 批准范围：用户已批准先梳理结构，再通过另一个 Issue 实际归档；本步只修改文档

## 背景与目标

保留现有 monorepo，将旧应用归档，在统一的 desktop 和 extension 中逐步整合功能，沿用 website，并在迁移验收后逐项删除旧项目。

本步交付归档清单、目录职责、功能与数据盘点，以及下一步的配置调整清单；不要求现在确定所有接口和数据迁移方案。

## 范围与排除项

- 范围：本 Issue、对应 Commit 记录和工作台；整理现有源码、配置和文档中可确认的事实。
- 排除项：移动目录、建立应用骨架、修改业务或构建配置、安装依赖、迁移数据、更改应用身份、删除源码、Git 提交和远端操作。
- 不额外创建 Spec 或 Plan；功能迁移涉及的具体设计在对应 Issue 中确认。

## Todo

- [x] 确认归档与保留清单、目标目录职责。
- [x] 归纳现有功能、执行位置、测试和数据边界。
- [x] 列出下一步必须检查的命令、Workspace、Actions 和路径引用。
- [x] 完成文档检查，停在用户验收，并将实际归档列为后续队列事项。

## 归档清单与目标目录

| 当前目录 | 下一步目标 | 处理方式 |
|---|---|---|
| `apps/extensions/ohmy-tabs/` | `archive/apps/extensions/ohmy-tabs/` | 保留源码、资源、测试和配置 |
| `apps/extensions/ohmy-dl/` | `archive/apps/extensions/ohmy-dl/` | 同上 |
| `apps/extensions/x-download/` | `archive/apps/extensions/x-download/` | 同上 |
| `apps/desktop/ohmy-photos/` | `archive/apps/desktop/ohmy-photos/` | 保留原生项目、脚本与测试 |
| `apps/helpers/x-download-helper/` | `archive/apps/helpers/x-download-helper/` | 保留应用、Native Host、脚本与测试 |
| `apps/website/` | 原位保留 | 继续使用 VitePress，失效内容引用按需更新 |
| `packages/stable-extension-dev/`、`skills/`、`docs/` | 原位保留 | 公共工具、Skill 和项目管理继续使用 |

候选结构：

```text
apps/
├─ website/              现有官网与使用、开发文档
├─ desktop/              统一桌面应用；下一步仅建立职责 README
└─ extension/            统一扩展；下一步仅建立职责 README
archive/
├─ README.md             归档清单、使用限制与移除条件
└─ apps/                 按原 extensions、desktop、helpers 分类保留
packages/               有实际复用需求的内部工具
skills/                 实际 Skill 文件
docs/                   Issue、Commit 记录和按需创建的设计与计划
```

默认只维护新应用；归档应用不继续发布新功能。归档不代表功能已迁移，也不代表旧安装或用户数据被移除。归档内容必须保持可追溯，复现所需依赖与命令在实际归档 Issue 中确定。

## 功能、依赖与数据盘点

| 现有能力 | 执行位置与未来归属 | 现有验证与迁移边界 |
|---|---|---|
| Tabs 书签网格、Dock、网站与标签组操作 | 浏览器；未来 extension 的首页与书签模块 | 数据目前由 `src/constants/bookmarks.ts` 提供；保留已有测试，运行时设置需在迁移前确认 |
| TG 页面识别、下载、进度与历史 | 页面内容脚本与扩展后台；未来 extension 的 Telegram 模块 | 现有 `tests/` 覆盖任务、历史等逻辑；历史键为 `ohmy-dl-task-history`，绑定旧扩展存储；桌面执行能力未确认 |
| X 页面媒体观察、任务提交与状态展示 | 浏览器采集，Native Messaging 交给 Helper；未来 extension 的 X 模块 | 现有媒体识别、通信与状态测试；保留来源 tab、帖子和媒体源，不把桌面直接解析任意帖子链接视为已有能力 |
| X 原生媒体下载与处理 | Swift Helper；未来 desktop 的网页下载模块 | 下载结果默认在 `~/Downloads/X Download/`；任务 Store 当前为内存数组；保留下载、文件保存与工具验证测试 |
| iPhone 设备会话、媒体浏览、缩略图、选择与备份 | ImageCaptureCore 与 SwiftUI；未来 desktop 的设备媒体模块 | 下载默认在 `~/Downloads/OhMy Photos/`，缩略图在 Application Support 下的 `OhMy Photos/Thumbnails`；SQLite Store 已有实现与测试，实际持久化接入及数据库位置待迁移前确认 |
| Native Host 与本机通信 | Helper 包含独立 Host；未来 desktop 的浏览器桥接能力 | 现有注册、消息帧与桥接测试；Host 名称为 `dev.kevinstack.xdownloadhelper.nativehost`，允许的扩展身份需随迁移评估 |

已确认的应用身份：Photos 为 `dev.kevinstack.ohmy-photos`，Helper 为 `dev.kevinstack.xdownloadhelper`。本步不修改身份；新 desktop 的名称、Bundle Identifier 和用户数据接续方式在建立应用前确认。

数据原则：不静默丢弃旧设置、历史、索引或下载文件；源码搬迁不等于数据搬迁。每项功能迁入前确定状态归属、数据处理和退出／断线行为。现有测试随归档保留，迁移时按仓库测试规则分类处理，不因搬目录删除行为覆盖。

## 下一步配置调整清单

| 位置 | 当前事实与下一步处理 |
|---|---|
| 根 `package.json` | 有官网、三扩展、Photos、Helper 命令；保留官网入口，旧命令明确退役或转为归档复现入口，不指向尚未建立的新应用 |
| `pnpm-workspace.yaml`、`pnpm-lock.yaml` | 当前匹配 `apps/*/*`、`apps/website`、`packages/*`；明确归档依赖安装／复现方式，同步 importer 路径或移除对应项，避免锁文件与 Workspace 不一致 |
| `turbo.json` | 当前有通用 dev、build、test 编排；按实际影响调整，归档项目不进入新应用默认任务，不无故改写公共任务 |
| `.github/workflows/ohmy-dl-draft-release.yml` | 当前唯一 workflow，包含旧路径、包名、ZIP 与发布逻辑；实际归档时退役旧发布入口，不建立空应用发布流程，不删除远端历史 Release 或 Tag |
| `.gitignore`、归档内配置与脚本 | `.gitignore` 有 Helper 工具的固定路径；检查相对路径、Workspace 公共依赖、安装脚本和被忽略的本机工具，防止移动后误跟踪二进制或下载文件 |
| 根 README、官网引用、项目说明 | 根 README 未列出 Photos；归档后同步当前入口，历史 Issue／Spec 保留历史语义，不批量改写 |
| `AGENTS.md` | 当前根规范仍有独立扩展目录的描述；下一步按统一产品与归档职责同步必要文字，保留批准、验收与提交规则 |

## 后续顺序与移除条件

1. 本 Issue 完成验收和最终提交后，创建“归档旧应用并调整仓库入口”Issue；只移动源码、整理入口，不迁移业务或运行时数据。
2. 后续候选顺序：Tabs 首页 → TG 下载 → 桌面设备媒体 → X 与桌面通信；仅表示路线，具体拆分和顺序在对应工作开始前确认。
3. 删除某个归档子项目前，必须确认功能已迁入并验收、数据已处理、构建／通信不再依赖旧项目，且该次 Issue 明确批准删除范围；不能仅因源码已复制就删除。

## 验收标准

- 归档与保留清单覆盖当前五个旧应用，website 原位保留；新应用目录职责清楚。
- 功能清单区分浏览器、本机和设备执行边界，已知数据与待确认项有明确记录。
- 下一步配置清单覆盖命令、Workspace／锁文件、Actions、忽略规则和文档引用。
- 本步仅改变三份文档；链接与 diff 检查通过。自动化检查不代表用户验收。
- 用户阅读归档清单、功能归属和下一步范围，确认是否符合预期；不要求加载扩展或运行桌面应用。

## 关联文档

- [Commit 记录](../commits/2026-10-08-repo-app-integration-inventory-commit.md)
- [工作台](../README.md)

## 唯一下一步

本 Issue 最终提交成功后，按队列创建第二个 Issue 并确认实际归档范围；本 Issue 不执行目录归档。
