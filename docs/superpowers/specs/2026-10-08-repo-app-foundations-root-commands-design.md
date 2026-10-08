# exts 应用身份与品牌图标设计

## 依据与状态

- [Issue](../../changes/issues/2026-10-08-repo-app-foundations-root-commands-issue.md)。
- 用户已确认统一名称 exts、macOS 标识 `dev.linguio.exts`，并确认可爱插头优化稿后要求继续整理源稿。
- 本记录只确定已有批准内容；两端目录方案保留在 Issue；用户于 2026-10-09 明确要求开始，批准串行实施。

## 身份

活动产品、网站、根包使用小写 exts，内部包使用 `@exts/*`。desktop 工程和 scheme 为 exts，Swift 入口 ExtsApp，Organization Identifier 为 dev.linguio，Bundle Identifier 为 `dev.linguio.exts`。旧数据位置不随名称自动迁移，归档及历史来源保留。

## 图标

- 唯一源稿：`assets/brand/exts.svg`，原生矢量路径，不能仅嵌入位图。
- 参考：用户确认的优化版可爱插头，短双脚、圆润身体、胶囊眼睛、微歪头与卷曲电线尾巴。
- 用户指定黑底白色作为品牌画布；按随后要求区分平台：macOS AppIcon 和网站 touch 保留黑底，插件与网站导航用同构透明黑／白版本。不添加新的装饰、渐变或阴影。
- 矢量整理只追踪已批准轮廓，不重新设计。macOS 保留参考构图与留白；插件和网站导航裁去无关画布，128px 主体最长边约 124px。各端路径完全一致，只改变 viewBox、背景及黑白填充。
- 导出：插件 16／32／48／128；网站 SVG 与 16／32／180／192／512；桌面 16／32／64／128／256／512／1024。同一平台内相同尺寸复用文件；不同平台按各自画布与透明要求派生，不直接混用 PNG。
- 分平台资源位于 `assets/brand/macos/`、`extension/` 与 `website/`；exports 保留为初轮黑底导出。macOS 提供 AppIcon.appiconset 及 Icon Composer 前景／背景 SVG，但没有生成 .icon 工程；插件只用 PNG，网站提供导航和 favicon SVG。接入时复制到各自构建位置，不引入运行时依赖或新公共包。

## 接入边界

现有 macOS 工程使用 AppIcon.appiconset 接入，Icon Composer 前景／背景只作为素材，不将 .icon 构建迁移加入本次验收。插件沿用既有主题图标逻辑，官网使用 VitePress themeConfig.logo 浅深配置和 head favicon；不新增 iOS 工程或 PWA。

## 本阶段验证与停止点

验证 SVG 可解析且不嵌入图像、平台派生路径与源稿相同、PNG 尺寸及各端约定的透明／黑色背景、AppIcon 映射完整；提供各尺寸资源供用户自行检查眼睛、插脚和尾巴。没有把小尺寸视觉判断作为自动化测试。用户已要求继续实施三端配置接入；实施完成后仍停在整项 Issue 用户验收，不自动提交。
