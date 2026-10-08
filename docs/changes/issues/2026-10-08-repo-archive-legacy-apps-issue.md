# 归档旧应用并调整仓库入口

## 元信息

- 日期：2026-10-08
- 项目：repo
- 状态：已完成
- 当前阶段：用户已批准全部本地提交，本阶段交付结束
- 任务规模：架构任务中的仓库结构调整，不包含业务迁移
- 分支：dev；本 Issue 不在 main 修改或提交
- 批准范围：用户于 2026-10-08 批准所列归档、退役与配置调整，交付后要求拆分并全部本地提交；实际分为归档配置、原脚本执行标记恢复和说明文档三个提交

## 背景与目标

第一步已完成现有功能和目标结构盘点。本步将五个旧应用归档，留下 website、desktop、extension 三个应用位置，并同步仓库入口，为后续逐项迁移准备结构。

## 范围

- 将 `apps/extensions/` 下三个应用、`apps/desktop/ohmy-photos/` 和 `apps/helpers/x-download-helper/` 移至 `archive/apps/` 中相同的相对分类。
- `apps/website/`、`packages/`、`skills/` 保留；建立 `apps/desktop/README.md`、`apps/extension/README.md` 和 `archive/README.md`。
- 同步根命令、Workspace、锁文件、忽略路径、根 README 和 AGENTS 项目结构段落；官网仅在存在失效的本地文件链接时修正路径，不重做内容或导航。
- 把旧 OhMy DL workflow 移至 `archive/.github/workflows/`，保留内容并停止后续根 workflow 触发；不触碰远端 Actions 设置、Release 或 Tag。

## 已批准的具体决定

1. 归档作为源码参考，不作为活动 Workspace：根 Workspace 只匹配 `apps/website` 和 `packages/*`；新 desktop、extension 尚无包配置，本步不加构建命令。
2. 根命令仅保留现有 `website:dev`；退役六个旧开发／打包命令，不建立归档命令替身。归档 README 明确旧命令不再适用，需要复现时使用归档前的 Git 历史，不承诺归档目录原地可构建。
3. 保留归档内业务源码、测试、资源和配置的原始内容；不批量重写旧 README、旧路径或历史项目文档，归档说明统一解释其历史语义。
4. 新目录仅写职责与功能迁入顺序，不建立空项目、不安装新框架，也不提前锁定通信接口或数据模型。

## 排除项

不迁移业务功能或运行时数据，不改应用身份与权限，不升级直接依赖或工具，不删除归档子项目，不新增 CI、发布流程或浏览器测试，不改写历史 Git 提交，不推送远端。

## Todo

- [x] 批准具体方案后，将五个旧应用完整归档并确认文件保留。
- [x] 建立新应用职责说明与归档说明。
- [x] 同步活动 Workspace、命令、锁文件、workflow 和必要路径说明。
- [x] 执行结构、配置与保留项目验证，交付用户验收并记录验证边界。

## 实际结果与限制

- 五个应用的 272 个文件和一个 workflow 已归档；移动前后 SHA-256 一致，最终 273 个文件与原 Git blob 一致。没有改写归档内部源码、测试或配置。
- 归档暂存时 Windows 丢失的十个脚本执行标记已通过独立提交恢复；最终内容和原 Git 文件模式均保留。
- 活动目录为 website、desktop、extension；官网源码不变，desktop 与 extension 仅有职责 README。Workspace 实际成员仅为根、官网和公共稳定发布工具。
- 六个旧根命令已退役，旧 workflow 不在根 `.github/workflows`；Helper 三条忽略路径随归档同步。`turbo.json` 无需修改，保留原样。
- Node 24.16.0、pnpm 12.4.2；供应链校验与依赖安装通过。官网构建通过，公共工具 1 个测试文件、7 项测试通过；初次受沙箱 spawn EPERM 限制，获准后重试成功。
- 结构、命令、18 个相关 Markdown 链接、UTF-8 和归档忽略规则检查通过。未运行浏览器或 macOS 真机验收。
- 根锁文件包含包管理器和项目依赖两个 YAML 文档；项目部分已移除旧扩展，仅保留根、官网和公共工具，直接依赖版本不变。`pnpm install --frozen-lockfile --ignore-scripts --offline` 获准在沙箱外执行后通过，确认最终锁文件与活动项目一致。
- 未验证完全无缓存的全新检出安装，也未复现归档项目；本机冻结安装、构建和测试不代替用户验收。

## 用户验收步骤

1. 查看根 README 和 `apps/`：应只有三个应用目录，新 desktop／extension README 明确尚未实现功能。
2. 查看 `archive/README.md` 与五个归档应用：源码、资源和原测试均保留，旧 workflow 在归档区。
3. 检查根命令、Workspace 与 `.gitignore`：根只保留官网开发命令，归档不参与活动依赖安装，Helper 工具与下载文件仍被忽略。
4. 如需复核本机结果，运行官网构建和公共工具测试；预期构建成功、7 项测试通过，不要求加载新扩展或桌面应用。
5. 检查本 Issue 与 Commit 记录的交付范围和未验证事项，确认是否通过本阶段验收；未明确批准前不提交。

## 验证与验收标准

- 原五个应用的 272 个受 Git 管理文件在归档中保留，除独立批准的必要说明外内容不变；本机未发现归档源目录中的忽略文件，移动前复核。
- 活动 `apps/` 中只保留 website、desktop、extension；后两者仅有 README，用户能从根 README 找到当前与归档入口。
- 活动 Workspace 不包含归档应用；旧六个根命令和根发布 workflow 退役，公共工具与官网入口保留。
- 忽略规则覆盖移动后的 Helper 二进制与下载目录，归档源码不使本机工具或生成产物被意外跟踪。
- 锁文件与实际活动依赖匹配；区分包管理器与项目依赖两个 YAML 文档，移除旧扩展 importer，保留活动项目直接依赖精确版本；若工具或网络阻塞则报告限制，不宣称安装验证通过。
- 阶段结束执行一次官网构建、公共稳定发布工具的既有逻辑测试及配置／链接检查；无可用的统一类型检查命令，不新增检查体系。
- 不验证扩展视觉与交互或 macOS 真机行为；归档前功能保持在历史版本中，本步不交付可运行的新扩展或桌面应用。
- 用户检查根目录结构、归档文件保留、README 职责与可用命令；确认后再批准本地最终提交。

## 关联文档

- [第一步盘点](2026-10-08-repo-app-integration-inventory-issue.md)
- [实施 Plan](../../superpowers/plans/2026-10-08-repo-archive-legacy-apps.md)
- [Commit 记录](../commits/2026-10-08-repo-archive-legacy-apps-commit.md)
- [工作台](../README.md)

## 唯一下一步

全部本地提交成功后，再按用户指示确定下一项功能迁移；本 Issue 不推送远端或开始功能迁移。
