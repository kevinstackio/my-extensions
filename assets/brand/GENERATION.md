# Logo 与跨平台图标生成规范

## 唯一源稿与品质要求

唯一正式源稿是 [exts.svg](./exts.svg)。用户于 2026-10-09 确认参考风格细修与放大 v3（插脚根部柔和连接、头顶基准线连续）：固定黑底白色插头，饱满柔和的主体、自然连续的曲线与相切的胶囊眼睛。原始参考 PNG 和预览仅供对照，不作为导出输入或第二源稿。

源稿画布为 1254×1254，整体等比变换后主体高度约 92%，上下约留 4% 安全区域。这是用户确认的项目构图，不是 Apple 或 Chrome 规定的通用占比。主体偏竖长，不能通过拉伸消除左右留白。

所有平台保留相同的眼睛、插脚、尾巴、内部比例和倾斜；只允许整体等比缩放、平移，以及外层容器、画布、留白和格式适配。不能按平台单独修形、为小尺寸另画一套或重复描摹。

放大后必须保持精细：连接自然，无意外折点、毛刺和细碎凹凸。不能追求最少控制点，也不能以模糊、羽化、阴影、描边或纹理掩盖轮廓问题。重新调整主体必须先批准，然后统一导出全部平台。

## 官方依据

核查日期：2026-10-09。涉及新的尺寸、形状或兼容范围时重新核对原文。

