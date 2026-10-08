# 归档旧应用并调整仓库入口实施 Plan

> 执行方式：使用 superpowers:executing-plans，在 dev 串行执行；禁止子代理，不创建中间 Git Commit。

**目标：** 归档旧应用，建立清晰的活动目录和可用仓库入口，不迁移业务功能。

**依据：** [本 Issue](../../changes/issues/2026-10-08-repo-archive-legacy-apps-issue.md) 和 [已验收盘点](../../changes/issues/2026-10-08-repo-app-integration-inventory-issue.md)。

**技术：** 保留现有 pnpm Workspace、Turborepo、VitePress 和原生项目文件；Node 24.16.0、pnpm 12.4.2、Turbo 2.10.12，不升级版本。

## 约束与停止点

- 用户已批准本 Plan，实施前已提醒可选择较低成本模型；用户验收通过并明确批准全部本地提交。
- 写文件前确认当前为 dev，工作区只有本 Issue 的规划文档；出现用户新改动时保留并重新判断移动范围。
- 移动前确认所有绝对源路径和目标路径均在当前仓库中，目标不存在；只使用 PowerShell 原生文件操作，不删除源内容。
- 保留归档源码和现有测试；本步不做测试重构或删除视觉测试，归档测试不作为活动验证对象。
- 同一失败只定位一次并修复重试一次；再失败则停下报告，不扩大业务改动。
- 实施结束停在用户验收；不推送、不合并 main、不自动 Git Commit。

## 1. 归档与文件保留

- [x] 用 Git 清单记录五个旧应用的受管理文件与内容摘要，复核忽略／未跟踪文件，防止工具或用户数据混入提交。
- [x] 创建 `archive/apps/`，将三个扩展、Photos、Helper 按原分类完整移动；不改内部代码和配置。
- [x] 将 `.github/workflows/ohmy-dl-draft-release.yml` 移至 `archive/.github/workflows/ohmy-dl-draft-release.yml`，内容保持不变。
- [x] 对照移动前清单确认 272 个旧应用文件及 workflow 内容保留，根旧发布 workflow 已不存在。

## 2. 活动目录与说明

- [x] 创建 `apps/desktop/README.md`：设备媒体、网页下载、任务、浏览器桥接的候选职责；注明当前仅预留位置。
- [x] 创建 `apps/extension/README.md`：首页／书签、Telegram、X、任务展示和桌面连接的候选职责；注明当前仅预留位置。
- [x] 创建 `archive/README.md`：归档清单、历史命令失效、Workspace 排除、Git 历史复现方式、逐项迁移验收与删除条件。
- [x] 更新根 README 的产品定位、目录和导航；根 AGENTS 仅更新项目结构职责，不改变审批与验收规则。

## 3. 命令与活动依赖

- [x] 根 `package.json` 只保留现有 `website:dev`，删除其余六个旧应用命令，不新增新应用命令。
- [x] `pnpm-workspace.yaml` 改为 `apps/website`、`packages/*`；归档不进入 Workspace，desktop／extension 没有 package.json。
- [x] `.gitignore` 的三条 Helper 路径改为归档后的路径；保留其他全局忽略规则。
- [x] `turbo.json` 只有通用任务，无旧应用路径；确认无需修改后保留原样。
- [x] 检查官网现有本地链接，未发现因移动失效的本地链接，官网源码保持不变；保留历史文档和归档内部路径语义。
- [x] 确认可用 Node／pnpm 精确版本；整理活动项目锁文件并安装验证，不改变 package.json 中任何依赖版本。若需要网络或权限，按工具审批流程处理；不自行降级版本。

根锁文件含包管理器与项目依赖两个 YAML 文档，活动项目部分已整理；最终离线冻结安装通过。

## 4. 验证与交付

- [x] 检查 Workspace 成员、根命令、目录职责、文件保留、忽略路径和当前入口链接；旧路径只允许出现在归档说明或历史文档中。
- [x] 运行一次 `pnpm --filter @ohmy-exts/website build` 和 `pnpm --filter @ohmy-exts/stable-extension-dev test`；不启动 dev server 或浏览器，不运行归档应用测试。
- [x] 最终检查 `git diff --check` 和变更范围，补充 Issue／Commit 记录中的实际交付、验证结果和限制。
- [x] 展示用户验收步骤与完整 Commit message；用户已通过本地提交请求确认验收并批准拆分提交，失败时恢复待提交状态。
