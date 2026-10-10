# 重建 Exts 产品官网

## 元信息

- 工作项：2026-10-11-website-product-homepage
- 项目：website
- 类型：架构任务；仅替换网站应用与构建框架，一个独立交付 Issue，不拆 Sub-issue
- 状态：已完成
- 创建日期：2026-10-11
- 当前阶段：用户已验收并明确批准两次本地 Commit，随最终交付提交结项
- 用户批准：用户明确要求完整重构 apps/website，确认首页预览、最终文案、平台按钮、GitHub Release 下载策略、工程组织与版本清单；2026-10-11 分别在设计与 Plan 交付后要求继续，已批准串行实施，未批准 Git Commit 或部署

## 背景

现有网站基于 VitePress，包含文档、应用与工具入口。用户要求全部替换为长期维护的 React 产品官网，不沿用旧站页面、导航或框架。官网内容少，但应用入口、基础组件、页面、下载行为、资源和配置必须有明确职责。

## 目标

交付已确认的 Notion 式黑白产品首页及清晰工程结构，按根产品版本提供 Chrome ZIP 与 macOS DMG 直链；为后续 GitHub Pages 与 exts.linguio.dev 部署提供静态产物。

## 范围

- 完整替换 apps/website 的 VitePress 页面、导航、配置与依赖，采用 Vite、React、TypeScript、Tailwind CSS、shadcn/ui Radix 组件及 Lucide React。
- 首页顶部左侧为 Exts，右侧仅 GitHub 图标，链接 https://github.com/linguio/exts。
- 首页中间左侧两行标语为“将想法与能力”“延伸为实用工具”，下方两个同等尺寸的平台按钮；Chrome 使用用户提供的单色 googlechrome.svg，macOS 使用 apple.svg。按钮保留文字，macOS 在前、Chrome 在后；两个按钮使用完全相同的黑底白字、白色平台图标、尺寸与交互样式；两端均可点击，不写“即将推出”，不预检下载结果。
- 中间右侧复用既有正式品牌 logo，静态展示，不加角标。桌面预览参考 logo 220px、标语 42px，实际布局自适应。
- 页脚只写 © 2026 Lin Gui，不添加 Powered by、重复网址或其他产品版权署名。
- 响应式布局；Chrome 入口不宣称未测试的 Edge 兼容。品牌图标使用独立 SVG，Lucide 用于适合的通用界面图标。
- 使用 scripts/version.mjs 读取并校验根 package.json 的 version，构建时注入网站，分别拼接 v<版本>/exts-chrome-<版本>.zip 与 v<版本>/exts-mac-<版本>.dmg；使用普通链接直接访问，不请求 GitHub API、不判断附件存在或下载结果，不显示成功/失败提示。
- 保持根 web:dev、web:build 命令及网站包名；产物在根 dist/build/exts-web，缓存在根 dist/.cache/website。同步网站 README、相关构建规范和依赖锁文件。
- 配置标题、描述、favicon、分享元信息；采用批准的精确版本，不升级 extension、desktop 或无关工具。

## 排除项

- 不部署 GitHub Pages，不修改 Actions、DNS、域名或 HTTPS；此交付提交完成后另立部署 Issue。
- 不构建或发布 macOS 安装包，不增加动画、多语言、深色模式、登录、数据库、后台或新业务页面。用户已知当前 DMG 地址不存在，仍明确批准开放链接。
- 不更改品牌源稿、不重绘平台图标、不重新生成三端品牌资源，不删除 archive/apps 或历史项目文档。
- 不预建空模块、路由系统、全局状态库或共享 UI 包。
- 不执行浏览器视觉、布局、焦点或指针验收，不新增假 DOM、截图或同类交互测试；不移除其他应用测试。
- 不自动提交、推送或创建远程 Release。

## Todo

- [x] 审核书面设计并批准精简实施 Plan。
- [x] 建立网站应用结构及固定版本依赖，接入 shadcn 基础 UI 与现有资源。
- [x] 实现批准的首页与根版本 Chrome/macOS 直接下载链接。
- [x] 删除被替代的 VitePress 实现，同步命令说明与必要构建集成。
- [x] 完成冻结安装、类型检查、网站构建与受影响构建边界检查，核对生产产物中的两端版本直链。
- [x] 整理交付文件、验证结果和用户可复现验收步骤，停在用户验收。

## 阶段交付与验证

- React/shadcn 首页与下载功能已实施；原网站 5 个 VitePress 配置与页面文件及对应依赖已移除，历史文档与归档保留。
- 已有构建发布边界测试 13/13 通过；简化后重新执行冻结安装、类型检查与网站生产构建，并核对两端直链。API 逻辑与对应测试已删除，不为字符串拼接新增镜像测试。
- 当前根版本 1.0.0 已注入两端链接；以后修改根版本并重新构建/部署网站即可更新。Tag 与附件命名需继续遵守现有规范。
- 锁文件仅网站 importer 变化，移除 81 个 VitePress 独占 package/snapshot 条目；其他 importer、保留条目与包管理器锁文档不变。
- 使用官方 pnpm 12.4.2 临时二进制执行命令；本机 Volta 全局 pnpm 为 12.4.1，未修改全局工具。正常安装执行 extension 的 wxt prepare，未绕过 postinstall。
- 用户于 2026-10-11 明确批准移除 API 与所有下载判断，改用根版本直链，并开放 macOS。当前 Chrome 1.0.0 ZIP HTTP 检查为 200；DMG 不存在为用户已知情况，未预检或阻止其链接。
- 未执行浏览器视觉、布局、焦点或指针验收；未部署域名，未创建 Git Commit 或推送。验收步骤详见 Commit 记录。

## 验收标准

- 首页内容、按钮状态与署名符合范围；桌面左右布局，窄屏重排且内容可读，以用户 Chrome 实际验收为准。
- shadcn Button 是真实接入的项目组件；基础 UI、页面布局和下载逻辑职责独立，源码及生成配置纳入 Git。
- Chrome 与 macOS href 分别为根 version 对应的 GitHub ZIP/DMG 地址；没有 API 查询、预检、加载状态或结果提示。
- macOS 和 Chrome 均可点击，GitHub 链接进入指定仓库，平台与品牌资源不被重绘；页面不声称附件已成功下载。
- VitePress 活动实现及网站依赖被移除；网站命令保持可用，构建路径符合根规范，不清理其他端产物。
- 所有新增依赖与 CLI 使用完整精确版本，锁文件一致；必要逻辑测试、类型检查和构建通过，实际视觉与交互验收仍由用户完成。

## 关联文档

- [Commit 记录](../commits/2026-10-11-website-product-homepage-commit.md)
- [设计](../../superpowers/specs/2026-10-11-website-product-homepage-design.md)
- [Plan](../../superpowers/plans/2026-10-11-website-product-homepage.md)
- [构建与分发规范](../../build-release.md)
- [插头 Logo 规范](../../exts-logo.md)

## 唯一下一步

无；当前 Issue 随最终交付 Commit 结项，用户尚未要求开始后续域名部署 Issue，不推送。
