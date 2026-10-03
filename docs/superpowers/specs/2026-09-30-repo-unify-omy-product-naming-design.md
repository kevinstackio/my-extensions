# 统一 OmyExts 仓库与产品命名设计

## 元信息

- 工作项：`2026-09-30-repo-unify-omy-product-naming`
- 状态：待用户审核
- 创建日期：2026-09-30
- 最近更新：2026-09-30
- 对应 Issue：[统一 OmyExts 仓库与产品命名](../../changes/issues/2026-09-30-repo-unify-omy-product-naming-issue.md)

## 1. 设计目的

本次工作将本地仓库从 `my-extensions` 统一为 OmyExts，将当前可独立迁移的两个浏览器扩展和官网统一到 Omy 产品命名，同时保留尚未准备迁移的 X Download Helper 原目录、工程和通信实现。

本次是直接重命名，不建立旧名称兼容层。旧的下载历史、文件选择器目录记忆、运行时消息和资源标识不作为交付内容保留。历史项目管理文档继续保留原名称，因为它们记录过去的真实交付事实。

## 2. 已确认的命名与边界

### 2.1 仓库与项目命名

```text
仓库 slug：omyexts
根 package name：omyexts
展示品牌：OmyExts
workspace scope：@omyexts

apps/
├─ extensions/
│  ├─ omytabs/             # OmyTabs 浏览器扩展
│  ├─ omydl/               # OmyDL 浏览器扩展
│  └─ x-download/          # 暂不迁移，后续并入 OmyDL
├─ helpers/
│  └─ x-download-helper/   # 暂不迁移
└─ website/                # OmyExts 官网与文档站
```

`extensions` 是多个浏览器扩展的集合目录，不缩写为 `ext`；`website` 表示唯一官网；`desktop` 是未来桌面平台分类，当前不创建该目录。

### 2.2 产品映射

| 旧标识 | 新目录标识 | 展示名 | 当前处理 |
| --- | --- | --- | --- |
| `my-tabs` | `omytabs` | OmyTabs | 本次迁移 |
| `tg-download` | `omydl` | OmyDL | 本次迁移 |
| `web` | `website` | OmyExts | 本次迁移 |
| `x-download` | `x-download` | X Download | 保持不变 |
| `x-download-helper` | `x-download-helper` | X Download Helper | 保持不变 |

## 3. 迁移策略

### 3.1 仓库品牌与 workspace

根 `package.json` 使用 `omyexts`；所有当前 workspace 包和内部依赖统一使用 `@omyexts/*`。这包括暂不迁移业务的 `x-download` 与共享包 `stable-extension-dev`，因为 scope 属于仓库级命名，不改变它们的业务职责。

`pnpm-workspace.yaml` 的通配规则继续覆盖 `apps/extensions/*` 和 `packages/*`；显式的官网入口从 `apps/web` 调整为 `apps/website`。完成包名和路径变更后重新生成锁文件，只允许出现 workspace importer、路径和名称变化，不升级依赖版本。

### 3.2 根命令

根 `package.json` 最终保留以下开发入口：

```text
website:dev   → @omyexts/website
omytabs:dev   → @omyexts/omytabs
omydl:dev     → @omyexts/omydl
x:dev         → @omyexts/x-download
x-helper:dev  → apps/helpers/x-download-helper/scripts/run.sh
```

`vitepress:dev`、`tabs:dev` 和 `tg:dev` 不保留兼容别名。`x-helper:dev` 的路径和命令保持原样，直到桌面端另建迁移 Issue。

### 3.3 OmyTabs

目录从 `apps/extensions/my-tabs` 移动到 `apps/extensions/omytabs`。同步修改：

- package name、workspace 依赖和根命令过滤器；
- WXT Manifest 名称、工具栏标题、新标签页标题和错误信息；
- Logo 文件名与所有配置、HTML、脚本和测试引用；
- README、项目级 `AGENTS.md`、根 README 和现行技术文档；
- 测试中的临时目录、资源路径、Manifest 断言和构建输出路径。

Logo 图像内容不重绘，只进行文件名和路径调整。

### 3.4 OmyDL

目录从 `apps/extensions/tg-download` 移动到 `apps/extensions/omydl`。同步修改：

- package name、根命令、WXT 配置和构建产物模板；
- Manifest 名称、Popup 标题、工具栏标题和 README；
- Logo 文件名、图标路径、CSS 类、动画名和 DOM 标识；
- 页面事件、runtime message、主题消息和测试数据；
- 下载任务历史存储键，直接使用 `omydl` 前缀；
- `showSaveFilePicker` 的 `id`，直接改为 `omydl`；
- 发布工作流中的路径、过滤器、临时文件、tag、ZIP 和 Release 文案。

