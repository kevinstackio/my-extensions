# 整理 V3 图标与插头 Logo 独立规范

## 元信息

- 工作项：`2026-10-10-repo-ohmy-icon-system-docs`
- 项目：`repo`
- 类型：小型任务
- 状态：已完成
- 当前阶段：用户已验收并批准本地提交结项
- 创建日期：2026-10-10
- 用户批准：用户要求整理 V3 与独立 Logo 文档；以 Simple Icons 原图为参考统一绘制风格，逐图选择外框；正式 SVG 最终统一 1024 坐标，只维护一份，使用方自行调整显示大小。GitHub、Notion、YouTube 首批样本均无框

## 背景

用户准备手绘 Tabs 网站所需图标，并作为 Kinari UI 配套资源。旧 V2 的产品身份、网站品牌职责和深浅资源命名需要改为通用个性化图标规则；现有插头 Logo 保持独立品牌规范。

## 目标

以 V3 替换本地 V2，明确一份手绘单色 SVG、主题换色、语义命名和 Iconfont 交付；将现有插头 Logo 规范整理为 docs 下的独立入口。

## 范围

- `docs/ohmy-icon-system.md` 修订为 V3；extension、download、photos、bookmark 使用同级语义名称，保留未要求改变的几何基准。
- 新增 `docs/exts-logo.md` 保存插头 Logo 规则，原 `assets/brand/GENERATION.md` 保留跳转入口，并同步资源 README。
- 整理 Logo 文档路径，验收产物位置以已批准的 `docs/build-release.md` 为准。
- 补充 Tabs 网站图标参考手绘与逐图外框规则；同步 apps/extension/AGENTS.md 的来源、手绘及外框约定，消除旧规则冲突。
- 最终源稿统一 viewBox="0 0 1024 1024" 与 currentColor，不写固定宽高，不额外生成 24×24 接入版；同步记录已确认的首批三个无框样本。
- 同步本 Issue、Commit 记录和工作台入口。

## 排除项

- 不修改现有图标、代码、依赖、外部 Notion 页面，不执行 Git 暂存、提交或推送。
- 不调整外框几何或图案登记尺寸，不生成用户尚未提供的手绘图标。
- 不改变插头 Logo 的主体、固定黑底白色及三端同步规则。

## Todo

- [x] 读取并导入 V2 原规范，确认设计基准。
- [x] 修订 V3 的职责、语义命名、单一 SVG 与主题规则。
- [x] 整理独立插头 Logo 文档及原入口。
- [x] 修正 Simple Icons 参考手绘、统一风格与逐图选择外框的规则。
- [x] 统一一份 1024 正式 SVG 的交付约定及扩展规范。
- [x] 核对规则、UTF-8、本地链接与 diff，停在用户验收。

## 验收标准

- 本地规范为 V3，extension 是与 download、photos 同级的个性化图标，不承担网站 Logo 职责。
- 文件及 Iconfont 名称不强制 ohmy- 前缀；每个图标只维护一份手绘单色 SVG，通过 currentColor 适配主题。
- 插头 Logo 独立文档保留原有主体、颜色、平台导出及验证规则，原入口仍可访问。
- Simple Icons 可作为手绘参考并进行统一风格的细节调整；有框或无框由用户逐图确认，不按品牌身份推断，不擅自重绘或替换资源。
- 正式 SVG 仅一份 1024 坐标的 currentColor 源文件；文档不再要求额外维护 24×24、黑色接入或深浅主题版本，显示适配由使用方负责。
- 文档及管理记录相互链接有效。

## 关联文档

- [Commit 记录](../commits/2026-10-10-repo-ohmy-icon-system-docs-commit.md)
- [独立规范](../../ohmy-icon-system.md)
- [插头 Logo 规范](../../exts-logo.md)
- [原规范](https://app.notion.com/p/3eefb7fd0360812d8651c3a4fcaa1de5)

## 唯一下一步

无；用户已批准本地提交，提交成功后可开始独立的 SVG 调整工作项。
