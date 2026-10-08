# exts 品牌图标

## 唯一图案源稿

`exts.svg` 是批准的黑底白色原生矢量源稿。插头路径在所有平台派生资源中保持一致，只改变画布、留白、背景和填充颜色，不改眼睛、插脚、倾斜或尾巴。

`exts-approved-reference.png` 保留用户确认的 ImageGen 优化稿，不作为构建导出来源。SVG 通过追踪批准稿轮廓并平滑路径形成，存在少量矢量化近似，仍需用户对照验收。

## 分平台资源

| 场景 | 资源 | 背景和留白 |
|---|---|---|
| macOS AppIcon | `macos/AppIcon.appiconset/`，16／32／64／128／256／512／1024 PNG 及 Contents.json | 保留批准黑底画布和主体留白，完整正方形，不在源图预裁系统圆角 |
| Icon Composer 图层 | `macos/composer-layers/foreground.svg`、`background.svg` | 透明白色插头前景与黑色背景分开；图层画布一致，尚未制作或验证 .icon 工程 |
| 插件 Manifest 和工具栏 | `extension/exts-<尺寸>.png` 与 `exts-light-<尺寸>.png`，16／32／48／128 | 黑色／白色透明图标，裁去无关留白；128px 主体最长边约 124px，保留约 2px 安全间距 |
| VitePress 导航 Logo | `website/exts.svg`、`exts-light.svg` | 黑色／白色透明 SVG，复用裁紧的同构 viewBox，不带黑色方形底板 |
| 网站 favicon | `website/exts[-light]-16.png`、`exts[-light]-32.png`，另可使用上述 SVG | 浅色用黑色，深色用白色，透明背景 |
| 网站 touch／PWA 图标 | `website/exts-180.png`、`exts-192.png`、`exts-512.png` | 黑底白色，保留品牌画布；这里只准备资源，不声明网站已启用 PWA |

`exports/` 保留第一轮通用黑底 PNG，不再作为所有场景的统一接入目录。插件不得在 Manifest 中引用 SVG。macOS 与网站 touch 资源采用批准的黑底；工具栏和导航 SVG 用透明背景。

## 实际接入位置与要求

- macOS：把 AppIcon.appiconset 接入 Xcode Assets，并保留 ASSETCATALOG_COMPILER_APPICON_NAME=AppIcon；按 Apple 规范由系统处理圆角遮罩。Icon Composer 图层是后续 .icon 工作的输入，不能把素材准备表述为已生成 .icon。
- 插件：复制到活动扩展的图标资源位置，Manifest icons 与 action.default_icon 使用黑色版；现有主题适配接入白色 action 图标。Manifest 不会自动按浏览器工具栏颜色切换，实际 Chrome／Edge 主题效果需用户验收。
- VitePress：复制到 public，themeConfig.logo.light 指向 /exts.svg，dark 指向 /exts-light.svg；head 中配置 prefers-color-scheme favicon 和 /exts-180.png touch icon。导航主题与系统 favicon 主题分别处理。
- 本轮已接入三端活动配置，实际构建通过；不新增 iOS 工程。用户的 macios 暂按现有 macOS 应用处理；若需要 iOS，再确认对应产物范围。

## 规格依据

- [Apple App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons/)
- [Apple Icon Composer](https://developer.apple.com/documentation/xcode/creating-your-app-icon-using-icon-composer)
- [Chrome 扩展图标](https://developer.chrome.com/docs/extensions/develop/ui/configure-icons)
- [VitePress 默认主题 Logo](https://vitepress.dev/reference/default-theme-config.html#logo)

## 用户验收步骤

1. 对照批准参考稿与 exts.svg，检查源稿是否保持角色。
2. 打开 exts-platform-preview.png：上排为浅色背景黑色版，下排为深色背景白色版；每排从左到右为 16、32、48、128px，均用最近邻放大到 128px 呈现实际采样结果。
3. 以实际大小查看插件 PNG，确认眼睛和插脚能分开、尾巴清楚；打开网站两个 SVG，检查同构与背景透明。
4. 检查 AppIcon.appiconset 的黑底画布与留白；Dock／Finder 的实际效果由用户打开本轮已构建的 exts.app 验收。未运行三端视觉或交互验收。
