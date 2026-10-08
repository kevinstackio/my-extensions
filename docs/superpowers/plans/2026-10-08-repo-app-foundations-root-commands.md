# 迁入 Tabs 与 Photos 并统一根命令实施 Plan

> 执行方式：使用 executing-plans 在 dev 串行实施，禁止子代理；不创建中间提交，结束后停在用户验收。

**依据：** [已确认 Issue](../../changes/issues/2026-10-08-repo-app-foundations-root-commands-issue.md)。用户已明确要求开始实施。

**目标：** 保留 Tabs／Photos 原行为，迁入活动应用并提供六个根 dev／build 命令。

## 约束

- 保留归档副本、现有产品名称与 Photos Bundle Identifier，不迁移 TG／X／Helper，不升级依赖。
- 根命令使用 web、ext、desk；desktop 用 Node 判断平台与工具后调用原生脚本。
- Photos 原生构建需 Mac；Windows 只验证入口逻辑及明确的环境错误，不宣称原生构建通过。
- 不启动长期 dev server，不执行浏览器或原生视觉／交互验收，失败定位与修复最多各一次。

## 1. 迁入 Tabs 与 web／ext 命令

- [ ] 将归档 Tabs 的源码、资源、配置、脚本与既有纯逻辑／配置测试复制到 `apps/extension/`，保留归档内容。
- [ ] 包身份改为 `@ohmy-exts/extension`，保持 Manifest 名称与功能；复制子项目规范并按根规则处理不适用的视觉测试要求。
- [ ] Workspace 加入 `apps/extension`；根命令添加 `web:dev`、`web:build`、`ext:dev`、`ext:build`，调用对应活动包。
- [ ] 沿用公共稳定 hook 与现有包体积配置，不改业务组件或主题。

## 2. 迁入 Photos 与 desk 命令

- [ ] 复制 Photos 工程、源码、资源、原生逻辑测试与脚本至 `apps/desktop/`，保持现有名称、系统要求和存储路径。
- [ ] 按用户后续要求将旧 Swift 源码目录整理为 `src/`，同步 project.yml 和 Xcode 工程引用；desktop 自身即项目根。
- [ ] 先添加 `apps/desktop/tests/desk.test.mjs`，以 Node 内置测试验证非 macOS、缺少工具、两种模式及错误退出码，确认新增入口尚未实现时失败。
- [ ] 实现 `apps/desktop/scripts/desk.mjs`：导出可测试的 `runDesk`，检查 platform、xcodebuild／xcodegen 后运行原生脚本，透传失败。
- [ ] 调整 `scripts/build.sh`：dev 构建 Debug 后打开应用；build 构建 Release 并生成 `dist/OhMyPhotos.app`，不打开应用；保留原数据与应用身份。
- [ ] 根命令通过 Node 转发 desk:dev／desk:build；修正目标项目说明，必要时更新 Xcode 工程配置但不增加平台能力。

## 3. 依赖、文档与阶段验证

- [ ] 安装精确版本依赖、同步锁文件，保留其包管理器与项目两个 YAML 文档；执行 WXT prepare，不新增依赖。
- [ ] 运行 desk 入口定向逻辑测试；完成后一次执行扩展测试、类型检查、生产构建、包体积检查、官网构建与公共稳定工具测试。
- [ ] 通过 WXT 一次性开发模式构建验证稳定目录发布，不启动 dev server；检查生产和稳定产物的 Manifest 与文件完整性。
- [ ] 核对根六个命令、活动项目无 archive 引用、迁移资源与原生源码保留、归档未修改、文档链接与 diff。
- [ ] 更新根 README、应用 README、归档状态说明、Issue 与 Commit 记录，列出实际构建目录和 Mac 待验收操作。
- [ ] 展示阶段结果、未验证项和拟提交 message；等待用户验收与明确提交请求。
