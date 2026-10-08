# 迁入 Tabs 与 Photos 并统一根命令

## 元信息

- 日期：2026-10-08
- 项目：repo
- 状态：实施中
- 当前阶段：用户已确认范围并要求开始，按简短 Plan 串行实施
- 分支：dev，不在 main 开发或提交
- 批准范围：用户确认六个命令、两端迁入与 desk 环境检查后，于 2026-10-08 明确要求“开始吧”，批准在 dev 串行实施；不包含 Git 提交

## 背景与目标

旧应用已归档，extension 与 desktop 目前只有职责说明。本次将 Tabs 和 Photos 分别迁入两个活动应用，成为后续整合的基座；用户在仓库根目录即可开发和生成三个应用的构建产物，不必进入子目录。

## 范围

- 将 `archive/apps/extensions/ohmy-tabs/` 的现有实现接入 `apps/extension/`，保留首页、书签、Dock、标签组、图标及稳定开发产物 hook。
- 将 `archive/apps/desktop/ohmy-photos/` 的现有工程接入 `apps/desktop/`，保留设备会话、媒体浏览、缩略图、选择与备份能力。
- 按用户后续要求，desktop 本身作为项目根目录，Swift 源码使用 `apps/desktop/src/`，不再保留旧的 `OhMyPhotos/` 源码目录名；同步 project.yml 与 Xcode 工程路径，原应用身份不变。
- 复用已有源码、资源、精确依赖版本和行为测试，调整目录、导入、脚本与 Workspace 引用；不以迁移为由重写业务实现。
- 根 scripts 统一为下表六个入口，原 `website:dev` 更名为 `web:dev`；实现留在各应用内，根命令仅转发。
- 同步必要的 Workspace、锁文件、应用说明和根 README；官网实现及公共稳定发布工具继续复用。

## 六个根命令与产物

| 根目录命令 | 预期行为 | 验收结果 |
|---|---|---|
| `pnpm web:dev` | 启动现有 VitePress 开发服务 | 根目录可启动，打开输出地址可浏览官网 |
| `pnpm web:build` | 构建官网静态站点 | 生成 `apps/website/.vitepress/dist/` |
| `pnpm ext:dev` | 启动统一扩展的 WXT 开发模式 | 完整产物发布到 `apps/extension/dist/<browser>-mv3-dev-stable/`，最终报告实际加载路径 |
| `pnpm ext:build` | 生成扩展生产构建 | `apps/extension/dist/` 下生成可通过“加载已解压的扩展”加载的完整产物，最终报告实际路径 |
| `pnpm desk:dev` | 在 Mac 上构建 Debug 并启动应用 | 无需进入子目录即可打开保留 Photos 能力的桌面应用；不要求新增 watcher |
| `pnpm desk:build` | 在 Mac 上生成 Release 应用 | 提供固定位置的 `apps/desktop/dist/OhMyPhotos.app`，仅构建，不自动启动 |

“打包”在本 Issue 中指生成正式构建产物；不包含 ZIP、DMG、签名、公证、部署或上传。desktop 沿用 macOS 原生工程与既有系统要求；在 Windows／Linux 运行 desk 命令须明确提示需要 macOS，不能返回虚假的成功。

## desk 命令环境检查

- 在迁入 Photos 并接入两个 desk 根命令的同一步实现，不另开 Issue。
- `desk:dev` 与 `desk:build` 共用 `apps/desktop/scripts/desk.mjs` Node 入口，分别传入 dev／build 模式；根命令先运行 Node，不直接调用 zsh。
- 入口先通过 `process.platform` 判断系统；非 macOS 时显示“桌面应用需要在 macOS 上运行和构建”，以非零状态退出，不尝试启动 shell 或原生构建工具。
- macOS 下检查 `xcodebuild`、`xcodegen` 是否可用；缺失时用中文说明缺少的工具，非零退出。工具检查通过后才调用对应原生脚本，透传失败退出码。
- 此入口不增加第三方依赖；必要逻辑测试覆盖非 macOS、工具缺失、dev／build 分派及失败退出码，不启动真实桌面界面。

## 数据与身份边界

- 此次仅调整工作区包身份与源码位置；扩展 Manifest 名称、图标和现有能力保持，若浏览器因加载路径变化改变扩展 ID，须报告影响，不宣称旧存储自动继承。
- Photos 保留显示名称、`dev.kevinstack.ohmy-photos` Bundle Identifier、默认下载与缓存位置，迁移不得清理或覆盖已有用户文件；如需改名或数据迁移，另行确认。
- 两个归档子项目保留，不在本 Issue 删除；新应用运行和构建不得依赖归档目录。

## 排除项

不迁入 TG、X 或 Helper，不建立跨端通信或统一任务中心，不重做页面与交互，不增加公共抽象或依赖升级，不删除归档，不新增 GitHub Actions、自动提交、合并或推送。

## Todo

- [ ] 确认实施范围及必要的简短 Plan，记录工具版本与停止点。
- [ ] 迁入 Tabs，接入 Workspace 与稳定开发产物，完成 web／ext 四个根入口。
- [ ] 迁入 Photos，提供 Mac Debug 启动和 Release 产物，完成共用 Node 环境检查入口及 desk 两个根命令。
- [ ] 保留纯逻辑行为覆盖，按根规范处理目标项目不适用的视觉／交互测试，同步锁文件和使用说明。
- [ ] 执行阶段验证，列明六个命令的实际结果、构建产物和未验证事项，停在用户验收。

## 验证与验收标准

- 根 scripts 恰好提供六个约定名称，所有入口调用活动应用，旧产品开发入口不再保留。
- 每个 build 命令生成可用产物，不能仅退出成功或调用归档项目；保留原核心能力，目标项目不引用 archive。
- 扩展完成必要逻辑测试、类型检查、现有体积检查与生产构建；稳定发布工具的成功、失败保留与恢复边界继续有效。不新增假 DOM 或视觉交互自动化测试。
- Mac 上完成 Photos 必要纯逻辑测试、Debug 和 Release 构建。Windows 环境无法代替原生构建或设备验证，缺少 Mac 证据时明确保留待验收项。
- 代理不启动长期 dev server，不执行浏览器视觉／交互验收；用户在根目录启动三个 dev 命令，观察官网、扩展和桌面应用的实际结果。
- 用户在 Chrome／Edge 加载报告中的稳定扩展目录，检查书签、Dock、标签组与重建结果；无桌面应用时 Tabs 仍可使用。
- 用户在 Mac 运行 desk 命令，连接 iPhone 验证现有媒体浏览与备份，检查拔线提示、同名文件不覆盖及 Release 应用启动；已有数据不被清理。
- 交付材料列出可复现操作、全部产物路径、自动化结果和环境限制；用户验收及明确本地提交批准前不标记已完成或进入下一次迁移。

## 关联文档

- [Commit 记录](../commits/2026-10-08-repo-app-foundations-root-commands-commit.md)
- [实施 Plan](../../superpowers/plans/2026-10-08-repo-app-foundations-root-commands.md)
- [已完成的归档工作](2026-10-08-repo-archive-legacy-apps-issue.md)
- [工作台](../README.md)

## 唯一下一步

按实施 Plan 在 dev 串行迁入两个基座，完成验证后停在用户验收；不自动提交。
