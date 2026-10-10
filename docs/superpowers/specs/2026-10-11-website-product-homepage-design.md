# Exts 产品官网设计

- 对应 [Issue](../../changes/issues/2026-10-11-website-product-homepage-issue.md)
- 对应 [Commit 记录](../../changes/commits/2026-10-11-website-product-homepage-commit.md)
- 日期：2026-10-11
- 状态：用户于 2026-10-11 批准设计与 Plan；已实施并完成自动化验证，用户已于 2026-10-11 确认验收通过
- [实施 Plan](../plans/2026-10-11-website-product-homepage.md)：已批准

## 应用与渲染选择

采用 Vite + React + TypeScript，生成可静态托管的网站产物。相较 Next.js 的完整应用框架，此版无需服务器或服务端数据；相较 Astro，此版用单一 React 组件体系接入 shadcn，减少两种组件模型的维护。此版只有首页，不引入路由。取舍是页面主体依赖 JavaScript 渲染；基础标题、描述与分享元信息放在 HTML 入口。如后续需要多页内容预渲染，单独评估，不预建该能力。

## 目录职责

```text
apps/website/
├─ public/                     # 固定公开资源与 favicon
├─ src/
│  ├─ app/                     # 启动入口、应用组合与全局样式
│  ├─ pages/home/              # 首页正文布局
│  ├─ components/ui/           # shadcn 基础组件
│  ├─ components/layout/       # 网站页头、页脚
│  ├─ features/download/       # 平台入口、Release 解析与必要逻辑测试
│  ├─ assets/                  # 页面品牌与平台 SVG
│  ├─ config/                  # 产品信息、仓库地址与署名
│  └─ lib/                     # shadcn 所需样式工具
├─ index.html
├─ components.json
├─ vite.config.ts
├─ tsconfig.json
├─ package.json
└─ README.md
```

仅创建当前有代码或资源的目录。页面组合 layout、平台入口模块与品牌资源；平台入口模块不依赖首页布局；基础 UI 不包含发布或产品逻辑。测试随下载职责组织。不把仅网站使用的代码提取到 packages，不照搬预览文件为单体页面。

## 视觉与资源边界

固定黑白浅色风格，参考 Notion 的清晰排版与留白，不复制其品牌或插画。页头 Exts 与 GitHub 图标分居左右；正文左侧标语和平台按钮、右侧静态 logo；窄屏顺序为标语与下载、logo。页脚仅 © 2026 Lin Gui。

按钮使用 shadcn Radix Button；文字为 Chrome、macOS，配用户提供的单色平台 SVG。macOS 在前、Chrome 在后，均为可点击的普通下载链接；两端统一使用相同的黑底白字按钮、白色平台图标、尺寸和交互样式，不增加“即将推出”；macOS 附件当前不存在为用户已知并批准的情况。保留可访问名称，使用明确平台文字消除图标歧义。

品牌复用根 assets/brand 的正式网站资源，不改源稿或重做圆角；平台 SVG 来自用户提供的 googlechrome.svg 与 apple.svg，纳入网站资源后不依赖 Downloads 路径。GitHub 使用独立品牌 SVG，避免通用图标库的品牌支持变化。Lucide 用于通用图标，不替代用户平台形状。保留必要第三方许可声明，不在页脚署名 Lucide。

## 下载与版本来源

根 package.json 的 version 是构建、发布与本版官网链接的唯一版本源。Vite 配置通过 scripts/version.mjs 读取并校验，再以 __EXTS_VERSION__ 注入网站，客户端不维护第二份版本。链接为 https://github.com/linguio/exts/releases/download/v<版本>/exts-chrome-<版本>.zip 与同 Tag 下的 exts-mac-<版本>.dmg。

用户于 2026-10-11 明确调整方案：不请求 GitHub API、不做可用性或结果判断，两端通过 shadcn Button asChild 渲染普通链接。没有 fetch、加载状态、重试或成功/失败提示。用户明确知道当前 DMG 地址不存在，仍要求开放。根版本变更后需要重新构建并部署网站，不自动追踪远程最新发布。浏览器负责跨域下载，页面不推断是否完成。

## 精确版本

优先与 apps/extension 已有精确版本对齐；2026-10-11 已通过 npm registry 核对版本存在及 peer/engine 声明，固定版本安装、类型检查与构建已验证。

| 项目 | 版本 |
| --- | --- |
| Node.js / pnpm | 24.16.0 / 12.4.2 |
| react / react-dom | 19.3.0 |
| vite / @vitejs/plugin-react | 8.3.0 / 6.1.1 |
| typescript | 7.0.2 |
| tailwindcss / @tailwindcss/vite | 4.3.3 |
| lucide-react / radix-ui | 1.46.0 / 1.6.7 |
| class-variance-authority | 0.7.1 |
| clsx / tailwind-merge | 2.1.1 / 3.7.0 |
| @types/react / @types/react-dom | 19.3.0 |
| @types/node | 24.13.4 |
| shadcn CLI | 4.21.4 |

CLI 固定版本不等于远程组件 registry 永久固定：生成后审查组件、依赖与许可证，并把源码和配置纳入 Git，以仓库版本作为实际组件事实来源。没有动画需求时不额外加入动画依赖。不使用浮动版本或无版本 CLI；必要新增依赖不在清单时先说明再批准。pnpm 版本已核对仓库配置，运行入口曾无输出并已停止，不能据此声称安装工具验证成功。

## 构建与验证

保留 @exts/website 包名及根 web:dev、web:build。仅更新网站构建适配及相关说明，维持 dist/build/exts-web 与 dist/.cache/website；不得清空公共 dist 或更改其他应用行为。GitHub Pages 在后续使用 web:build，而非 macOS 专用根 build。

直链是简单配置拼接，不保留已删除 API 的测试或 Vitest 网站依赖，不新增镜像测试。冻结安装、类型检查、网站构建、生产直链核对及已有构建边界检查用于必要验证，不引入假 DOM、源码形式或样式测试。页面视觉、布局、键盘、焦点、指针及真实下载由用户在 Chrome 验收。

## 停止点

书面设计批准后编写精简 Plan；Plan 批准并选择串行本地实施后再开发。交付停在用户验收，不自动 Git Commit。完成第一个 Issue 的最终交付 Commit 后，另立 GitHub Pages、自定义域名 exts.linguio.dev 与 HTTPS 部署 Issue。

## 官方依据

- [shadcn Vite 接入](https://ui.shadcn.com/docs/installation/vite)
- [shadcn Radix Button](https://ui.shadcn.com/docs/components/radix/button)
- [Vite 静态部署](https://vite.dev/guide/static-deploy.html)
- [构建与分发命名规范](../../build-release.md)