不读取旧的 `tg-download` 存储键，不保留旧的文件选择器 ID，不增加数据迁移。用户重新加载 OmyDL 后，旧下载历史和旧保存目录记忆不属于本次交付。

### 3.5 官网

目录从 `apps/web` 移动到 `apps/website`，包名调整为 `@omyexts/website`，根命令使用 `website:dev`。VitePress 只是实现技术，不作为根命令前缀或产品名；页面品牌使用 OmyExts，不创建 OmySite 产品名。

同步更新首页标题、Apps 页面、文档入口、README、VitePress 配置、Turbo filter 和现行本地链接。

### 3.6 X Download 与 Helper

本次不移动、不重命名、不修改以下内容：

- `apps/extensions/x-download` 目录与产品标识；
- `apps/helpers/x-download-helper` 目录；
- Xcode 工程、Scheme、Target、Module、App 和测试 Target；
- `XDownloadHelper`、`XDownloadNativeHost`、Native Host 名称、Socket 路径和 Bundle Identifier；
- `x:dev`、`x-helper:dev`、安装/卸载脚本和现有通信协议。

后续功能合并与 `apps/helpers/x-download-helper → apps/desktop/omydl` 是独立 Issue。本次只允许修改 X Download 的 workspace scope 和共享仓库品牌引用，不触碰其业务代码或 Native Messaging 契约。

## 4. 发布命名

TG Download 的现行发布工作流改为 OmyDL 语义：

```text
.github/workflows/tg-download-draft-release.yml
→ .github/workflows/omydl-draft-release.yml

tg-download-v<version>
→ omydl-v<version>

tg-download-<version>-chromium.zip
→ omydl-<version>-chromium.zip
```

旧 tag 和历史 Release 不改写。重命名工作本身不执行发布；实际下一个版本号由用户在发布前按商店和仓库现状决定，不能在工作流中自动重置为一个未经确认的版本。

## 5. 现行文档与历史事实

以下内容属于当前有效文档，需要更新：根 README、各当前项目 README、官网页面、`docs/monorepo.md`、`docs/wxt.md`、迁移指南、共享开发工具 README、当前 `AGENTS.md` 规则示例和发布工作流说明。

`docs/changes/` 中已完成 Issue/Commit、`docs/superpowers/` 中已完成 Spec/Plan、复盘文章和历史技术文章保留原名称。最终扫描分为“现行引用”和“历史事实”两类，不用全仓库无差别搜索旧字符串来判断迁移是否完成。

## 6. 用户可观察影响

- 新构建路径变为 `apps/extensions/omytabs`、`apps/extensions/omydl` 和 `apps/website`。
- 浏览器需要重新加载新的 OmyTabs/OmyDL 稳定构建目录；旧开发目录不作为新的稳定加载目标。
- OmyDL 的旧任务历史和旧文件选择器目录记忆不保留，属于已确认的重命名后果。
- X Download 和 X Download Helper 的现有路径、命令和通信流程在本次迁移后保持可用。
- GitHub 仓库 slug、remote、Release 页面、商店后台和推送由用户在本地交付后处理，本地代码不代替外部系统操作。

## 7. 验证策略

自动化验证覆盖：

- 所有 package.json、workspace、Turbo filter 和 VitePress 配置可解析；
- `pnpm-lock.yaml` 的 importer 与内部包名完整一致；
- OmyTabs、OmyDL、website 和共享包的现行路径、包名、脚本及资源引用无断链；
- OmyDL 新存储键、文件选择器 ID、运行时消息、CSS/资源标识和测试断言一致；
- OmyDL 发布工作流的路径、tag、ZIP 和 Manifest 校验目标一致；
- OmyTabs 与 OmyDL 的类型检查、单元测试和 WXT 构建通过；
- website 独立构建通过；
- `git diff --check` 和现行文档链接检查通过。

不自动执行视觉、布局、指针、真实焦点和浏览器交互验收。用户在 Chrome/Edge 中加载新构建产物，并在 macOS 上确认现有 X Download Helper 未受影响。

## 8. 停止点

1. Spec 审核通过后，编写实施 Plan。
2. Plan 审核通过后，按“仓库 scope 与官网 → OmyTabs → OmyDL → 完整验证”的顺序实施。
3. 每个阶段只完成已列出的本地范围，不提前迁移 Helper 或执行 GitHub 改名。
4. 自动化验证完成后停在用户验收，不自动提交 Git、不推送远端。