- [Apple HIG：App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons/)：方形图层输入、系统最终圆角遮罩、居中与官方网格、跨平台一致性。
- [Apple：Icon Composer](https://developer.apple.com/documentation/xcode/creating-your-app-icon-using-icon-composer)：Mac 的 1024×1024 图层画布、SVG 输入、不预先导出遮罩、真实 .icon 工程与 target 接入。
- [Apple Design Resources](https://developer.apple.com/design/resources/)：官方设计资源、网格与 Icon Composer；不自行猜测通用圆角半径。
- [Chrome：配置扩展图标](https://developer.chrome.com/docs/extensions/develop/ui/configure-icons)：PNG、方形画布、16／32／48／128 用途；Manifest 不支持 SVG。
- [Chrome Web Store：扩展图标](https://developer.chrome.com/docs/webstore/images#extension-icon)：方形商店图案参考 96×96 区域、每边 16px 透明留白，并兼顾明暗背景与视觉重量。
- [W3C SVG 2：等比映射](https://www.w3.org/TR/SVG2/coords.html#PreserveAspectRatioAttribute)：viewBox 和 preserveAspectRatio；SVG 不规定品牌容器的美术圆角。

## 统一外形与同步修改规则

三端最终外形以 Icon Composer 的 macOS Default 1024px 正式导出 `macos/exts-final.png` 为准，保留 Apple 的圆角、透明边缘与默认边缘材质，不自行猜测圆角。主体的唯一可编辑矢量源稿仍为根 exts.svg。

- 只改唯一源稿，必须在同一工作项重新生成全部平台和尺寸，禁止直接编辑单端派生图标。
- macOS 输入未预裁剪的透明前景；扩展和网站从正式 1024px 导出直接缩小，不从小图逐级放大。
- 扩展 16、32 使用完整构图；48、128 按 Chrome 用途保留外部透明安全区，主体与圆角一起等比缩放。
- 网站 16、32、180、192、512 PNG 使用完整构图；展示 SVG 自包含嵌入同一 1024px 正式 PNG，保持精确外观。该展示文件是位图封装，不能宣称为无限分辨率纯矢量；可编辑主体 SVG 保持纯矢量。
- `macos/exts-final.json` 记录源稿与正式导出的 SHA-256；脚本发现不匹配即停止，防止混用旧导出。

## macOS 正式制作流程

工具：Xcode 27.0（27A266a）、Icon Composer 27.0、XcodeGen 2.46.0。当前目标为 macOS 27.0，不扩大兼容范围。

1. 从 Xcode Developer Tool 打开 Icon Composer，创建并保存 `exts.icon`。当前 `macos/exts.icon` 已由此流程创建，可直接打开。
2. 使用官方网格，导入 `macos/composer-layers/foreground.svg`；Layout 为 100%、x/y 为 0。透明图层为 1024×1024，内部保留已确认的主体构图，不再独立修形。
3. 背景设为 Solid Black，仅启用 macOS；前景 Glass 关闭，组阴影为 0，关闭半透明，不自制材质或高光。
4. 保存正式工程；`icon.json` 是官方工具创建的文档，不是手写猜测模板。升级工具后重新保存并验证。
5. 生成脚本同步主体与工程到 `apps/desktop/src/resources/exts.icon`；XcodeGen 识别为图标资源，App Icon 名称为 `exts`。
6. 构建实际 App，核对 CFBundleIconName／CFBundleIconFile 为 `exts`，资源包含 `exts.icns` 和 `Assets.car`。不同时维护旧 AppIcon.appiconset。

项目不维护自定义主题变体或明暗切换代码。macOS 用户主动选择的系统图标外观、材质与抗锯齿仍由系统处理，不能承诺应用能禁止系统外观。

## 可复现导出与验证

使用 Node.js 24.16.0、Sharp 0.35.5。Sharp 是离线导出工具，本次使用 Codex 已有运行时，未新增应用依赖或修改锁文件。

在仓库根目录执行：

```sh
node assets/brand/scripts/generate-icons.mjs --sharp-module /Users/kevin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp
```

其他机器通过 `--sharp-module` 指向已有 Sharp 0.35.5 目录；有现成 `sharp` 模块时可省略。脚本检查精确版本，不自动安装依赖，不把机器路径写入应用构建。

每次改稿的顺序：

1. 修改唯一源稿，运行上述命令并追加 `--prepare-composer`，同步透明前景及正式 .icon 工程。
2. 关闭并重新打开 Icon Composer 工程，防止已打开的文档继续使用旧图层；导出 macOS Default 1024px PNG，更新 macos/exts-final.png。
3. 确认导出主体是当前批准版本，再更新 exts-final.json 的 sourceSha256 与 imageSha256；可用 `shasum -a 256 assets/brand/exts.svg assets/brand/macos/exts-final.png` 获取，两项不能未经版本核对就更新。
4. 运行不带 --prepare-composer 的生成命令；自动核对哈希、1024px 尺寸与透明通道，再统一生成全部 PNG 和展示 SVG。
5. 执行相关构建与配置检查，之后由用户实际验收。根 SVG 与全部 Composer 前景必须一致。

PNG 使用 sRGB，Sharp Lanczos3 单次缩小。无需再安装应用依赖或改锁文件。

```sh
pnpm --filter @exts/extension test
pnpm --filter @exts/extension typecheck
pnpm --filter @exts/extension build
pnpm --filter @exts/website build
pnpm desk:build
```

资源修改后执行一次对应完整验证。Apple 图标导出需要系统渲染服务；受限环境失败时，定位服务访问限制后只重试一次，不改成猜测圆角或伪造工程。

## 清理与用户验收

- 清理无引用的主题变体、旧 PNG AppIcon 和旧通用导出，保留原始参考图和批准预览记录。
- macOS：退出旧进程，打开本轮 `apps/desktop/dist/exts.app`，在 Finder／Dock 检查最终圆角、主体占比与细节。旧进程或系统缓存可能显示旧图标，不能仅据源图声称验收通过。
- Chrome／Edge：加载本轮 `apps/extension/dist/chrome-mv3` 生产产物，检查工具栏、管理页和新标签页 favicon；切换明暗主题，品牌图标保持固定，书签和标签组行为保持。不加载 WXT 临时 dev 目录，持续开发仍使用原 stable-dev hook。
- 网站：检查本轮 `apps/website/dist` 的导航、favicon 和 touch 图标；页面主题仍可切换，品牌图标不由配置自动替换。
- 视觉、布局和交互由用户实际验收，不新增截图、像素、主题外观或交互自动化测试，不以构建通过代替验收。
