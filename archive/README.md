# 旧应用归档

这里保存整合前的应用源码，供后续迁移参考；不参与活动 pnpm Workspace、默认构建或发布。

## 归档清单

| 目录 | 已有能力 | 后续归属 |
|---|---|---|
| `apps/extensions/ohmy-tabs/` | 新标签页、书签、Dock、标签组操作 | extension |
| `apps/extensions/ohmy-dl/` | Telegram 媒体下载、进度与历史 | extension |
| `apps/extensions/x-download/` | X 页面媒体识别与原生任务提交 | extension |
| `apps/desktop/ohmy-photos/` | iPhone 媒体浏览、缩略图与备份 | desktop |
| `apps/helpers/x-download-helper/` | X 本机下载、菜单栏与 Native Host | desktop |
| `.github/workflows/ohmy-dl-draft-release.yml` | 旧 OhMy DL 草稿发布流程 | 仅保留历史，不再触发 |

## 使用与复现

归档内保留原源码、测试、资源和配置，内部 README 和脚本中的旧路径、命令按历史语义理解。六个旧根开发／打包命令已退役，归档扩展仍引用原 Workspace 公共包，不能直接把归档目录当作独立可构建项目。

需要运行旧版本时，从 Git 历史中选择归档前版本，在独立检出目录恢复原 Workspace 和工具版本，按该版本说明安装、构建；不要在当前目录手工反向搬回归档源码。macOS 项目仍需 Mac 与原生工具链。历史锁文件与依赖安装是否可复现须实际验证，本次归档不作保证。

归档未卸载任何旧应用、修改扩展身份、移动浏览器存储、桌面数据库或用户下载文件。已下载文件和原安装继续属于原产品，后续迁入前明确数据方案。

## 后续迁移与移除

候选顺序为 Tabs 首页、TG 下载、桌面设备媒体、X 与桌面通信；以每次批准的 Issue 为准，每个可独立验收的结果分别交付。

删除归档子项目前必须确认：功能已迁入并验收；旧数据已处理；新构建与通信不再依赖旧项目；当前 Issue 明确批准删除范围。仅复制代码不满足删除条件。

- [当前项目入口](../README.md)
- [功能与数据盘点](../docs/changes/issues/2026-10-08-repo-app-integration-inventory-issue.md)
- [项目工作台](../docs/changes/README.md)
