# Oh My 产品命名迁移设计

## 元信息

- 工作项：`2026-09-30-repo-rename-ohmy-products`
- 状态：已批准
- 创建日期：2026-09-30
- 最近更新：2026-09-30
- 对应 Issue：[Oh My 产品命名迁移](../../changes/issues/2026-09-30-repo-rename-ohmy-products-issue.md)
- 参考 Issue：[统一 OmyExts 仓库与产品命名](../../changes/issues/2026-09-30-repo-unify-omy-product-naming-issue.md)

## 1. 设计目的

本次工作将已经完成的 OmyDL、OmyTabs 和 Omy Photos 统一重命名为 Oh My 产品系列。它是一次全新项目的内部命名迁移，不承担线上用户兼容责任，也不保留旧产品标识的读取、别名或回退路径。

迁移只改变产品身份和相关路径，不改变三个产品已经交付的业务行为、权限边界、数据模型或平台能力。

## 2. 最终命名

| 旧标识 | 新目录标识 | 新展示名 | 新包/工程标识 |
| --- | --- | --- | --- |
| `omydl` | `ohmy-dl` | `Oh My DL` | `@omyexts/ohmy-dl` |
| `omytabs` | `ohmy-tabs` | `Oh My Tabs` | `@omyexts/ohmy-tabs` |
| `omy-photos` | `ohmy-photos` | `Oh My Photos` | `OhMyPhotos` / `dev.kevinstack.ohmyphotos` |
| `x-download` | `x-download` | `X Download` | 保持不变 |

`@omyexts` 仍表示仓库级 workspace scope，不随单个产品名称重复迁移。目录和脚本使用 kebab-case，TypeScript、Swift 模块和 Bundle 使用无分隔符标识。

## 3. 迁移范围

### 3.1 OmyTabs

- 将目录、包名、根命令和现行文档从 `omytabs` 调整为 `ohmy-tabs`。
- 将 Manifest、入口标题、错误文本、资源文件名、资源路径、CSS/DOM 前缀和测试断言调整为 `Oh My Tabs` / `ohmy-tabs`。
- 将稳定开发目录、构建目录、临时测试目录和构建产物名称同步调整。

### 3.2 OmyDL

- 将目录、包名、根命令和现行文档从 `omydl` 调整为 `ohmy-dl`。
- 将 Manifest、Popup、菜单、主题消息、运行时消息、页面事件、CSS/DOM 前缀和测试断言调整为 `Oh My DL` / `ohmy-dl`。
- 将 Logo、图标、ZIP、Draft Release 工作流、tag 前缀和 Release 文案同步调整。
- 下载历史键、文件选择器 ID 和运行时协议直接改用新前缀，不读取旧键，不增加兼容别名。

### 3.3 Oh My Photos

- 将目录 `apps/desktop/omy-photos/` 调整为 `apps/desktop/ohmy-photos/`。
- 将 Xcode 工程、Scheme、Target、Swift 模块、测试模块、源文件和工程配置调整为 `OhMyPhotos`。
- 将 Bundle Identifier 调整为 `dev.kevinstack.ohmyphotos`。
- 将 Application Support、下载目录、缩略图目录和现行文档中的产品名称调整为 `Oh My Photos`。
- 保持 ImageCaptureCore、SQLite、SwiftUI 以及现有最小 MVP 行为不变。

### 3.4 仓库现行引用

- 更新根 `package.json`、workspace、README、Monorepo/WXT 文档、迁移指南和当前项目 README。
- 根命令使用 `ohmy-tabs:dev`、`ohmy-tabs:build`、`ohmy-dl:dev`、`ohmy-dl:build` 和 `ohmy-dl:package`；不保留 `omytabs:*` 或 `omydl:*` 兼容别名。
- 更新当前 Issue、Spec、Plan 和 Commit 记录中的活动名称；已完成历史记录保留当时的事实名称。
- 重新生成 `pnpm-lock.yaml`，只允许出现 workspace 路径和包名变化，不升级依赖。

## 4. 明确排除项

- 不修改 `apps/extensions/x-download/` 的业务代码、目录、Native Messaging 标识、权限或运行时协议。
- 不迁移 `apps/helpers/x-download-helper/`，不修改其 Xcode 工程、Bundle Identifier、Native Host、Socket、脚本或命令。
- 不改变 OmyDL、OmyTabs 或 Omy Photos 的业务功能、权限、数据模型和 UI 交互设计。
- 不保留旧存储键、旧消息前缀、旧资源别名、旧包名或旧路径兼容层。
- 不修改 GitHub 仓库、远端 URL、Release 历史、Chrome Web Store、Edge Add-ons 或其他外部系统。
- 不重绘 Logo；只调整文件名、路径和引用。
- 不批量重写已经完成的历史 Issue、Commit、Spec、Plan、复盘和文章。

## 5. 用户可观察影响

- 新的本地项目路径为 `apps/extensions/ohmy-tabs/`、`apps/extensions/ohmy-dl/` 和 `apps/desktop/ohmy-photos/`。
- 根开发命令改为 `ohmy-tabs:dev`、`ohmy-dl:dev` 和对应的构建命令。
- 浏览器需要重新加载新的 Oh My Tabs、Oh My DL 稳定构建目录。
- Omy Photos 需要从新的 `OhMyPhotos.app` Bundle 重新打开。
- 旧路径、旧产物和旧标识不作为交付入口保留。

## 6. 验证策略

- 静态扫描确认活动配置、源码、测试和文档不再依赖旧产品标识；历史记录单独排除。
- OmyTabs：类型检查、Vitest、WXT 构建和 Manifest/资源路径检查。
- OmyDL：类型检查、Vitest、WXT 构建、WXT ZIP 和发布工作流静态检查。
- Oh My Photos：XcodeGen、`scripts/build.sh`、`xcodebuild build-for-testing`、Bundle 标识和 `git diff --check`。
- 完整验证只运行一次；视觉、布局、指针、真实焦点、Chrome/Edge 加载和真实 iPhone 流程由用户验收。

## 7. 停止点

1. 用户审核通过本 Spec 后，再编写实施 Plan。
2. Plan 审核通过后，按 OmyTabs → OmyDL → Oh My Photos → 仓库现行引用与完整验证的顺序实施。
3. 任一迁移阶段出现范围外的业务行为变化时，暂停并更新 Issue，不顺手扩大迁移范围。
4. 自动化验证完成后停在用户验收，得到明确提交授权后再创建最终本地 Commit。
