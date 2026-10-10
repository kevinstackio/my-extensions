# Exts 产品官网

React 单页产品官网，使用 Vite、TypeScript、Tailwind CSS 与 shadcn/ui。网站显示 Exts 标语、现有品牌 logo、Chrome 与 macOS 版本直链入口；页脚为 © 2026 Lin Gui。

## 开发与构建

在仓库根目录执行，使用根配置固定的 Node.js 24.16.0、pnpm 12.4.2：

```sh
pnpm install --frozen-lockfile
pnpm web:dev
```

按开发命令输出的本地地址打开页面。生产构建与逻辑检查分别执行：

```sh
node --test tests/build-release.test.mjs
pnpm --filter @exts/website typecheck
pnpm web:build
```

产物为根 dist/build/exts-web，Vite 缓存在根 dist/.cache/website/vite；只清理网站自己的生产目录。构建通过 scripts/version.mjs 校验根产品版本，不在网站维护第二份 version。GitHub Pages 后续只运行 web:build，不运行 macOS 专用根 build。

## 工程组织

- src/app：React 启动、顶层页面组合与全局设计变量。
- src/pages/home：首页正文布局，组合布局组件与下载模块。
- src/components/layout：网站页头、页脚；src/components/ui：纳入 Git 的 shadcn 基础组件。
- src/features/download：组合 shadcn 平台下载链接。
- src/config/site.ts：产品文案、GitHub 地址、根版本下载链接与署名。
- src/assets：用户提供的单色 Chrome、Apple 与 GitHub 品牌 SVG；public：已有正式品牌资源、favicon 与第三方许可声明。
- src/lib/utils.ts：class-variance-authority 配合的本地样式合并工具，不提取共享 UI 包。

## 组件与资源

Button 来源于 shadcn 官方 new-york-v4 registry，保持 Radix Slot、variant、size 与 disabled 语义。仅把官方源码的 cn 导入改为本地已固定 clsx、tailwind-merge 工具；未引入新的 cn 包。components.json 保存网站组件生成配置；如使用 CLI，固定为 shadcn@4.21.4，生成后检查源码和依赖，禁止保留浮动版本或直接运行 @latest。

Lucide React 用于通用状态图标，平台与 GitHub 用品牌 SVG。Google Chrome 与 Apple SVG 使用用户提供的原文件，不在运行时读取 Downloads。public/exts.svg 及各尺寸 PNG 沿用根 assets/brand/website 正式派生资源；不重绘或修改源稿。主体与跨平台外形见 [Logo 规范](../../docs/exts-logo.md)。第三方许可证随产物保留在 public/third-party-notices.txt，不作为页脚署名。

## 下载行为

构建通过 scripts/version.mjs 读取根 package.json 的 version，并注入 __EXTS_VERSION__。Chrome 与 macOS 分别直接链接 GitHub v<版本> 下的 exts-chrome-<版本>.zip、exts-mac-<版本>.dmg，不维护第二份版本。

不查询 API、不检查文件存在、不判断下载结果，不添加加载状态或成功/失败提示。用户已知当前 DMG 地址不存在，仍要求开放链接。版本修改后需重新构建和部署网站。源码入口为 https://github.com/linguio/exts。

扩展 ZIP 需解压后在 Chrome 扩展管理页开启开发者模式并选择“加载已解压的扩展程序”，不是 Chrome 商店安装包。此版官网仅标注 Chrome，未宣称 Edge 已通过验收。

## 验证与上线边界

使用类型检查、构建、产物直链核对与现有根构建边界测试；无 API 测试、假 DOM、截图或浏览器交互测试。页面布局、键盘与指针流程、真实下载由用户在 Chrome 验收。

预定域名 https://exts.linguio.dev/；本工作项仅生成静态网站，不创建 CNAME、部署 workflow、修改 DNS 或开启 HTTPS。上线属于后续独立 Issue。

- [当前 Issue](../../docs/changes/issues/2026-10-11-website-product-homepage-issue.md)
- [设计](../../docs/superpowers/specs/2026-10-11-website-product-homepage-design.md)
- [Plan](../../docs/superpowers/plans/2026-10-11-website-product-homepage.md)
- [构建规范](../../docs/build-release.md)
