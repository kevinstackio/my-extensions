# 更新 OhMy 系列产品图标

## 元信息

- 工作项：`2026-10-03-repo-ohmy-product-icons`
- 项目：`repo`
- 类型：小型任务
- 状态：已完成
- 当前阶段：已交付
- 创建日期：2026-10-03
- 最近更新：2026-10-04

## 背景

OhMy 图标体系已经确定圆角矩形外框、深浅双色、中央语义图案和视觉居中规则。Tabs、DL、Photos 与 Website 需要分别使用对应定稿图形，并接入各自项目的正式资源位置。

## 目标

从同一份确定性 SVG 母版生成四个产品图标，严格保持已登记的构图与视觉居中偏移，并更新到对应项目。

## 范围

- 为 OhMy Tabs 生成并替换 16、32、48、128px 深浅图标。
- 为 OhMy DL 生成并替换 16、32、48、128px 深浅图标。
- 为 OhMy Photos 生成标准 macOS AppIcon 资源并接入工程配置。
- 为 Website 生成 Extension 拼图图案的 SVG 品牌图标与 favicon 资源并接入 VitePress。
- 保留每个中央图案已经确认的视觉居中尺寸和偏移。

## 排除项

- 不重画、重组或改变四个定稿图形。
- 不修改产品名称、页面内容、功能逻辑或主题设计。
- 不引入紫色、渐变、阴影、纹理或额外底板。
- 不修改 X Download 或其他项目资源。

## Todo

- [x] 保存四个确定性 SVG 母版并校验视觉居中登记值。
- [x] 生成并接入 Tabs、DL 的深浅扩展图标。
- [x] 生成并接入 Photos AppIcon 与 Website 图标资源。
- [x] 验证资源尺寸、SVG 结构、扩展构建、macOS 项目生成和网站构建。
- [x] 停在用户视觉验收，不主动提交。

## 验收标准

- Tabs、DL、Photos 与 Website 使用各自对应的定稿中央图案。
- 四个图标均遵守视觉居中优先规则；尺寸变化和深浅版本不改变构图。
- Tabs、DL 的扩展 Manifest 继续引用完整的 16、32、48、128px 图标。
- Photos 工程包含可由 Xcode 识别的完整 macOS AppIcon。
- Website 页面使用品牌 SVG，并提供标准 favicon 资源。
- 自动化结构与构建验证通过；视觉结果由用户实际验收。

## 关联文档

- [Commit 记录](../commits/2026-10-03-repo-ohmy-product-icons-commit.md)
- [OhMy Icon System · 图标设计规范 v2](https://app.notion.com/p/3eefb7fd0360812d8651c3a4fcaa1de5)

## 唯一下一步

无；工作项已完成。
